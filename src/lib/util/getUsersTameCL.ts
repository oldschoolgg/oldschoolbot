import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { prisma } from '../settings/prisma';

export async function getUsersTamesCollectionLog(userID: string) {
	const allTames = await prisma.tame.findMany({
		where: {
			user_id: userID
		}
	});
	let totalBank = new Bank();
	for (const tame of allTames) {
		totalBank.add(tame.max_total_loot as ItemBank);
	}
	await prisma.userStats.upsert({
		where: {
			user_id: BigInt(userID)
		},
		create: {
			user_id: BigInt(userID),
			tame_cl_bank: totalBank.bank
		},
		update: {
			tame_cl_bank: totalBank.bank
		}
	});
	return totalBank;
}
