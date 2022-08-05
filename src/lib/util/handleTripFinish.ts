import { activity_type_enum } from '@prisma/client';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { MessageAttachment, MessageCollector, MessageOptions } from 'discord.js';
import { randInt, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { alching } from '../../mahoji/commands/laps';
import { MysteryBoxes } from '../bsoOpenables';
import { ClueTiers } from '../clues/clueTiers';
import { COINS_ID, lastTripCache, LastTripRunArgs, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { inventionBoosts, InventionID, inventionItemBoost } from '../invention/inventions';
import { triggerRandomEvent } from '../randomEvents';
import { runCommand } from '../settings/settings';
import { ClientSettings } from '../settings/types/ClientSettings';
import { RuneTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { DougTable, PekyTable } from '../simulation/sharedTables';
import { SkillsEnum } from '../skilling/types';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, itemID, roll, toKMB, updateBankSetting, updateGPTrackSetting } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { makeDoClueButton, makeOpenCasketButton, makeRepeatTripButton } from './globalInteractions';
import { userHasItemsEquippedAnywhere } from './minionUtils';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

const activitiesToTrackAsPVMGPSource: activity_type_enum[] = [
	'GroupMonsterKilling',
	'MonsterKilling',
	'Raids',
	'ClueCompletion'
];

export interface TripFinishEffect {
	name: string;
	fn: (options: { data: ActivityTaskOptions; user: KlasaUser; loot: Bank | null; messages: string[] }) => unknown;
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(COINS_ID);
				if (typeof GP === 'number') {
					updateGPTrackSetting('gp_pvm', GP);
				}
			}
		}
	},
	{
		name: 'Implings',
		fn: async ({ data, messages, user }) => {
			const imp = await handlePassiveImplings(user, data);
			if (imp && imp.bank.length > 0) {
				const many = imp.bank.length > 1;
				messages.push(`Caught ${many ? 'some' : 'an'} impling${many ? 's' : ''}, you received: ${imp.bank}`);
				await user.addItemsToBank({ items: imp.bank, collectionLog: true });
			}
		}
	},
	{
		name: 'Growable Pets',
		fn: async ({ data, messages, user }) => {
			await handleGrowablePetGrowth(user, data, messages);
		}
	},
	{
		name: 'Random Events',
		fn: async ({ data, messages, user }) => {
			await triggerRandomEvent(user, data.duration, messages);
		}
	},
	{
		name: 'Loot Doubling',
		fn: async ({ data, messages, user, loot }) => {
			if (
				loot &&
				!data.cantBeDoubled &&
				!['GroupMonsterKilling', 'KingGoldemar', 'Ignecarus', 'Inferno', 'Alching', 'Agility'].includes(
					data.type
				) &&
				data.duration > Time.Minute * 20 &&
				roll(user.usingPet('Mr. E') ? 12 : 15)
			) {
				const otherLoot = new Bank().add(MysteryBoxes.roll());
				const bonusLoot = new Bank().add(loot).add(otherLoot);
				messages.push(`<:mysterybox:680783258488799277> **You received 2x loot and ${otherLoot}.**`);
				await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
				updateBankSetting(globalClient, ClientSettings.EconomyStats.TripDoublingLoot, bonusLoot);
			}
		}
	},
	{
		name: 'Custom Pet Perk',
		fn: async ({ data, messages, user }) => {
			const pet = user.equippedPet();
			const minutes = Math.floor(data.duration / Time.Minute);
			if (minutes < 5) return;
			let bonusLoot = new Bank();
			switch (pet) {
				case itemID('Peky'): {
					for (let i = 0; i < minutes; i++) {
						if (roll(10)) {
							bonusLoot.add(PekyTable.roll());
						}
					}
					messages.push(
						`<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Obis'): {
					let rolls = minutes / 3;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(RuneTable.roll());
					}
					messages.push(
						`<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Brock'): {
					let rolls = minutes / 3;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(WoodTable.roll());
					}
					messages.push(
						`<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Wilvus'): {
					let rolls = minutes / 6;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(WilvusTable.roll());
					}
					messages.push(
						`<:wilvus:787320791011164201> Wilvus did some pickpocketing during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Smokey'): {
					for (let i = 0; i < minutes; i++) {
						if (roll(450)) {
							bonusLoot.add(MysteryBoxes.roll());
						}
					}
					if (bonusLoot.length > 0) {
						messages.push(
							`<:smokey:787333617037869139> Smokey did some walking around while you were on your trip and found you ${bonusLoot}.`
						);
					}
					break;
				}
				case itemID('Doug'): {
					for (let i = 0; i < minutes / 2; i++) {
						bonusLoot.add(DougTable.roll());
					}
					messages.push(`Doug did some mining while you were on your trip and got you: ${bonusLoot}.`);
					break;
				}
				case itemID('Harry'): {
					for (let i = 0; i < minutes; i++) {
						bonusLoot.add('Banana', randInt(1, 3));
					}
					messages.push(`<:harry:749945071104819292>: ${bonusLoot}.`);
					break;
				}
				default: {
				}
			}
			await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
		}
	},
	{
		name: 'Voidling',
		fn: async ({ data, messages, user }) => {
			if (!user.allItemsOwned().has('Voidling')) return;
			const voidlingEquipped = user.usingPet('Voidling');
			const alchResult = alching({
				user,
				tripLength: voidlingEquipped
					? data.duration * (user.hasItemEquippedAnywhere('Magic master cape') ? 3 : 1)
					: data.duration / (user.hasItemEquippedAnywhere('Magic master cape') ? 1 : randInt(6, 7)),
				isUsingVoidling: true
			});
			if (alchResult !== null) {
				if (!user.owns(alchResult.bankToRemove)) {
					messages.push(
						`Your Voidling couldn't do any alching because you don't own ${alchResult.bankToRemove}.`
					);
				}
				await user.addItemsToBank({ items: alchResult.bankToAdd });
				await user.removeItemsFromBank(alchResult.bankToRemove);

				updateBankSetting(globalClient, ClientSettings.EconomyStats.MagicCostBank, alchResult.bankToRemove);

				updateGPTrackSetting('gp_alch', alchResult.bankToAdd.amount('Coins'));
				messages.push(
					`Your Voidling alched ${alchResult.maxCasts}x ${alchResult.itemToAlch.name}. Removed ${
						alchResult.bankToRemove
					} from your bank and added ${alchResult.bankToAdd}. ${
						!voidlingEquipped && !user.hasItemEquippedAnywhere('Magic master cape')
							? "As you left your Voidling in the bank, it didn't manage to alch at its full potential."
							: ''
					}${
						user.hasItemEquippedAnywhere('Magic master cape')
							? 'Voidling was buffed by your Magic Master cape, and is alching much faster!'
							: ''
					}`
				);
			} else if (user.getUserFavAlchs(Time.Minute * 30).length !== 0) {
				messages.push(
					"Your Voidling didn't alch anything because you either don't have any nature runes or fire runes."
				);
			}
		}
	},
	{
		name: 'Invention Effects',
		fn: async ({ data, messages, user }) => {
			if (userHasItemsEquippedAnywhere(user, 'Silverhawk boots') && data.duration > Time.Minute) {
				const costRes = await inventionItemBoost({
					userID: user.id,
					inventionID: InventionID.SilverHawkBoots,
					duration: data.duration
				});
				if (costRes.success) {
					const xpToReceive = inventionBoosts.silverHawks.passiveXPCalc(
						data.duration,
						user.skillLevel(SkillsEnum.Agility)
					);
					await user.addXP({
						skillName: SkillsEnum.Agility,
						amount: xpToReceive,
						multiplier: false,
						duration: data.duration
					});
					messages.push(`+${toKMB(xpToReceive)} Agility XP from Silverhawk boots (${costRes.messages})`);
				}
			}
		}
	}
];

export async function handleTripFinish(
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue:
		| undefined
		| [string, unknown[] | Record<string, unknown>, boolean?, string?]
		| ((args: LastTripRunArgs) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: MessageAttachment | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: Bank | null,
	_messages?: string[]
) {
	const perkTier = getUsersPerkTier(user);
	const messages: string[] = [];
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages });

	const clueReceived = loot ? ClueTiers.find(tier => loot.amount(tier.scrollID) > 0) : undefined;

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message += `\n**Messages:** ${messages.join(', ')}`;
	}

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;

	const runCmdOptions = {
		channelID,
		userID: user.id,
		guildID: isGuildBasedChannel(channel) && channel.guild ? channel.guild.id : undefined,
		user,
		member: null
	};

	const onContinueFn = Array.isArray(onContinue)
		? (args: LastTripRunArgs) =>
				runCommand({
					commandName: onContinue[0],
					args: onContinue[1],
					isContinue: onContinue[2],
					method: onContinue[3],
					bypassInhibitors: true,
					...runCmdOptions,
					...args
				})
		: onContinue;

	if (onContinueFn) lastTripCache.set(user.id, { data, continue: onContinueFn });
	const components: MessageOptions['components'] = [[]];
	if (onContinueFn) components[0].push(makeRepeatTripButton());
	if (clueReceived && perkTier > PerkTier.One) components[0].push(makeDoClueButton(clueReceived));

	const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
	if (casketReceived) components[0].push(makeOpenCasketButton(casketReceived));
	sendToChannelID(channelID, {
		content: message,
		image: attachment,
		components: components[0].length > 0 ? components : undefined
	});
}
