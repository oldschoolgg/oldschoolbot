import { type Monster, Monsters } from 'oldschooljs';

import { allSlayerTasks } from '@/lib/slayer/tasks/index.js';

export function getAllAlternateMonsters(options: { monster: Monster }): Monster[];
export function getAllAlternateMonsters(options: { monsterId: number }): number[];
export function getAllAlternateMonsters(options: { monster: Monster } | { monsterId: number }) {
	const useMonster = 'monster' in options;
	const monsterId = useMonster ? options.monster.id : options.monsterId;
	const monsters = allSlayerTasks.map(task => (task.monsters.includes(monsterId) ? task.monsters : [])).flat(2);
	return useMonster ? Monsters.filter(m => monsters.includes(m.id)).map(m => m) : monsters;
}
