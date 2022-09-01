import { gloves, miningCapeOreEffect, varrockArmours } from '../src/mahoji/commands/mine';

describe('mining.test', () => {
	/*
	test('determineMiningTime', () => {
		const fakeUser = mockUser();
		const crystalPickaxe = pickaxes.find(pick => pick.id === itemID('Crystal pickaxe'))!;
		const granite = Mining.Ores.find(ore => ore.name.includes('Granite'))!;
		const testGraniteMiningTimeOptions = {
			quantity: undefined,
			user: fakeUser,
			ore: granite,
			ticksBetweenRolls: crystalPickaxe.ticksBetweenRolls,
			glovesRate: 0,
			armourEffect: 0,
			miningCapeEffect: 0,
			powermining: true,
			goldSilverBoost: false,
			miningLvl: 99
		};
		const respawnTimeOrPick =
			crystalPickaxe.ticksBetweenRolls > granite.respawnTime
				? crystalPickaxe.ticksBetweenRolls
				: granite.respawnTime;
		const userMaxTripTicks = calcMaxTripLength(fakeUser, 'Mining') / (Time.Second * 0.6);
		const maxQuantity = Math.ceil(userMaxTripTicks / respawnTimeOrPick);
		const [simTripLength, simQuantity] = determineMiningTime(testGraniteMiningTimeOptions);
		expect(simQuantity).toBeLessThanOrEqual(maxQuantity);
		expect(simTripLength).toBeCloseTo(calcMaxTripLength(fakeUser, 'Mining'));
	});

	test('Crystal Pickaxe', () => {
		const crystalPick = pickaxes.find(pick => pick.id === itemID('Crystal pickaxe'))!;
		expect(crystalPick).toStrictEqual({ id: itemID('Crystal pickaxe'), ticksBetweenRolls: 2.75, miningLvl: 71 });
	});
	*/
	test('Gloves', () => {
		let percentCheck: boolean = false;
		for (let glove of gloves) {
			if (glove.Percentages.filter((_, quantity) => quantity >= 100).length > 0) {
				percentCheck = true;
			}
		}
		expect(percentCheck).toEqual(false);
	});

	test('VarrockArmour', () => {
		let percentCheck: boolean = false;
		for (let armour of varrockArmours) {
			if (armour.Percentages.filter((_, quantity) => quantity >= 100).length > 0) {
				percentCheck = true;
			}
		}
		expect(percentCheck).toEqual(false);
	});

	test('miningCape', () => {
		let percentCheck: boolean = false;
		if (miningCapeOreEffect.filter((_, quantity) => quantity >= 100).length > 0) {
			percentCheck = true;
		}
		expect(percentCheck).toEqual(false);
	});
});
