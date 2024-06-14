import { calcPercentOfNum, calcWhatPercent, clamp, percentChance, randFloat, randInt, sumArr, Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { GeneralBank, GeneralBankType } from './structures/GeneralBank';
import { assert } from './util';
import { averageBank, exponentialPercentScale, formatDuration } from './util/smallUtils';

interface Wave {
	waveNumber: number;
	enemies: string[];
	reinforcements?: string[];
	table: LootTable;
}

interface Handicap {
	name: string;
	effect: string;
	tier?: number;
}

const waves: Wave[] = [
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
		enemies: ['Fremennik Warband', 'Serpent Shaman', '2x Javelin Colossus'],
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
		enemies: ['Fremennik Warband', 'Serpent Shaman', '2x Javelin Colossus', 'Manticore'],
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
		reinforcements: ['Minotaur (Fortis Colosseum)'],
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
		enemies: ['Fremennik Warband', '2x Javelin Colossus', 'Manticore', 'Shockwave Colossus'],
		reinforcements: ['Minotaur (Fortis Colosseum)'],
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
		enemies: ['Fremennik Warband', 'Javelin Colossus', '2x Manticore'],
		reinforcements: ['Minotaur (Fortis Colosseum)'],
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
		enemies: ['Fremennik Warband', '2x Javelin Colossus', '2x Manticore'],
		reinforcements: ['Minotaur (Fortis Colosseum)', 'Serpent Shaman'],
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
		enemies: ['Fremennik Warband', 'Javelin Colossus', '2x Manticore', 'Shockwave Colossus'],
		reinforcements: ['Minotaur (Fortis Colosseum)', 'Serpent Shaman'],
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
			.every("Dizana's quiver")
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

const calculateLootForWave = (wave: Wave) => {
	const loot = new Bank();
	loot.add(wave.table.roll());
	return loot;
};

function calculateDeathChance(kc: number, waveNumber: number): number {
	const cappedKc = Math.min(Math.max(kc, 0), 1000);

	const baseChance = 75;
	const kcReduction = Math.min(90, 90 * (1 - Math.exp(-0.1 * cappedKc))); // Steep reduction for the first few kc
	const waveIncrease = waveNumber * 1.5;

	const deathChance = Math.max(1, Math.min(99, baseChance - kcReduction + waveIncrease));

	return deathChance;
}

export class ColosseumWaveBank extends GeneralBank<number> {
	constructor(initialBank?: GeneralBankType<number>) {
		super({
			initialBank,
			allowedKeys: waves.map(i => i.waveNumber),
			valueSchema: { floats: true, min: 0, max: 999_999 }
		});
	}
}

interface ColosseumResult {
	diedAt: number | null;
	loot: Bank | null;
	maxGlory: number;
	addedWaveKCBank: ColosseumWaveBank;
	debugMessages: string[];
}

const startColosseumRun = (options: { kcBank: ColosseumWaveBank; chosenWaveToStop: number }): ColosseumResult => {
	const debugMessages: string[] = [];
	const bank = new Bank();

	const waveKCSkillBank = new ColosseumWaveBank();
	for (const [waveNumber, kc] of options.kcBank.entries()) {
		waveKCSkillBank.add(waveNumber, clamp(calcWhatPercent(kc, 30 - waveNumber), 1, 100));
	}
	const totalKCSkillPercent = sumArr(waveKCSkillBank.entries().map(ent => ent[1])) / waveKCSkillBank.length();

	const expSkill = exponentialPercentScale(totalKCSkillPercent);
	const maxPossibleGlory = 60_000;
	const ourMaxGlory = calcPercentOfNum(expSkill, maxPossibleGlory);

	const addedWaveKCBank = new ColosseumWaveBank();

	let maxGlory = 0;
	for (const wave of waves) {
		const kc = options.kcBank.amount(wave.waveNumber) ?? 0;
		const kcSkill = waveKCSkillBank.amount(wave.waveNumber) ?? 0;
		const wavePerformance = exponentialPercentScale((totalKCSkillPercent + kcSkill) / 2);
		const glory = randInt(calcPercentOfNum(wavePerformance, ourMaxGlory), ourMaxGlory);
		maxGlory = Math.max(glory, maxGlory);
		const deathChance = calculateDeathChance(kc, wave.waveNumber);
		// console.log({ expSkill, wavePerformance, totalKCSkillPercent });

		debugMessages.push(`Wave ${wave.waveNumber} at ${kc}KC death chance: ${deathChance}%`);
		if (percentChance(deathChance)) {
			return {
				diedAt: wave.waveNumber,
				loot: null,
				maxGlory: 0,
				addedWaveKCBank,
				debugMessages
			};
		}
		addedWaveKCBank.add(wave.waveNumber);
		const waveLoot = calculateLootForWave(wave);
		bank.add(waveLoot);
		if (wave.waveNumber === options.chosenWaveToStop || wave.waveNumber === 12) {
			return {
				diedAt: null,
				loot: bank,
				maxGlory,
				addedWaveKCBank,
				debugMessages
			};
		}
	}

	throw new Error('Colosseum run did not end correctly.');
};

function simulateColosseumRuns() {
	const totalSimulations = 200;
	let totalAttempts = 0;
	let totalDeaths = 0;
	const totalLoot = new Bank();
	const finishAttemptAmounts = [];

	for (let i = 0; i < totalSimulations; i++) {
		let attempts = 0;
		let deaths = 0;
		let done = false;
		const kcBank = new ColosseumWaveBank();
		const runLoot = new Bank();

		while (!done) {
			attempts++;
			const stopAt = waves[waves.length - 1].waveNumber;
			const result = startColosseumRun({ kcBank, chosenWaveToStop: stopAt });
			kcBank.add(result.addedWaveKCBank);
			// console.log(result.debugMessages.join(', '));
			if (result.diedAt === null) {
				if (result.loot) runLoot.add(result.loot);
				done = true;
			} else {
				deaths++;
			}
		}

		assert(kcBank.amount(12) > 0);
		finishAttemptAmounts.push(attempts);
		totalAttempts += attempts;
		totalDeaths += deaths;
		totalLoot.add(runLoot);
		console.log(runLoot.toString());
	}

	const averageAttempts = totalAttempts / totalSimulations;
	const averageDeaths = totalDeaths / totalSimulations;

	finishAttemptAmounts.sort((a, b) => a - b);

	console.log(`Total simulations: ${totalSimulations}`);
	console.log(
		`Average attempts to beat wave 12: ${averageAttempts}. ${formatDuration(
			Time.Minute * 40 * averageAttempts
		)} hours.`
	);
	console.log(`Average deaths before beating wave 12: ${averageDeaths}`);
	console.log(`Average loot: ${averageBank(totalLoot, totalSimulations)}`);
	console.log(`Min: ${finishAttemptAmounts[0]}, Max: ${finishAttemptAmounts[finishAttemptAmounts.length - 1]}`);
}

simulateColosseumRuns();
