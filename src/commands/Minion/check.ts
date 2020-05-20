import { KlasaMessage } from 'klasa';

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

export default class extends BotCommand {
	async run(msg: KlasaMessage, [kc = 0]: [number]) {
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

		const totalMultiplier = 1 + gearMultiplier + getKcMultiplier(kc);
		const BASE_TIME = Time.Minute * 100;
		const BASE_POINTS = 8_000;
		const timeAndPointsRes = `Time: ${BASE_TIME / totalMultiplier} Points: ${BASE_POINTS *
			totalMultiplier}`;
		const res =
			`${minGearRequired}` +
			`${testGearUsed}` +
			`BASE: ${BASE_GEAR_SCORE}\nTEST: ${TEST_GEAR_SCORE}\nDifference: ${difference}\nGear Multiplier: ${gearMultiplier}` +
			`Total multiplier: ${totalMultiplier}` +
			`${timeAndPointsRes}`;

		return msg.send(res);
	}
}
