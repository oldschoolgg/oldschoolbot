import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	calcTotalGearScore,
	getMeleeContribution,
	getRangeContribution,
	getMageContribution,
	getKcMultiplier
} from '../../lib/minions/functions/raidsCalculations';
import {
	testMeleeGear,
	testMageGear,
	testRangeGear,
	minimumMeleeGear,
	minimumMageGear,
	minimumRangeGear
} from '../../lib/gear/raidsGear';
import { Time } from 'oldschooljs/dist/constants';
import { formatDuration } from '../../util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:integer{1}]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [kc = 1]: [number]) {
		/**
		 * THIS IS A TEMPORARY COMMAND TO HELP TESTING.
		 */
		const BASE_GEAR_SCORE = calcTotalGearScore({
			meleeGear: minimumMeleeGear,
			rangeGear: minimumRangeGear,
			mageGear: minimumMageGear
		});
		const TEST_GEAR_SCORE = calcTotalGearScore({
			meleeGear: testMeleeGear,
			rangeGear: testRangeGear,
			mageGear: testMageGear
		});
		const meleeGear = testMeleeGear;
		const rangeGear = testRangeGear;
		const mageGear = testMageGear;

		// const TEST_GEAR_SCORE = calcTotalGearScore(msg.author.getCombatGear());
		// const { meleeGear, rangeGear, mageGear } = msg.author.getCombatGear();
		const difference = TEST_GEAR_SCORE - BASE_GEAR_SCORE;
		const gearMultiplier = Math.min(2, (difference * 3) / BASE_GEAR_SCORE);

		const minGearRequired = `min melee: ${getMeleeContribution(
			minimumMeleeGear
		)}\nmin range: ${getRangeContribution(minimumRangeGear)}\nmin mage: ${getMageContribution(
			minimumMageGear
		)}\n\n`;

		const testGearUsed = `test melee: ${getMeleeContribution(
			meleeGear
		)}\ntest range: ${getRangeContribution(rangeGear)}\ntest mage: ${getMageContribution(
			mageGear
		)}\n\n`;
		const kcMultiplier = getKcMultiplier(kc);
		const totalMultiplier = 1 + gearMultiplier + kcMultiplier;
		const BASE_TIME = Time.Minute * 100;
		const BASE_POINTS = 8_000;
		const timeAndPointsRes = `Time: ${formatDuration(
			BASE_TIME / totalMultiplier
		)}\n Points: ${Math.floor(BASE_POINTS * totalMultiplier)}`;
		const res =
			`${minGearRequired}` +
			`${testGearUsed}` +
			`BASE: ${BASE_GEAR_SCORE}\nTEST: ${TEST_GEAR_SCORE}\nDifference: ${difference}\nGear Multiplier: ${gearMultiplier}\n` +
			`KC Multiplier: ${kcMultiplier}\n` +
			`Total multiplier: ${totalMultiplier}\n\n` +
			`${timeAndPointsRes}`;

		return msg.send(res);
	}
}
