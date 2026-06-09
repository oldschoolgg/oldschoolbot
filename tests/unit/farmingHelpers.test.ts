import { Bank, convertLVLtoXP } from 'oldschooljs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const getFarmingInfoFromUserMock = vi.fn();

vi.mock('@oldschoolgg/discord', async () => {
	const actual = await vi.importActual<typeof import('@oldschoolgg/discord')>('@oldschoolgg/discord');

	return {
		...actual,
		dateFm: (date: Date) => `formatted ${date.toISOString()}`
	};
});

vi.mock('@/lib/skilling/skills/farming/utils/getFarmingInfo.js', () => ({
	getFarmingInfoFromUser: getFarmingInfoFromUserMock
}));

import './setup.js';

import { AutoFarmFilterEnum } from '@/prisma/main/enums.js';
import { BitField } from '@/lib/constants.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import {
	canShowAutoFarmButton,
	canShowAutoFarmButtonForPatches,
	findPlant,
	getFarmingKeyFromName,
	hasAnyReadyPatch,
	isPatchName,
	userGrowingProgressStr
} from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import { mockMUser } from './userutil.js';

function setFarmingPreferenceData(
	user: MUser,
	data: {
		autoFarmFilter?: AutoFarmFilterEnum;
		preferredSeeds?: unknown;
	}
) {
	const writableUser = user.user as unknown as {
		auto_farm_filter?: AutoFarmFilterEnum;
		minion_farmingPreferredSeeds?: unknown;
	};
	if (data.autoFarmFilter) {
		writableUser.auto_farm_filter = data.autoFarmFilter;
	}
	if (data.preferredSeeds) {
		writableUser.minion_farmingPreferredSeeds = data.preferredSeeds;
	}
}

describe('farming helpers', () => {
	afterEach(() => {
		getFarmingInfoFromUserMock.mockReset();
	});

	it('identifies valid farming patch names', () => {
		expect(isPatchName('herb')).toBe(true);
		expect(isPatchName('not-a-real-patch')).toBe(false);
	});

	it('maps patch names to settings keys', () => {
		expect(getFarmingKeyFromName('tree')).toBe('farmingPatches_tree');
	});

	it('finds plants by name or alias', () => {
		const guam = Farming.Plants.find(plant => plant.name === 'Guam');
		expect(guam).toBeDefined();

		const plantByName = findPlant('Guam');
		const plantByAlias = findPlant('guam weed');

		expect(plantByName?.name).toBe('Guam');
		expect(plantByAlias?.name).toBe('Guam');
	});

	it('returns null when last planted crop is missing or unknown', () => {
		expect(findPlant(null as any)).toBeNull();
		expect(findPlant('unknown crop')).toBeNull();
	});

	it('detects whether any patches are ready to harvest', () => {
		expect(hasAnyReadyPatch([{ ready: false } as any, { ready: null } as any, { ready: true } as any])).toBe(true);

		expect(hasAnyReadyPatch([{ ready: false } as any, { ready: null } as any])).toBe(false);
	});

	it('determines whether the auto farm button should be shown', async () => {
		const readyPatches = [{ ready: true } as IPatchDataDetailed];
		getFarmingInfoFromUserMock.mockReturnValueOnce({ patchesDetailed: readyPatches });

		const result = await canShowAutoFarmButton(mockMUser());
		expect(result).toBe(true);

		getFarmingInfoFromUserMock.mockReturnValueOnce({ patchesDetailed: [{ ready: null } as IPatchDataDetailed] });
		const resultWithoutReady = await canShowAutoFarmButton(mockMUser());
		expect(resultWithoutReady).toBe(false);
	});

	it('shows the auto farm button when AllFarm can plant an empty patch', async () => {
		const emptyHerbPatch: IPatchDataDetailed = {
			lastPlanted: null,
			patchPlanted: false,
			plantTime: Date.now(),
			lastQuantity: 0,
			lastUpgradeType: null,
			lastPayment: false,
			ready: null,
			readyIn: null,
			readyAt: null,
			patchName: 'herb',
			friendlyName: 'Empty herb patch',
			plant: null
		};
		const user = mockMUser({
			bank: new Bank().add('Guam seed', 10),
			skills_farming: convertLVLtoXP(10)
		});
		setFarmingPreferenceData(user, { autoFarmFilter: AutoFarmFilterEnum.AllFarm });
		getFarmingInfoFromUserMock.mockReturnValueOnce({ patchesDetailed: [emptyHerbPatch] });

		await expect(canShowAutoFarmButton(user)).resolves.toBe(true);
		expect(canShowAutoFarmButtonForPatches(user, [emptyHerbPatch])).toBe(true);
	});

	it('does not show the auto farm button for empty patches skipped by filter or preference', () => {
		const emptyHerbPatch: IPatchDataDetailed = {
			lastPlanted: null,
			patchPlanted: false,
			plantTime: Date.now(),
			lastQuantity: 0,
			lastUpgradeType: null,
			lastPayment: false,
			ready: null,
			readyIn: null,
			readyAt: null,
			patchName: 'herb',
			friendlyName: 'Empty herb patch',
			plant: null
		};
		const user = mockMUser({
			bank: new Bank().add('Guam seed', 10),
			skills_farming: convertLVLtoXP(10)
		});

		setFarmingPreferenceData(user, { autoFarmFilter: AutoFarmFilterEnum.Replant });
		expect(canShowAutoFarmButtonForPatches(user, [emptyHerbPatch])).toBe(false);

		setFarmingPreferenceData(user, {
			autoFarmFilter: AutoFarmFilterEnum.AllFarm,
			preferredSeeds: { herb: { type: 'empty' } }
		});
		expect(canShowAutoFarmButtonForPatches(user, [emptyHerbPatch])).toBe(false);
	});

	it('userGrowingProgressStr includes all patch states and auto farm button', () => {
		const basePatch: IPatchDataDetailed = {
			lastPlanted: 'Guam',
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 5,
			lastUpgradeType: null,
			lastPayment: false,
			ready: true,
			readyIn: 0,
			readyAt: new Date('2020-01-01T00:00:00Z'),
			patchName: 'herb',
			friendlyName: 'Ready patch',
			plant: null
		};

		const growingPatch: IPatchDataDetailed = {
			...basePatch,
			ready: false,
			readyIn: 10,
			readyAt: new Date('2020-01-02T00:00:00Z'),
			friendlyName: 'Growing patch'
		};

		const emptyPatch: IPatchDataDetailed = {
			...basePatch,
			ready: null,
			friendlyName: 'Empty patch'
		};

		const result = userGrowingProgressStr([basePatch, growingPatch, emptyPatch], mockMUser());

		const normalized =
			typeof result === 'string'
				? { content: result, components: [] as unknown[] }
				: 'content' in result
					? { content: result.content, components: result.components ?? [] }
					: { content: '', components: [] as unknown[] };

		expect(normalized.content).toContain('Ready patch');
		expect(normalized.content).toContain('Growing patch');
		expect(normalized.content).toContain('Nothing planted');
		expect(normalized.components).toHaveLength(1);
		expect((normalized.components?.[0] as any).data?.custom_id).toBeDefined();
	});

	it('userGrowingProgressStr respects the disabled auto farm button bitfield', () => {
		const readyPatch: IPatchDataDetailed = {
			lastPlanted: 'Guam',
			patchPlanted: true,
			plantTime: Date.now(),
			lastQuantity: 5,
			lastUpgradeType: null,
			lastPayment: false,
			ready: true,
			readyIn: 0,
			readyAt: new Date('2020-01-01T00:00:00Z'),
			patchName: 'herb',
			friendlyName: 'Ready patch',
			plant: null
		};

		const result = userGrowingProgressStr([readyPatch], mockMUser({ bitfield: [BitField.DisableAutoFarmButton] }));

		const normalized =
			typeof result === 'string'
				? { content: result, components: [] as unknown[] }
				: 'content' in result
					? { content: result.content, components: result.components ?? [] }
					: { content: '', components: [] as unknown[] };

		expect(normalized.content).toContain('Ready patch');
		expect(normalized.components).toHaveLength(0);
	});

	it('userGrowingProgressStr omits the auto farm button when nothing is ready and no user is provided', () => {
		const emptyOnly: IPatchDataDetailed = {
			lastPlanted: null,
			patchPlanted: false,
			plantTime: Date.now(),
			lastQuantity: 0,
			lastUpgradeType: null,
			lastPayment: false,
			ready: null,
			readyIn: null,
			readyAt: null,
			patchName: 'herb',
			friendlyName: 'Empty patch',
			plant: null
		};

		const result = userGrowingProgressStr([emptyOnly]);

		const normalized =
			typeof result === 'string'
				? { content: result, components: [] as unknown[] }
				: 'content' in result
					? { content: result.content, components: result.components ?? [] }
					: { content: '', components: [] as unknown[] };

		expect(normalized.components).toHaveLength(0);
		expect(normalized.content).toContain('Nothing planted');
	});

	it('userGrowingProgressStr includes the auto farm button when an empty patch can be planted', () => {
		const emptyOnly: IPatchDataDetailed = {
			lastPlanted: null,
			patchPlanted: false,
			plantTime: Date.now(),
			lastQuantity: 0,
			lastUpgradeType: null,
			lastPayment: false,
			ready: null,
			readyIn: null,
			readyAt: null,
			patchName: 'herb',
			friendlyName: 'Empty patch',
			plant: null
		};
		const user = mockMUser({
			bank: new Bank().add('Guam seed', 10),
			skills_farming: convertLVLtoXP(10)
		});
		setFarmingPreferenceData(user, { autoFarmFilter: AutoFarmFilterEnum.AllFarm });

		const result = userGrowingProgressStr([emptyOnly], user);

		const normalized =
			typeof result === 'string'
				? { content: result, components: [] as unknown[] }
				: 'content' in result
					? { content: result.content, components: result.components ?? [] }
					: { content: '', components: [] as unknown[] };

		expect(normalized.components).toHaveLength(1);
		expect(normalized.content).toContain('Nothing planted');
	});
});
