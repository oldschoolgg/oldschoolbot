import { calcPerHour } from '@oldschoolgg/toolkit';
import { Monsters } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { miscBossKillables } from '@/lib/minions/data/killableMonsters/bosses/misc.js';

describe('Yama speed', () => {
	it('reaches 18 kills/hr normally and 20 kills/hr on weekends with maxed boosts and 10k KC', () => {
		const yama = miscBossKillables.find(monster => monster.id === Monsters.Yama.id)!;
		const mainBoosts = [
			15, // stats
			10, // KC
			3, // Burning claws
			2, // Lightbearer
			5, // Rite of vile transference
			5, // Amulet of rancour
			4, // Infernal cape
			4 // Ferocious gloves
		];

		const timeBeforeFood = Math.ceil(
			mainBoosts.reduce((time, reductionPercent) => time * (1 - reductionPercent / 100), yama.timeToFinish)
		);
		const timePerKill = Math.floor(timeBeforeFood * 0.98);
		const weekendTimePerKill = Math.ceil(timePerKill * 9 * 0.9) / 9;

		expect(calcPerHour(9, timePerKill * 9)).toBeCloseTo(18, 0);
		expect(calcPerHour(9, weekendTimePerKill * 9)).toBeCloseTo(20, 0);
	});
});
