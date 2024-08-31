import { exponentialPercentScale, formatDuration, mentionCommand } from '@oldschoolgg/toolkit';
import { UserError } from '@oldschoolgg/toolkit';
import { GeneralBank, type GeneralBankType } from '@oldschoolgg/toolkit';
import {
	Time,
	calcPercentOfNum,
	calcWhatPercent,
	clamp,
	increaseNumByPercent,
	objectEntries,
	objectValues,
	percentChance,
	randInt,
	reduceNumByPercent,
	sumArr
} from 'e';
import { Bank, LootTable } from 'oldschooljs';
import type { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { userStatsBankUpdate } from '../mahoji/mahojiSettings';
import { gorajanGearBoost } from './bso/gorajanGearBoost';
import { getSimilarItems } from './data/similarItems';
import { degradeChargeBank } from './degradeableItems';
import type { GearSetupType } from './gear/types';
import { trackLoot } from './lootTrack';
import { QuestID } from './minions/data/quests';
import { ChargeBank } from './structures/Bank';
import type { ItemBank, Skills } from './types';
import type { ColoTaskOptions } from './types/minions';
import { itemID } from './util';
import addSubTaskToActivityTask from './util/addSubTaskToActivityTask';
import { calcMaxTripLength } from './util/calcMaxTripLength';
import resolveItems from './util/resolveItems';
import { formatSkillRequirements, itemNameFromID } from './util/smallUtils';
import { updateBankSetting } from './util/updateBankSetting';

function combinedChance(percentages: number[]): number {
	const failureProbabilities = percentages.map(p => (100 - p) / 100);
	const combinedFailureProbability = failureProbabilities.reduce((acc, prob) => acc * prob, 1);
	const combinedSuccessProbability = 1 - combinedFailureProbability;
	return combinedSuccessProbability * 100;
}

interface Wave {
	waveNumber: number;
	enemies: string[];
	reinforcements?: string[];
	table: LootTable;
}

export const colosseumWaves: Wave[] = [
	{
		waveNumber: 1,
		enemies: ['Fremennik Warband', 'Serpent Shaman'],
		reinforcements: ['Jaguar Warrior'],
		table: new LootTable().every('Sunfire splinters', 80)
	},
	{
		waveNumber: 2,
		enemies: ['Fremennik Warband', 'Serpent Shaman', 'Javelin Colossus'],
		reinforcements: ['Jaguar Warrior'],
		table: new LootTable()
			.add('Rune platebody', 1)
			.add('Death rune', 150)
			.add('Chaos rune', 150)
			.add('Sunfire splinters', 150)
			.add('Cannonball', 80)
			.add('Rune kiteshield', 4)
			.add('Rune chainbody', 1)
	},
	{
		waveNumber: 3,
		enemies: ['Fremennik Warband', 'Serpent Shaman', 'Javelin Colossus'],
		reinforcements: ['Jaguar Warrior'],
		table: new LootTable()
			.add('Rune platebody', 1, 9)
			.add('Death rune', 150, 9)
			.add('Chaos rune', 150, 9)
			.add('Sunfire splinters', 150, 9)
			.add('Cannonball', 80, 9)
			.add('Rune kiteshield', 4, 9)
			.add('Rune chainbody', 1, 9)
			.add('Onyx bolts', 30)
			.add('Snapdragon seed', 1)
			.add('Dragon platelegs', 1)
			.add('Sunfire splinters', 500)
			.add('Earth orb', 80)
			.add('Rune 2h sword', 2)
			.add('Gold ore', 150)
	},
	{
		waveNumber: 4,
		enemies: ['Fremennik Warband', 'Serpent Shaman', 'Manticore'],
		reinforcements: ['Jaguar Warrior', 'Serpent Shaman'],
		table: new LootTable()
			.add('Rune platebody', 1, 5535)
			.add('Death rune', 150, 5535)
			.add('Chaos rune', 150, 5535)
			.add('Sunfire splinters', 150, 5535)
			.add('Cannonball', 80, 5535)
			.add('Rune kiteshield', 4, 5535)
			.add('Rune chainbody', 1, 5535)
			.add('Onyx bolts', 30, 615)
			.add('Snapdragon seed', 1, 615)
			.add('Dragon platelegs', 1, 615)
			.add('Sunfire splinters', 500, 615)
			.add('Earth orb', 80, 615)
			.add('Rune 2h sword', 2, 615)
			.add('Gold ore', 150, 615)
			.add('Echo crystal', 1, 126)
			.add('Sunfire fanatic helm', 1, 70)
			.add('Sunfire fanatic cuirass', 1, 70)
			.add('Sunfire fanatic chausses', 1, 70)
			.add('Echo crystal', 2, 14)
			.add('Echo crystal', 3, 14)
	},
	{
		waveNumber: 5,
		enemies: ['Fremennik Warband', 'Serpent Shaman', 'Javelin Colossus', 'Manticore'],
		reinforcements: ['Jaguar Warrior', 'Serpent Shaman'],
		table: new LootTable()
			.add('Onyx bolts', 30, 2725)
			.add('Snapdragon seed', 1, 2725)
			.add('Dragon platelegs', 1, 2725)
			.add('Sunfire splinters', 500, 2725)
			.add('Earth orb', 80, 2725)
			.add('Rune 2h sword', 2, 2725)
			.add('Gold ore', 150, 2725)
			.add('Echo crystal', 1, 63)
			.add('Sunfire fanatic helm', 1, 35)
			.add('Sunfire fanatic cuirass', 1, 35)
			.add('Sunfire fanatic chausses', 1, 35)
			.add('Echo crystal', 2, 7)
			.add('Echo crystal', 3, 7)
	},
	{
		waveNumber: 6,
		enemies: ['Fremennik Warband', 'Serpent Shaman', 'Javelin Colossus', 'Manticore'],
		reinforcements: ['Jaguar Warrior', 'Serpent Shaman'],
		table: new LootTable()
			.add('Onyx bolts', 30, 2375)
			.add('Snapdragon seed', 1, 2375)
			.add('Dragon platelegs', 1, 2375)
			.add('Sunfire splinters', 500, 2375)
			.add('Earth orb', 80, 2375)
			.add('Rune 2h sword', 2, 2375)
			.add('Gold ore', 150, 2375)
			.add('Echo crystal', 1, 63)
			.add('Sunfire fanatic helm', 1, 35)
			.add('Sunfire fanatic cuirass', 1, 35)
			.add('Sunfire fanatic chausses', 1, 35)
			.add('Echo crystal', [2, 3], 7)
	},
	{
		waveNumber: 7,
		enemies: ['Fremennik Warband', 'Javelin Colossus', 'Manticore', 'Shockwave Colossus'],
		reinforcements: ['Minotaur'],
		table: new LootTable()
			.add('Onyx bolts', 30, 5832)
			.add('Snapdragon seed', 1, 5832)
			.add('Dragon platelegs', 1, 5832)
			.add('Sunfire splinters', 500, 5832)
			.add('Earth orb', 80, 5832)
			.add('Rune 2h sword', 2, 5832)
			.add('Gold ore', 150, 5832)
			.add('Dragon bolts (unf)', 200, 756)
			.add('Ranarr seed', 4, 756)
			.add('Sunfire splinters', 1100, 756)
			.add('Dragon arrowtips', 150, 756)
			.add('Adamantite ore', 100, 756)
			.add('Death rune', 250, 756)
			.add('Echo crystal', 1, 189)
			.add('Sunfire fanatic helm', 1, 105)
			.add('Sunfire fanatic cuirass', 1, 105)
			.add('Sunfire fanatic chausses', 1, 105)
			.add('Tonalztics of ralos (uncharged)', 1, 35)
			.add('Echo crystal', [2, 3], 21)
	},
	{
		waveNumber: 8,
		enemies: ['Fremennik Warband', 'Javelin Colossus', 'Manticore', 'Shockwave Colossus'],
		reinforcements: ['Minotaur'],
		table: new LootTable()
			.add('Onyx bolts', 30, 14_472)
			.add('Snapdragon seed', 1, 14_472)
			.add('Dragon platelegs', 1, 14_472)
			.add('Sunfire splinters', 500, 14_472)
			.add('Earth orb', 80, 14_472)
			.add('Rune 2h sword', 2, 14_472)
			.add('Gold ore', 150, 14_472)
			.add('Onyx bolts', 50, 1876)
			.add('Dragon platelegs', 2, 1876)
			.add('Sunfire splinters', 1750, 1876)
			.add('Rune kiteshield', 5, 1876)
			.add('Runite ore', 12, 1876)
			.add('Death rune', 300, 1876)
			.add('Echo crystal', 1, 567)
			.add('Sunfire fanatic helm', 1, 315)
			.add('Sunfire fanatic cuirass', 1, 315)
			.add('Sunfire fanatic chausses', 1, 315)
			.add('Tonalztics of ralos (uncharged)', 1, 105)
			.add('Echo crystal', [2, 3], 63)
	},
	{
		waveNumber: 9,
		enemies: ['Fremennik Warband', 'Javelin Colossus', 'Manticore'],
		reinforcements: ['Minotaur'],
		table: new LootTable()
			.add('Dragon bolts (unf)', 200, 3180)
			.add('Ranarr seed', 4, 3180)
			.add('Sunfire splinters', 1100, 3180)
			.add('Dragon arrowtips', 150, 3180)
			.add('Adamantite ore', 100, 3180)
			.add('Death rune', 250, 3180)
			.add('Onyx bolts', 75, 424)
			.add('Sunfire splinters', 2500, 424)
			.add('Dragon platelegs', 3, 424)
			.add('Death rune', 300, 424)
			.add('Rune warhammer', 5, 424)
			.add('Echo crystal', 1, 135)
			.add('Sunfire fanatic helm', 1, 75)
			.add('Sunfire fanatic cuirass', 1, 75)
			.add('Sunfire fanatic chausses', 1, 75)
			.add('Tonalztics of ralos (uncharged)', 1, 25)
			.add('Echo crystal', [2, 3], 15)
	},
	{
		waveNumber: 10,
		enemies: ['Fremennik Warband', 'Javelin Colossus', 'Manticore'],
		reinforcements: ['Minotaur', 'Serpent Shaman'],
		table: new LootTable()
			.add('Onyx bolts', 50, 2340)
			.add('Dragon platelegs', 2, 2340)
			.add('Sunfire splinters', 1750, 2340)
			.add('Rune kiteshield', 5, 2340)
			.add('Runite ore', 12, 2340)
			.add('Death rune', 300, 2340)
			.add('Onyx bolts', 100, 312)
			.add('Rune warhammer', 8, 312)
			.add('Dragon platelegs', 3, 312)
			.add('Sunfire splinters', 3500, 312)
			.add('Dragon arrowtips', 250, 312)
			.add('Echo crystal', 1, 135)
			.add('Sunfire fanatic helm', 1, 75)
			.add('Sunfire fanatic cuirass', 1, 75)
			.add('Sunfire fanatic chausses', 1, 75)
			.add('Tonalztics of ralos (uncharged)', 1, 25)
			.add('Echo crystal', [2, 3], 15)
	},
	{
		waveNumber: 11,
		enemies: ['Fremennik Warband', 'Javelin Colossus', 'Manticore', 'Shockwave Colossus'],
		reinforcements: ['Minotaur', 'Serpent Shaman'],
		table: new LootTable()
			.add('Onyx bolts', 75, 360)
			.add('Sunfire splinters', 2500, 360)
			.add('Dragon platelegs', 3, 360)
			.add('Death rune', 300, 360)
			.add('Rune warhammer', 5, 360)
			.add('Cannonball', 2000, 50)
			.add('Dragon plateskirt', 5, 50)
			.add('Dragon arrowtips', 350, 50)
			.add('Onyx bolts', 150, 50)
			.add('Echo crystal', 1, 27)
			.add('Sunfire fanatic helm', 1, 15)
			.add('Sunfire fanatic cuirass', 1, 15)
			.add('Sunfire fanatic chausses', 1, 15)
			.add('Tonalztics of ralos (uncharged)', 1, 5)
			.add('Echo crystal', [2, 3], 3)
	},
	{
		waveNumber: 12,
		enemies: ['Sol Heredit'],
		table: new LootTable()
			.every("Dizana's quiver (uncharged)")
			.tertiary(200, 'Smol heredit')
			.add('Onyx bolts', 100, 792)
			.add('Rune warhammer', 8, 792)
			.add('Dragon platelegs', 3, 792)
			.add('Sunfire splinters', 3500, 792)
			.add('Dragon arrowtips', 250, 792)
			.add('Echo crystal', 1, 135)
			.add('Uncut onyx', 1, 110)
			.add('Dragon plateskirt', 5, 110)
			.add('Rune 2h sword', 9, 110)
			.add('Runite ore', 35, 110)
			.add('Sunfire fanatic helm', 1, 75)
			.add('Sunfire fanatic cuirass', 1, 75)
			.add('Sunfire fanatic chausses', 1, 75)
			.add('Tonalztics of ralos (uncharged)', 1, 25)
			.add('Echo crystal', [2, 3], 15)
	}
];

function calculateDeathChance(waveKC: number, hasBF: boolean, hasSGS: boolean, hasBulwark: boolean): number {
	const cappedKc = Math.min(Math.max(waveKC, 0), 150);
	const baseChance = 80;
	const kcReduction = 80 * (1 - Math.exp(-1.5 * cappedKc));

	let newChance = baseChance - kcReduction;

	if (hasSGS) {
		newChance = reduceNumByPercent(newChance, 5);
	}
	if (hasBF) {
		newChance = reduceNumByPercent(newChance, 5);
	}
	if (hasBulwark) {
		newChance = reduceNumByPercent(newChance, 20);
	}

	return clamp(newChance, 1, 80);
}

export class ColosseumWaveBank extends GeneralBank<number> {
	constructor(initialBank?: GeneralBankType<number>) {
		super({
			initialBank,
			allowedKeys: colosseumWaves.map(i => i.waveNumber),
			valueSchema: { floats: true, min: 0, max: 999_999 }
		});
	}
}

function calculateTimeInMs(waveTwelveKC: number): number {
	const points: { kc: number; timeInMinutes: number }[] = [
		{ kc: 0, timeInMinutes: 60 },
		{ kc: 1, timeInMinutes: 45 },
		{ kc: 1, timeInMinutes: 35 },
		{ kc: 5, timeInMinutes: 30 },
		{ kc: 10, timeInMinutes: 25 },
		{ kc: 50, timeInMinutes: 19 },
		{ kc: 100, timeInMinutes: 16 },
		{ kc: 300, timeInMinutes: 15 }
	];

	if (waveTwelveKC <= points[0].kc) return points[0].timeInMinutes * 60 * 1000;
	if (waveTwelveKC >= points[points.length - 1].kc) return points[points.length - 1].timeInMinutes * 60 * 1000;

	for (let i = 0; i < points.length - 1; i++) {
		const point1 = points[i];
		const point2 = points[i + 1];
		if (waveTwelveKC >= point1.kc && waveTwelveKC <= point2.kc) {
			const slope = (point2.timeInMinutes - point1.timeInMinutes) / (point2.kc - point1.kc);
			return (point1.timeInMinutes + slope * (waveTwelveKC - point1.kc)) * 60 * 1000;
		}
	}

	return 0;
}

function calculateGlory(kcBank: ColosseumWaveBank, wave: Wave) {
	const waveKCSkillBank = new ColosseumWaveBank();
	for (const [waveNumber, kc] of kcBank.entries()) {
		waveKCSkillBank.add(waveNumber, clamp(calcWhatPercent(kc, 30 - waveNumber), 1, 100));
	}
	const kcSkill = waveKCSkillBank.amount(wave.waveNumber) ?? 0;
	const totalKCSkillPercent = sumArr(waveKCSkillBank.entries().map(ent => ent[1])) / waveKCSkillBank.length();
	const expSkill = exponentialPercentScale(totalKCSkillPercent);
	const maxPossibleGlory = 60_000;
	const ourMaxGlory = calcPercentOfNum(expSkill, maxPossibleGlory);
	const wavePerformance = exponentialPercentScale((totalKCSkillPercent + kcSkill) / 2);
	const glory = randInt(calcPercentOfNum(wavePerformance, ourMaxGlory), ourMaxGlory);
	return glory;
}

interface ColosseumResult {
	diedAt: number | null;
	loot: Bank | null;
	maxGlory: number;
	addedWaveKCBank: ColosseumWaveBank;
	fakeDuration: number;
	realDuration: number;
	totalDeathChance: number;
	deathChances: number[];
	scytheCharges: number;
	venatorBowCharges: number;
	bloodFuryCharges: number;
}

export const colosseumWaveTime = (options: {
	kcBank: ColosseumWaveBank;
	hasScythe: boolean;
	hasTBow: boolean;
	hasVenBow: boolean;
	hasClaws: boolean;
	hasTorture: boolean;
	hasHFB: boolean;
	hasVoidStaff: boolean;
	hasSungodAxe: boolean;
	hasGora: boolean;
	hasBHook: boolean;
}): number => {
	const waveTwelveKC = options.kcBank.amount(12);
	let waveDuration = calculateTimeInMs(waveTwelveKC) / 12;

	// reduce wave by 30% for axe (Effectively 40% boost since waveDuration wasn't increased by 10%)
	if (options.hasSungodAxe) {
		waveDuration = reduceNumByPercent(waveDuration, 30);
	} else if (!options.hasScythe) {
		waveDuration = increaseNumByPercent(waveDuration, 10);
	}
	// reduce wave by 12% for HFB (Effectively 22% boost since waveDuration wasn't increased by 10%)
	if (options.hasHFB) {
		waveDuration = reduceNumByPercent(waveDuration, 12);
	} else if (!options.hasTBow) {
		waveDuration = increaseNumByPercent(waveDuration, 10);
	}
	if (options.hasVoidStaff) {
		waveDuration = reduceNumByPercent(waveDuration, 12);
	}
	if (options.hasGora) {
		waveDuration = reduceNumByPercent(waveDuration, 10);
	}
	if (!options.hasVenBow) {
		waveDuration = increaseNumByPercent(waveDuration, 7);
	}
	if (!options.hasClaws) {
		waveDuration = increaseNumByPercent(waveDuration, 4);
	}
	if (!options.hasTorture || !options.hasBHook) {
		waveDuration = increaseNumByPercent(waveDuration, 5);
	}
	return waveDuration;
};

export const startColosseumRun = (options: {
	kcBank: ColosseumWaveBank;
	hasScythe: boolean;
	hasTBow: boolean;
	hasVenBow: boolean;
	hasBF: boolean;
	hasClaws: boolean;
	hasSGS: boolean;
	hasTorture: boolean;
	scytheCharges: number;
	venatorBowCharges: number;
	bloodFuryCharges: number;
	hasHFB: boolean;
	hasVoidStaff: boolean;
	hasSungodAxe: boolean;
	hasGora: boolean;
	hasBHook: boolean;
	hasBulwark: boolean;
}): ColosseumResult => {
	const bank = new Bank();
	const addedWaveKCBank = new ColosseumWaveBank();

	const waveDuration = colosseumWaveTime({
		kcBank: options.kcBank,
		hasScythe: options.hasScythe,
		hasTBow: options.hasTBow,
		hasVenBow: options.hasVenBow,
		hasClaws: options.hasClaws,
		hasTorture: options.hasTorture,
		hasHFB: options.hasHFB,
		hasVoidStaff: options.hasVoidStaff,
		hasSungodAxe: options.hasSungodAxe,
		hasGora: options.hasGora,
		hasBHook: options.hasBHook
	});

	const fakeDuration = 12 * waveDuration;
	const deathChances: number[] = [];
	let realDuration = 0;
	let maxGlory = 0;

	// Calculate charges used
	const scytheCharges = 300;
	const calculateVenCharges = () => 50;

	for (const wave of colosseumWaves) {
		realDuration += waveDuration;
		const kcForThisWave = options.kcBank.amount(wave.waveNumber);
		maxGlory = Math.max(calculateGlory(options.kcBank, wave), maxGlory);
		const deathChance = calculateDeathChance(kcForThisWave, options.hasBF, options.hasSGS, options.hasBulwark);
		deathChances.push(deathChance);

		if (percentChance(deathChance)) {
			return {
				diedAt: wave.waveNumber,
				loot: null,
				maxGlory: 0,
				addedWaveKCBank,
				fakeDuration,
				realDuration,
				totalDeathChance: combinedChance(deathChances),
				deathChances,
				scytheCharges: options.hasScythe ? scytheCharges : 0,
				venatorBowCharges: options.hasVenBow ? calculateVenCharges() : 0,
				bloodFuryCharges: options.hasBF ? scytheCharges * 3 : 0
			};
		}
		addedWaveKCBank.add(wave.waveNumber);
		bank.add(wave.table.roll());
		if (wave.waveNumber === 12) {
			return {
				diedAt: null,
				loot: bank,
				maxGlory,
				addedWaveKCBank,
				fakeDuration,
				realDuration,
				totalDeathChance: combinedChance(deathChances),
				deathChances,
				scytheCharges: options.hasScythe ? scytheCharges : 0,
				venatorBowCharges: options.hasVenBow ? calculateVenCharges() : 0,
				bloodFuryCharges: options.hasBF ? scytheCharges * 3 : 0
			};
		}
	}

	throw new Error('Colosseum run did not end correctly.');
};

export async function colosseumCommand(user: MUser, channelID: string, quantity: number | undefined) {
	if (user.minionIsBusy) {
		return `${user.usernameOrMention} is busy`;
	}

	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return `You need to complete the "Children of the Sun" quest before you can enter the Colosseum. Send your minion to do the quest using: ${mentionCommand(
			globalClient,
			'activities',
			'quest'
		)}.`;
	}

	const skillReqs: Skills = {
		attack: 90,
		strength: 90,
		defence: 90,
		prayer: 80,
		ranged: 90,
		magic: 94,
		hitpoints: 90
	};

	if (!user.hasSkillReqs(skillReqs)) {
		return `You need ${formatSkillRequirements(skillReqs)} to enter the Colosseum.`;
	}

	const requiredItems: Partial<Record<GearSetupType, Partial<Record<EquipmentSlot, number[]>>>> = {
		melee: {
			cape: resolveItems(['Infernal cape', 'Fire cape']),
			head: resolveItems(['Torva full helm', 'Neitiznot faceguard', 'Justiciar faceguard']),
			neck: resolveItems(["Brawler's hook necklace", 'Amulet of blood fury', 'Amulet of torture']),
			body: resolveItems(['Torva platebody', 'Bandos chestplate']),
			legs: resolveItems(['Torva platelegs', 'Bandos tassets']),
			feet: resolveItems(['Torva boots', 'Primordial boots']),
			hands: resolveItems(['Torva gloves', 'Ferocious gloves', 'Barrows gloves']),
			ring: resolveItems(['Ignis ring', 'Ultor ring', 'Berserker ring'])
		},
		range: {
			cape: resolveItems(["Ava's assembler"]),
			head: resolveItems(['Pernix cowl', 'Masori mask', 'Armadyl helmet']),
			neck: resolveItems(['Farsight snapshot necklace', 'Necklace of anguish']),
			body: resolveItems(['Pernix body', 'Masori body', 'Armadyl chestplate']),
			legs: resolveItems(['Pernix chaps', 'Masori chaps', 'Armadyl chainskirt']),
			feet: resolveItems(['Pernix boots', 'Pegasian boots']),
			hands: resolveItems(['Pernix gloves', 'Zaryte vambraces', 'Barrows gloves']),
			ring: resolveItems(['Ring of piercing', 'Venator ring', 'Archers ring'])
		}
	};

	const meleeWeapons = resolveItems([
		'Axe of the high sungod',
		'Scythe of vitur',
		'Soulreaper axe',
		'Blade of saeldor (c)'
	]);
	const rangeWeapons = resolveItems(['Hellfire bow', 'Zaryte bow', 'Twisted bow', 'Bow of faerdhinen (c)']);

	for (const [gearType, gearNeeded] of objectEntries(requiredItems)) {
		const gear = user.gear[gearType];
		if (!gearNeeded) continue;
		for (const items of objectValues(gearNeeded)) {
			if (!items) continue;
			if (!items.some(g => gear.hasEquipped(g, true))) {
				const simGear = items.flatMap(i => getSimilarItems(i));
				const gearNeeded = [...new Set([...simGear])];
				return `You need one of these equipped in your ${gearType} setup to enter the Colosseum: ${gearNeeded
					.map(itemNameFromID)
					.join(', ')}.`;
			}
		}
	}

	if (!meleeWeapons.some(i => user.gear.melee.hasEquipped(i, true))) {
		const simMeleeWeapon = meleeWeapons.flatMap(itemID => getSimilarItems(itemID));
		const meleeWeaponNeeded = [...new Set([...simMeleeWeapon])];
		return `You need one of these equipped in your melee setup to enter the Colosseum: ${meleeWeaponNeeded
			.map(itemNameFromID)
			.join(', ')}.`;
	}

	if (!rangeWeapons.some(i => user.gear.range.hasEquipped(i, true))) {
		const simRangeWeapon = rangeWeapons.flatMap(itemID => getSimilarItems(itemID));
		const rangeWeaponNeeded = [...new Set([...simRangeWeapon])];
		return `You need one of these equipped in your range setup to enter the Colosseum: ${rangeWeaponNeeded
			.map(itemNameFromID)
			.join(', ')}.`;
	}

	//OSB boost items:
	const hasBF = user.gear.melee.hasEquipped('Amulet of blood fury', true, false);
	const hasScythe = user.gear.melee.hasEquipped('Scythe of vitur', true, true);
	const hasTBow = user.gear.range.hasEquipped('Twisted bow', true, false);
	function calculateVenCharges() {
		return 50;
	}
	const hasVenBow = user.hasEquippedOrInBank('Venator bow') && user.user.venator_bow_charges >= calculateVenCharges();
	const hasClaws = user.hasEquippedOrInBank('Dragon claws');
	const hasSGS = user.hasEquippedOrInBank('Saradomin godsword');
	const hasTorture = !hasBF && user.gear.melee.hasEquipped('Amulet of torture');
	const scytheCharges = 300;
	const bloodFuryCharges = scytheCharges * 3;
	const venatorBowCharges = calculateVenCharges();

	//BSO boost items:
	const hasSungodAxe = user.gear.melee.hasEquipped('Axe of the high sungod', true, true);
	const hasHFB = user.gear.range.hasEquipped('Hellfire bow', true, true);
	const hasVoidStaff = user.gear.mage.hasEquipped('Void Staff', true, true);
	const hasGora = gorajanGearBoost(user, 'Colosseum');
	const hasBHook = !hasBF && user.gear.melee.hasEquipped("Brawler's hook necklace");
	const hasBulwark = user.owns('Infernal bulwark');
	const voidCharges = 150;

	// Get trip time and calculate max attempts the user can do per trip
	const kcBank: ColosseumWaveBank = new ColosseumWaveBank(
		(await user.fetchStats({ colo_kc_bank: true })).colo_kc_bank as ItemBank
	);
	const waveDuration = colosseumWaveTime({
		kcBank,
		hasScythe,
		hasTBow,
		hasVenBow,
		hasClaws,
		hasTorture,
		hasHFB,
		hasVoidStaff,
		hasSungodAxe,
		hasGora,
		hasBHook
	});
	const oneColoTripTime = waveDuration * 12;
	const maxUserTripTime = calcMaxTripLength(user, 'MonsterKilling');
	const maxColoQty = Math.max(1, Math.floor(maxUserTripTime / oneColoTripTime));
	if (!quantity || quantity > maxColoQty) {
		quantity = maxColoQty;
	}

	// get all the results and cost from each attempt
	const chargeBank = new ChargeBank();
	const cost = new Bank();
	const results: ColosseumResult[] = [];
	for (let i = 0; i < quantity; i++) {
		const res = startColosseumRun({
			kcBank,
			hasScythe,
			hasTBow,
			hasVenBow,
			hasBF,
			hasClaws,
			hasSGS,
			hasTorture,
			scytheCharges,
			venatorBowCharges,
			bloodFuryCharges,
			hasHFB,
			hasVoidStaff,
			hasSungodAxe,
			hasGora,
			hasBHook,
			hasBulwark
		});
		results.push(res);
		const minutes = res.realDuration / Time.Minute;

		// Calculate resources needed for 1 attempt
		cost.add('Saradomin brew(4)', 6).add('Super restore(4)', 8).add('Super combat potion(4)');
		if (user.bank.has('Ranging potion(4)')) {
			cost.add('Ranging potion(4)');
		} else if (user.bank.has('Bastion potion(4)')) {
			cost.add('Bastion potion(4)');
		} else {
			return 'You need to have a Ranging potion(4) or Bastion potion(4) in your bank.';
		}
		if (hasHFB) cost.add('Hellfire arrow', Math.ceil(minutes * 3.5));
		if (hasTBow) cost.add('Dragon arrow', Math.ceil(minutes * 3));
		if (hasVoidStaff) cost.add('void_staff_charges', voidCharges)
		if (hasScythe) chargeBank.add('scythe_of_vitur_charges', scytheCharges);
		if (hasBF) chargeBank.add('blood_fury_charges', bloodFuryCharges);
		if (hasVenBow) {
			chargeBank.add('venator_bow_charges', calculateVenCharges());
			cost.add(hasHFB ? 'Hellfire arrow' : 'Dragon arrow', hasHFB ? 40 : 50);
		}
	}

	// Generate various messages
	const costStr: string[] = [];
	const boosts: string[] = [];
	const missedBoosts: string[] = [];
	const deathBoosts: string[] = [];
	const missedDeathBoosts: string[] = [];

	if (hasSungodAxe) {
		boosts.push('+40% for Axe of the high sungod');
	} else if (hasScythe) {
		boosts.push('+10% for Scythe');
	} else {
		missedBoosts.push('+10% for Scythe, +40% for Axe of the high sungod');
	}

	if (hasHFB) {
		boosts.push('+22% for Hellfire bow');
	} else if (hasTBow) {
		boosts.push('+10% for TBow');
	} else {
		missedBoosts.push('+10% for TBow, +20% for Hellfire bow');
	}

	if(hasVoidStaff){
		boosts.push('+12% for Void staff');
	} else {
		missedBoosts.push('12% for Void staff');
	}

	if (hasGora) {
		boosts.push('+10% for Gorajan');
	} else {
		missedBoosts.push('+10% for Gorajan');
	}

	if (hasVenBow) {
		boosts.push('+7% boost for Venator bow');
	} else {
		missedBoosts.push(
			`+7% for Venator bow (You also need atleast ${hasHFB ? '40' : '50'} ${hasHFB ? 'Hellfire arrow' : 'Dragon arrow'} equipped)`
		);
	}

	if (hasTorture || hasBHook) {
		boosts.push(`5% boost for ${hasBHook ? "Brawler's" : 'Torture'}`);
	} else {
		missedBoosts.push("Missed 5% Brawler's/Torture boost");
	}

	if (hasClaws) {
		boosts.push('+4% for Dragon claws');
	} else {
		missedBoosts.push('+4% for Dragon claws');
	}

	if (hasBF) {
		deathBoosts.push('-5% for blood fury');
	} else {
		missedDeathBoosts.push('-5% for blood fury');
	}

	if (hasSGS) {
		deathBoosts.push('-5% for Saradomin godsword');
	} else {
		missedDeathBoosts.push('-5% for Saradomin godsword');
	}

	if (hasBulwark) {
		deathBoosts.push('-20% for Infernal bulwark');
	} else {
		missedDeathBoosts.push('-20% for Infernal bulwark');
	}

	// attempt to remove resources and charges from the user
	const realCost = new Bank();
	try {
		const result = await user.specialRemoveItems(cost);
		realCost.add(result.realCost);
	} catch (err: any) {
		if (err instanceof UserError) {
			return err.message;
		}
		throw err;
	}
	costStr.push(`**Removed:** ${realCost}`);

	if (chargeBank.length() > 0) {
		const hasChargesResult = user.hasCharges(chargeBank);
		if (!hasChargesResult.hasCharges) {
			return hasChargesResult.fullUserString!;
		}

		const degradeResults = await degradeChargeBank(user, chargeBank);
		costStr.push(degradeResults.map(i => i.userMessage).join(', '));
	}

	// update user stats
	await updateBankSetting('colo_cost', realCost);
	await userStatsBankUpdate(user, 'colo_cost', realCost);
	await trackLoot({
		totalCost: realCost,
		id: 'colo',
		type: 'Minigame',
		changeType: 'cost',
		users: [
			{
				id: user.id,
				cost: realCost
			}
		]
	});

	let totalDuration = 0;
	let totalFakeDuration = 0;
	let maxGlory = 0;
	const diedAt: (number | null)[] = [];
	const totalLoot = new Bank();
	let totalScytheCharges = 0;
	let totalVenatorBowCharges = 0;
	let totalBloodFuryCharges = 0;

	// go through the results and combine them
	for (const result of results) {
		totalDuration += result.realDuration;
		totalFakeDuration += result.fakeDuration;
		if (result.maxGlory > maxGlory) maxGlory = result.maxGlory;
		diedAt.push(result.diedAt);
		if (result.loot) totalLoot.add(result.loot);
		totalScytheCharges += result.scytheCharges;
		totalVenatorBowCharges += result.venatorBowCharges;
		totalBloodFuryCharges += result.bloodFuryCharges;
	}

	await addSubTaskToActivityTask<ColoTaskOptions>({
		userID: user.id,
		channelID,
		duration: totalDuration,
		type: 'Colosseum',
		quantity,
		fakeDuration: totalFakeDuration,
		maxGlory,
		diedAt: diedAt,
		loot: totalLoot.bank,
		scytheCharges: totalScytheCharges,
		venatorBowCharges: totalVenatorBowCharges,
		bloodFuryCharges: totalBloodFuryCharges
	});

	if (missedBoosts.length === 0) missedBoosts.push('None');
	if (missedDeathBoosts.length === 0) missedDeathBoosts.push('None');

	return (
		`${user.minionName} is now ${quantity > 1 ? `doing ${quantity} attempts at` : 'attempting'} the Colosseum. They will finish in around ${formatDuration(totalFakeDuration)}, unless they die early.\n\n` +
		`**Boosts:** ${boosts.join(', ')}.\n` +
		`**Missed Boosts:** ${missedBoosts.join(', ')}.\n` +
		`**Death Reduction:** ${deathBoosts.join(', ')}.\n` +
		`**Missed Death Reduction:** ${missedDeathBoosts.join(', ')}.\n\n` +
		`${costStr.join(', ')}`
	);
}
