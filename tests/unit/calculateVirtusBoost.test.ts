import { Bank, type Monster, Monsters } from 'oldschooljs';
import { EGear } from 'oldschooljs/EGear';
import { expect, test } from 'vitest';

import { Gear } from '../../src/lib/structures/Gear';
import { GearBank } from '../../src/lib/structures/GearBank';
import { calculateVirtusBoost } from '../../src/mahoji/lib/abstracted_commands/minionKill/minionKillData';

test('calculateVirtusBoost', () => {
	type VirtusTestOptions = {
		wildy: boolean;
		onTask: boolean;
		mageGear?: EGear[];
		wildyGear?: EGear[];
		osjsMon: Monster | undefined;
	};
	function virtusTest(input: VirtusTestOptions) {
		const mageGear = new Gear();
		for (const item of input.mageGear ?? []) mageGear.equip(item);

		const wildyGear = new Gear();
		for (const item of input.wildyGear ?? []) wildyGear.equip(item);

		const gearBank = new GearBank({
			gear: {
				mage: mageGear,
				wildy: wildyGear
			} as any,
			bank: new Bank()
		} as any);

		return calculateVirtusBoost({
			isInWilderness: input.wildy,
			isOnTask: input.onTask,
			gearBank,
			osjsMon: input.osjsMon
		}).virtusBoost;
	}

	expect(
		virtusTest({
			wildy: false,
			mageGear: [],
			wildyGear: [],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(0);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(2);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK, EGear.VIRTUS_ROBE_TOP, EGear.VIRTUS_ROBE_BOTTOM],
			wildyGear: [],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(6);

	expect(
		virtusTest({
			wildy: true,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(0);

	expect(
		virtusTest({
			wildy: true,
			mageGear: [],
			wildyGear: [EGear.VIRTUS_MASK],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(2);

	expect(
		virtusTest({
			wildy: true,
			mageGear: [EGear.BLACK_MASK_I],
			wildyGear: [EGear.VIRTUS_MASK],
			onTask: true,
			osjsMon: undefined
		})
	).toBe(2);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [EGear.BLACK_MASK_I],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(2);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [EGear.BLACK_MASK_I],
			onTask: true,
			osjsMon: undefined
		})
	).toBe(0);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [EGear.BLACK_MASK_I],
			onTask: true,
			osjsMon: Monsters.Ankou
		})
	).toBe(0);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [EGear.BLACK_MASK_I, EGear.SALVE_AMULETI],
			onTask: true,
			osjsMon: Monsters.Ankou
		})
	).toBe(2);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_MASK],
			wildyGear: [EGear.BLACK_MASK_I, EGear.SALVE_AMULETI],
			onTask: true,
			osjsMon: undefined
		})
	).toBe(0);

	expect(
		virtusTest({
			wildy: false,
			mageGear: [EGear.VIRTUS_ROBE_TOP],
			wildyGear: [],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(2);

	expect(
		virtusTest({
			wildy: true,
			mageGear: [],
			wildyGear: [EGear.VIRTUS_ROBE_TOP],
			onTask: false,
			osjsMon: undefined
		})
	).toBe(2);
});
