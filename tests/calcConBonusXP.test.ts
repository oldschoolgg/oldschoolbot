import { calcConBonusXP } from '../src/lib/util/calcConBonusXP';
import { constructGearSetup } from './utils';

describe('calcConBonusXP.test', () => {
	test('calcConBonusXP', () => {
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
		expect(
			calcConBonusXP(
				constructGearSetup({
					feet: "Carpenter's boots"
				})
			)
		).toEqual(0.2);
		expect(
			calcConBonusXP(
				constructGearSetup({
					feet: 'Dragon boots'
				})
			)
		).toEqual(0);
	});
});
