import { SoulBank, calcSoulChance } from '@oldschoolgg/necromancy';

import type { NewMonsterActivityOptions } from '@/tasks/minions/monsterActivity';

function rollSouls({ trip }: { trip: NewMonsterActivityOptions }) {
	const baseChance = calcSoulChance({
		monsterKillTime: trip.monster.timeToFinish,
		necromancyLevel: trip.gearBank.skillsAsLevels.necromancy
	});

	let souls = 0;
	for (let i = 0; i < trip.q; i++) {
		if (Math.random() < baseChance) souls++;
	}

	const soulLoot = new SoulBank();
	soulLoot.add(trip.monster.id, souls);
	return souls;
}

export const Necromancy = {
	rollSouls
};
