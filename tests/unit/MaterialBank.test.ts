import { describe, expect, test } from 'vitest';

import { MaterialBank } from '../../src/lib/invention/MaterialBank';

describe('materialLoot', () => {
	test('materialLoot', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('dextrous', 10);
		materialLoot.add('swift', 1);
		materialLoot.add('swift', 5);
		materialLoot.add('corporeal', 100);
		materialLoot.remove('corporeal', 20);
		expect(materialLoot.amount('corporeal')).toEqual(80);
		materialLoot.remove(new MaterialBank().add('corporeal', 20));
		expect(materialLoot.amount('corporeal')).toEqual(60);
		expect(materialLoot.amount('swift')).toEqual(6);
		expect(materialLoot.amount('dextrous')).toEqual(10);
	});
	test('has', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('dextrous', 10);
		materialLoot.add('swift', 5);

		expect(materialLoot.has(new MaterialBank().add('dextrous', 10))).toEqual(true);
		expect(materialLoot.has(new MaterialBank().add('dextrous', 10).add('swift', 5))).toEqual(true);
		expect(materialLoot.has(new MaterialBank().add('dextrous', 11))).toEqual(false);
		expect(materialLoot.has(new MaterialBank().add('dextrous', 10).add('swift', 6))).toEqual(false);

		const testBank = new MaterialBank().add('swift', 100_000).add('dextrous', 10_000);
		const haveBank = new MaterialBank().add('swift', 100).add('dextrous', 100);
		expect(testBank.has(haveBank)).toEqual(true);
		expect(haveBank.has(testBank)).toEqual(false);
	});
	test('fits', () => {
		const materialLoot = new MaterialBank();
		materialLoot.add('dextrous', 10);
		materialLoot.add('swift', 5);

		expect(materialLoot.fits(new MaterialBank().add('dextrous', 10))).toEqual(1);
		expect(new MaterialBank().add('dextrous', 10).fits(materialLoot)).toEqual(0);
		expect(materialLoot.fits(new MaterialBank().add('dextrous', 1))).toEqual(10);
	});
	test('mutReduceAllValuesByPercent', () => {
		const materialLoot = new MaterialBank()
			.add('crystal', 100_001)
			.add('dextrous', 11)
			.add('swift', 5)
			.add('abyssal', 1);
		materialLoot.mutReduceAllValuesByPercent(10);

		expect(materialLoot.amount('dextrous')).toEqual(10);
		expect(materialLoot.amount('swift')).toEqual(5);
		expect(materialLoot.amount('abyssal')).toEqual(1);
		expect(materialLoot.amount('crystal')).toEqual(90_001);
	});
	test('mutIncreaseAllValuesByPercent', () => {
		const materialLoot = new MaterialBank()
			.add('crystal', 100_001)
			.add('dextrous', 11)
			.add('swift', 5)
			.add('abyssal', 1);
		materialLoot.mutIncreaseAllValuesByPercent(10);

		expect(materialLoot.amount('dextrous')).toEqual(12);
		expect(materialLoot.amount('swift')).toEqual(5);
		expect(materialLoot.amount('abyssal')).toEqual(1);
		expect(materialLoot.amount('crystal')).toEqual(110_001);
	});
});
