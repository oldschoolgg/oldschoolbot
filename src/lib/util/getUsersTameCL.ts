import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

export async function getUsersTamesCollectionLog(user: KlasaUser) {
	const { TamesTable } = await import('../typeorm/TamesTable.entity');
	const allTames = await TamesTable.find({
		where: {
			userID: user.id
		}
	});
	let totalBank = new Bank();
	for (const tame of allTames) {
		totalBank.add(tame.totalLoot);
	}
	return totalBank;
}
