import { Bank, EGear, EItem } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { createTestUser, promiseAllRandom } from '../util.js';

describe('Gear', () => {
	const TEST_GEAR = [
		EGear.DRAGON_FULL_HELM,
		EGear.DRAGON_PLATEBODY,
		EGear.DRAGON_PLATELEGS,
		EGear.AMULET_OF_FURY,
		EGear.DRAGON_SQ_SHIELD,
		EGear.DRAGON_WARHAMMER
	];

	it("shouldn't dupe when unequipping/swapping at the same time", async () => {
		const user = await createTestUser();
		await user.max();
		await user.equip('melee', TEST_GEAR);
		await promiseAllRandom([
			() => user.runCommand('gear', { unequip: { gear_setup: 'melee', all: true } }),
			() => user.runCommand('gear', { swap: { setup_one: 'melee', setup_two: 'mage' } })
		]);

		await user.sync();
		expect(user.allItemsOwned.amount(EGear.DRAGON_FULL_HELM)).toBe(1);
		expect(user.allItemsOwned.amount(EGear.DRAGON_PLATEBODY)).toBe(1);
		expect(user.allItemsOwned.amount(EGear.DRAGON_PLATELEGS)).toBe(1);
	});

	it("shouldn't dupe when swapping 2 gears at the same time", async () => {
		const user = await createTestUser();
		await user.max();
		await user.equip('melee', TEST_GEAR);
		await promiseAllRandom([
			() => user.runCommand('gear', { swap: { setup_one: 'melee', setup_two: 'mage' } }),
			() => user.runCommand('gear', { swap: { setup_one: 'melee', setup_two: 'range' } })
		]);

		await user.sync();
		console.log(user.allItemsOwned.toString());
		expect(user.allItemsOwned.amount(EGear.DRAGON_FULL_HELM)).toBe(1);
		expect(user.allItemsOwned.amount(EGear.DRAGON_PLATEBODY)).toBe(1);
		expect(user.allItemsOwned.amount(EGear.DRAGON_PLATELEGS)).toBe(1);
	});

	it("shouldn't dupe when equipping", async () => {
		const user = await createTestUser();
		await user.setBank(new Bank().add(EItem.TWISTED_BOW));
		await promiseAllRandom([
			() => user.runCommand('gear', { equip: { gear_setup: 'melee', items: 'twisted bow' } }),
			() => user.runCommand('gear', { equip: { gear_setup: 'mage', items: 'twisted bow' } })
		]);

		await user.sync();
		expect(user.allItemsOwned.amount(EGear.TWISTED_BOW)).toBe(1);
	});

	it("shouldn't dupe when equipping/unequipping at same time", async () => {
		const user = await createTestUser();
		await user.setBank(new Bank().add(EItem.TWISTED_BOW));
		await user.equip('melee', [EGear.DRAGON_DAGGER]);
		await promiseAllRandom([
			() => user.runCommand('gear', { equip: { gear_setup: 'melee', item: 'twisted bow' } }),
			() => user.runCommand('gear', { unequip: { gear_setup: 'melee', item: 'twisted bow' } })
		]);

		await user.sync();
		expect(user.allItemsOwned.amount(EGear.TWISTED_BOW)).toBe(1);
		expect(user.allItemsOwned.amount(EGear.DRAGON_DAGGER)).toBe(1);
	});

	it("shouldn't dupe when unequipping twice at same time", async () => {
		const user = await createTestUser();
		await user.equip('melee', [EGear.TWISTED_BOW]);
		await promiseAllRandom([
			() => user.runCommand('gear', { unequip: { gear_setup: 'melee', item: 'twisted bow' } }),
			() => user.runCommand('gear', { unequip: { gear_setup: 'melee', item: 'twisted bow' } })
		]);

		await user.sync();
		expect(user.allItemsOwned.amount(EGear.TWISTED_BOW)).toBe(1);
	});

	it("shouldn't dupe when equipping item/pet at same time", async () => {
		const user = await createTestUser();
		await user.equip('melee', TEST_GEAR);
		await user.setBank(new Bank().add(EItem.TWISTED_BOW).add(EItem.HERBI));
		await promiseAllRandom([
			() => user.runCommand('gear', { pet: { equip: 'herbi' } }),
			() => user.runCommand('gear', { equip: { gear_setup: 'melee', item: 'twisted bow' } })
		]);

		await user.sync();
		for (const gear of TEST_GEAR) {
			expect(user.allItemsOwned.amount(gear)).toBe(1);
		}
		expect(user.allItemsOwned.amount(EGear.TWISTED_BOW)).toBe(1);
		expect(user.allItemsOwned.amount(EItem.HERBI)).toBe(1);
	});

	it("shouldn't dupe when unequipping all twice at same time", async () => {
		const user = await createTestUser();
		await user.equip('melee', [EGear.TWISTED_BOW]);
		await promiseAllRandom([
			() => user.runCommand('gear', { unequip: { gear_setup: 'melee', all: true } }),
			() => user.runCommand('gear', { unequip: { gear_setup: 'melee', all: true } })
		]);

		await user.sync();
		expect(user.allItemsOwned.amount(EGear.TWISTED_BOW)).toBe(1);
		expect(user.bank.amount(EGear.TWISTED_BOW)).toBe(1);
	});
});
