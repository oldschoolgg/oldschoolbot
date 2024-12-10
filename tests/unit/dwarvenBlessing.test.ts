import { describe, expect, test } from 'vitest';

import { Time } from 'e';
import { EItem } from 'oldschooljs';
import { dwarvenBlessing } from '../../src/lib/bso/dwarvenBlessing';
import { BitField } from '../../src/lib/constants';
import { makeGearBank } from './utils';

const EXPECTED_POTS_PER_HOUR = Math.ceil(Time.Hour / (Time.Minute * 5));

describe('Dwarven Blessing', () => {
	test('No blessing and no prayer pots', () => {
		const res = dwarvenBlessing({ gearBank: makeGearBank(), duration: Time.Hour, bitfield: [] });
		expect(res).toBeNull();
	});

	test('Blessing and no prayer pots', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		const res = dwarvenBlessing({ gearBank, duration: Time.Hour, bitfield: [] });
		expect(res).toBeNull();
	});

	test('Blessing and prayer pots', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.bank.add('Prayer potion(4)', 100);
		const res = dwarvenBlessing({ gearBank, duration: Time.Hour, bitfield: [] });
		expect(res).not.toBeNull();
		expect(res).toMatchObject({
			percentageReduction: 20,
			message: '20% boost from Dwarven blessing'
		});
	});

	test('Blessing and restore pots without bitfield', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.bank.add(EItem.SUPER_RESTORE4, 100);
		const res = dwarvenBlessing({ gearBank, duration: Time.Hour, bitfield: [] });
		expect(res).toBeNull();
	});

	test('Blessing and prayer pots with bitfield', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.bank.add(EItem.PRAYER_POTION4, 100);
		const res = dwarvenBlessing({
			gearBank,
			duration: Time.Hour,
			bitfield: [BitField.UseSuperRestoresForDwarvenBlessing]
		});
		expect(res).toBeNull();
	});

	test('Blessing and restore pots with bitfield', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.bank.add(EItem.SUPER_RESTORE4, 100);
		const res = dwarvenBlessing({
			gearBank,
			duration: Time.Hour,
			bitfield: [BitField.UseSuperRestoresForDwarvenBlessing]
		});
		expect(res).not.toBeNull();
		expect(res).toMatchObject({
			percentageReduction: 20,
			message: '20% boost from Dwarven blessing'
		});
		expect(res?.itemCost.amount(EItem.SUPER_RESTORE4)).toEqual(EXPECTED_POTS_PER_HOUR);
	});

	test('Blessing and prayer pots without bitfield', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.bank.add(EItem.PRAYER_POTION4, 100);
		const res = dwarvenBlessing({ gearBank, duration: Time.Hour, bitfield: [] });
		expect(res).not.toBeNull();
		expect(res).toMatchObject({
			percentageReduction: 20,
			message: '20% boost from Dwarven blessing'
		});
		expect(res?.itemCost.amount(EItem.PRAYER_POTION4)).toEqual(EXPECTED_POTS_PER_HOUR);
	});

	test('Blessing and prayer pots with prayer master cape', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.gear.melee.equip('Prayer master cape');
		gearBank.bank.add(EItem.PRAYER_POTION4, 100);
		const res = dwarvenBlessing({ gearBank, duration: Time.Hour, bitfield: [] });
		expect(res).not.toBeNull();
		expect(res).toMatchObject({
			percentageReduction: 20,
			message: '20% boost from Dwarven blessing (40% less cost for prayer cape)'
		});
		expect(res?.itemCost.amount(EItem.PRAYER_POTION4)).toEqual(Math.floor(EXPECTED_POTS_PER_HOUR * 0.6));
	});

	test('Blessing and prayer pots with amulet of zealots', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Dwarven blessing');
		gearBank.gear.melee.equip('Amulet of zealots');
		gearBank.bank.add(EItem.PRAYER_POTION4, 100);
		const res = dwarvenBlessing({ gearBank, duration: Time.Hour, bitfield: [] });
		expect(res).not.toBeNull();
		expect(res).toMatchObject({
			percentageReduction: 25,
			message: '25% boost from Dwarven blessing'
		});
		expect(res?.itemCost.amount(EItem.PRAYER_POTION4)).toEqual(EXPECTED_POTS_PER_HOUR);
	});
});
