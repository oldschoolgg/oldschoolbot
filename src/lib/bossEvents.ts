import { MessageEmbed, TextChannel } from 'discord.js';
import { chunk, percentChance, randArrItem, shuffleArr, Time } from 'e';
import { KlasaClient } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { production } from '../config';
import { getScaryFoodFromBank, scaryEatables } from './constants';
import { prisma } from './settings/prisma';
import {
	getPHeadDescriptor,
	numberOfPHeadItemsInCL,
	PUMPKINHEAD_HEALING_NEEDED,
	PUMPKINHEAD_ID,
	pumpkinHeadNonUniqueTable,
	pumpkinHeadUniqueTable
} from './simulation/pumpkinHead';
import { BossInstance, BossOptions, BossUser } from './structures/Boss';
import { Gear } from './structures/Gear';
import { NewBossOptions } from './types/minions';
import { formatDuration, roll } from './util';
import { sendToChannelID } from './util/webhook';
import { LampTable } from './xpLamps';

interface BossEvent {
	id: number;
	name: string;
	bossOptions: Omit<BossOptions, 'leader' | 'channel' | 'massText' | 'settingsKeys'>;
	handleFinish: (options: NewBossOptions, bossUsers: BossUser[]) => Promise<void>;
}

export const bossEventChannelID = production ? '897170239333220432' : '895410639835639808';

export const bossEvents: BossEvent[] = [
	{
		id: PUMPKINHEAD_ID,
		name: 'Pumpkinhead',
		handleFinish: async (data, bossUsers) => {
			const lootElligible = shuffleArr(bossUsers.filter(i => !percentChance(i.deathChance)));
			let userLoot: Record<string, Bank> = {};
			for (const i of lootElligible) {
				userLoot[i.user.id] = new Bank();
				userLoot[i.user.id].add(pumpkinHeadNonUniqueTable.roll(5));
				if (roll(25)) {
					userLoot[i.user.id].add("Choc'rock");
				}
				await i.user.incrementMonsterScore(PUMPKINHEAD_ID, 1);
			}

			const lootGroups = chunk(lootElligible, 4).filter(i => i.length === 4);
			const uniqueItemRecipients = lootGroups.map(groupArr => randArrItem(groupArr));
			let uniqueLootStr = [];

			let secondChancePeople = [];
			for (const lootElliPerson of lootElligible) {
				if (
					!uniqueItemRecipients.includes(lootElliPerson) &&
					numberOfPHeadItemsInCL(lootElliPerson.user) < 2 &&
					lootElliPerson.user.hasItemEquippedAnywhere('Haunted amulet') &&
					roll(2)
				) {
					uniqueItemRecipients.push(lootElliPerson);
					secondChancePeople.push(lootElliPerson);
				}
			}

			for (const recip of uniqueItemRecipients) {
				const cl = recip.user.cl();
				const items = pumpkinHeadUniqueTable.roll();
				const numPetsInCL = cl.amount('Mini Pumpkinhead');
				const pheadDropRate = 40 * (numPetsInCL + 1);
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
							uniqueLootStr.push(`${recip.user}'s loot got rerolled to ${newRecipient.user}!`);
						}
						continue;
					}

					items.bank = newRoll.bank;
					rerolled = true;
				}
				const hasPet = items.has('Mini Pumpkinhead');
				let str = `${rerolled ? '♻️ ' : ''}${recip.user} got ${items}`;
				if (hasPet) str = `**${str}**`;
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
						.add('Clue scroll (Grandmaster)', 1, 2)
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
${specialLootRecipient.user.username} received ${specialLoot}.
**Unique Loot:** ${
					uniqueLootStr.length > 0
						? chunk(uniqueLootStr, 10)
								.map(arr => arr.join(', '))
								.join('\n')
						: 'Nobody received any unique items!'
				}`
			});
		},
		bossOptions: {
			id: PUMPKINHEAD_ID,
			baseDuration: Time.Hour,
			skillRequirements: {},
			itemBoosts: [],
			customDenier: async user => {
				const foodRequired = getScaryFoodFromBank(user.bank(), PUMPKINHEAD_HEALING_NEEDED);
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
				const foodRequired = getScaryFoodFromBank(data.user.bank(), PUMPKINHEAD_HEALING_NEEDED);
				if (!foodRequired) {
					let fakeBank = new Bank();
					for (const { item } of scaryEatables) fakeBank.add(item.id, 100);
					return getScaryFoodFromBank(fakeBank, PUMPKINHEAD_HEALING_NEEDED) as Bank;
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
			automaticStartTime: production ? Time.Minute * 5 : Time.Minute,
			maxSize: 500
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

export async function startBossEvent({
	boss,
	client,
	id
}: {
	boss: BossEvent;
	client: KlasaClient;
	id?: BossEvent['id'];
}) {
	if (await bossActiveIsActiveOrSoonActive(id)) {
		throw new Error('There is already a boss event activity going on.');
	}
	const channel = client.channels.cache.get(bossEventChannelID) as TextChannel;
	const instance = new BossInstance({
		...boss.bossOptions,
		channel,
		massText: `<@&896845245873025067> Pumpkinhead the Pumpkinheaded ${getPHeadDescriptor()} ${getPHeadDescriptor()} Horror has spawned! Who will fight him?!`,
		quantity: 1
	});
	try {
		const { bossUsers } = await instance.start();
		const embed = new MessageEmbed()
			.setDescription(
				`A group of ${bossUsers.length} users is off to fight ${
					boss.name
				}, good luck! The total trip will take ${formatDuration(instance.duration)}.`
			)
			.setImage('https://cdn.discordapp.com/attachments/357422607982919680/896527691849826374/PHEAD.png')
			.setColor('#ff9500');

		return channel.send({
			embeds: [embed],
			content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : undefined,
			allowedMentions: {
				roles: ['896845245873025067']
			}
		});
	} catch (err: unknown) {
		client.wtf(err as Error);
	}
}
