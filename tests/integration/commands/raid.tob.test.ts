import { gorajanOccultOutfit } from '@/lib/bso/collection-log/main.js';

import { Bank, itemID } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { TOBMaxMeleeGear, TOBMaxRangeGear } from '@/lib/data/tob.js';
import { Gear } from '@/lib/structures/Gear.js';
import type { TheatreOfBloodTaskOptions } from '@/lib/types/minions.js';
import { bankWithAllItems } from '../../test-utils/misc.js';
import { mockClient } from '../util.js';

describe('Raid ToB start activity payload', async () => {
	const client = await mockClient();

	async function setupTOBUser() {
		const user = await client.mockUser({
			bank: bankWithAllItems.clone().add(new Bank().add('Coins', 10_000_000)),
			maxed: true
		});

		const meleeGear = new Gear(TOBMaxMeleeGear.raw());
		meleeGear.equip('Offhand drygore longsword');
		meleeGear.equip('Infernal cape');

		const rangeGear = new Gear(TOBMaxRangeGear.raw());
		rangeGear.equip('Hellfire bow');
		rangeGear.equip('Hellfire arrow', 1000);

		const mageGear = new Gear();
		for (const item of gorajanOccultOutfit) {
			mageGear.equip(item);
		}

		await user.updateGear([
			{ setup: 'melee', gear: meleeGear.raw() },
			{ setup: 'range', gear: rangeGear.raw() },
			{ setup: 'mage', gear: mageGear.raw() }
		]);
		await user.updateBlowpipe({
			scales: 10_000,
			dartID: itemID('Dragon dart'),
			dartQuantity: 10_000
		});

		return user;
	}

	async function getLatestTobActivity(userID: string) {
		const activity = await prisma.activity.findFirstOrThrow({
			where: {
				user_id: BigInt(userID),
				completed: false,
				type: 'TheatreOfBlood'
			},
			orderBy: { id: 'desc' }
		});
		return ActivityManager.convertStoredActivityToFlatActivity(activity) as TheatreOfBloodTaskOptions;
	}

	it('stores a single real user ID for true solo mode', async () => {
		const user = await setupTOBUser();
		const result = await user.runCommand('raid', {
			tob: { start: { solo: 'solo', quantity: 1 } }
		});

		expect(String(result)).toContain('is now off to do 1x Theatre of Blood raid');

		const activity = await getLatestTobActivity(user.id);
		expect(activity.solo).toBe('solo');
		expect(activity.users).toEqual([user.id]);

		await prisma.activity.deleteMany({
			where: { user_id: BigInt(user.id), completed: false }
		});
	});

	it('stores trio simulation mode with a single real user ID (credit once)', async () => {
		const user = await setupTOBUser();
		const result = await user.runCommand('raid', {
			tob: { start: { solo: 'trio', quantity: 1 } }
		});

		expect(String(result)).toContain("You're in a team of 3.");

		const activity = await getLatestTobActivity(user.id);
		expect(activity.solo).toBe('trio');
		expect(activity.users).toEqual([user.id]);

		await prisma.activity.deleteMany({
			where: { user_id: BigInt(user.id), completed: false }
		});
	});
});
