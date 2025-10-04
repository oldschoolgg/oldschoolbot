import { tearsOfGuthixIronmanReqs, tearsOfGuthixSkillReqs } from '@/lib/bso/commands/tearsOfGuthixCommand.js';
import { chargePortentIfHasCharges, getAllPortentCharges, PortentID } from '@/lib/bso/divination.js';
import { gods } from '@/lib/bso/divineDominion.js';
import { handleCrateSpawns } from '@/lib/bso/handleCrateSpawns.js';
import { mysteriousStepData } from '@/lib/bso/mysteryTrail.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';
import { InventionID, inventionBoosts, inventionItemBoost } from '@/lib/bso/skills/invention/inventions.js';

import { randArrItem, randInt, roll } from '@oldschoolgg/rng';
import { channelIsSendable, makeComponents, notEmpty, Stopwatch, Time } from '@oldschoolgg/toolkit';
import { activity_type_enum } from '@prisma/client';
import type { AttachmentBuilder, ButtonBuilder, MessageCollector, MessageCreateOptions } from 'discord.js';
import { bold } from 'discord.js';
import { Bank, EItem, itemID, toKMB } from 'oldschooljs';

import { mahojiChatHead } from '@/lib/canvas/chatHeadImage.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { combatAchievementTripEffect } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField, PerkTier } from '@/lib/constants.js';
import { mentionCommand } from '@/lib/discord/index.js';
import { handleGrowablePetGrowth } from '@/lib/growablePets.js';
import { handlePassiveImplings } from '@/lib/implings.js';
import { triggerRandomEvent } from '@/lib/randomEvents.js';
import { RuneTable, WilvusTable, WoodTable } from '@/lib/simulation/seedTable.js';
import { DougTable, PekyTable } from '@/lib/simulation/sharedTables.js';
import { calculateZygomiteLoot } from '@/lib/skilling/skills/farming/zygomites.js';
import { calculateBirdhouseDetails } from '@/lib/skilling/skills/hunter/birdhouses.js';
import { getUsersCurrentSlayerInfo } from '@/lib/slayer/slayerUtil.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import {
	makeAutoContractButton,
	makeAutoSlayButton,
	makeBirdHouseTripButton,
	makeClaimDailyButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeOpenSeedPackButton,
	makeRepeatTripButton,
	makeTearsOfGuthixButton
} from '@/lib/util/interactions.js';
import { hasSkillReqs, perHourChance } from '@/lib/util/smallUtils.js';
import { sendToChannelID } from '@/lib/util/webhook.js';
import { alching } from '@/mahoji/commands/laps.js';
import { canRunAutoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { handleTriggerShootingStar } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

const collectors = new Map<string, MessageCollector>();

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

type TripEffectReturn = {
	itemsToAddWithCL?: Bank;
	itemsToRemove?: Bank;
};

export interface TripFinishEffect {
	name: string;
	fn: (options: TripFinishEffectOptions) => Promise<TripEffectReturn | undefined | void>;
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: async ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(EItem.COINS);
				if (typeof GP === 'number') {
					await ClientSettings.updateClientGPTrackSetting('gp_pvm', GP);
				}
			}
			return {};
		}
	},
	{
		name: 'Implings',
		fn: async ({ data, messages, user }) => {
			const imp = await handlePassiveImplings(user, data, messages);
			if (imp && imp.bank.length > 0) {
				messages.push(`Caught ${imp.bank}`);
				await user.statsBankUpdate('passive_implings_bank', imp.bank);
				return {
					itemsToAddWithCL: imp.bank
				};
			}
			return {};
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
			return triggerRandomEvent(user, data.type, data.duration, messages);
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

				await Promise.all([
					await user.statsBankUpdate('doubled_loot_bank', bonusLoot),
					await ClientSettings.updateBankSetting('trip_doubling_loot', bonusLoot)
				]);
				return {
					itemsToAddWithCL: bonusLoot
				};
			}
		}
	},
	{
		name: 'Custom Pet Perk',
		fn: async ({ data, messages, user }) => {
			const pet = user.user.minion_equippedPet;
			const minutes = Math.floor(data.duration / Time.Minute);
			if (minutes < 5) return;
			const bonusLoot = new Bank();
			switch (pet) {
				case itemID('Peky'): {
					for (let i = 0; i < minutes; i++) {
						if (roll(10)) {
							bonusLoot.add(PekyTable.roll());
						}
					}
					await user.statsBankUpdate('peky_loot_bank', bonusLoot);
					messages.push(
						`<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Obis'): {
					const rolls = minutes / 3;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(RuneTable.roll());
					}
					await user.statsBankUpdate('obis_loot_bank', bonusLoot);
					messages.push(
						`<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Brock'): {
					const rolls = minutes / 3;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(WoodTable.roll());
					}
					await user.statsBankUpdate('brock_loot_bank', bonusLoot);
					messages.push(
						`<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Wilvus'): {
					const rolls = minutes / 6;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(WilvusTable.roll());
					}
					await user.statsBankUpdate('wilvus_loot_bank', bonusLoot);
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
					await user.statsBankUpdate('smokey_loot_bank', bonusLoot);
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
					await user.statsBankUpdate('doug_loot_bank', bonusLoot);
					messages.push(`Doug did some mining while you were on your trip and got you: ${bonusLoot}.`);
					break;
				}
				case itemID('Harry'): {
					for (let i = 0; i < minutes; i++) {
						bonusLoot.add('Banana', randInt(1, 3));
					}
					await user.statsBankUpdate('harry_loot_bank', bonusLoot);
					messages.push(`<:harry:749945071104819292>: ${bonusLoot}.`);
					break;
				}
				default: {
				}
			}

			return {
				itemsToAddWithCL: bonusLoot
			};
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

				await Promise.all([
					ClientSettings.updateBankSetting('magic_cost_bank', alchResult.bankToRemove),
					ClientSettings.updateClientGPTrackSetting('gp_alch', alchResult.bankToAdd.amount('Coins'))
				]);
				messages.push(
					`<:Voidling:886284972380545034> ${alchResult.maxCasts}x ${
						alchResult.itemToAlch.name
					} <:alch:739456571347566623> ${toKMB(alchResult.bankToAdd.amount('Coins'))} GP ${
						!voidlingEquipped && !user.hasEquipped('Magic master cape')
							? '<:bank:739459924693614653>⏬'
							: ''
					}${user.hasEquipped('Magic master cape') ? '<:Magicmastercape:1115026341314703492>⏫' : ''}`
				);
				return {
					itemsToAddWithCL: alchResult.bankToAdd,
					itemsToRemove: alchResult.bankToRemove
				};
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
						user.skillLevel('agility')
					);
					await user.statsUpdate({
						silverhawk_boots_passive_xp: {
							increment: xpToReceive
						}
					});
					await user.addXP({
						skillName: 'agility',
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
		fn: async ({ data, messages }) => {
			const underwaterTrips: activity_type_enum[] = [
				activity_type_enum.UnderwaterAgilityThieving,
				activity_type_enum.DepthsOfAtlantis
			];
			if (!underwaterTrips.includes(data.type)) return;
			if (!roll(500)) return;
			messages.push('You found a message in a bottle!');
			const bottleLoot = new Bank().add('Message in a bottle');
			return {
				itemsToAddWithCL: bottleLoot
			};
		}
	},
	{
		name: 'Crate Spawns',
		fn: async ({ data, messages, user }) => {
			const crateRes = handleCrateSpawns(user, data.duration, messages);
			if (crateRes && crateRes.length > 0) {
				messages.push(bold(`You found ${crateRes}!`));
				return {
					itemsToAddWithCL: crateRes
				};
			}
		}
	},
	{
		name: 'God Favour',
		fn: async ({ data, user }) => {
			if (!('mi' in data)) return;
			if (data.type !== 'MonsterKilling') return;
			const favourableGod = gods.find(g => g.friendlyMonsters.includes(data.mi as number));
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
			if (previousStepData?.clueItem && user.owns(previousStepData.clueItem.id)) {
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
							Logging.logError(err as Error);
						}
					}
				}
				const message = `${
					user.minionName
				} arrives at the snowy area north of rellekka, finding a giant, monstrous Yeti. At his feet, lay a slain animal. The Yeti looks at ${
					user.minionName
				}, and prepares to attack. Use ${mentionCommand('k')} to fight the yeti!.`;
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
				messages.push(
					`You received ${loot}, your Rebirth portent has ${chargeResult.portent.charges_remaining}x charges remaining.`
				);
				return {
					itemsToAddWithCL: loot
				};
			}
		}
	},
	{
		name: 'Moonlight mutator',
		fn: async ({ data, user, messages }) => {
			if (!user.bank.has('Moonlight mutator')) return;
			if (user.user.disabled_inventions.includes(InventionID.MoonlightMutator)) return;

			const minutes = Math.floor(data.duration / Time.Minute);
			if (minutes < 1) return;
			const { loot, cost } = calculateZygomiteLoot(minutes, user.bank);

			if (cost.length > 0 || loot.length > 0) {
				if (cost.length > 0 && !user.bank.has(cost)) {
					console.error(`User ${user.id} doesn't ML ${cost.toString()}`);
					return;
				}

				if (cost.length > 0 && loot.length === 0) {
					messages.push(`<:moonlightMutator:1220590471613513780> Mutated ${cost}, but all died`);
				} else if (loot.length > 0) {
					messages.push(`<:moonlightMutator:1220590471613513780> Mutated ${cost}; ${loot} survived`);
				}

				return {
					itemsToAddWithCL: loot,
					itemsToRemove: cost
				};
			}
		}
	}
];

export async function handleTripFinish(
	user: MUser,
	channelID: string,
	_message: string | ({ content: string } & MessageCreateOptions),
	attachment:
		| AttachmentBuilder
		| Buffer
		| undefined
		| {
				name: string;
				attachment: Buffer;
		  },
	data: ActivityTaskData,
	loot: Bank | null,
	_messages?: string[],
	_components?: ButtonBuilder[]
) {
	const message = typeof _message === 'string' ? { content: _message } : _message;
	if (attachment) {
		if (!message.files) {
			message.files = [attachment];
		} else if (Array.isArray(message.files)) {
			message.files.push(attachment);
		} else {
			console.warn(`Unexpected attachment type in handleTripFinish: ${typeof attachment}`);
		}
	}
	const perkTier = user.perkTier();
	const messages: string[] = [];

	const portents = await getAllPortentCharges(user);
	const itemsToAddWithCL = new Bank();
	const itemsToRemove = new Bank();
	for (const effect of tripFinishEffects) {
		const stopwatch = new Stopwatch().start();
		const res = await effect.fn({ data, user, loot, messages, portents });
		if (res?.itemsToAddWithCL) itemsToAddWithCL.add(res.itemsToAddWithCL);
		if (res?.itemsToRemove) itemsToRemove.add(res.itemsToRemove);
		stopwatch.stop();
		if (stopwatch.duration > 500) {
			Logging.logDebug(`Finished ${effect.name} trip effect for ${user.id} in ${stopwatch}`);
		}
	}

	if (itemsToAddWithCL.length > 0 || itemsToRemove.length > 0) {
		await user.transactItems({ itemsToAdd: itemsToAddWithCL, collectionLog: true, itemsToRemove });
	}

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message.content += `\n**Messages:** ${messages.join(', ')}`;
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

		const { last_tears_of_guthix_timestamp, last_daily_timestamp } = await user.fetchStats();

		// Tears of Guthix start button if ready
		if (!user.bitfield.includes(BitField.DisableTearsOfGuthixButton)) {
			const last = Number(last_tears_of_guthix_timestamp);
			const ready = last <= 0 || Date.now() - last >= Time.Day * 7;
			const meetsSkillReqs = hasSkillReqs(user, tearsOfGuthixSkillReqs)[0];
			const meetsIronmanReqs = user.user.minion_ironman ? hasSkillReqs(user, tearsOfGuthixIronmanReqs)[0] : true;

			if (user.QP >= 43 && ready && meetsSkillReqs && meetsIronmanReqs) {
				components.push(makeTearsOfGuthixButton());
			}
		}

		// Minion daily button if ready
		if (!user.bitfield.includes(BitField.DisableDailyButton)) {
			const last = Number(last_daily_timestamp);
			const ready = last <= 0 || Date.now() - last >= Time.Hour * 12;

			if (ready) {
				components.push(makeClaimDailyButton());
			}
		}

		const birdHousedetails = calculateBirdhouseDetails(user);
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
		if (!message.files) message.files = img.files;
		else message.files = [...message.files, ...img.files];
		const mysteriousLoot = new Bank().add('Mysterious clue (1)');
		await user.addItemsToBank({ items: mysteriousLoot, collectionLog: true });
		if (user.user.bso_mystery_trail_current_step_id === null) {
			await user.update({
				bso_mystery_trail_current_step_id: 1
			});
		}
		if (message.content) {
			message.content += `\nYou received ${mysteriousLoot}.`;
		}
	}

	handleTriggerShootingStar(user, data, components);

	sendToChannelID(channelID, message);
}
