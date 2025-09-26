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
			QP: 200,
			skills_farming: convertLVLtoXP(99)
		});

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

	it('requires the tree removal fee when lacking Woodcutting level', async () => {
		const user = mockMUser({
			bank: new Bank({ 'Redwood tree seed': 1 }),
			QP: 200,
			skills_farming: convertLVLtoXP(99)
		});

		const redwoodPlant = Farming.Plants.find(plant => plant.name === 'Redwood tree');
		if (!redwoodPlant) {
			throw new Error('Expected redwood plant data');
		}

		const patchDetailed: IPatchDataDetailed = {
			ready: true,
			readyIn: null,
			readyAt: null,
			patchName: 'redwood',
			friendlyName: 'Redwood patch',
			plant: null,
			lastPlanted: redwoodPlant.name,
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false
		};

		const availableBank = new Bank({ 'Redwood tree seed': 1, Coins: 1999 });
		const prepared = await prepareFarmingStep({
			user,
			plant: redwoodPlant,
			quantity: 1,
			pay: false,
			patchDetailed,
			maxTripLength: Time.Hour,
			availableBank,
			compostTier: 'ultracompost' as CropUpgradeType
		});

		expect(prepared.success).toBe(false);
		if (prepared.success) return;
		expect(prepared.error).toBe(
			'Your minion does not have 90 Woodcutting or the 2000 GP required to be able to harvest the currently planted trees, and so they cannot harvest them.'
		);
	});

	it('returns the tree removal fee when enough coins are available', async () => {
		const user = mockMUser({
			bank: new Bank({ 'Redwood tree seed': 1 }),
			QP: 200,
			skills_farming: convertLVLtoXP(99),
			GP: 5000
		});

		const redwoodPlant = Farming.Plants.find(plant => plant.name === 'Redwood tree');
		if (!redwoodPlant) {
			throw new Error('Expected redwood plant data');
		}

		const patchDetailed: IPatchDataDetailed = {
			ready: true,
			readyIn: null,
			readyAt: null,
			patchName: 'redwood',
			friendlyName: 'Redwood patch',
			plant: redwoodPlant,
			lastPlanted: redwoodPlant.name,
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: false
		};

		const availableBank = user.bank.clone().add('Coins', user.GP);
		const prepared = await prepareFarmingStep({
			user,
			plant: redwoodPlant,
			quantity: 1,
			pay: false,
			patchDetailed,
			maxTripLength: Time.Hour,
			availableBank,
			compostTier: 'ultracompost' as CropUpgradeType
		});

		if (!prepared.success) {
			throw new Error(`Preparation failed: ${prepared.error}`);
		}

		expect(prepared.data.treeChopFee).toBe(2000);
		expect(prepared.data.cost).toStrictEqual(new Bank({ 'Redwood tree seed': 1 }));
	});
});
