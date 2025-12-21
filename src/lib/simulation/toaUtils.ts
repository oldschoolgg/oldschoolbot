import type { ItemBank } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import type { TOAOptions } from '@/lib/types/minions.js';

export function normalizeTOAUsers(data: TOAOptions) {
	const _detailedUsers = data.detailedUsers;
	const detailedUsers = (
		(Array.isArray(_detailedUsers[0]) ? _detailedUsers : [_detailedUsers]) as [string, number, number[]][][]
	).map(userArr =>
		userArr.map(user => ({
			id: user[0],
			points: user[1],
			deaths: user[2]
		}))
	);
	return detailedUsers;
}

export function getToaKCs(toaRaidLevelsBank: Prisma.JsonValue) {
	let entryKC = 0;
	let normalKC = 0;
	let expertKC = 0;
	for (const [levelStr, qty] of Object.entries(toaRaidLevelsBank as ItemBank)) {
		const level = Number(levelStr);
		if (level >= 300) {
			expertKC += qty;
			continue;
		}
		if (level >= 150) {
			normalKC += qty;
			continue;
		}
		entryKC += qty;
	}
	return { entryKC, normalKC, expertKC, totalKC: entryKC + normalKC + expertKC };
}

export const mileStoneBaseDeathChances = [
	{ level: 600, chance: 97, minChance: 97 },
	{ level: 500, chance: 85, minChance: 93 },
	{ level: 450, chance: 48.5, minChance: null },
	{ level: 400, chance: 36, minChance: null },
	{ level: 350, chance: 25.5, minChance: null },
	{ level: 300, chance: 23, minChance: null },
	{ level: 200, chance: 15, minChance: null },
	{ level: 150, chance: 13, minChance: null },
	{ level: 100, chance: 10, minChance: null },
	{ level: 1, chance: 5, minChance: null }
] as const;

export type RaidLevel = (typeof mileStoneBaseDeathChances)[number]['level'];
