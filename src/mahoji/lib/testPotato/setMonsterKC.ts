import { stringMatches } from '@oldschoolgg/toolkit';

import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';

interface TestPotatoSetMonsterKCOptions {
	monster: string;
	kc?: number;
}

export async function handleTestPotatoSetMonsterKC(user: MUser, options: TestPotatoSetMonsterKCOptions) {
	if (options.monster.toLowerCase() === 'all') {
		const kc = options.kc ?? 1;
		const stats = await user.fetchStats();
		await user.statsUpdate({
			monster_scores: {
				...(stats.monster_scores as Record<string, number>),
				...Object.fromEntries(effectiveMonsters.map(mon => [mon.id, kc]))
			}
		});
		return `Set all ${effectiveMonsters.length} monster KCs to ${kc}.`;
	}

	const monster = effectiveMonsters.find(m => stringMatches(m.name, options.monster));
	if (!monster) return 'Invalid monster';
	const stats = await user.fetchStats();
	await user.statsUpdate({
		monster_scores: {
			...(stats.monster_scores as Record<string, unknown>),
			[monster.id]: options.kc ?? 1
		}
	});
	return `Set your ${monster.name} KC to ${options.kc ?? 1}.`;
}
