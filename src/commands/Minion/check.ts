import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	calcTotalGearScore,
	getMeleeContribution,
	getRangeContribution,
	getMageContribution
} from '../../lib/minions/functions/raidsCalculations';
import {
	minimumMeleeGear,
	minimumMageGear,
	minimumRangeGear,
	testMeleeGear,
	testMageGear,
	testRangeGear
} from '../../lib/gear/raidsGear';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
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
		const difference = TEST_GEAR_SCORE - BASE_GEAR_SCORE;
		const gearMultiplier = Math.min(2, (difference * 3) / BASE_GEAR_SCORE);

		const res = `min melee: ${getMeleeContribution(
			minimumMeleeGear
		)}\nmin range: ${getRangeContribution(minimumRangeGear)}\nmin mage: ${getMageContribution(
			minimumMageGear
		)}\n\ntest melee: ${getMeleeContribution(
			testMeleeGear
		)}\ntest range: ${getRangeContribution(testRangeGear)}\ntest mage: ${getMageContribution(
			testMageGear
		)}\n\nBASE: ${BASE_GEAR_SCORE}\nTEST: ${TEST_GEAR_SCORE}\nDifference: ${difference}\nMultiplier: ${gearMultiplier}`;

		return msg.send(res);
	}
}
