import { calcConBonusXP } from '../src/lib/util/calcConBonusXP';
import { constructGearSetup, testSetup } from './utils';

describe('calcConBonusXP.test', () => {
	beforeAll(testSetup);
	expect(
		calcConBonusXP(
			constructGearSetup({
				head: "Carpenter's helmet",
				body: "Carpenter's shirt",
				legs: "Carpenter's trousers",
				feet: "Carpenter's boots"
			})
		)
	).toEqual(2.5);
	expect(
		calcConBonusXP(
			constructGearSetup({
				head: "Carpenter's helmet",
				body: "Carpenter's shirt",
				legs: "Carpenter's trousers"
			})
		)
	).toEqual(1.8);
});
