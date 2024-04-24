import { mentionCommand } from '@oldschoolgg/toolkit';
import { activity_type_enum } from '@prisma/client';
import { AttachmentBuilder, bold, ButtonBuilder, MessageCollector, MessageCreateOptions } from 'discord.js';
import { notEmpty, randArrItem, randInt, roll, shuffleArr, Time } from 'e';
import { Bank } from 'oldschooljs';

import { alching } from '../../mahoji/commands/laps';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { canRunAutoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { handleTriggerShootingStar } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { updateClientGPTrackSetting, userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';
import { chargePortentIfHasCharges, getAllPortentCharges, PortentID } from '../bso/divination';
import { gods } from '../bso/divineDominion';
import { MysteryBoxes } from '../bsoOpenables';
import { ClueTiers } from '../clues/clueTiers';
import { buildClueButtons } from '../clues/clueUtils';
import { combatAchievementTripEffect } from '../combat_achievements/combatAchievements';
import { BitField, COINS_ID, Emoji, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { inventionBoosts, InventionID, inventionItemBoost } from '../invention/inventions';
import { mysteriousStepData } from '../mysteryTrail';
import { triggerRandomEvent } from '../randomEvents';
import { RuneTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { DougTable, PekyTable } from '../simulation/sharedTables';
import {
	zygomiteFarmingSource,
	zygomiteMutSurvivalChance,
	zygomiteSeedMutChance
} from '../skilling/skills/farming/zygomites';
import { SkillsEnum } from '../skilling/types';
import { getUsersCurrentSlayerInfo } from '../slayer/slayerUtil';
import { ActivityTaskData } from '../types/minions';
import { channelIsSendable, makeComponents, perHourChance, toKMB } from '../util';
import { mahojiChatHead } from './chatHeadImage';
import {
	makeAutoContractButton,
	makeAutoSlayButton,
	makeBirdHouseTripButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeOpenSeedPackButton,
	makeRepeatTripButton
} from './globalInteractions';
import { handleCrateSpawns } from './handleCrateSpawns';
import itemID from './itemID';
import { logError } from './logError';
import { updateBankSetting } from './updateBankSetting';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

const activitiesToTrackAsPVMGPSource: activity_type_enum[] = [
	'GroupMonsterKilling',
	'MonsterKilling',
	'Raids',
	'ClueCompletion'
];

interface TripFinishEffectOptions {
	data: ActivityTaskData;
	user: MUser;
	loot: Bank | null;
	messages: string[];
	portents?: Awaited<ReturnType<typeof getAllPortentCharges>>;
}
export interface TripFinishEffect {
	name: string;
	fn: (options: TripFinishEffectOptions) => unknown;
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
			const imp = await handlePassiveImplings(user, data, messages);
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
			if (user.hasEquippedOrInBank('Silverhawk boots') && data.duration >= Time.Minute * 5) {
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
			const crateRes = await handleCrateSpawns(user, data.duration);
			if (crateRes !== null) {
				messages.push(crateRes);
			}
		}
	},
	{
		name: 'God Favour',
		fn: async ({ data, user }) => {
			if (!('monsterID' in data)) return;
			if (data.type !== 'MonsterKilling') return;
			const favourableGod = gods.find(g => g.friendlyMonsters.includes(data.monsterID as number));
			if (!favourableGod) return;
			const unfavorableGods = gods.filter(g => g.name !== favourableGod.name);
			await user.addToGodFavour(
				unfavorableGods.map(g => g.name).filter(g => g !== 'Guthix'),
				data.duration
			);
		}
	},
	{
		name: 'Combat Achievements',
		fn: combatAchievementTripEffect
	},
	{
		name: 'Mysterious trail',
		fn: async ({ data, user, messages }) => {
			if (user.skillsAsLevels.hunter < 100) return;
			if (!user.owns('Mysterious clue (1)')) return;
			if (user.user.bso_mystery_trail_current_step_id === null) return;
			const { step, stepData, previousStepData, nextStep } = user.getMysteriousTrailData();
			if (!step || !(await step.didPass(data))) {
				return;
			}
			if (stepData.loot) {
				if (user.cl.has(stepData.loot)) return;
				await user.addItemsToBank({ items: stepData.loot, collectionLog: true });
			}
			if (previousStepData && previousStepData.clueItem && user.owns(previousStepData.clueItem.id)) {
				await user.removeItemsFromBank(new Bank().add(previousStepData.clueItem.id));
			}
			if (nextStep) {
				await user.update({
					bso_mystery_trail_current_step_id: user.user.bso_mystery_trail_current_step_id + 1
				});
				messages.push(`❔You found ${stepData.loot}.`);
			} else {
				if (user.bitfield.includes(BitField.HasUnlockedYeti)) return;
				await user.update({
					bitfield: {
						push: BitField.HasUnlockedYeti
					}
				});
				for (const item of [
					...Object.values(mysteriousStepData).map(i => i.clueItem?.id),
					itemID('Mysterious clue (1)')
				].filter(notEmpty)) {
					if (user.owns(item)) {
						try {
							await user.removeItemsFromBank(new Bank().add(item));
						} catch (err) {
							logError(err);
						}
					}
				}
				const message = `${
					user.minionName
				} arrives at the snowy area north of rellekka, finding a giant, monstrous Yeti. At his feet, lay a slain animal. The Yeti looks at ${
					user.minionName
				}, and prepares to attack. Use ${mentionCommand(globalClient, 'k')} to fight the yeti!.`;
				messages.push(bold(message));
			}
		}
	},
	{
		name: 'Divine eggs',
		fn: async ({ data, user, portents, messages }) => {
			const skillingTypes: activity_type_enum[] = [
				activity_type_enum.Fishing,
				activity_type_enum.Mining,
				activity_type_enum.Woodcutting,
				activity_type_enum.MemoryHarvest,
				activity_type_enum.Farming,
				activity_type_enum.Hunter
			];
			if (!skillingTypes.includes(data.type)) return;
			const fiveMinuteSegments = Math.floor(data.duration / (Time.Minute * 5));
			if (fiveMinuteSegments < 1) return;
			if (!portents) return;
			const charges = portents[PortentID.RebirthPortent];
			if (!charges) return;
			let eggsReceived = 0;
			for (let i = 0; i < fiveMinuteSegments; i++) {
				perHourChance(Time.Minute * 5, 2, () => {
					eggsReceived += 1;
				});
			}
			eggsReceived = Math.min(eggsReceived, charges);
			if (eggsReceived === 0) return;
			const loot = new Bank().add('Divine egg', eggsReceived);
			const chargeResult = await chargePortentIfHasCharges({
				user,
				portentID: PortentID.RebirthPortent,
				charges: eggsReceived
			});
			if (chargeResult.didCharge) {
				await user.addItemsToBank({ items: loot, collectionLog: true });
				messages.push(
					`You received ${loot}, your Rebirth portent has ${chargeResult.portent.charges_remaining}x charges remaining.`
				);
			}
		}
	},
	{
		name: 'Moonlight mutator',
		fn: async ({ data, user, messages }) => {
			if (!user.bank.has('Moonlight mutator')) return;
			if (user.user.disabled_inventions.includes(InventionID.MoonlightMutator)) return;
			const randomZyg = randArrItem(zygomiteFarmingSource.filter(z => z.lootTable !== null));
			const loot = new Bank();
			const cost = new Bank();

			const minutes = Math.floor(data.duration / Time.Minute);
			if (minutes < 1) return;
			for (let i = 0; i < minutes; i++) {
				if (roll(zygomiteSeedMutChance)) {
					const ownedSeed = shuffleArr(randomZyg.mutatedFromItems!).find(seed => user.bank.has(seed));
					if (!ownedSeed) continue;
					cost.add(ownedSeed);

					if (roll(zygomiteMutSurvivalChance)) {
						loot.add(randomZyg.seedItem);
					}
				}
			}

			if (cost.length > 0 || loot.length > 0) {
				if (cost.length > 0 && !user.bank.has(cost)) {
					console.error(`User ${user.id} doesn't ML ${cost.toString()}`);
					return;
				}
				await user.transactItems({
					itemsToRemove: cost,
					itemsToAdd: loot,
					collectionLog: true
				});

				if (cost.length > 0 && loot.length === 0) {
					messages.push(`<:moonlightMutator:1220590471613513780> Mutated ${cost} seeds, but all died`);
				} else if (loot.length > 0) {
					messages.push(`<:moonlightMutator:1220590471613513780> Mutated ${cost} seeds, ${loot} survived`);
				}
			}
		}
	}
];

export async function handleTripFinish(
	user: MUser,
	channelID: string,
	_message: string | ({ content: string } & MessageCreateOptions),
	attachment: AttachmentBuilder | Buffer | undefined,
	data: ActivityTaskData,
	loot: Bank | null,
	_messages?: string[],
	_components?: ButtonBuilder[]
) {
	const message = typeof _message === 'string' ? { content: _message } : _message;
	if (attachment) {
		!message.files ? (message.files = [attachment]) : message.files.push(attachment);
	}
	const perkTier = user.perkTier();
	const messages: string[] = [];

	// TODO: This is called for *every* trip, even though it's used only for users with the rebirth portent.
	const portents = await getAllPortentCharges(user);
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages, portents });

	const clueReceived = loot ? ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0) : [];

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message.content += `\n**Messages:** ${messages.join(', ')}`;
	}

	if (clueReceived.length > 0 && perkTier < PerkTier.Two) {
		clueReceived.map(
			clue => (message.content += `\n${Emoji.Casket} **You got a ${clue.name} clue scroll** in your loot.`)
		);
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
		components.push(...buildClueButtons(loot, perkTier, user));
		const birdHousedetails = await calculateBirdhouseDetails(user.id);
		if (birdHousedetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton))
			components.push(makeBirdHouseTripButton());

		if ((await canRunAutoContract(user)) && !user.bitfield.includes(BitField.DisableAutoFarmContractButton))
			components.push(makeAutoContractButton());

		const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
		if ((currentTask === null || currentTask.quantity_remaining <= 0) && data.type === 'MonsterKilling') {
			components.push(makeNewSlayerTaskButton());
		} else if (!user.bitfield.includes(BitField.DisableAutoSlayButton)) {
			components.push(makeAutoSlayButton());
		}
		if (loot?.has('Seed pack')) {
			components.push(makeOpenSeedPackButton());
		}
	}

	if (_components) {
		components.push(..._components);
	}

	handleTriggerShootingStar(user, data, components);

	if (components.length > 0) {
		message.components = makeComponents(components);
	}

	if (!user.owns('Mysterious clue (1)') && roll(10) && !user.bitfield.includes(BitField.HasUnlockedYeti)) {
		const img = await mahojiChatHead({
			content: randArrItem([
				'Traveller, I need your help... Use this clue to guide you.',
				'I have a task for you.... Use this clue to guide you.',
				'I have a quest for you... Use this clue to guide you.',
				'Duty calls. Use this clue to guide you.'
			]),
			head: 'mysteriousFigure'
		});
		if (message.files) {
			message.files.push(...img.files);
		} else {
			message.files = img.files;
		}
		const loot = new Bank().add('Mysterious clue (1)');
		await user.addItemsToBank({ items: loot, collectionLog: true });
		if (user.user.bso_mystery_trail_current_step_id === null) {
			await user.update({
				bso_mystery_trail_current_step_id: 1
			});
		}
		if (message.content) {
			message.content += `\nYou received ${loot}.`;
		}
	}

	handleTriggerShootingStar(user, data, components);

	sendToChannelID(channelID, message);
}
