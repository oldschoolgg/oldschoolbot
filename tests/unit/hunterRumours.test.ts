import { Time } from '@oldschoolgg/toolkit';
import { MathRNG } from 'node-rng';
import { Bank, convertLVLtoXP } from 'oldschooljs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import { QuestID } from '@/lib/minions/data/quests.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { hunterOutfitBonus } from '@/lib/skilling/skills/hunter/hunter.js';
import { rumoursCommand } from '@/lib/skilling/skills/hunter/rumours/rumours.js';
import {
	canAssignRumour,
	getRumourHunter,
	normaliseRumourBlockList
} from '@/lib/skilling/skills/hunter/rumours/util.js';
import type { RumourActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { rumourTask } from '@/tasks/minions/rumourActivity.js';
import { mockMUser } from './userutil.js';

vi.mock('@/lib/lootTrack.js', () => ({ trackLoot: vi.fn(async () => undefined) }));
vi.mock('@/lib/util/makeBankImage.js', () => ({
	makeBankImage: vi.fn(async () => ({ name: 'bank.png', buffer: Buffer.from('bank') }))
}));

type RumourTrip = Omit<RumourActivityTaskOptions, 'id' | 'finishDate'>;

function getCreature(name: string) {
	const creature = creatures.find(creature => creature.name === name);
	if (!creature) throw new Error(`Unknown creature: ${name}`);
	return creature;
}

function makeUser(outfit?: 'full' | 'partial') {
	const user = mockMUser({
		id: '123',
		QP: 300,
		meleeGear:
			outfit === 'full'
				? {
						head: 'Guild hunter headwear',
						body: 'Guild hunter top',
						legs: 'Guild hunter legs',
						feet: 'Guild hunter boots'
					}
				: outfit === 'partial'
					? { head: 'Guild hunter headwear' }
					: undefined
	});
	Object.assign(user.user, {
		skills_hunter: BigInt(convertLVLtoXP(99)),
		skills_herblore: BigInt(convertLVLtoXP(99)),
		finished_quest_ids: [QuestID.ChildrenOfTheSun]
	});
	user.updateProperties();
	return user;
}

function mockTripStart(user: MUser, maxLength = 40 * Time.Minute) {
	const startTrip = vi.fn<(data: RumourTrip) => Promise<void>>().mockResolvedValue(undefined);
	vi.stubGlobal('ActivityManager', { startTrip });
	vi.spyOn(user, 'calcMaxTripLength').mockResolvedValue(maxLength);
	return startTrip;
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

describe('Hunter Rumours assignments', () => {
	it.each([
		['cervus', 'Swamp lizard', true],
		['ornus', 'Swamp lizard', false],
		['ornus', 'Spined larupia', true],
		['cervus', 'Spined larupia', false],
		['aco', 'Moonlight moth', true],
		['teco', 'Moonlight moth', false],
		['teco', 'Herbiboar', true],
		['aco', 'Herbiboar', false],
		['gilman', 'Moonlight antelope', true],
		['wolf', 'Sunlight moth', false]
	] as const)('%s can assign %s: %s', (hunter, creature, expected) => {
		expect(canAssignRumour(getRumourHunter(hunter), getCreature(creature))).toBe(expected);
	});

	it('migrates tier blocks to hunters who can assign them without changing existing blocks', () => {
		const stored = {
			adept: getCreature('Spined larupia').id,
			expert: getCreature('Herbiboar').id,
			wolf: getCreature('Moonlight moth').id
		};
		expect(normaliseRumourBlockList(stored)).toEqual({
			ornus: stored.adept,
			teco: stored.expert,
			wolf: stored.wolf
		});
		expect(stored).not.toHaveProperty('ornus');
	});

	it('does not migrate a legacy block onto a second hunter for the same creature', () => {
		const herbiboar = getCreature('Herbiboar').id;
		expect(normaliseRumourBlockList({ expert: herbiboar, teco: herbiboar })).toEqual({ teco: herbiboar });
	});

	it('prevents training with a hunter holding a block', async () => {
		const user = makeUser();
		Object.assign(user.user, { rumour_blocked_ids: { teco: getCreature('Herbiboar').id } });
		const startTrip = mockTripStart(user);
		expect(await rumoursCommand(user, '123', 'teco')).toContain('holding a blocked rumour');
		expect(startTrip).not.toHaveBeenCalled();
	});

	it('excludes blocked creatures and consecutive repeats from the generated trip', async () => {
		const user = makeUser();
		const blockedCreature = getCreature('Herbiboar');
		Object.assign(user.user, { rumour_blocked_ids: { teco: blockedCreature.id } });
		const startTrip = mockTripStart(user);
		vi.spyOn(MathRNG, 'percentChance').mockReturnValue(true);
		vi.spyOn(MathRNG, 'pick').mockImplementation(candidates => candidates[0]);

		await rumoursCommand(user, '123', 'wolf');

		const trip = startTrip.mock.calls[0][0];
		expect(trip.rumours.length).toBeGreaterThan(1);
		for (const [index, rumour] of trip.rumours.entries()) {
			expect(rumour.creatureID).not.toBe(blockedCreature.id);
			expect(rumour.creatureID).not.toBe(trip.rumours[index - 1]?.creatureID);
		}
	});
});

describe('Hunter Rumours trip duration and outfit', () => {
	it.each([
		['Herbiboar', 'teco', 7, 14, 12],
		['Razor-backed kebbit', 'cervus', 15, 30, 28],
		['Moonlight moth', 'aco', 40, 80, 76],
		['Sunlight moth', 'teco', 40, 80, 76]
	] as const)('uses the correct rare-part chance and pity cap for %s', async (name, hunter, rate, pity, outfitPity) => {
		const creature = getCreature(name);
		const chance = vi.spyOn(MathRNG, 'percentChance').mockReturnValue(false);
		// Prefer this creature when eligible, respecting the exclusion of consecutive repeats.
		vi.spyOn(MathRNG, 'pick').mockImplementation(
			candidates => candidates.find(candidate => candidate === creature) ?? candidates[0]
		);

		for (const outfit of [undefined, 'full'] as const) {
			const user = makeUser(outfit);
			const startTrip = mockTripStart(user);
			chance.mockClear();

			const response = await rumoursCommand(user, '123', hunter);

			const trip = startTrip.mock.calls[0][0];
			const matchingRumours = trip.rumours.filter(rumour => rumour.creatureID === creature.id);
			expect(matchingRumours.length).toBeGreaterThan(0);
			expect(matchingRumours.every(rumour => rumour.quantity === (outfit ? outfitPity : pity))).toBe(true);
			expect(chance).toHaveBeenCalledWith((100 / rate) * (outfit ? 1.05 : 1));
			if (outfit) {
				expect(hunterOutfitBonus(user)).toBe(2.5);
				expect(response).toContain('+2.5% catch chance');
				expect(response).toContain('+5% rare creature part chance and reduced pity thresholds');
			}
		}
	});

	it('applies a partial outfit catch bonus without the full outfit rare-part bonus', async () => {
		const user = makeUser('partial');
		const startTrip = mockTripStart(user);
		const chance = vi.spyOn(MathRNG, 'percentChance').mockReturnValue(true);
		const firstCreature = getCreature('Red salamander');
		vi.spyOn(MathRNG, 'pick').mockImplementation(
			candidates => candidates.find(candidate => candidate === firstCreature) ?? candidates[0]
		);

		const response = await rumoursCommand(user, '123', 'wolf');

		expect(hunterOutfitBonus(user)).toBe(0.4);
		expect(response).toContain('+0.4% catch chance');
		expect(response).not.toContain('+5% rare creature part chance');
		expect(startTrip.mock.calls[0][0].rumours.every(rumour => rumour.quantity === 1)).toBe(true);
		expect(startTrip.mock.calls[0][0].rumours[0].creatureID).toBe(firstCreature.id);
		expect(chance.mock.calls[0][0]).toBe(100 / 25);
	});

	it('finishes a whole rumour beyond the trip limit when needed to reach 75%', async () => {
		const user = makeUser();
		const maxLength = 40 * Time.Minute;
		const startTrip = mockTripStart(user, maxLength);
		const dashingKebbit = getCreature('Dashing kebbit');
		const herbiboar = getCreature('Herbiboar');
		let nextCreature = dashingKebbit;
		vi.spyOn(MathRNG, 'percentChance').mockReturnValue(false);
		vi.spyOn(MathRNG, 'pick').mockImplementation(candidates => {
			const creature = candidates.find(candidate => candidate === nextCreature);
			if (!creature) throw new Error('Expected alternating rumour creature to be eligible.');
			nextCreature = creature === dashingKebbit ? herbiboar : dashingKebbit;
			return creature;
		});

		await rumoursCommand(user, '123', 'wolf');

		const trip = startTrip.mock.calls[0][0];
		const previousDuration = trip.duration - trip.rumours.at(-1)!.duration;
		expect(previousDuration).toBeLessThan(maxLength * 0.75);
		expect(trip.duration).toBeGreaterThanOrEqual(maxLength * 0.75);
		expect(trip.duration).toBeGreaterThan(maxLength);
		expect(trip.duration).toBe(trip.rumours.reduce((total, rumour) => total + rumour.duration, 0));
		expect(trip.quantity).toBe(trip.rumours.length);
		expect(trip.rumours.at(-1)).toMatchObject({ creatureID: herbiboar.id, quantity: 14 });
	});
});

describe('Hunter Rumours trip rewards', () => {
	it.each([
		[9, 'Basic quetzal whistle blueprint'],
		[99, 'Torn enhanced quetzal whistle blueprint'],
		[249, 'Torn perfected quetzal whistle blueprint'],
		[10, null],
		[100, null],
		[250, null]
	] as const)('handles milestones after %i total rumours', async (oldTotal, blueprint) => {
		const user = makeUser();
		Object.assign(user.user, { skills_hunter: 200_000_000n });
		user.updateProperties();
		const counts = { novice: 4, master: oldTotal - 4 };
		vi.spyOn(user, 'fetchStats').mockResolvedValue({ rumours: counts } as unknown as Awaited<
			ReturnType<MUser['fetchStats']>
		>);
		const statsUpdate = vi.spyOn(user, 'statsUpdate').mockResolvedValue(undefined);
		vi.spyOn(user, 'incrementCreatureScore').mockResolvedValue({ newKC: 3 });
		vi.spyOn(user, 'addXP').mockResolvedValue('');
		vi.stubGlobal('ClientSettings', { updateBankSetting: vi.fn().mockResolvedValue(undefined) });
		const transactItems = vi.spyOn(user, 'transactItems').mockImplementation(async ({ itemsToAdd }) => ({
			previousCL: new Bank(),
			itemsAdded: new Bank(itemsToAdd),
			itemsRemoved: undefined,
			newBank: new Bank(itemsToAdd),
			newCL: new Bank(itemsToAdd),
			newUser: user,
			clLootBank: new Bank(itemsToAdd)
		}));
		const creature = getCreature('Moonlight moth');
		const data: RumourActivityTaskOptions = {
			id: 1,
			userID: user.id,
			channelId: '123',
			type: 'Rumour',
			tier: 'master',
			hunter: 'wolf',
			quantity: 3,
			duration: 30 * Time.Minute,
			finishDate: Date.now(),
			rumours: Array.from({ length: 3 }, () => ({
				creatureID: creature.id,
				quantity: 1,
				duration: 10 * Time.Minute
			}))
		};
		const handleTripFinish = vi.fn();

		await rumourTask.run(data, { user, handleTripFinish, rng: MathRNG });

		expect(statsUpdate).toHaveBeenCalledWith({ rumours: { novice: 4, master: oldTotal - 4 + 3 } });
		expect(counts).toEqual({ novice: 4, master: oldTotal - 4 });
		const loot = new Bank(transactItems.mock.calls[0][0].itemsToAdd);
		expect(loot.amount("Hunters' loot sack (master)")).toBe(3);
		const message = handleTripFinish.mock.calls[0][0].message;
		expect(message.content).toContain(`Total rumours completed: **${oldTotal + 3}**.`);
		const earnedXP = creature.hunterXP * 3 + (99 + 5) * 60 * 3;
		expect(user.addXP).toHaveBeenCalledWith({ skillName: 'hunter', amount: earnedXP, duration: data.duration });
		expect(message.content).toContain(`${earnedXP.toLocaleString()} Hunter XP (`);
		expect(message.content).toContain('XP/h)');
		expect(makeBankImage).toHaveBeenCalledWith(expect.objectContaining({ bank: loot }));
		expect(message.files).toHaveLength(1);
		if (blueprint) {
			expect(loot.amount(blueprint)).toBe(1);
			expect(message.content).toContain('**Milestone rewards:**');
			expect(message.content).toContain(blueprint);
		} else {
			expect(loot.length).toBe(1);
			expect(message.content).not.toContain('**Milestone rewards:**');
		}
	});
});
