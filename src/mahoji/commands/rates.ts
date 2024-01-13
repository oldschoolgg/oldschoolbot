import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { divinationEnergies, memoryHarvestTypes } from '../../lib/bso/divination';
import { GLOBAL_BSO_XP_MULTIPLIER } from '../../lib/constants';
import { inventionBoosts } from '../../lib/invention/inventions';
import { stoneSpirits } from '../../lib/minions/data/stoneSpirits';
import Agility from '../../lib/skilling/skills/agility';
import {
	calcGorajanShardChance,
	calcMaxFloorUserCanDo,
	numberOfGorajanOutfitsEquipped
} from '../../lib/skilling/skills/dung/dungDbFunctions';
import Mining from '../../lib/skilling/skills/mining';
import Smithing from '../../lib/skilling/skills/smithing';
import { convertBankToPerHourStats } from '../../lib/util';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { calcPerHour, returnStringOrFile } from '../../lib/util/smallUtils';
import { calculateAgilityResult } from '../../tasks/minions/agilityActivity';
import { calculateDungeoneeringResult } from '../../tasks/minions/bso/dungeoneeringActivity';
import { memoryHarvestResult } from '../../tasks/minions/bso/memoryHarvestActivity';
import { calculateMiningResult } from '../../tasks/minions/miningActivity';
import { OSBMahojiCommand } from '../lib/util';
import { calculateMiningInput } from './mine';

export const ratesCommand: OSBMahojiCommand = {
	name: 'rates',
	description: 'Check rates of various skills/activities.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'xphr',
			description: 'Check XP/hr rates.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'divination_memory_harvesting',
					description: 'Divination.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'agility',
					description: 'agility.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'dungeoneering',
					description: 'Dungeoneering.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'mining',
					description: 'Mining.',
					options: []
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		xphr?: { divination_memory_harvesting?: {}; agility?: {}; dungeoneering?: {}; mining?: {} };
	}>) => {
		const user = await mUserFetch(userID);

		if (options.xphr?.mining) {
			let results = `${[
				'Ore',
				'XP/Hr',
				'Powermining',
				'Portent',
				'S. Inferno Adze',
				'Volcanic Pickaxe',
				'Smithing XP',
				'Loot',
				'Cost'
			].join('\t')}\n`;
			const duration = Time.Hour * 3;
			for (const ore of Mining.Ores) {
				for (const isPowerminingInput of [true, false]) {
					for (const shouldTryUseSpirits of [true, false]) {
						for (const shouldUsePortent of [true, false]) {
							for (const usingAdze of [true, false]) {
								for (const hasOffhandVolcPick of [true, false]) {
									if (shouldUsePortent && !shouldTryUseSpirits) continue;

									const smeltedOre = Smithing.Bars.find(
										o =>
											o.inputOres.bank[ore.id] &&
											o.inputOres.items().filter(i => i[0].name !== 'Coal').length === 1
									);
									if (usingAdze && (!smeltedOre || isPowerminingInput)) continue;

									let miningLevel = 120;
									const fakeGear = user.gear.skilling.clone();
									fakeGear.equip('Volcanic pickaxe');
									fakeGear.equip('Varrock armour 4');
									fakeGear.equip('Mining master cape');
									fakeGear.equip('Amulet of glory');
									fakeGear.equip('Prospector helmet');
									fakeGear.equip('Prospector jacket');
									fakeGear.equip('Prospector legs');
									fakeGear.equip('Prospector boots');

									const secondaryGearSetup = fakeGear.clone();
									if (usingAdze) {
										secondaryGearSetup.equip('Superior inferno adze');
									}

									const fullSetup = {
										skilling: fakeGear,
										misc: secondaryGearSetup
									} as any;

									const result = calculateMiningInput({
										nameInput: ore.name,
										quantityInput: undefined,
										isPowermining: isPowerminingInput,
										gear: fullSetup,
										hasSOTFQuest: true,
										qp: 500,
										miningLevel,
										craftingLevel: 120,
										strengthLevel: 120,
										maxTripLength: duration
									});
									if (typeof result === 'string') continue;
									const spiritOre = stoneSpirits.find(t => t.ore.id === ore.id);
									const amountOfSpiritsToUse =
										spiritOre !== undefined && shouldTryUseSpirits
											? Math.min(result.newQuantity, 100_000)
											: 0;

									if (shouldTryUseSpirits && !spiritOre) continue;
									const { totalMiningXPToAdd, smithingXPFromAdze, loot, totalCost } =
										calculateMiningResult({
											duration,
											isPowermining: result.isPowermining,
											isUsingObsidianPickaxe: hasOffhandVolcPick,
											quantity: result.newQuantity,
											hasMiningMasterCape: true,
											ore,
											allGear: fullSetup,
											miningLevel,
											disabledInventions: [],
											equippedPet: null,
											amountOfSpiritsToUse,
											spiritOre,
											portentResult: !shouldUsePortent
												? { didCharge: false }
												: ({ didCharge: true, portent: { charges_remaining: 1000 } } as any),
											collectionLog: new Bank(),
											miningXP: 500_000_000
										});

									results += [
										ore.name,
										Math.floor(
											calcPerHour(totalMiningXPToAdd * GLOBAL_BSO_XP_MULTIPLIER, duration)
										).toLocaleString(),
										result.isPowermining ? 'Powermining' : 'NOT Powermining',
										shouldUsePortent ? 'Has Portent' : 'No Portent',
										usingAdze ? 'Has Adze' : 'No Adze',
										hasOffhandVolcPick ? 'Has Volc Pick' : 'No Volc Pick',
										calcPerHour(smithingXPFromAdze * GLOBAL_BSO_XP_MULTIPLIER, duration),
										convertBankToPerHourStats(loot, duration).join(', '),
										convertBankToPerHourStats(totalCost, duration).join(', ')
									].join('\t');
									results += '\n';
								}
							}
						}
					}
				}
			}
			return returnStringOrFile(results, true);
		}

		if (options.xphr?.divination_memory_harvesting) {
			let results = `${[
				'Type',
				'Method',
				'Wisp-buster',
				'Cache Boost',
				'Divine Hand',
				'Divination Potion',
				'Boon',
				'Pet Time (Hours)',
				'XP/Hr',
				'Memories/HR',
				'GMC/hr',
				'MC/hr',
				'EnergyLoot/hr',
				'EnergyCost/hr',
				'Energy per memory',
				'Hours for Boon'
			].join('\t')}\n`;
			for (const energy of divinationEnergies) {
				for (const harvestMethod of memoryHarvestTypes) {
					for (const hasCacheBoost of [true, false]) {
						for (const hasPotAndBoon of [true, false]) {
							for (const hasWispBuster of [true, false]) {
								for (const hasDivineHand of [true, false]) {
									if (hasDivineHand && hasWispBuster) continue;
									const res = memoryHarvestResult({
										duration: Time.Hour,
										energy,
										hasBoon: hasPotAndBoon,
										harvestMethod: harvestMethod.id,
										hasGuthixianBoost: hasCacheBoost,
										hasDivineHand,
										hasWispBuster,
										isUsingDivinationPotion: hasPotAndBoon
									});

									const energyPerHour = calcPerHour(res.loot.amount(energy.item.id), Time.Hour);

									const nextEnergy = divinationEnergies[divinationEnergies.indexOf(energy) + 1];
									let timeToGetBoon = 0;
									if (
										nextEnergy &&
										nextEnergy.boonEnergyCost &&
										energyPerHour > 0 &&
										res.loot.has(energy.item.id)
									) {
										timeToGetBoon = nextEnergy.boonEnergyCost / energyPerHour;
									}

									results += [
										energy.type,
										harvestMethod.name,
										hasWispBuster ? 'Has Wisp-buster' : 'No Wisp-buster',
										hasCacheBoost ? 'Has Cache Boost' : 'No Cache Boost',
										hasDivineHand ? 'Has Divine Hand' : 'No Divine Hand',
										hasPotAndBoon ? 'Has Pot' : 'No Pot',
										hasPotAndBoon ? 'Has Boon' : 'No Boon',
										res.avgPetTime / Time.Hour,
										res.totalDivinationXP * GLOBAL_BSO_XP_MULTIPLIER,
										calcPerHour(res.totalMemoriesHarvested, Time.Hour),
										calcPerHour(res.loot.amount('Clue scroll (grandmaster)'), Time.Hour),
										calcPerHour(res.loot.amount('Clue scroll (master)'), Time.Hour),
										energyPerHour,
										calcPerHour(res.cost.amount(energy.item.id), Time.Hour),
										res.energyPerMemory,
										timeToGetBoon
									].join('\t');
									results += '\n';
								}
							}
						}
					}
				}
			}

			return returnStringOrFile(results);
		}

		if (options.xphr?.agility) {
			let results = `${[
				'Course',
				'XP/Hr',
				'Marks/hr',
				'Agility Level',
				'Silver Hawk Boots',
				'Portent',
				'Harry'
			].join('\t')}\n`;
			for (const course of Agility.Courses) {
				for (const usingSilverHawks of [true, false]) {
					for (const usingHarry of [true, false]) {
						for (const usingPortent of [true, false]) {
							let timePerLap = course.lapTime * Time.Second;
							if (usingSilverHawks) {
								timePerLap = Math.floor(
									timePerLap / inventionBoosts.silverHawks.agilityBoostMultiplier
								);
							}
							const quantity = Math.floor(Time.Hour / timePerLap);
							const duration = quantity * timePerLap;
							let agilityLevel = 120;
							const result = calculateAgilityResult({
								quantity,
								course,
								agilityLevel,
								duration,
								hasDiaryBonus: true,
								usingHarry,
								hasAgilityPortent: usingPortent
							});
							const xpHr = calcPerHour(result.xpReceived * GLOBAL_BSO_XP_MULTIPLIER, duration);
							results += [
								course.name,
								Math.round(xpHr),
								calcPerHour(result.loot.amount('Mark of grace'), duration).toFixed(1),
								agilityLevel,
								usingSilverHawks ? 'Yes' : 'No',
								usingPortent ? 'Yes' : 'No',
								usingHarry ? 'Yes' : 'No'
							].join('\t');
							results += '\n';
						}
					}
				}
			}
			return returnStringOrFile(results, true);
		}

		if (options.xphr?.dungeoneering) {
			let results = `${['Floor', 'XP/Hr', 'Dung. Level', 'Tokens/hr', 'Portent'].join('\t')}\n`;
			for (const floor of [1, 2, 3, 4, 5, 6, 7]) {
				for (const hasPortent of [true, false]) {
					const dungeonLength = Time.Minute * 5 * (floor / 2);
					let quantity = Math.floor(calcMaxTripLength(user, 'Dungeoneering') / dungeonLength);
					let duration = quantity * dungeonLength;
					let dungeoneeringLevel = 120;
					let goraShardChance = calcGorajanShardChance(user);
					const result = calculateDungeoneeringResult({
						floor,
						quantity,
						duration,
						dungeoneeringLevel,
						gorajanShardChance: goraShardChance.chance,
						maxFloorUserCanDo: calcMaxFloorUserCanDo(user),
						hasScrollOfMystery: true,
						gorajanEquipped: numberOfGorajanOutfitsEquipped(user),
						hasDungeonPortent: hasPortent
					});
					const xpHr = calcPerHour(result.xp * GLOBAL_BSO_XP_MULTIPLIER, duration);
					results += [
						floor,
						Math.round(xpHr),
						dungeoneeringLevel,
						calcPerHour(result.tokens, duration),
						hasPortent ? 'Has Portent' : 'No Portent'
					].join('\t');
					results += '\n';
				}
			}
			return returnStringOrFile(results, true);
		}
		return 'No option selected.';
	}
};
