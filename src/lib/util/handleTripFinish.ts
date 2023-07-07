import { mentionCommand } from '@oldschoolgg/toolkit';
import { activity_type_enum } from '@prisma/client';
import { AttachmentBuilder, bold, ButtonBuilder, MessageCollector } from 'discord.js';
import { randInt, reduceNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import { alching } from '../../mahoji/commands/laps';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { canRunAutoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { handleTriggerShootingStar } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { updateClientGPTrackSetting, userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';
import { MysteryBoxes } from '../bsoOpenables';
import { ClueTiers } from '../clues/clueTiers';
import { BitField, COINS_ID, Emoji, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { inventionBoosts, InventionID, inventionItemBoost } from '../invention/inventions';
import { triggerRandomEvent } from '../randomEvents';
import { RuneTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { DougTable, PekyTable } from '../simulation/sharedTables';
import { SkillsEnum } from '../skilling/types';
import { getUsersCurrentSlayerInfo } from '../slayer/slayerUtil';
import { ActivityTaskOptions } from '../types/minions';
import { buildClueButtons, channelIsSendable, itemID, makeComponents, roll, toKMB } from '../util';
import {
	makeAutoContractButton,
	makeBirdHouseTripButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeOpenSeedPackButton,
	makeRepeatTripButton
} from './globalInteractions';
import { updateBankSetting } from './updateBankSetting';
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
	fn: (options: { data: ActivityTaskOptions; user: MUser; loot: Bank | null; messages: string[] }) => unknown;
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(COINS_ID);
				if (typeof GP === 'number') {
					updateClientGPTrackSetting('gp_pvm', GP);
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
				userStatsBankUpdate(user.id, 'passive_implings_bank', imp.bank);
				await transactItems({ userID: user.id, itemsToAdd: imp.bank, collectionLog: true });
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
			await triggerRandomEvent(user, data.type, data.duration, messages);
		}
	},
	{
		name: 'Loot Doubling',
		fn: async ({ data, messages, user, loot }) => {
			const cantBeDoubled = ['GroupMonsterKilling', 'KingGoldemar', 'Ignecarus', 'Inferno', 'Alching', 'Agility'];
			if (
				loot &&
				!data.cantBeDoubled &&
				!cantBeDoubled.includes(data.type) &&
				data.duration > Time.Minute * 20 &&
				roll(user.usingPet('Mr. E') ? 12 : 15)
			) {
				const otherLoot = new Bank().add(MysteryBoxes.roll());
				const bonusLoot = new Bank().add(loot).add(otherLoot);
				messages.push(`<:mysterybox:680783258488799277> **You received 2x loot and ${otherLoot}.**`);
				userStatsBankUpdate(user.id, 'doubled_loot_bank', bonusLoot);
				await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
				updateBankSetting('trip_doubling_loot', bonusLoot);
			}
		}
	},
	{
		name: 'Custom Pet Perk',
		fn: async ({ data, messages, user }) => {
			const pet = user.user.minion_equippedPet;
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
					userStatsBankUpdate(user.id, 'peky_loot_bank', bonusLoot);
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
					userStatsBankUpdate(user.id, 'obis_loot_bank', bonusLoot);
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
					userStatsBankUpdate(user.id, 'brock_loot_bank', bonusLoot);
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
					userStatsBankUpdate(user.id, 'wilvus_loot_bank', bonusLoot);
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
					userStatsBankUpdate(user.id, 'smokey_loot_bank', bonusLoot);
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
					userStatsBankUpdate(user.id, 'doug_loot_bank', bonusLoot);
					messages.push(`Doug did some mining while you were on your trip and got you: ${bonusLoot}.`);
					break;
				}
				case itemID('Harry'): {
					for (let i = 0; i < minutes; i++) {
						bonusLoot.add('Banana', randInt(1, 3));
					}
					userStatsBankUpdate(user.id, 'harry_loot_bank', bonusLoot);
					messages.push(`<:harry:749945071104819292>: ${bonusLoot}.`);
					break;
				}
				default: {
				}
			}
			if (bonusLoot.length > 0) {
				await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
			}
		}
	},
	{
		name: 'Voidling',
		fn: async ({ data, messages, user }) => {
			if (!user.allItemsOwned.has('Voidling')) return;
			const voidlingEquipped = user.usingPet('Voidling');
			const alchResult = alching({
				user,
				tripLength: voidlingEquipped
					? data.duration * (user.hasEquipped('Magic master cape') ? 3 : 1)
					: data.duration / (user.hasEquipped('Magic master cape') ? 1 : randInt(6, 7)),
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

				updateBankSetting('magic_cost_bank', alchResult.bankToRemove);

				updateClientGPTrackSetting('gp_alch', alchResult.bankToAdd.amount('Coins'));
				messages.push(
					`<:Voidling:886284972380545034> ${alchResult.maxCasts}x ${
						alchResult.itemToAlch.name
					} <:alch:739456571347566623> ${toKMB(alchResult.bankToAdd.amount('Coins'))} GP ${
						!voidlingEquipped && !user.hasEquipped('Magic master cape')
							? '<:bank:739459924693614653>⏬'
							: ''
					}${user.hasEquipped('Magic master cape') ? '<:Magicmastercape:1115026341314703492>⏫' : ''}`
				);
			} else if (user.favAlchs(Time.Minute * 30).length !== 0) {
				messages.push(
					"Your Voidling didn't alch anything because you either don't have any nature runes or fire runes."
				);
			}
		}
	},
	{
		name: 'Invention Effects',
		fn: async ({ data, messages, user }) => {
			if (user.hasEquipped('Silverhawk boots') && data.duration > Time.Minute) {
				const costRes = await inventionItemBoost({
					user,
					inventionID: InventionID.SilverHawkBoots,
					duration: data.duration
				});
				if (costRes.success) {
					const xpToReceive = inventionBoosts.silverHawks.passiveXPCalc(
						data.duration,
						user.skillLevel(SkillsEnum.Agility)
					);
					userStatsUpdate(user.id, () => ({
						silverhawk_boots_passive_xp: {
							increment: xpToReceive
						}
					}));
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
	},
	{
		name: 'Message in a Bottle',
		fn: async ({ data, messages, user }) => {
			const underwaterTrips: activity_type_enum[] = [
				activity_type_enum.UnderwaterAgilityThieving,
				activity_type_enum.DepthsOfAtlantis
			];
			if (!underwaterTrips.includes(data.type)) return;
			if (!roll(500)) return;
			messages.push('You found a message in a bottle!');
			const bottleLoot = new Bank().add('Message in a bottle');
			await user.addItemsToBank({ items: bottleLoot, collectionLog: true });
		}
	},
	{
		name: 'Crate Spawns',
		fn: async ({ data, messages, user }) => {
			const accountAge = user.accountAgeInDays();
			let dropratePerMinute = 15 * 60;
			if (accountAge) {
				if (user.isIronman) {
					dropratePerMinute = Math.floor(reduceNumByPercent(dropratePerMinute, 15));
				}
			}
			const minutes = Math.floor(data.duration / Time.Minute);

			dropratePerMinute = Math.floor(dropratePerMinute / 6);

			if (user.cl.amount('Birthday crate (s2)') === 0) {
				dropratePerMinute = Math.floor(reduceNumByPercent(dropratePerMinute, 75));
			}

			for (let i = 0; i < minutes; i++) {
				if (roll(dropratePerMinute)) {
					const loot = new Bank().add('Birthday crate (s2)');
					await user.addItemsToBank({ items: loot, collectionLog: true });
					messages.push(bold(`You found ${loot}!`));
				}
			}
		}
	},
	{
		name: 'Bug Finding',
		fn: async ({ data, messages, user }) => {
			if (!user.bank.has('Bug jar')) return;
			const minutes = Math.floor(data.duration / Time.Minute);
			for (let i = 0; i < minutes; i++) {
				// Find a bug every 2 hours
				if (roll(120)) {
					await transactItems({
						userID: user.id,
						collectionLog: false,
						itemsToAdd: new Bank().add('Full bug jar'),
						itemsToRemove: new Bank().add('Bug jar')
					});
					messages.push(
						bold(`You found a bug! Hand it in using ${mentionCommand(globalClient, 'birthday', 'hand_in')}`)
					);
					break;
				}
			}
		}
	}
];

export async function handleTripFinish(
	user: MUser,
	channelID: string,
	message: string,
	attachment: AttachmentBuilder | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: Bank | null,
	_messages?: string[],
	_components?: ButtonBuilder[]
) {
	const perkTier = user.perkTier();
	const messages: string[] = [];
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages });

	const clueReceived = loot ? ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0) : [];

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message += `\n**Messages:** ${messages.join(', ')}`;
	}

	if (clueReceived.length > 0 && perkTier < PerkTier.Two) {
		clueReceived.map(clue => (message += `\n${Emoji.Casket} **You got a ${clue.name} clue scroll** in your loot.`));
	}

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;

	const components: ButtonBuilder[] = [];
	components.push(makeRepeatTripButton());
	const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
	if (casketReceived) components.push(makeOpenCasketButton(casketReceived));
	if (perkTier > PerkTier.One) {
		components.push(...buildClueButtons(loot, perkTier));
		const birdHousedetails = await calculateBirdhouseDetails(user.id);
		if (birdHousedetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton))
			components.push(makeBirdHouseTripButton());

		if ((await canRunAutoContract(user)) && !user.bitfield.includes(BitField.DisableAutoFarmContractButton))
			components.push(makeAutoContractButton());

		const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
		if ((currentTask === null || currentTask.quantity_remaining <= 0) && data.type === 'MonsterKilling') {
			components.push(makeNewSlayerTaskButton());
		}
		if (loot?.has('Seed pack')) {
			components.push(makeOpenSeedPackButton());
		}
	}

	if (_components) {
		components.push(..._components);
	}

	handleTriggerShootingStar(user, data, components);

	sendToChannelID(channelID, {
		content: message,
		image: attachment,
		components: components.length > 0 ? makeComponents(components) : undefined
	});
}
