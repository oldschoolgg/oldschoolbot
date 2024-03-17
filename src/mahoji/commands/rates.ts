import { bold } from '@discordjs/builders';
import { InteractionReplyOptions } from 'discord.js';
import { increaseNumByPercent, reduceNumByPercent, sumArr, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { calcAtomicEnergy, divinationEnergies, memoryHarvestTypes } from '../../lib/bso/divination';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { GLOBAL_BSO_XP_MULTIPLIER, PeakTier } from '../../lib/constants';
import { inventionBoosts } from '../../lib/invention/inventions';
import { marketPriceOfBank } from '../../lib/marketPrices';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { stoneSpirits } from '../../lib/minions/data/stoneSpirits';
import Agility from '../../lib/skilling/skills/agility';
import {
	calcGorajanShardChance,
	calcMaxFloorUserCanDo,
	numberOfGorajanOutfitsEquipped
} from '../../lib/skilling/skills/dung/dungDbFunctions';
import {
	zygomiteFarmingSource,
	zygomiteMutSurvivalChance,
	zygomiteSeedMutChance
} from '../../lib/skilling/skills/farming/zygomites';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import Mining from '../../lib/skilling/skills/mining';
import Smithing from '../../lib/skilling/skills/smithing';
import { HunterTechniqueEnum } from '../../lib/skilling/types';
import { Gear } from '../../lib/structures/Gear';
import { convertBankToPerHourStats, stringMatches, toKMB } from '../../lib/util';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { deferInteraction } from '../../lib/util/interactionReply';
import itemID from '../../lib/util/itemID';
import { calcPerHour, formatDuration, itemNameFromID, returnStringOrFile } from '../../lib/util/smallUtils';
import { calculateAgilityResult } from '../../tasks/minions/agilityActivity';
import { calculateDungeoneeringResult } from '../../tasks/minions/bso/dungeoneeringActivity';
import { memoryHarvestResult, totalTimePerRound } from '../../tasks/minions/bso/memoryHarvestActivity';
import { calculateHunterResult } from '../../tasks/minions/HunterActivity/hunterActivity';
import { calculateMiningResult } from '../../tasks/minions/miningActivity';
import { OSBMahojiCommand } from '../lib/util';
import { calculateHunterInput } from './hunt';
import { calculateMiningInput } from './mine';
import { determineTameClueResult } from './tames';

export const ratesCommand: OSBMahojiCommand = {
	name: 'rates',
	description: 'Check rates of various skills/activities.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'tames',
			description: 'Check tames rates.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'eagle',
					description: 'Eagle tame.',
					options: []
				}
			]
		},
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
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'hunter',
					description: 'XP/hr rates for Hunter.',
					options: []
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'monster',
			description: 'Check monster loot rates.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'monster',
					description: 'Check monster.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'The name of the monster.',
							required: true
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'misc',
			description: 'Miscelleanous rates.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'zygomite_seeds',
					description: 'Check zygomite seeds.'
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		xphr?: { divination_memory_harvesting?: {}; agility?: {}; dungeoneering?: {}; mining?: {}; hunter?: {} };
		monster?: { monster?: { name: string } };
		tames?: { eagle?: {} };
		misc?: { zygomite_seeds?: {} };
	}>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		if (options.misc?.zygomite_seeds) {
			const mutationChancePerMinute = 1 / zygomiteSeedMutChance;
			const survivalChancePerMutation = 1 / zygomiteMutSurvivalChance;
			const chancePerMinuteBoth = mutationChancePerMinute * survivalChancePerMutation;
			const averageMinutesToGetBoth = 1 / chancePerMinuteBoth;
			const averageHoursToGetBoth = averageMinutesToGetBoth / 60;
			return `For every minute in any trip, a random, valid seed from your bank has a 1 in ${zygomiteSeedMutChance} chance of mutating, and then that mutated seed has a 1 in ${zygomiteMutSurvivalChance} chance of surviving. ${averageHoursToGetBoth.toFixed(
				1
			)} hours on average to get a zygomite seed.

${zygomiteFarmingSource
	.map(
		z =>
			`${bold(z.seedItem.name)} evolves from: ${z.mutatedFromItems
				.map(itemNameFromID)
				.join(', ')}, drops these items: ${z.lootTable.allItems.map(itemNameFromID).join(', ')}.`
	)
	.join('\n\n')}`;
		}
		if (options.tames?.eagle) {
			let results = `${['Support Level', 'Clue Tier', 'Clues/hr', 'Kibble/hr', 'GMC/Hr'].join('\t')}\n`;
			for (const tameLevel of [50, 60, 70, 75, 80, 85, 90, 95, 100]) {
				for (const clueTier of ClueTiers) {
					const res = determineTameClueResult({
						tameGrowthLevel: 3,
						clueTier,
						extraTripLength: Time.Hour * 10,
						supportLevel: tameLevel,
						equippedArmor: itemID('Abyssal jibwings (e)'),
						equippedPrimary: itemID('Divine ring')
					});

					results += [
						tameLevel,
						clueTier.name,
						calcPerHour(res.quantity, res.duration).toLocaleString(),
						calcPerHour(res.cost.amount('Extraordinary kibble'), res.duration).toLocaleString(),
						calcPerHour(res.cost.amount('Clue scroll (grandmaster)'), res.duration).toLocaleString()
					].join('\t');
					results += '\n';
				}
			}

			return {
				content: 'Assumes abyssal jibwings (e) and divine ring',
				...(returnStringOrFile(results, true) as InteractionReplyOptions)
			};
		}

		if (options.monster?.monster) {
			const monster = killableMonsters.find(m => stringMatches(m.name, options.monster!.monster!.name));
			if (!monster) {
				return 'Invalid monster.';
			}

			if (user.id !== '157797566833098752') {
				return 'This command is currently disabled.';
			}

			let { timeToFinish } = monster;
			// 10% for learning
			timeToFinish = reduceNumByPercent(timeToFinish, 10);

			// 2x for BSO
			timeToFinish /= 2;

			if (monster.pohBoosts) {
				const totalBoostPercent = sumArr(Object.values(monster.pohBoosts).map(val => Object.values(val)[0]));
				timeToFinish = reduceNumByPercent(timeToFinish, totalBoostPercent);
			}

			if (monster.itemInBankBoosts) {
				const boosts = sumArr(monster.itemInBankBoosts.map(b => Object.values(b)[0]));
				timeToFinish = reduceNumByPercent(timeToFinish, boosts);
			}

			if (!monster.wildy) {
				// boosts.push('40% boost for Dwarven warhammer');
				timeToFinish = reduceNumByPercent(timeToFinish, 40);
			} else if (monster.wildy) {
				timeToFinish /= 3;
				// boosts.push('3x boost for Hellfire bow');
			}

			timeToFinish = reduceNumByPercent(timeToFinish, 15);

			if (monster.equippedItemBoosts) {
				for (const boostSet of monster.equippedItemBoosts) {
					const equippedInThisSet = boostSet.items[0];
					if (equippedInThisSet) {
						timeToFinish = reduceNumByPercent(timeToFinish, equippedInThisSet.boostPercent);
					}
				}
			}

			const sampleSize = 100_000;
			let boostedSize = increaseNumByPercent(sampleSize, 25);

			const loot = monster.table.kill(boostedSize, {});
			let totalTime = timeToFinish * sampleSize;

			let str = `${monster.name}\n`;

			const results: { item: Item; qty: number; perHour: number; valuePerHour: number }[] = [];
			for (const [item, qty] of loot.items()) {
				const perHour = calcPerHour(qty, totalTime);
				const valuePerHour = calcPerHour(marketPriceOfBank(new Bank().add(item, qty)), totalTime);
				results.push({ item, qty, perHour, valuePerHour });
			}
			results.sort((a, b) => b.valuePerHour - a.valuePerHour);
			str += '\nTop 10 most valuable item drops:\n';
			for (const { item, perHour, valuePerHour } of results.slice(0, 10)) {
				str += `${item.name}: ${perHour.toFixed(2)}/hr ${toKMB(valuePerHour)} GP/hr\n`;
			}

			str += '\n';

			str += `Based on market/bot prices, this monster produces ${toKMB(
				calcPerHour(marketPriceOfBank(loot), totalTime)
			)}/hr in GP.`;

			str += '\n\nAssumes max learning, poh boosts, all item boosts, DWWH/HFB, Ori.';
			return str;
		}
		if (options.xphr?.hunter) {
			let results = `${[
				'Creature',
				'XP/Hr',
				'Portent',
				'Quick Trap',
				'Max Learning',
				'Stam&Hunt Pots',
				'Successful qty/hr',
				'QuantityHunted'
			].join('\t')}\n`;

			for (const creature of Hunter.Creatures) {
				for (const hasPortent of [true, false]) {
					for (const _hasQuickTrap of [true, false]) {
						for (const usingStamAndHunterPotions of [true, false]) {
							for (const hasMaxLearning of [true, false]) {
								let hasQuickTrap =
									_hasQuickTrap && creature.huntTechnique === HunterTechniqueEnum.BoxTrapping;
								if (creature.huntTechnique !== HunterTechniqueEnum.BoxTrapping && _hasQuickTrap) {
									continue;
								}
								const duration = Time.Hour * 5;
								const skillsAsLevels = {
									...user.skillsAsLevels,
									hunter: 120,
									fishing: 120,
									agility: 120,
									mining: 120,
									woodcutting: 120,
									prayer: 120,
									herblore: 120
								};

								const creatureScores = hasMaxLearning ? { [creature.id]: 100_000_000 } : {};

								const gear = new Gear();
								gear.equip('Beginner rumble greegree');
								gear.equip('Masori body (f)');
								gear.equip('Masori chaps (f)');
								gear.equip('Dragon boots');
								gear.equip('Fire cape');

								const bank = new Bank()
									.add('Hunter potion(4)', 1000)
									.add('Simple kibble', 100_000)
									.add('Delicious kibble', 100_000)
									.add('Stamina potion(4)', 1000)
									.add('Eastern ferret', 10_000)
									.add('Saradomin brew(4)', 1000)
									.add('Super restore(4)', 1000)
									.add('Banana', 100_000)
									.add('Magic box', 50_000)
									.add('Butterfly jar', 10_000);

								const fullSetup = {
									wildy: gear
								} as any;

								const inputResult = calculateHunterInput({
									creatureScores,
									creature,
									skillsAsLevels,
									isUsingHunterPotion: usingStamAndHunterPotions,
									shouldUseStaminaPotions: usingStamAndHunterPotions,
									bank,
									quantityInput: undefined,
									allGear: fullSetup,
									hasHunterMasterCape: true,
									maxTripLength: duration,
									isUsingQuickTrap: hasQuickTrap,
									quickTrapMessages: '',
									QP: 5000,
									hasGraceful: true
								});

								if (typeof inputResult === 'string') {
									console.log(inputResult);
									continue;
								}
								const result = calculateHunterResult({
									creature,
									allItemsOwned: new Bank(),
									skillsAsLevels,
									usingHuntPotion: usingStamAndHunterPotions,
									bank,
									quantity: inputResult.quantity,
									duration,
									creatureScores,
									allGear: user.gear,
									collectionLog: new Bank(),
									equippedPet: itemID('Sandy'),
									skillsAsXP: skillsAsLevels,
									hasHunterMasterCape: true,
									wildyPeakTier: PeakTier.Low,
									isUsingArcaneHarvester: false,
									arcaneHarvesterMessages: undefined,
									portentResult: hasPortent
										? { didCharge: true, portent: { charges_remaining: 1000 } as any }
										: { didCharge: false },
									invincible: true,
									noRandomness: true
								});
								results += [
									creature.name,
									Math.floor(
										calcPerHour(result.totalHunterXP * GLOBAL_BSO_XP_MULTIPLIER, duration)
									).toLocaleString(),
									hasPortent ? 'Has Portent' : 'No Portent',
									hasQuickTrap
										? 'Has Quick Trap'
										: creature.huntTechnique === HunterTechniqueEnum.BoxTrapping
										? 'No Quick Trap'
										: 'Not Applicable',
									hasMaxLearning ? 'Max Learning' : 'No Max Learning',
									usingStamAndHunterPotions ? 'Has Pots' : 'No Pots',
									calcPerHour(result.successfulQuantity, duration).toLocaleString(),
									inputResult.quantity
								].join('\t');
								results += '\n';
							}
						}
					}
				}
			}
			return {
				...(returnStringOrFile(results, true) as InteractionReplyOptions),
				content: 'Assumes: Hunter master cape, level 120 Hunter, full Graceful, Sandy pet equipped.'
			};
		}

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
			const duration = Number(Time.Hour);
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
			return {
				...(returnStringOrFile(results, true) as InteractionReplyOptions),
				content:
					'Assumes: Mining master cape, full Prospector, Glory, Varrock armour 4, 120 mining, Volcanic pickaxe.'
			};
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
				'Hours for Boon',
				'Atomic energy/hr'
			].join('\t')}\n`;
			for (const energy of divinationEnergies) {
				for (const harvestMethod of memoryHarvestTypes) {
					for (const hasCacheBoost of [true, false]) {
						for (const hasPotAndBoon of [true, false]) {
							for (const hasWispBuster of [true, false]) {
								for (const hasDivineHand of [true, false]) {
									if (hasDivineHand && hasWispBuster) continue;
									const duration = Time.Hour;
									const totalSeconds = Math.round(duration / Time.Second);
									const rounds = Math.floor(totalSeconds / totalTimePerRound);
									const res = memoryHarvestResult({
										duration,
										energy,
										hasBoon: hasPotAndBoon,
										harvestMethod: harvestMethod.id,
										hasGuthixianBoost: hasCacheBoost,
										hasDivineHand,
										hasWispBuster,
										isUsingDivinationPotion: hasPotAndBoon,
										hasMasterCape: false,
										rounds
									});

									const energyReceived = res.loot.amount(energy.item.id);
									const energyPerHour = calcPerHour(energyReceived, Time.Hour);

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

									const atomicEnergyPerHour =
										energyReceived === 0
											? '0'
											: calcPerHour(energyReceived * calcAtomicEnergy(energy), duration).toFixed(
													1
											  );

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
										timeToGetBoon,
										atomicEnergyPerHour
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
			let results = `${['Floor', 'XP/Hr', 'Dung. Level', 'Tokens/hr', 'Portent', 'G. Shard Time'].join('\t')}\n`;
			for (const floor of [1, 2, 3, 4, 5, 6, 7]) {
				for (const hasPortent of [true, false]) {
					const dungeonLength = Time.Minute * 5 * (floor / 2);
					let quantity = Math.floor(calcMaxTripLength(user, 'Dungeoneering') / dungeonLength);
					let duration = quantity * dungeonLength;
					let dungeoneeringLevel = 120;
					let goraShardChance = calcGorajanShardChance({
						dungLevel: dungeoneeringLevel,
						hasMasterCape: user.hasEquipped('Dungeoneering master cape'),
						hasRingOfLuck: user.hasEquipped('Ring of luck')
					});
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
						hasPortent ? 'Has Portent' : 'No Portent',
						floor >= 5 ? `${formatDuration(result.goraShardChanceX * duration)}` : 'N/A'
					].join('\t');
					results += '\n';
				}
			}
			return {
				...(returnStringOrFile(results, true) as InteractionReplyOptions),
				content: 'Assumes: 120 Dungeoneering, Ring of luck, master cape (For gora shard chance)'
			};
		}
		return 'No option selected.';
	}
};
