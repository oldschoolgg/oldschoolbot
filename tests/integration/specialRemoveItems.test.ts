import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { Gear } from '../../src/lib/structures/Gear';
import { createTestUser } from './util';

describe('specialRemoveItems', () => {
	test("should deduct for NO ava's", async () => {
		const user = await createTestUser();
		const gear = new Gear();
		gear.equip('Rune arrow', 1000);
		await user.update({
			gear_range: gear.raw() as any,
			bank: new Bank().add('Egg', 1000).toJSON()
		});
		expect(user.gear.range.ammo!.quantity).toBe(1000);
		await user.specialRemoveItems(new Bank().add('Rune arrow', 1000));
		expect(user.gear.range.ammo).toBeNull();
	});

	test("should deduct for ava's", async () => {
		const user = await createTestUser();
		const gear = new Gear();
		gear.equip('Rune arrow', 1000);
		gear.equip("Ava's assembler");
		await user.update({
			gear_range: gear.raw() as any,
			bank: new Bank().add('Egg', 1000).toJSON()
		});
		expect(user.gear.range.ammo!.quantity).toBe(1000);
		await user.specialRemoveItems(new Bank().add('Rune arrow', 1000));
		expect(user.gear.range.ammo!.quantity).toBeLessThan(850);
		expect(user.gear.range.ammo!.quantity).toBeGreaterThan(650);
	});

	test("should not deduct for ava's and javelin", async () => {
		const user = await createTestUser();
		const gear = new Gear();
		gear.equip('Rune javelin', 1000);
		gear.equip("Ava's assembler");
		await user.update({
			gear_range: gear.raw() as any,
			bank: new Bank().add('Egg', 1000).toJSON()
		});
		expect(user.gear.range.ammo!.quantity).toBe(1000);
		await user.specialRemoveItems(new Bank().add('Rune javelin', 1000));
		expect(user.gear.range.ammo).toBeNull;
	});
});
