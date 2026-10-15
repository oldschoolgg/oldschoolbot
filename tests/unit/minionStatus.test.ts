import { Bank } from 'oldschooljs';
import { describe, expect, it, test, vi } from 'vitest';

import { Farming } from '../../src/lib/skilling/skills/farming/index.js';
import type { IPatchData } from '../../src/lib/skilling/skills/farming/utils/types.js';
import type { Fletchable } from '../../src/lib/skilling/types.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import { formatZeroTimeFletchingStatus } from '../../src/lib/util/formatZeroTimeFletchingStatus.js';
import { minionStatus } from '../../src/lib/util/minionStatus.js';
import { formatTripDuration } from '../../src/lib/util/minionUtils.js';
import { mockMUser } from './userutil.js';

const defaultPatch: IPatchData = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: 0,
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false
};

describe('minionStatus - Farming', () => {
	const plantsName = Farming.Plants[0].name;

	it('shows combined auto-farm with the current task remaining time', () => {
		const now = new Date('2024-01-01T00:00:00.000Z');
		vi.useFakeTimers();
		vi.setSystemTime(now);

		const user = mockMUser({ id: '123' });
		const currentDuration = 40_000;
		const planDuration = 60_000;
		const task: FarmingActivityTaskOptions = {
			type: 'Farming',
			userID: user.id,
			channelId: '456',
			id: 1,
			duration: currentDuration,
			finishDate: now.getTime() + currentDuration,
			plantsName,
			quantity: 2,
			upgradeType: null,
			patchType: defaultPatch,
			planting: true,
			currentDate: now.getTime(),
			autoFarmed: true,
			autoFarmPlan: [
				{
					plantsName: 'Guam',
					quantity: 5,
					upgradeType: null,
					patchType: defaultPatch,
					planting: true,
					currentDate: now.getTime(),
					payment: false,
					duration: planDuration
				}
			],
			autoFarmCombined: true
		};

		const result = minionStatus(user, task);
		const expectedRemaining = `${formatTripDuration(user, currentDuration)} remaining`;

		expect(result).toContain('auto-farming multiple patches');
		expect(result).toContain(`Estimated time remaining: ${expectedRemaining}.`);
		expect(result).toContain(`Current step: ${plantsName} (${task.quantity}x).`);

		vi.useRealTimers();
	});

	it('keeps normal farming output when not combined', () => {
		const now = new Date('2024-01-01T00:00:00.000Z');
		vi.useFakeTimers();
		vi.setSystemTime(now);

		const user = mockMUser({ id: '987' });
		const currentDuration = 25_000;
		const task: FarmingActivityTaskOptions = {
			type: 'Farming',
			userID: user.id,
			channelId: '789',
			id: 2,
			duration: currentDuration,
			finishDate: now.getTime() + currentDuration,
			plantsName,
			quantity: 1,
			upgradeType: null,
			patchType: defaultPatch,
			planting: true,
			currentDate: now.getTime(),
			autoFarmed: false
		};

		const result = minionStatus(user, task);

		expect(result).toContain(`currently farming ${task.quantity}x ${plantsName}`);
		expect(result).toContain(`${formatTripDuration(user, currentDuration)} remaining.`);
		expect(result).not.toContain('auto-farming multiple patches');

		vi.useRealTimers();
	});
});

describe('formatZeroTimeFletchingStatus', () => {
	const baseFletchable: Fletchable = {
		name: 'Test arrows',
		id: 1,
		level: 1,
		xp: 1,
		inputItems: new Bank(),
		tickRate: 1
	};

	test('includes sets wording for multi-output items', () => {
		const result = formatZeroTimeFletchingStatus(5, {
			...baseFletchable,
			outputMultiple: 10,
			name: 'Multi output'
		});

		expect(result).toBe('They are also fletching 5 sets of Multi output.');
	});

	test('omits sets wording for single-output items', () => {
		const result = formatZeroTimeFletchingStatus(3, {
			...baseFletchable,
			name: 'Single output'
		});

		expect(result).toBe('They are also fletching 3 Single output.');
	});
});
