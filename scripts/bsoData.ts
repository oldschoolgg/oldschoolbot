import { writeFileSync } from 'node:fs';
import { calcSoulChance } from '@oldschoolgg/necromancy';
import { Items } from 'oldschooljs';

import killableMonsters from '@/lib/minions/data/killableMonsters';
import { customItems } from '../src/lib/customItems/util';

export function renderBsoItemsFile() {
	writeFileSync(
		'data/bso/bso_items.json',
		JSON.stringify(
			customItems.reduce(
				(acc, id) => {
					acc[id] = Items.itemNameFromId(id)!;
					return acc;
				},
				{} as Record<number, string>
			),
			null,
			4
		),
		'utf-8'
	);

	const chances = [];
	for (const monster of killableMonsters) {
		for (const necromancyLevel of [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]) {
			const chance = calcSoulChance({ monsterKillTime: monster.timeToFinish, necromancyLevel });
			chances.push({
				monster: monster.name,
				kill_time_s: monster.timeToFinish / 1000,
				chance: chance,
				chance_percent: chance * 100,
				necromancy_level: necromancyLevel
			});
		}
	}

	writeFileSync('data/bso/necromancy_soul_chances.json', JSON.stringify(chances, null, 4), 'utf-8');
}
