import { stringMatches } from '@oldschoolgg/toolkit';
import type { ItemBank, Monster } from 'oldschooljs';

import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { Minigames } from '@/lib/settings/minigames.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';

export async function getKCByName(user: MUser, kcName: string): Promise<[string, number] | [null, 0]> {
	const mon = effectiveMonsters.find(
		mon => stringMatches(mon.name, kcName) || mon.aliases.some(alias => stringMatches(alias, kcName))
	);
	if (mon) {
		return [mon.name, await user.getKC((mon as unknown as Monster).id)];
	}

	const minigame = Minigames.find(
		game => stringMatches(game.name, kcName) || game.aliases.some(alias => stringMatches(alias, kcName))
	);
	if (minigame && minigame.name !== 'Tithe farm') {
		return [minigame.name, await user.fetchMinigameScore(minigame.column)];
	}

	const creature = Hunter.Creatures.find(c => c.aliases.some(alias => stringMatches(alias, kcName)));
	if (creature) {
		return [creature.name, await user.getCreatureScore(creature.id)];
	}

	const stats = await user.fetchStats();
	const special: [string[], number][] = [
		[['superior', 'superiors', 'superior slayer monster'], stats.slayer_superior_count],
		[['tithe farm', 'Tithe farm', 'tithefarm', 'tithe'], stats.tithe_farms_completed]
	];
	const res = special.find(s => s[0].includes(kcName));
	if (res) {
		return [res[0][0], res[1]];
	}

	return [null, 0];
}

export type AllKillCountEntry = {
	name: string;
	amount: number;
	type: 'Monster' | 'Minigame' | 'Hunter' | 'Special';
};

export async function getAllKillCounts(user: MUser): Promise<AllKillCountEntry[]> {
	const stats = await user.fetchStats();
	const monsterScores = (stats.monster_scores as ItemBank) ?? ({} as ItemBank);
	const creatureScores = (stats.creature_scores as ItemBank) ?? ({} as ItemBank);
	const result: AllKillCountEntry[] = [];

	for (const monster of effectiveMonsters) {
		const monsterID = (monster as unknown as Monster).id;
		result.push({
			name: monster.name,
			amount: monsterScores[monsterID] ?? 0,
			type: 'Monster'
		});
	}

	const minigameScores = await user.fetchMinigameScores();
	for (const { minigame, score } of minigameScores) {
		if (minigame.name === 'Tithe farm') continue;
		result.push({
			name: minigame.name,
			amount: score ?? 0,
			type: 'Minigame'
		});
	}

	for (const creature of Hunter.Creatures) {
		result.push({
			name: creature.name,
			amount: creatureScores[creature.id] ?? 0,
			type: 'Hunter'
		});
	}

	result.push({
		name: 'Superior slayer monsters',
		amount: stats.slayer_superior_count ?? 0,
		type: 'Special'
	});

	result.push({
		name: 'Tithe farm',
		amount: stats.tithe_farms_completed ?? 0,
		type: 'Special'
	});

	return result;
}
