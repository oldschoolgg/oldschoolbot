import type { Prisma } from '@prisma/client';
import type { ItemBank } from 'oldschooljs';

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
