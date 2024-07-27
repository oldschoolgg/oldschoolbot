import type { TameActivity } from '@prisma/client';
import {
	type APIInteractionGuildMember,
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	type GuildMember,
	userMention
} from 'discord.js';
import { Time, increaseNumByPercent, isFunction, percentChance, randArrItem, randInt, roll } from 'e';
import { isEmpty } from 'lodash';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { BitField } from '../../lib/constants';
import { handlePassiveImplings } from '../../lib/implings';
import { trackLoot } from '../../lib/lootTrack';
import { allOpenables } from '../../lib/openables';

import { runCommand } from '../../lib/settings/settings';
import { getTemporossLoot } from '../../lib/simulation/tempoross';
import { WintertodtCrate } from '../../lib/simulation/wintertodt';
import type { MTame } from '../../lib/structures/MTame';
import {
	type ArbitraryTameActivity,
	TameSpeciesID,
	type TameTaskOptions,
	TameType,
	seaMonkeySpells,
	tameKillableMonsters
} from '../../lib/tames';
import type { ActivityTaskData } from '../../lib/types/minions';
import { assert, calcPerHour, formatDuration, itemNameFromID } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleCrateSpawns } from '../../lib/util/handleCrateSpawns';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { tameLastFinishedActivity } from '../../lib/util/tameUtil';
import { sendToChannelID } from '../../lib/util/webhook';
import { collectables } from '../../mahoji/lib/collectables';

export async function handleFinish({
	lootToAdd,
	user,
	activity,
	tame,
	message
}: { lootToAdd: Bank; message: string; user: MUser; tame: MTame; activity: TameActivity }) {
	const results: string[] = [message];
	const previousTameCl = tame.totalLoot.clone();
	const crateRes = handleCrateSpawns(user, activity.duration);
	if (crateRes !== null) lootToAdd.add(crateRes);

	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			max_total_loot: previousTameCl.clone().add(lootToAdd).bank,
			last_activity_date: new Date()
		}
	});
	const { itemsAdded } = await user.addItemsToBank({ items: lootToAdd, collectionLog: false });
	results.push(`Received ${itemsAdded}`);

	const addRes = await tame.addDuration(activity.duration);
	if (addRes) results.push(addRes);

	return sendToChannelID(activity.channel_id, {
		content: results.join(', '),
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('REPEAT_TAME_TRIP')
					.setLabel('Repeat Trip')
					.setStyle(ButtonStyle.Secondary)
			)
		],
		files:
			itemsAdded.length > 0
				? [
						new AttachmentBuilder(
							(
								await makeBankImage({
									bank: lootToAdd,
									title: `${tame}'s Loot`,
									user: user,
									previousCL: previousTameCl
								})
							).file.attachment
						)
					]
				: undefined
	});
}

export const arbitraryTameActivities: ArbitraryTameActivity[] = [
	{
		name: 'Tempoross',
		id: 'Tempoross',
		allowedTames: [TameSpeciesID.Monkey],
		run: async ({ handleFinish, user, duration, tame, previousTameCL, activity }) => {
			const quantity = Math.ceil(duration / (Time.Minute * 5));
			const loot = getTemporossLoot(quantity, tame.maxGathererLevel + 15, previousTameCL);
			handleFinish({
				lootToAdd: loot,
				message: `${user}, ${tame} finished defeating Tempoross ${quantity}x times.`,
				user,
				tame,
				activity
			});
		}
	},
	{
		name: 'Wintertodt',
		id: 'Wintertodt',
		allowedTames: [TameSpeciesID.Igne],
		run: async ({ handleFinish, user, duration, tame, activity }) => {
			const quantity = Math.ceil(duration / (Time.Minute * 5));
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				loot.add(
					WintertodtCrate.open({
						points: randArrItem([500, 500, 750, 1000]),
						itemsOwned: user.bank.bank,
						skills: user.skillsAsXP,
						firemakingXP: user.skillsAsXP.firemaking
					})
				);
			}
			handleFinish({
				lootToAdd: loot,
				message: `${user}, ${tame} finished defeating Wintertodt ${quantity}x times.`,
				user,
				activity,
				tame
			});
		}
	}
];

async function handleImplingLocator(user: MUser, tame: MTame, duration: number, loot: Bank, messages: string[]) {
	if (tame.hasBeenFed('Impling locator')) {
		const result = await handlePassiveImplings(
			user,
			{
				type: 'MonsterKilling',
				duration
			} as ActivityTaskData,
			messages,
			true
		);
		if (result && result.bank.length > 0) {
			const actualImplingLoot = new Bank();
			for (const [item, qty] of result.bank.items()) {
				const openable = allOpenables.find(i => i.id === item.id)!;
				assert(!isEmpty(openable));
				actualImplingLoot.add(
					isFunction(openable.output)
						? (
								await openable.output({
									user,
									quantity: qty,
									self: openable,
									totalLeaguesPoints: 0
								})
							).bank
						: openable.output.roll(qty)
				);
			}
			loot.add(actualImplingLoot);
			messages.push(`${tame} caught ${result.bank} with their Impling locator!`);
			await tame.addToStatsBank('implings_loot', actualImplingLoot);
		}
	}
}

export async function runTameTask(activity: TameActivity, tame: MTame) {
	const user = await mUserFetch(activity.user_id);

	const activityData = activity.data as any as TameTaskOptions;
	switch (activityData.type) {
		case 'pvm': {
			const { quantity, monsterID } = activityData;
			const mon = tameKillableMonsters.find(i => i.id === monsterID)!;

			let killQty = quantity - activity.deaths;
			if (killQty < 1) {
				handleFinish({
					lootToAdd: new Bank(),
					message: `${userMention(user.id)}, Your tame died in all their attempts to kill ${
						mon.name
					}. Get them some better armor!`,
					user,
					activity,
					tame
				});
				return;
			}
			const hasOri = tame.hasBeenFed('Ori');

			const oriIsApplying = hasOri && mon.oriWorks !== false;
			// If less than 8 kills, roll 25% chance per kill
			if (oriIsApplying) {
				if (killQty >= 8) {
					killQty = Math.ceil(increaseNumByPercent(killQty, 25));
				} else {
					for (let i = 0; i < quantity; i++) {
						if (roll(4)) killQty++;
					}
				}
			}
			const loot = mon.loot({ quantity: killQty, tame });
			const messages: string[] = [];

			let str = `${user}, ${tame} finished killing ${quantity}x ${mon.name}.${
				activity.deaths > 0 ? ` ${tame} died ${activity.deaths}x times.` : ''
			}`;
			if (oriIsApplying) {
				messages.push('25% extra loot (ate an Ori)');
			}

			const { doubleLootMsg } = tame.doubleLootCheck(loot);
			str += doubleLootMsg;
			await handleImplingLocator(user, tame, activity.duration, loot, messages);

			if (messages.length > 0) {
				str += `\n\n**Messages:** ${messages.join(', ')}.`;
			}

			await trackLoot({
				duration: activity.duration,
				kc: activityData.quantity,
				id: mon.name,
				changeType: 'loot',
				type: 'Monster',
				totalLoot: loot,
				suffix: 'tame',
				users: [
					{
						id: user.id,
						loot,
						duration: activity.duration
					}
				]
			});
			handleFinish({
				lootToAdd: loot,
				message: str,
				user,
				activity,
				tame
			});
			break;
		}
		case 'collect': {
			const { quantity, itemID } = activityData;
			const collectable = collectables.find(c => c.item.id === itemID)!;
			const totalQuantity = quantity * collectable.quantity;
			const loot = new Bank().add(collectable.item.id, totalQuantity);
			let str = `${user}, ${tame} finished collecting ${totalQuantity}x ${
				collectable.item.name
			}. (${Math.round((totalQuantity / (activity.duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
			const { doubleLootMsg } = tame.doubleLootCheck(loot);
			str += doubleLootMsg;
			handleFinish({
				lootToAdd: loot,
				message: str,
				user,
				tame,
				activity
			});
			break;
		}
		case 'SpellCasting': {
			const spell = seaMonkeySpells.find(s => s.id === activityData.spellID)!;
			const loot = new Bank(activityData.loot);
			let str = `${user}, ${tame} finished casting the ${spell.name} spell for ${formatDuration(
				activity.duration
			)}. ${loot
				.items()
				.map(([item, qty]) => `${Math.floor(calcPerHour(qty, activity.duration)).toFixed(1)}/hr ${item.name}`)
				.join(', ')}`;
			const { doubleLootMsg } = tame.doubleLootCheck(loot);
			str += doubleLootMsg;
			handleFinish({
				lootToAdd: loot,
				message: str,
				user,
				activity,
				tame
			});
			break;
		}
		case 'Clues': {
			const clueTier = ClueTiers.find(c => c.scrollID === activityData.clueID)!;
			const messages: string[] = [];
			const loot = new Bank();

			await handleImplingLocator(user, tame, activity.duration, loot, messages);

			let actualOpenQuantityWithBonus = 0;
			for (let i = 0; i < activityData.quantity; i++) {
				actualOpenQuantityWithBonus += randInt(1, 3);
			}

			if (clueTier.name === 'Master' && !user.bitfield.includes(BitField.DisabledTameClueOpening)) {
				const hasDivineRing = tame.hasEquipped('Divine ring');
				const percentChanceOfGMC = hasDivineRing ? 3.5 : 1.5;
				for (let i = 0; i < activityData.quantity; i++) {
					if (percentChance(percentChanceOfGMC)) {
						loot.add('Clue scroll (grandmaster)');
					}
				}
				if (hasDivineRing) messages.push('2x GMC droprate for divine ring');
			}

			if (user.bitfield.includes(BitField.DisabledTameClueOpening)) {
				loot.add(clueTier.id, activityData.quantity);
			} else {
				const openingLoot = clueTier.table.open(actualOpenQuantityWithBonus, user);

				if (tame.hasEquipped('Abyssal jibwings') && clueTier !== ClueTiers[0]) {
					const lowerTier = ClueTiers[ClueTiers.indexOf(clueTier) - 1];
					const abysJwLoot = new Bank();
					let bonusClues = 0;
					for (let i = 0; i < activityData.quantity; i++) {
						if (percentChance(5)) {
							bonusClues++;
							abysJwLoot.add(lowerTier.table.open(1, user));
						}
					}
					if (abysJwLoot.length > 0) {
						loot.add(abysJwLoot);
						await tame.addToStatsBank('abyssal_jibwings_loot', abysJwLoot);
						messages.push(
							`You received the loot from ${bonusClues}x ${lowerTier.name} caskets from your Abyssal jibwings.`
						);
					}
				} else if (tame.hasEquipped('3rd age jibwings') && openingLoot.has('Coins')) {
					const thirdAgeJwLoot = new Bank().add('Coins', openingLoot.amount('Coins'));
					loot.add(thirdAgeJwLoot);
					messages.push(`You received ${thirdAgeJwLoot} from your 3rd age jibwings.`);
					await tame.addToStatsBank('third_age_jibwings_loot', thirdAgeJwLoot);
				}

				loot.add(openingLoot);
			}

			if (tame.hasBeenFed('Elder knowledge') && roll(15)) {
				await tame.addToStatsBank('elder_knowledge_loot_bank', loot);
				loot.multiply(2);
				messages.push('2x loot from Elder knowledge (1/15 chance)');
			}

			let str = `${user}, ${tame} finished completing ${activityData.quantity}x ${itemNameFromID(
				clueTier.scrollID
			)}. (${Math.floor(calcPerHour(activityData.quantity, activity.duration)).toFixed(1)} clues/hr)`;

			if (messages) {
				str += `\n\n${messages.join('\n')}`;
			}

			handleFinish({
				lootToAdd: loot,
				message: str,
				user,
				activity,
				tame
			});
			break;
		}
		case 'Tempoross':
		case 'Wintertodt': {
			const previousTameCL = await prisma.userStats.findFirst({
				where: {
					user_id: BigInt(user.id)
				},
				select: {
					tame_cl_bank: true
				}
			});
			const act = arbitraryTameActivities.find(i => i.id === activityData.type)!;
			await act.run({
				handleFinish,
				user,
				tame,
				duration: activity.duration,
				previousTameCL: new Bank(previousTameCL?.tame_cl_bank as ItemBank),
				activity
			});
			break;
		}
		default: {
			console.error('Unmatched tame activity type', activity.type);
			break;
		}
	}
}

export async function repeatTameTrip({
	channelID,
	guildID,
	user,
	member,
	interaction,
	continueDeltaMillis
}: {
	channelID: string;
	guildID: string | null;
	user: MUser;
	member: APIInteractionGuildMember | GuildMember | null;
	interaction: ButtonInteraction | ChatInputCommandInteraction;
	continueDeltaMillis: number | null;
}) {
	const activity = await tameLastFinishedActivity(user);
	if (!activity) {
		return;
	}
	const data = activity.data as unknown as TameTaskOptions;
	switch (data.type) {
		case TameType.Combat: {
			const mon = tameKillableMonsters.find(i => i.id === data.monsterID);
			return runCommand({
				commandName: 'tames',
				args: {
					kill: {
						name: mon!.name
					}
				},
				bypassInhibitors: true,
				channelID,
				guildID,
				user,
				member,
				interaction,
				continueDeltaMillis
			});
		}
		case TameType.Gatherer: {
			return runCommand({
				commandName: 'tames',
				args: {
					collect: {
						name: getOSItem(data.itemID).name
					}
				},
				bypassInhibitors: true,
				channelID,
				guildID,
				user,
				member,
				interaction,
				continueDeltaMillis
			});
		}
		case 'SpellCasting': {
			let args = {};
			switch (data.spellID) {
				case 1: {
					args = {
						tan: getOSItem(data.itemID).name
					};
					break;
				}
				case 2: {
					args = {
						plank_make: getOSItem(data.itemID).name
					};
					break;
				}
				case 3: {
					args = {
						spin_flax: 'flax'
					};
					break;
				}
				case 4: {
					args = {
						superglass_make: 'molten glass'
					};
					break;
				}
			}
			return runCommand({
				commandName: 'tames',
				args: {
					cast: args
				},
				bypassInhibitors: true,
				channelID,
				guildID,
				user,
				member,
				interaction,
				continueDeltaMillis
			});
		}
		case 'Tempoross':
		case 'Wintertodt': {
			return runCommand({
				commandName: 'tames',
				args: {
					activity: {
						name: data.type
					}
				},
				bypassInhibitors: true,
				channelID,
				guildID,
				user,
				member,
				interaction,
				continueDeltaMillis
			});
		}
		case 'Clues': {
			const clueTier = ClueTiers.find(c => c.scrollID === data.clueID)!;
			return runCommand({
				commandName: 'tames',
				args: {
					clue: {
						clue: clueTier.name
					}
				},
				bypassInhibitors: true,
				channelID,
				guildID,
				user,
				member,
				interaction,
				continueDeltaMillis
			});
		}
		default: {
		}
	}
}
