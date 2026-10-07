import { MathRNG } from 'node-rng';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { buildCombatAchievementsResult, formatCombatAchievementDetails } from '@/lib/combat_achievements/caUtils.js';
import { allCombatAchievementTasks, type CombatAchievement } from '@/lib/combat_achievements/combatAchievements.js';
import { caCommand } from '@/mahoji/commands/ca.js';
import { mockInteraction } from '../test-utils/mockInteraction.js';
import { mockMUser } from './userutil.js';

const originalGlobalClient = globalThis.globalClient;

afterEach(() => {
	globalThis.globalClient = originalGlobalClient;
});

function getTask(name: string) {
	return allCombatAchievementTasks.find(task => task.name === name)!;
}

function viewTasks(
	tasks: CombatAchievement[],
	completed: number[] = [],
	type: 'all' | 'complete' | 'incomplete' = 'all'
) {
	return buildCombatAchievementsResult(new Set(completed), { name: 'Test boss', tasks }, type, 2000, true);
}

describe('Detailed combat achievement views', () => {
	test('shows chance and equipment tips, including guaranteed chances', () => {
		const result = viewTasks([getTask('Defence? What Defence?')]);
		expect(result).toMatchObject({
			content: expect.stringContaining('Chance per kill: 1/1 (when all requirements are met).')
		});
		expect(result).toMatchObject({ content: expect.stringContaining('Details: You must be training Magic.') });
	});

	test('shows solo restrictions and their activity', () => {
		const result = formatCombatAchievementDetails(getTask('Perfect Olm (Solo)'));
		expect(result).toContain('Activity: Chambers of Xeric');
		expect(result).toContain('Details: Solo trip required.');
		expect(result).toContain('Chance per kill: 1/44');
	});

	test('shows collection log and manual requirements with claim instructions', () => {
		expect(formatCombatAchievementDetails(getTask("Amascut's Remnant"))).toContain('Cursed phalanx');
		const result = formatCombatAchievementDetails(getTask('Expert Tomb Looter'));
		expect(result).toContain('Requirements: Complete the Tombs of Amascut (Expert mode) 25 times.');
		expect(result).toContain('Claim with /ca claim');
		expect(result).not.toContain('Chance per kill:');
		expect(result).not.toContain('undefined');
	});

	test('retains completion filters and empty-result messages', () => {
		const completed = getTask('Defence? What Defence?');
		const incomplete = getTask('Barrows Novice');
		const tasks = [completed, incomplete];
		const completeResult = viewTasks(tasks, [completed.id], 'complete');
		expect(completeResult).toMatchObject({ content: expect.stringContaining(completed.name) });
		expect(completeResult).toMatchObject({ content: expect.not.stringContaining(incomplete.name) });
		const incompleteResult = viewTasks(tasks, [completed.id], 'incomplete');
		expect(incompleteResult).toMatchObject({ content: expect.stringContaining(incomplete.name) });
		expect(incompleteResult).toMatchObject({ content: expect.not.stringContaining(completed.name) });
		expect(viewTasks(tasks, [], 'complete')).toBe('No tasks completed for Test boss.');
		expect(
			viewTasks(
				tasks,
				tasks.map(task => task.id),
				'incomplete'
			)
		).toBe('All tasks completed for Test boss.');
	});

	test('keeps the existing default output and includes details in long attachments', () => {
		const task = getTask('Defence? What Defence?');
		const group = { name: 'Barrows', tasks: [task] };
		expect(buildCombatAchievementsResult(new Set(), group, 'all', 2000)).toEqual({
			content: `Combat Achievement tasks for Barrows:\n\nName: ${task.name}\nDescription: ${task.desc}\nStatus: Incomplete\n\n`,
			files: undefined
		});
		const result = buildCombatAchievementsResult(new Set(), group, 'all', 50, true);
		expect(typeof result).toBe('object');
		if (typeof result === 'string') throw new Error(result);
		expect(result.files?.[0].name).toBe('caBoss.txt');
		expect(result.files?.[0].buffer.toString()).toContain('Details: You must be training Magic.');
	});

	test('explains tasks that cannot be completed', () => {
		const task: CombatAchievement = {
			id: -1,
			name: 'Unavailable task',
			type: 'mechanical',
			monster: 'Test boss',
			desc: 'Test description',
			notPossible: true
		};
		expect(formatCombatAchievementDetails(task)).toContain('This task cannot currently be completed in the bot.');
	});

	test.each([undefined, 'tombs of amascut'])('supports detailed incomplete command views for %s', async name => {
		globalThis.globalClient = { mentionCommand: vi.fn(() => '/ca') } as unknown as typeof globalClient;
		const user = mockMUser();
		user._updateRawUser({ ...user.user, completed_ca_task_ids: [getTask('Tomb Raider').id] });
		const result = await caCommand.run({
			options: { view: { name, type: 'incomplete', detailed: true } },
			user,
			interaction: mockInteraction({ user }),
			member: null,
			channelId: '1',
			guildId: null,
			userId: user.id,
			rng: MathRNG
		});
		expect(typeof result).toBe('object');
		if (typeof result !== 'object' || !result || !('files' in result))
			throw new Error('Expected a task attachment');
		const content = result.files?.[0]?.buffer.toString();
		expect(content).toContain('Chance per kill:');
		expect(content).toContain('Activity: Tombs of Amascut');
		expect(content).not.toMatch(/(?:Name: |Completed .*?)Tomb Raider(?:\n| -)/);
	});
});
