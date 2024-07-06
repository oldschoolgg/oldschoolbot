import { averageArr, seedShuffle, toTitleCase } from '@oldschoolgg/toolkit';
import type { FishingContestCatch } from '@prisma/client';
import { calcPercentOfNum, randArrItem } from 'e';
import type { Item } from 'oldschooljs/dist/meta/types';

import {
	ArdougneDiary,
	DesertDiary,
	KourendKebosDiary,
	LumbridgeDraynorDiary,
	MorytaniaDiary,
	WildernessDiary,
	userhasDiaryTier
} from './diaries';
import { prisma } from './settings/prisma';
import { SkillsEnum } from './skilling/types';
import { ISODateString, gaussianRandom } from './util';
import getOSItem from './util/getOSItem';

const warmVerbs = ['freshwater', 'waterborn', 'silver'];
const coldVerbs = ['pacific', 'long-finned', 'spotted'];

const riverNouns = ['lamprey', 'monkeyface', 'oilfish', 'candlefish', 'prickleback'];
const oceanNouns = ['daggertooth', 'loweye', 'sunfish', 'angelfish', 'hatchetfish'];
const lakeNouns = ['stargazer', 'swordfish', 'loach', 'sturgeon', 'catfish'];

type Temperature = 'cold' | 'warm';
type Water = 'ocean' | 'river' | 'lake';

const verbMap = {
	warm: warmVerbs,
	cold: coldVerbs
} as const;

const waterMap = {
	river: riverNouns,
	ocean: oceanNouns,
	lake: lakeNouns
} as const;

interface LuckModifier {
	name: string;
	has: (user: MUser) => Promise<boolean>;
	percentAddedToMin: number;
}

interface FishingLocation {
	id: number;
	name: string;
	temperature: Temperature;
	water: Water;
	specialtyVerb: string;
	allFishNames: string[];
	modifiers: LuckModifier[];
	bait: Item;
}

export const fishingLocations: FishingLocation[] = [
	// Rivers
	{
		id: 1,
		name: 'River Elid',
		temperature: 'warm',
		water: 'river',
		specialtyVerb: 'sand-skin',
		allFishNames: [],
		modifiers: [
			{
				name: 'Elite Desert Diary',
				has: async user => {
					return (await userhasDiaryTier(user, DesertDiary.elite))[0];
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Raw beast meat')
	},
	{
		id: 2,
		name: 'River Salve',
		temperature: 'cold',
		water: 'river',
		specialtyVerb: 'skeletal',
		allFishNames: [],
		modifiers: [
			{
				name: '90+ Prayer',
				has: async user => {
					return user.skillLevel(SkillsEnum.Prayer) >= 90;
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Unicorn horn')
	},
	{
		id: 3,
		name: 'River Dougne',
		temperature: 'cold',
		water: 'river',
		specialtyVerb: 'baxtorian',
		allFishNames: [],
		modifiers: [
			{
				name: 'Elite Ardougne Diary',
				has: async user => {
					return (await userhasDiaryTier(user, ArdougneDiary.elite))[0];
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Red salamander')
	},
	{
		id: 4,
		name: 'River Lum',
		temperature: 'warm',
		water: 'river',
		specialtyVerb: 'green',
		allFishNames: [],
		modifiers: [
			{
				name: 'Elite Lumbridge Diary',
				has: async user => {
					return (await userhasDiaryTier(user, LumbridgeDraynorDiary.elite))[0];
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Raw beef')
	},
	// Oceans
	{
		id: 7,
		name: 'Trollweiss Ocean',
		temperature: 'cold',
		water: 'ocean',
		specialtyVerb: 'snowy',
		allFishNames: [],
		modifiers: [
			{
				name: 'Infernal cape',
				has: async user => {
					return user.hasEquippedOrInBank('Infernal cape');
				},
				percentAddedToMin: 5
			},
			{
				name: 'TzKal cape',
				has: async user => {
					return user.hasEquippedOrInBank('TzKal cape');
				},
				percentAddedToMin: 2
			}
		],
		bait: getOSItem('Snowy knight')
	},
	{
		id: 8,
		name: 'East Piscarilius Ocean',
		temperature: 'warm',
		water: 'ocean',
		specialtyVerb: 'firm',
		allFishNames: [],
		modifiers: [
			{
				name: 'Elite Kourend Diary',
				has: async user => {
					return (await userhasDiaryTier(user, KourendKebosDiary.elite))[0];
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Chinchompa')
	},
	// Lakes
	{
		id: 10,
		name: 'Lake Molch',
		temperature: 'cold',
		water: 'lake',
		specialtyVerb: 'winged',
		allFishNames: [],
		modifiers: [
			{
				name: 'Golden Tench',
				has: async user => {
					return user.cl.has('Golden tench');
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Orange feather')
	},
	{
		id: 11,
		name: 'Mort Myre Swamp Lake',
		temperature: 'cold',
		water: 'lake',
		specialtyVerb: 'skeletal',
		allFishNames: [],
		modifiers: [
			{
				name: 'Elite Morytania Diary',
				has: async user => {
					return (await userhasDiaryTier(user, MorytaniaDiary.elite))[0];
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Mort myre fungus')
	},
	{
		id: 12,
		name: 'Wilderness Lava Lake',
		temperature: 'warm',
		water: 'lake',
		specialtyVerb: 'magma',
		allFishNames: [],
		modifiers: [
			{
				name: 'Elite Wilderness Diary',
				has: async user => {
					return (await userhasDiaryTier(user, WildernessDiary.elite))[0];
				},
				percentAddedToMin: 5
			}
		],
		bait: getOSItem('Infernal eel')
	}
];

for (const location of fishingLocations) {
	for (const verb of [...verbMap[location.temperature], location.specialtyVerb]) {
		for (const noun of waterMap[location.water]) {
			location.allFishNames.push(`${toTitleCase(verb)} ${toTitleCase(noun)}`);
		}
	}
}

interface FishType {
	temperature: Temperature;
	water: Water;
}

export function getCurrentFishType(dateOverride?: Date): FishType {
	const day = (dateOverride ?? new Date()).toLocaleDateString();

	return {
		temperature: seedShuffle(['cold', 'warm'] as const, day)[0],
		water: seedShuffle(['ocean', 'lake', 'river'] as const, day)[0]
	};
}

export function getValidLocationsForFishType(type: FishType) {
	return fishingLocations.filter(loc => loc.temperature === type.temperature && loc.water === type.water);
}

export async function getTopDailyFishingCatch() {
	const topThreeCatches: FishingContestCatch[] = await prisma.$queryRawUnsafe(`SELECT *
FROM fishing_contest_catch
WHERE date::date = '${ISODateString()}'
ORDER BY length_cm DESC
LIMIT 3;`);
	return topThreeCatches;
}

export async function getUsersFishingContestDetails(user: MUser) {
	const catchesFromToday: FishingContestCatch[] = await prisma.$queryRawUnsafe(`SELECT *
FROM fishing_contest_catch
WHERE user_id = ${user.id}::bigint
AND date::date = '${ISODateString()}'
LIMIT 10;`);
	const catchesAllTime = await prisma.fishingContestCatch.count({
		where: {
			user_id: BigInt(user.id)
		}
	});
	const totalLength: [{ sum: number }] = await prisma.$queryRawUnsafe(`SELECT SUM(COALESCE(length_cm, 0))::int as sum
FROM fishing_contest_catch
WHERE user_id = ${user.id}::bigint;`);
	const totalUniqueCatches: [{ uniq: number }] = await prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT(name)) AS uniq
FROM fishing_contest_catch
WHERE user_id = ${user.id}::bigint;`);
	return {
		catchesFromToday,
		catchesAllTime,
		totalLength: totalLength[0].sum,
		totalUniqueCatches: totalUniqueCatches[0].uniq
	};
}

export async function catchFishAtLocation({ user, location }: { user: MUser; location: FishingLocation }) {
	let minLength = 3.5;
	let maxLength = 180;

	const boosts: string[] = [];

	if (user.hasEquipped('Ring of luck')) {
		maxLength += 1;
		boosts.push('+1cm max len for RoL');
	}

	if (user.hasEquipped('Crystal fishing rod')) {
		maxLength += 5;
		boosts.push('+5cm max len for Crystal fishing rod');
	}

	for (const mod of location.modifiers) {
		if (await mod.has(user)) {
			const num = Math.floor(calcPercentOfNum(mod.percentAddedToMin, maxLength));
			minLength += num;
			boosts.push(`+${num}cm min len for ${mod.name}`);
		}
	}

	// Deduct from max length for <99 Fishing
	maxLength -= (100 - Math.min(99, user.skillLevel(SkillsEnum.Fishing) + 1)) / 3;

	// Deduct from max length based on average agil/str level
	const otherSkillAverage = averageArr([SkillsEnum.Agility, SkillsEnum.Strength].map(i => user.skillLevel(i)));
	maxLength -= (100 - Math.min(99, otherSkillAverage + 1)) / 5;

	const lengthCentimetres = gaussianRandom(minLength, maxLength, 8);
	const weightGrams = lengthCentimetres * gaussianRandom(50, 150, 6);
	const name = randArrItem(location.allFishNames);

	return {
		name,
		lengthCentimetres,
		weightGrams,
		lengthMetres: lengthCentimetres / 100,
		weightKG: weightGrams / 1000,
		boosts,
		maxLength
	};
}
