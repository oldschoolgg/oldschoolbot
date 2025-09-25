import { Time } from '@oldschoolgg/toolkit/datetime';
import type { CropUpgradeType } from '@prisma/client';
import { Bank, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import type { IPatchDataDetailed } from '../../src/lib/minions/farming/types.js';
import { prepareFarmingStep } from '../../src/lib/minions/functions/farmingTripHelpers.js';
import Farming from '../../src/lib/skilling/skills/farming/index.js';
import { mockMUser } from './userutil.js';

describe('prepareFarmingStep auto farm limits', () => {
	it('charges only for the achievable quantity when inputs differ', async () => {
		const user = mockMUser({
			bank: new Bank({ 'Grape seed': 5, Saltpetre: 1 }),
			QP: 200
		});
		user.user.skills_farming = convertLVLtoXP(99);

		const grapePlant = Farming.Plants.find(plant => plant.name === 'Grape');
		if (!grapePlant) {
			throw new Error('Expected grape plant data');
		}

		const patchDetailed: IPatchDataDetailed = {
			ready: true,
			readyIn: null,
			readyAt: null,
			patchName: 'vine',
			friendlyName: 'Grape patch',
			plant: null,
			lastPlanted: null,
			patchPlanted: false,
			plantTime: Date.now(),
			lastQuantity: 0,
			lastUpgradeType: null,
			lastPayment: false
		};

		const availableBank = user.bank.clone();
		const prepared = await prepareFarmingStep({
			user,
			plant: grapePlant,
			quantity: null,
			pay: false,
			patchDetailed,
			maxTripLength: Time.Hour * 10,
			availableBank,
			compostTier: 'compost' as CropUpgradeType
		});

		if (!prepared.success) {
			throw new Error(`Preparation failed: ${prepared.error}`);
		}

		expect(prepared.data.quantity).toBe(1);
		expect(prepared.data.cost).toStrictEqual(new Bank({ 'Grape seed': 1, Saltpetre: 1 }));
	});
});
