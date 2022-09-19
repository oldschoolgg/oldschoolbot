import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { prisma } from '../settings/prisma';

export async function getUsersTamesCollectionLog(user: MUser) {
	const allTames = await prisma.tame.findMany({
		where: {
			user_id: user.id
		}
	});
	let totalBank = new Bank();
	for (const tame of allTames) {
		totalBank.add(tame.max_total_loot as ItemBank);
	}
	return totalBank;
}
