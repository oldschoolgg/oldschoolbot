import { EmbedBuilder, type TextChannel } from 'discord.js';
import {
	Time,
	calcPercentOfNum,
	calcWhatPercent,
	chunk,
	percentChance,
	randArrItem,
	reduceNumByPercent,
	shuffleArr
} from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { OWNER_IDS, production } from '../config';

import {
	PUMPKINHEAD_HEALING_NEEDED,
	PUMPKINHEAD_ID,
	getPHeadDescriptor,
	numberOfPHeadItemsInCL,
	pumpkinHeadNonUniqueTable,
	pumpkinHeadUniqueTable
} from './simulation/pumpkinHead';
import { BossInstance, type BossOptions, type BossUser } from './structures/Boss';
import { Gear } from './structures/Gear';
import type { NewBossOptions } from './types/minions';
import { formatDuration, roll } from './util';
import getOSItem from './util/getOSItem';
import { logError } from './util/logError';
import { sendToChannelID } from './util/webhook';
import { LampTable } from './xpLamps';

interface BossEvent {
	id: number;
	name: string;
	bossOptions: Omit<BossOptions, 'leader' | 'channel' | 'massText' | 'settingsKeys'>;
	handleFinish: (options: NewBossOptions, bossUsers: BossUser[]) => Promise<void>;
}

export const bossEventChannelID = production ? '897170239333220432' : '1023760501957722163';

export const scaryEatables = [
	{
		item: getOSItem('Candy teeth'),
		healAmount: 3
	},
	{
		item: getOSItem('Toffeet'),
		healAmount: 5
	},
	{
		item: getOSItem('Chocolified skull'),
		healAmount: 8
	},
	{
		item: getOSItem('Rotten sweets'),
		healAmount: 9
	},
	{
		item: getOSItem('Hairyfloss'),
		healAmount: 12
	},
	{
		item: getOSItem('Eyescream'),
		healAmount: 13
	},
	{
		item: getOSItem('Goblinfinger soup'),
		healAmount: 20
	},
	{
		item: getOSItem("Benny's brain brew"),
		healAmount: 50
	},
	{
		item: getOSItem('Roasted newt'),
		healAmount: 120
	}
];

function getScaryFoodFromBank(user: MUser, totalHealingNeeded: number, _userBank?: Bank): false | Bank {
	if (OWNER_IDS.includes(user.id)) return new Bank();
	let totalHealingCalc = totalHealingNeeded;
	const foodToRemove = new Bank();
	const userBank = _userBank ?? user.bank;

	const sorted = [...scaryEatables]
		.filter(i => !user.user.favoriteItems.includes(i.item.id))
		.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))
		.sort((a, b) => {
			if (!userBank.has(a.item.id!)) return 1;
			if (!userBank.has(b.item.id!)) return -1;
			return 0;
		});

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const { id } = eatable.item;
		const { healAmount } = eatable;
		const amountOwned = userBank.amount(id!);
		const toRemove = Math.ceil(totalHealingCalc / healAmount);
		if (!amountOwned) continue;
		if (amountOwned >= toRemove) {
			totalHealingCalc -= Math.ceil(healAmount * toRemove);
			foodToRemove.add(id!, toRemove);
			break;
		} else {
			totalHealingCalc -= Math.ceil(healAmount * amountOwned);
			foodToRemove.add(id!, amountOwned);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}

export const bossEvents: BossEvent[] = [
	{
		id: PUMPKINHEAD_ID,
		name: 'Pumpkinhead',
		handleFinish: async (data, bossUsers) => {
			const lootElligible = shuffleArr(bossUsers.filter(i => !percentChance(i.deathChance)));
			const userLoot: Record<string, Bank> = {};
			for (const i of lootElligible) {
				userLoot[i.user.id] = new Bank();
				userLoot[i.user.id].add(pumpkinHeadNonUniqueTable.roll(5));
				if (roll(25)) {
					userLoot[i.user.id].add("Choc'rock");
				}
				await i.user.incrementKC(PUMPKINHEAD_ID, 1);
			}

			const lootGroups = chunk(lootElligible, 4).filter(i => i.length === 4);
			const uniqueItemRecipients = lootGroups.map(groupArr => randArrItem(groupArr));
			const uniqueLootStr = [];
			const rerolledUsersStr = [];

			const secondChancePeople = [];
			for (const lootElliPerson of lootElligible) {
				if (
					!uniqueItemRecipients.includes(lootElliPerson) &&
					numberOfPHeadItemsInCL(lootElliPerson.user) < 2 &&
					lootElliPerson.user.hasEquipped('Haunted amulet') &&
					roll(2)
				) {
					uniqueItemRecipients.push(lootElliPerson);
					secondChancePeople.push(lootElliPerson);
				}
			}

			const failoverEmojis = ['🙈', '🙉', '🙊'];
			const randomFailEmoji = () => randArrItem(failoverEmojis);
			for (const recip of uniqueItemRecipients) {
				const { cl } = recip.user;
				const items = pumpkinHeadUniqueTable.roll();
				const numPetsInCL = cl.amount('Mini Pumpkinhead');
				let pheadDropRate = 40 * (numPetsInCL + 1);
				const userPhKc = await recip.user.getKC(PUMPKINHEAD_ID);
				if (numPetsInCL === 0) {
					// 140 kc gets 60%
					const reductionPercent = calcPercentOfNum(calcWhatPercent(Math.min(140, userPhKc), 140), 60);
					pheadDropRate = Math.floor(reduceNumByPercent(pheadDropRate, reductionPercent));
				}
				if (roll(pheadDropRate)) {
					items.add('Mini Pumpkinhead');
				}

				let rerolled = false;

				// If no pet, and they already have 2 of this item in CL
				if (items.length === 1 && cl.amount(items.items()[0][0].id) >= 2) {
					// Roll them new loot
					const newRoll = pumpkinHeadUniqueTable.roll();
					newRoll.remove('Mini Pumpkinhead');
					// If the new loot has no pet, and they also have 2 of this item in CL,
					// they get nothing, and someone who didn't originally get a drop, now gets one,
					// however, the new recipient is subject to the same rerolling happening to them.
					if (newRoll.length === 1 && cl.amount(newRoll.items()[0][0].id) >= 2) {
						const newRecipient = randArrItem(lootElligible.filter(u => !uniqueItemRecipients.includes(u)));
						if (newRecipient && roll(2)) {
							uniqueItemRecipients.push(newRecipient);
							rerolledUsersStr.push(`${recip.user}'s loot got rerolled to ${newRecipient.user}!`);
						}
						continue;
					}

					items.bank = newRoll.bank;
					rerolled = true;
				}
				const hasPet = items.has('Mini Pumpkinhead');
				let str = `${rerolled ? '♻️ ' : ''}${recip.user} got ${items}`;
				if (hasPet) str = `<:Mini_pumpkinhead:904028863724675072>**${str}**`;
				if (secondChancePeople.includes(recip)) str = `<:Haunted_amulet:898407574527942677>${str}`;
				uniqueLootStr.push(str);
				userLoot[recip.user.id].add(items);
			}

			const specialLootRecipient = randArrItem(lootElligible);
			const specialLoot = new Bank()
				.add('Holiday mystery box')
				.add(LampTable.roll())
				.add(
					new LootTable()
						.add('Clue scroll (hard)', 1, 20)
						.add('Clue scroll (elite)', 1, 10)
						.add('Clue scroll (master)', 1, 5)
						.add('Clue scroll (grandmaster)', 1, 2)
						.roll()
				);
			userLoot[specialLootRecipient.user.id].add(specialLoot);

			for (const [id, bank] of Object.entries(userLoot)) {
				const user = bossUsers.find(u => u.user.id === id)!;
				await user.user.addItemsToBank({ items: bank, collectionLog: true });
			}

			sendToChannelID(data.channelID, {
				content: `<@&896845245873025067> **Your Group Finished Fighting Pumpkinhead the Pumpkinheaded Horror!**

*Everyone* received some Halloween candy!
${specialLootRecipient.user.usernameOrMention} received ${specialLoot}.
**Unique Loot:**
${uniqueLootStr.length > 0 ? uniqueLootStr.join('\n') : 'Nobody received any unique items!'}

**${randomFailEmoji()} Rerolled players:**
${rerolledUsersStr.length > 0 ? rerolledUsersStr.join('\n') : 'Nobody was rerolled!'}

**Key:** These Emoji by your name mean:
<:Haunted_amulet:898407574527942677> - Your Haunted amulet activated to give you a second chance!
♻ - You already had 2+ of the selected item and got a second chance.
<:Mini_pumpkinhead:904028863724675072> - You got the pet! Congratulations 🙂`,
				allowedMentions: { roles: ['896845245873025067'] }
			});
		},
		bossOptions: {
			id: PUMPKINHEAD_ID,
			baseDuration: Time.Hour,
			skillRequirements: {},
			itemBoosts: [],
			customDenier: async user => {
				const foodRequired = getScaryFoodFromBank(user, PUMPKINHEAD_HEALING_NEEDED);
				if (!foodRequired) {
					return [
						true,
						`Not enough food! You need special spooky food to fight Pumpkinhead: ${scaryEatables
							.map(i => `${i.item.name} (${i.healAmount} HP)`)
							.join(', ')}`
					];
				}
				return [false];
			},
			bisGear: new Gear(),
			gearSetup: 'melee',
			itemCost: async data => {
				const foodRequired = getScaryFoodFromBank(data.user, PUMPKINHEAD_HEALING_NEEDED);
				if (!foodRequired) {
					const fakeBank = new Bank();
					for (const { item } of scaryEatables) fakeBank.add(item.id, 100);
					return getScaryFoodFromBank(data.user, PUMPKINHEAD_HEALING_NEEDED, fakeBank) as Bank;
				}

				return foodRequired;
			},
			mostImportantStat: 'attack_crush',
			food: () => new Bank(),
			activity: 'BossEvent',
			minSize: production ? 5 : 1,
			solo: false,
			canDie: true,
			customDeathChance: () => {
				return 5;
			},
			quantity: 1,
			allowMoreThan1Solo: false,
			allowMoreThan1Group: false,
			automaticStartTime: production ? Time.Minute * 3 : Time.Second * 30,
			maxSize: 500,
			skipInvalidUsers: true,
			speedMaxReduction: 50
		}
	}
];

export async function bossActiveIsActiveOrSoonActive(id?: BossEvent['id']) {
	const results = await prisma.activity.findMany({
		where: {
			completed: false,
			type: 'BossEvent'
		}
	});

	const otherResults = await prisma.bossEvent.findMany({
		where: {
			completed: false,
			start_date: {
				lt: new Date(Date.now() + Time.Minute * 20)
			},
			id:
				id === undefined
					? undefined
					: {
							not: id
						}
		}
	});

	return results.length > 0 || otherResults.length > 0;
}

export async function startBossEvent({ boss, id }: { boss: BossEvent; id?: BossEvent['id'] }) {
	if (await bossActiveIsActiveOrSoonActive(id)) {
		throw new Error('There is already a boss event activity going on.');
	}
	const channel = globalClient.channels.cache.get(bossEventChannelID) as TextChannel;
	const instance = new BossInstance({
		...boss.bossOptions,
		channel,
		massText: `<@&896845245873025067> Pumpkinhead the Pumpkinheaded ${getPHeadDescriptor()} ${getPHeadDescriptor()} Horror has spawned! Who will fight him?!`,
		allowedMentions: { roles: ['896845245873025067'] },
		quantity: 1,
		leader: await mUserFetch(OWNER_IDS[0])
	});
	try {
		const { bossUsers } = await instance.start();
		const embed = new EmbedBuilder()
			.setDescription(
				`A group of ${bossUsers.length} users is off to fight ${
					boss.name
				}, good luck! The total trip will take ${formatDuration(instance.duration)}.`
			)
			.setImage('https://cdn.discordapp.com/attachments/357422607982919680/896527691849826374/PHEAD.png')
			.setColor('#ff9500');

		return channel.send({
			embeds: [embed],
			content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.',
			allowedMentions: {
				roles: ['896845245873025067']
			}
		});
	} catch (err: unknown) {
		logError(err);
	}
}
