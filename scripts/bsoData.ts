import { writeFileSync } from 'node:fs';
import { calcMonsterStrengthFactor, calcNecroLevelForMonster, calcSoulChance } from '@oldschoolgg/necromancy';
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

	const necromancySoulChances: any = {};
	for (const monster of [...killableMonsters].sort((a, b) => a.timeToFinish - b.timeToFinish)) {
		necromancySoulChances[monster.name] = {};
		necromancySoulChances[monster.name].strength_factor = calcMonsterStrengthFactor(monster.timeToFinish);
		necromancySoulChances[monster.name].necromancy_level_required = calcNecroLevelForMonster({
			monsterKillTime: monster.timeToFinish
		});
		necromancySoulChances[monster.name].chances = [];

		for (const necromancyLevel of [1, 10, 20, 30, 40, 50, 60, 70, 80, 85, 90, 95, 100, 105, 110, 115, 120]) {
			if (necromancyLevel < necromancySoulChances[monster.name].necromancy_level_required) continue;

			const chance = calcSoulChance({
				monsterKillTime: monster.timeToFinish,
				necromancyLevel,
				requiredNecromancyLevel: necromancySoulChances[monster.name].necromancy_level_required
			});

			necromancySoulChances[monster.name].chances.push({
				kill_time_s: monster.timeToFinish / 1000,
				chance: chance,
				chance_percent: chance * 100,
				necromancy_level: necromancyLevel
			});
		}
	}

	writeFileSync('data/bso/necromancy_soul_chances.json', JSON.stringify(necromancySoulChances, null, 4), 'utf-8');
}
