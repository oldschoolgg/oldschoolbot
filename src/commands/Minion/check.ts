import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { calcTotalGearScore } from '../../lib/minions/functions/raidsCalculations';
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
		const BASE_GEAR_SCORE = calcTotalGearScore([
			minimumMeleeGear,
			minimumRangeGear,
			minimumMageGear
		]);
		const TEST_GEAR_SCORE = calcTotalGearScore([testMeleeGear, testRangeGear, testMageGear]);
		const Multiplier = Math.min(2, TEST_GEAR_SCORE / BASE_GEAR_SCORE);

		return msg.send(
			`BASE: ${BASE_GEAR_SCORE}\nTEST: ${TEST_GEAR_SCORE}\nMultiplier: ${Multiplier}
			`
		);
	}
}
