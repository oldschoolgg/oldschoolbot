import { slayerMasksHelms } from '@/lib/bso/pvmEffects.js';

import { Bank, type ItemBank, Monsters } from 'oldschooljs';
import { expect, test } from 'vitest';

import { SlayerTaskUnlocksEnum } from '@/lib/slayer/slayerUnlocks.js';
import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { makeGearBank } from '../utils.js';

function runMaskScoreUpdate({
	monsterID,
	maskName,
	effectiveSlayed,
	onTaskMonsterScores = {},
	onTaskWithMaskMonsterScores = {}
}: {
	monsterID: number;
	maskName: string;
	effectiveSlayed: number;
	onTaskMonsterScores?: ItemBank;
	onTaskWithMaskMonsterScores?: ItemBank;
}) {
	const updateBank = new UpdateBank();
	const gearBank = makeGearBank({ bank: new Bank().add(maskName) });
	slayerMasksHelms({
		monster: { id: monsterID } as any,
		slayerContext: { isOnTask: true, effectiveSlayed } as any,
		slayerUnlocks: [SlayerTaskUnlocksEnum.Maskuerade],
		updateBank,
		gearBank,
		userStats: { onTaskMonsterScores, onTaskWithMaskMonsterScores },
		messages: []
	} as any);
	return {
		onTaskMonsterScores: updateBank.userStats.on_task_monster_scores as ItemBank,
		onTaskWithMaskMonsterScores: updateBank.userStats.on_task_with_mask_monster_scores as ItemBank
	};
}

test('slayerMasksHelms accumulates black demon masked scores across updates', () => {
	const first = runMaskScoreUpdate({
		monsterID: Monsters.BlackDemon.id,
		maskName: 'Black demonical mask',
		effectiveSlayed: 12
	});
	expect(first.onTaskMonsterScores[Monsters.BlackDemon.id]).toBe(12);
	expect(first.onTaskWithMaskMonsterScores[Monsters.BlackDemon.id]).toBe(12);

	const second = runMaskScoreUpdate({
		monsterID: Monsters.BlackDemon.id,
		maskName: 'Black demonical mask',
		effectiveSlayed: 9,
		onTaskMonsterScores: first.onTaskMonsterScores,
		onTaskWithMaskMonsterScores: first.onTaskWithMaskMonsterScores
	});
	expect(second.onTaskMonsterScores[Monsters.BlackDemon.id]).toBe(21);
	expect(second.onTaskWithMaskMonsterScores[Monsters.BlackDemon.id]).toBe(21);
});

test('slayerMasksHelms accumulates gargoyle masked scores and preserves existing IDs', () => {
	const first = runMaskScoreUpdate({
		monsterID: Monsters.BlackDemon.id,
		maskName: 'Black demonical mask',
		effectiveSlayed: 5
	});
	const second = runMaskScoreUpdate({
		monsterID: Monsters.Gargoyle.id,
		maskName: 'Gargoyle mask',
		effectiveSlayed: 7,
		onTaskMonsterScores: first.onTaskMonsterScores,
		onTaskWithMaskMonsterScores: first.onTaskWithMaskMonsterScores
	});
	expect(second.onTaskWithMaskMonsterScores[Monsters.BlackDemon.id]).toBe(5);
	expect(second.onTaskWithMaskMonsterScores[Monsters.Gargoyle.id]).toBe(7);
});

test('slayerMasksHelms continues to accumulate abyssal demon masked scores', () => {
	const first = runMaskScoreUpdate({
		monsterID: Monsters.AbyssalDemon.id,
		maskName: 'Abyssal mask',
		effectiveSlayed: 14
	});
	expect(first.onTaskMonsterScores[Monsters.AbyssalDemon.id]).toBe(14);
	expect(first.onTaskWithMaskMonsterScores[Monsters.AbyssalDemon.id]).toBe(14);

	const second = runMaskScoreUpdate({
		monsterID: Monsters.AbyssalDemon.id,
		maskName: 'Abyssal mask',
		effectiveSlayed: 6,
		onTaskMonsterScores: first.onTaskMonsterScores,
		onTaskWithMaskMonsterScores: first.onTaskWithMaskMonsterScores
	});
	expect(second.onTaskMonsterScores[Monsters.AbyssalDemon.id]).toBe(20);
	expect(second.onTaskWithMaskMonsterScores[Monsters.AbyssalDemon.id]).toBe(20);
});
