import { toTitleCase } from '@oldschoolgg/toolkit';
import { type UserStats, tame_growth } from '@prisma/client';
import { calcWhatPercent, objectEntries, sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { divinationEnergies } from './bso/divination';
import { ClueTiers } from './clues/clueTiers';
import { BitField } from './constants';
import { allCollectionLogs } from './data/Collections';
import {
	allDOAPets,
	capesCL,
	chambersOfXericCL,
	chambersOfXericMetamorphPets,
	cluesBeginnerCL,
	cluesEasyCL,
	cluesEliteCL,
	cluesEliteRareCL,
	cluesGrandmasterCL,
	cluesHardCL,
	cluesHardRareCL,
	cluesMasterCL,
	cluesMasterRareCL,
	cluesMediumCL,
	cluesRaresCL,
	cluesSharedCL,
	cmbClothes,
	customPetsCL,
	dailyCL,
	diariesCL,
	doaCL,
	expertCapesCL,
	holidayCL,
	leaguesCL,
	miscellaneousCL,
	questCL,
	randomEventsCL,
	shayzienArmourCL,
	theatreOfBLoodCL,
	toaCL,
	tobMetamorphPets} from './data/CollectionsExport';
import { creatablesCL } from './data/createables';
import { getSimilarItems } from './data/similarItems';
import { slayerMasksHelmsCL } from './data/slayerMaskHelms';
import { diaries, diariesObject } from './diaries';
import { growablePetsCL } from './growablePets';
import { allLeagueTasks, leagueTasks } from './leagues/leagues';
import { BSOMonsters } from './minions/data/killableMonsters/custom/customMonsters';
import { type DiaryID, type DiaryTierName, diaryTiers } from './minions/types';
import { PoHObjects, getPOHObject } from './poh';
import { getFarmingInfoFromUser } from './skilling/functions/getFarmingInfo';
import Skillcapes from './skilling/skillcapes';
import Agility from './skilling/skills/agility';
import { dungBuyables } from './skilling/skills/dung/dungData';
import { slayerUnlockableRewards } from './slayer/slayerUnlocks';
import { type RequirementFailure, Requirements } from './structures/Requirements';
import { TameSpeciesID, tameFeedableItems } from './tames';
import type { ItemBank } from './types';
import { itemID, itemNameFromID } from './util';
import resolveItems from './util/resolveItems';

const minigameRequirements = new Requirements();
for (const [name, activity] of Object.entries(allCollectionLogs.Minigames.activities)) {
	if (activity.items) {
		minigameRequirements.add({
			name: `Complete ${name} CL`,
			clRequirement: activity.items
		});
	}
}
minigameRequirements
	.add({ name: 'Defeat the Corrupted Gauntlet', minigames: { corrupted_gauntlet: 1 } })
	.add({ name: 'Defeat the Inferno', minigames: { inferno: 1 } })
	.add({ name: 'Defeat the Emerged Zuk Inferno', minigames: { emerged_inferno: 1 } })
	.add({
		name: 'Reach level 5 Honour level',
		has: ({ stats }) => stats.baHonourLevel === 5
	});

const pvmRequirements = new Requirements();
for (const [name, activity] of Object.entries(allCollectionLogs.PvM.activities)) {
	if (activity.items) {
		pvmRequirements.add({
			name: `Complete ${name} CL`,
			clRequirement: activity.items
		});
	}
}
pvmRequirements
	.add({ name: 'Obtain all Slayer mask and helms', clRequirement: slayerMasksHelmsCL })
	.add({
		name: 'Kill a Frost dragon',
		kcRequirement: {
			[BSOMonsters.FrostDragon.id]: 1
		}
	})
	.add({
		name: "Complete the Champion's Challenge",
		minigames: {
			champions_challenge: 1
		}
	})
	.add({
		name: 'Receive all ToB pet metamorphosis',
		clRequirement: resolveItems(["Lil' Zik", 'Sanguine dust', ...tobMetamorphPets])
	})
	.add({
		name: 'Receive all CoX pet metamorphosis',
		clRequirement: resolveItems(['Olmlet', 'Metamorphic dust', ...chambersOfXericMetamorphPets])
	})
	.add({
		name: 'Receive/Create all ToA pet metamorphosis',
		clRequirement: resolveItems([
			"Tumeken's guardian",
			'Remnant of akkha',
			'Akkhito',
			'Remnant of ba-ba',
			'Babi',
			'Remnant of kephri',
			'Kephriti',
			'Ancient remnant',
			"Tumeken's damaged guardian",
			'Ancient remnant',
			"Elidinis' damaged guardian",
			'Remnant of zebak',
			'Zebo'
		])
	})
	.add({
		name: 'Receive all DoA pet metamorphosis',
		clRequirement: allDOAPets
	});

const skillingRequirements = new Requirements();
for (const [name, activity] of Object.entries(allCollectionLogs.Skilling.activities)) {
	if (activity.items) {
		skillingRequirements.add({
			name: `Complete ${name} CL`,
			clRequirement: activity.items
		});
	}
}
skillingRequirements
	.add({
		name: 'Grow 5 Spirit trees',
		has: ({ user }) => {
			const info = getFarmingInfoFromUser(user.user);
			const hasFive = info.patches.spirit.lastQuantity >= 5;
			return hasFive || user.bitfield.includes(BitField.GrewFiveSpiritTrees);
		}
	});

for (const cape of Skillcapes) {
	skillingRequirements.add({
		name: `Achieve 500m ${toTitleCase(cape.skill)} XP and purchase the Master cape`,
		clRequirement: [cape.masterCape.id]
	});
}
for (const cape of expertCapesCL) {
	skillingRequirements.add({
		name: `Purchase a ${itemNameFromID(cape)}`,
		clRequirement: [cape]
	});
}
skillingRequirements.add({
	name: 'Complete a lap at every Agility course',
	has: ({ stats }) => {
		const coursesNotDone = Agility.Courses.filter(course => !stats.lapsScores[course.id]);
		if (coursesNotDone.length > 0) {
			return [
				{
					reason: `You need to complete a lap at every Agility course, you still need to do one at: ${coursesNotDone
						.map(i => i.name)
						.join(', ')}.`
				}
			];
		}
	}
});

const cluesRequirements = new Requirements()
	.add({ name: 'Complete Beginner Treasure Trails CL', clRequirement: cluesBeginnerCL })
	.add({ name: 'Complete Easy Treasure Trails CL', clRequirement: cluesEasyCL })
	.add({ name: 'Complete Elite Treasure Trail Rewards (Rare) CL', clRequirement: cluesEliteRareCL })
	.add({ name: 'Complete Elite Treasure Trails CL', clRequirement: cluesEliteCL })
	.add({ name: 'Complete Hard Treasure Trail Rewards (Rare) CL', clRequirement: cluesHardRareCL })
	.add({ name: 'Complete Hard Treasure Trails CL', clRequirement: cluesHardCL })
	.add({ name: 'Complete Master Treasure Trail Rewards (Rare) CL', clRequirement: cluesMasterRareCL })
	.add({ name: 'Complete Master Treasure Trails CL', clRequirement: cluesMasterCL })
	.add({ name: 'Complete Medium Treasure Trails CL', clRequirement: cluesMediumCL })
	.add({ name: 'Complete Rare Treasure Trail Rewards CL', clRequirement: cluesRaresCL })
	.add({ name: 'Complete Shared Treasure Trail Rewards CL', clRequirement: cluesSharedCL })
	.add({
		name: 'Build and Fill all STASH Units',
		has: ({ stashUnits }) => {
			const amountNotBuilt = stashUnits.filter(i => !i.isFull || !i.builtUnit).length;
			if (amountNotBuilt > 0) {
				return `You have ${amountNotBuilt} stash units left to build and fill.`;
			}
		}
	})
	.add({
		name: 'Collect/Complete/Open a Grandmaster clue',
		has: ({ clueCounts }) => {
			if (clueCounts.Grandmaster === 0) {
				return 'You need to Collect/Complete/Open a Grandmaster clue';
			}
		}
	})
	.add({
		name: 'Collect/Complete/Open a Elder clue',
		has: ({ clueCounts }) => {
			if (clueCounts.Elder === 0) {
				return 'You need to Collect/Complete/Open a Elder clue';
			}
		}
	})
	.add({
		name: 'Complete 600 Beginner Treasure Trails',
		clueCompletions: {
			Beginner: 600
		}
	})
	.add({
		name: 'Complete 500 Easy Treasure Trails',
		clueCompletions: {
			Easy: 500
		}
	})
	.add({
		name: 'Complete 400 Medium Treasure Trails',
		clueCompletions: {
			Medium: 400
		}
	})
	.add({
		name: 'Complete 300 Hard Treasure Trails',
		clueCompletions: {
			Hard: 300
		}
	})
	.add({
		name: 'Complete 200 Elite Treasure Trails',
		clueCompletions: {
			Elite: 200
		}
	})
	.add({
		name: 'Complete 100 Master Treasure Trails',
		clueCompletions: {
			Master: 100
		}
	})
	.add({
		name: 'Complete 50 Grandmaster Treasure Trails',
		clueCompletions: {
			Grandmaster: 50
		}
	})
	.add({
		name: 'Complete 30 Elder Treasure Trails',
		clueCompletions: {
			Elder: 30
		}
	})
	.add({
		name: 'Complete a total of 2001 Treasure Trails',
		has: ({ clueCounts }) => {
			const hasAll = sumArr(Object.values(clueCounts)) >= 2001;
			if (!hasAll) {
				return 'You need to complete a total of 2001 Treasure Trails';
			}
		}
	});

const miscRequirements = new Requirements()
	.add({ name: 'Complete Daily CL', clRequirement: dailyCL })
	.add({ name: 'Complete Growable Pets CL', clRequirement: growablePetsCL })
	.add({ name: 'Complete Leagues CL', clRequirement: leaguesCL })
	.add({ name: 'Complete Miscellaneous CL', clRequirement: miscellaneousCL })
	.add({ name: 'Complete Quest CL', clRequirement: questCL })
	.add({ name: 'Complete Random Events CL', clRequirement: randomEventsCL })
	.add({ name: 'Complete Shayzien Armour CL', clRequirement: shayzienArmourCL });

const petTripSource: [string, keyof UserStats][] = [
	['Brock', 'brock_loot_bank'],
	['Doug', 'doug_loot_bank'],
	['Harry', 'harry_loot_bank'],
	['Obis', 'obis_loot_bank'],
	['Peky', 'peky_loot_bank'],
	['Wilvus', 'wilvus_loot_bank']
];
for (const [name, key] of petTripSource) {
	miscRequirements.add({
		name: `Take ${name} on a trip and receive loot from them`,
		has: ({ stats }) => {
			if (Object.keys(stats.userStats[key] as ItemBank).length === 0) {
				return [
					{
						reason: `You need to take ${name} on a trip and receive loot from them.`
					}
				];
			}
			return [];
		}
	});
}
miscRequirements
	.add({
		name: 'Buy a Music cape',
		has: ({ stats }) => {
			const itemsBought = new Bank(stats.userStats.buy_loot_bank as ItemBank);
			if (!itemsBought.has('Music cape')) {
				return [
					{
						reason: 'You need to buy a Music cape.'
					}
				];
			}
			return [];
		}
	})
	.add({
		name: 'Buy a trimmed Music cape',
		has: ({ stats }) => {
			const itemsBought = new Bank(stats.userStats.buy_loot_bank as ItemBank);
			if (!itemsBought.has('Music cape (t)')) {
				return [
					{
						reason: 'You need to buy a trimmed Music cape.'
					}
				];
			}
			return [];
		}
	})
	.add({
		name: 'Unlock all Slayer unlocks',
		has: ({ user, roboChimpUser }) => {
			const hasAll =
				roboChimpUser.leagues_completed_tasks_ids.includes(4103) ||
				user.user.slayer_unlocks.length >= slayerUnlockableRewards.length ||
				user.bitfield.includes(BitField.HadAllSlayerUnlocks);
			if (!hasAll) {
				return 'Unlock all Slayer unlocks';
			}
		}
	})
	.add({
		name: 'Buy all Dungeoneering rewards',
		clRequirement: dungBuyables.map(i => i.item.id)
	})
	.add({
		name: 'Receive a casket of every tier from Zippy (excluding Grandmaster and Elder)',
		has: ({ stats }) => {
			const tiersNotReceived = ClueTiers.filter(i => !['Grandmaster', 'Elder'].includes(i.name)).filter(
				tier => !stats.lootFromZippyBank.has(tier.id)
			);
			if (tiersNotReceived.length > 0) {
				return [
					{
						reason: `You need to receive a casket of every tier from Zippy. You still need: ${tiersNotReceived
							.map(tier => tier.name)
							.join(', ')}.`
					}
				];
			}
		}
	})
	.add({
		name: 'Buy a Master quest cape',
		clRequirement: resolveItems(['Master quest cape'])
	})
	.add({
		name: 'Build the highest tier (level requirement) item in every POH Slot',
		has: ({ poh }) => {
			const failures: RequirementFailure[] = [];
			for (const [key, val] of objectEntries(poh)) {
				if (key === 'user_id' || key === 'background_id' || key === 'altar') continue;
				const sorted = PoHObjects.filter(
					i => i.slot === key && (typeof i.level === 'number' || 'construction' in i.level)
				).sort((a, b) => {
					const sortA = typeof a.level === 'number' ? a.level : a.level.construction!;
					const sortB = typeof b.level === 'number' ? b.level : b.level.construction!;
					return sortB - sortA;
				});
				const highestIDs = sorted.filter(i => i.level === sorted[0].level).map(i => i.id);
				if (!val || typeof val !== 'number' || !highestIDs.includes(val)) {
					failures.push({
						reason: `You need to build one of these in the ${key} slot: ${highestIDs
							.map(getPOHObject)
							.map(i => i.name)
							.join(', ')}`
					});
				}
			}
			return failures;
		}
	});

const unlockablesRequirements = new Requirements()
	.add({
		name: 'Use a Scroll of Farming',
		bitfieldRequirement: BitField.HasScrollOfFarming
	})
	.add({
		name: 'Use a Scroll of Longevity',
		bitfieldRequirement: BitField.HasScrollOfLongevity
	})
	.add({
		name: 'Use a Scroll of the Hunt',
		bitfieldRequirement: BitField.HasScrollOfTheHunt
	})
	.add({
		name: 'Use a Torn Prayer Scroll',
		bitfieldRequirement: BitField.HasTornPrayerScroll
	})
	.add({
		name: 'Use a Guthix Engram',
		bitfieldRequirement: BitField.HasGuthixEngram
	})
	.add({
		name: 'Unlock the Hosidius wallkit',
		bitfieldRequirement: BitField.HasHosidiusWallkit
	})
	.add({
		name: 'Use a Dexterous Prayer Scroll',
		bitfieldRequirement: BitField.HasDexScroll
	})
	.add({
		name: 'Use a Daemonheim agility pass',
		bitfieldRequirement: BitField.HasDaemonheimAgilityPass
	})
	.add({
		name: 'Use a Banana enchantment scroll',
		bitfieldRequirement: BitField.HasBananaEnchantmentScroll
	})
	.add({
		name: 'Use a Arcane prayer scroll',
		bitfieldRequirement: BitField.HasArcaneScroll
	})
	.add({
		name: 'Use a Runescroll of bloodbark',
		bitfieldRequirement: BitField.HasBloodbarkScroll
	})
	.add({
		name: 'Use a Runescroll of swampbark',
		bitfieldRequirement: BitField.HasSwampbarkScroll
	})
	.add({
		name: 'Use a Slepey tablet',
		bitfieldRequirement: BitField.HasSlepeyTablet
	})
	.add({
		name: 'Use/Plant an Ivy seed',
		bitfieldRequirement: BitField.HasPlantedIvy
	})
	.add({
		name: "Use a Saradomin's light",
		bitfieldRequirement: BitField.HasSaradominsLight
	})
	.add({
		name: 'Unlock the Leagues max trip length boost',
		bitfieldRequirement: BitField.HasLeaguesOneMinuteLengthBoost
	})
	.add({
		name: 'Unlock the sacrifice max trip length boost',
		has: ({ user }) => {
			const sac = Number(user.user.sacrificedValue);
			const { isIronman } = user;
			const sacPercent = Math.min(100, calcWhatPercent(sac, isIronman ? 5_000_000_000 : 10_000_000_000));
			if (sacPercent < 100) {
				return 'You need to sacrifice enough items to unlock the max trip length boost.';
			}
		}
	});

for (const energy of divinationEnergies) {
	if (!energy.boon || !energy.boonBitfield) continue;
	unlockablesRequirements.add({
		name: `Use a ${energy.boon.name}`,
		bitfieldRequirement: energy.boonBitfield
	});
}

const tameRequirements = new Requirements()
	.add({
		name: 'Build a Nursery',
		has: ({ user }) => {
			if (user.user.nursery === null) {
				return 'You need to build a Nursery.';
			}
		}
	})
	.add({
		name: 'Obtain, hatch, and fully grow a Monkey Tame',
		has: ({ tames }) => {
			if (!tames.some(t => t.species.id === TameSpeciesID.Monkey && t.growthStage === tame_growth.adult)) {
				return 'You need to obtain, hatch, and grow to adult a Monkey Tame.';
			}
		},
		clRequirement: resolveItems(['Monkey egg'])
	})
	.add({
		name: 'Obtain, hatch, and fully grow a Igne Tame',
		has: ({ tames }) => {
			if (!tames.some(t => t.species.id === TameSpeciesID.Igne && t.growthStage === tame_growth.adult)) {
				return 'You need to obtain, hatch, and grow to adult a Igne Tame.';
			}
		},
		clRequirement: resolveItems(['Dragon egg'])
	})
	.add({
		name: 'Feed a Monkey tame all items that provide a boost',
		has: ({ tames }) => {
			const itemsToBeFed = tameFeedableItems.filter(i =>
				i.tameSpeciesCanBeFedThis.includes(TameSpeciesID.Monkey)
			);

			const oneTameHasAll = tames
				.filter(t => t.species.id === TameSpeciesID.Monkey)
				.some(tame =>
					itemsToBeFed.every(itemNeedsToBeFed =>
						getSimilarItems(itemNeedsToBeFed.item.id).some(similarItem => tame.fedItems.has(similarItem))
					)
				);
			if (!oneTameHasAll) {
				return `You need to feed all of these items to one of your Monkey tames: ${itemsToBeFed
					.map(i => i.item.name)
					.join(', ')}.`;
			}
		}
	})
	.add({
		name: 'Feed a Igne tame all items that provide a boost',
		has: ({ tames }) => {
			const itemsToBeFed = tameFeedableItems.filter(i => i.tameSpeciesCanBeFedThis.includes(TameSpeciesID.Igne));

			const oneTameHasAll = tames
				.filter(t => t.species.id === TameSpeciesID.Igne)
				.some(tame =>
					itemsToBeFed.every(itemNeedsToBeFed =>
						getSimilarItems(itemNeedsToBeFed.item.id).some(similarItem => tame.fedItems.has(similarItem))
					)
				);
			if (!oneTameHasAll) {
				return `You need to feed all of these items to one of your Igne tames: ${itemsToBeFed
					.map(i => i.item.name)
					.join(', ')}.`;
			}
		}
	})
	.add({
		name: 'Equip a Igne tame with the BiS items',
		has: ({ tames }) => {
			const oneTameHasAll = tames
				.filter(t => t.species.id === TameSpeciesID.Igne)
				.some(tame => {
					return (
						tame.equippedArmor?.id === itemID('Gorajan igne armor') &&
						tame.equippedPrimary?.id === itemID('Gorajan igne claws')
					);
				});
			if (!oneTameHasAll) {
				return 'You need to equip a Igne tame with the BiS items.';
			}
		}
	});

const diaryRequirements = new Requirements();
for (const [, b] of objectEntries(diariesObject)) {
	diaryRequirements.add({
		name: `Complete the ${b.name} achievement diary`,
		diaryRequirement: diaries.flatMap(i => {
			const res: [DiaryID, DiaryTierName][] = [];
			for (const a of diaryTiers) {
				res.push([i.id, a]);
			}
			return res;
		})
	});
}
diaryRequirements.add({ name: 'Complete Achievement Diary CL', clRequirement: diariesCL });

export const compCapeTrimmedRequirements = new Requirements()
	.add({
		name: 'Complete the main Grandmaster treasure trails CL',
		clRequirement: cluesGrandmasterCL
	})
	.add({
		name: 'Complete all Leagues tasks',
		has: ({ roboChimpUser }) => {
			const hasAll =
				roboChimpUser.leagues_completed_tasks_ids.length === allLeagueTasks.length &&
				allLeagueTasks.every(t => roboChimpUser.leagues_completed_tasks_ids.includes(t.id));
			if (!hasAll) {
				return 'You need to complete all Leagues tasks.';
			}
		}
	})
	.add({ name: 'Complete Capes CL', clRequirement: capesCL })
	.add({ name: 'Complete Clothing Mystery Box CL', clRequirement: cmbClothes })
	.add({ name: 'Complete Creatables CL', clRequirement: creatablesCL })
	.add({ name: 'Complete Custom Pets CL', clRequirement: customPetsCL })
	.add({ name: 'Complete Holiday Mystery box CL', clRequirement: holidayCL })
	.add({ name: "Complete Chamber's of Xeric CL", clRequirement: chambersOfXericCL })
	.add({ name: 'Complete Depths of Atlantis CL', clRequirement: doaCL })
	.add({ name: 'Complete Theatre of Blood CL', clRequirement: theatreOfBLoodCL })
	.add({ name: 'Complete Tombs of Amascut CL', clRequirement: toaCL });

for (const group of leagueTasks) {
	compCapeTrimmedRequirements.add({
		name: `Complete all ${group.name} Leagues tasks`,
		has: ({ roboChimpUser }) => {
			return group.tasks.every(t => roboChimpUser.leagues_completed_tasks_ids.includes(t.id));
		}
	});
}

export const compCapeCategories = [
	{
		name: 'PvM',
		requirements: pvmRequirements
	},
	{
		name: 'Skilling',
		requirements: skillingRequirements
	},
	{
		name: 'Diaries',
		requirements: diaryRequirements
	},
	{
		name: 'Tames',
		requirements: tameRequirements
	},
	{
		name: 'Unlockables',
		requirements: unlockablesRequirements
	},
	{
		name: 'Treasure Trails',
		requirements: cluesRequirements
	},
	{
		name: 'Minigames',
		requirements: minigameRequirements
	},
	{
		name: 'Miscellaneous',
		requirements: miscRequirements
	},
	{
		name: 'Trimmed',
		requirements: compCapeTrimmedRequirements
	}
] as const;

// const allCLItemsCheckedFor = compCapeCategories
// 	.map(i => i.requirements.requirements)
// 	.flat(2)
// 	.flatMap(req => {
// 		if ('clRequirement' in req) {
// 			return Array.isArray(req.clRequirement) ? req.clRequirement : req.clRequirement.items().map(i => i[0].id);
// 		}
// 		return [];
// 	});

// const overallItemsNotCheckedFor = Items.array()
// 	.map(i => i.id)
// 	.filter(i => !allCLItemsCheckedFor.includes(i));

// writeFileSync('overallItemsNotCheckedFor.txt', `${overallItemsNotCheckedFor.map(itemNameFromID).sort().join('\n')}`);

export async function generateAllCompCapeTasksList() {
	let totalRequirements = 0;

	let finalStr = '';

	for (const cat of compCapeCategories) {
		const tasksLen = cat.requirements.requirements.length;
		totalRequirements += tasksLen;
		let subStr = `${cat.name} (${tasksLen} tasks)\n`;
		subStr += cat.requirements.formatAllRequirements();
		subStr += '\n\n';
		finalStr += subStr;
	}

	return `Completionist Cape Tasks - ${totalRequirements} tasks\n\n

${finalStr}`;
}
