import '@/lib/safeglobals.js';

import { Bank } from 'oldschooljs';
import PQueue from 'p-queue';

import { TableBankManager } from '@/lib/table-banks/tableBankManager.js';

export async function massMigrateToTableBanks() {
	const totalUsers = await prisma.user.count();
	const batchSize = 250;
	let skip = 0;

	while (skip < totalUsers) {
		const start = performance.now();
		const users = await prisma.user.findMany({
			take: batchSize,
			skip,
			select: { id: true, collectionLogBank: true }
		});
		if (users.length === 0) break;

		const queue = new PQueue({ concurrency: 10 });

		for (const user of users) {
			queue.add(async () => {
				const cl = new Bank(user.collectionLogBank as any);
				if (cl.length === 0) return;

				const tableBank = await TableBankManager.getOrCreateBankId(user.id, 'CollectionLog');
				const isEmpty =
					(await prisma.tableBankItem.count({
						where: { bank_id: tableBank.id }
					})) === 0;

				if (tableBank.inserted || isEmpty) {
					await TableBankManager.update({
						userId: user.id,
						type: 'CollectionLog',
						itemsToAdd: cl
					});
				} else {
					const current = await TableBankManager.fetch({ userId: user.id, type: 'CollectionLog' });
					if (current.toString() !== cl.toString()) {
						Logging.logDebug(`WARNING: ${user.id} diff: JSON[${cl.length}] vs TB[${current.length}]`);
					}
				}
			});
		}

		await queue.onIdle();
		const timeTaken = performance.now() - start;
		const processed = Math.min(skip + batchSize, totalUsers);
		const remaining = totalUsers - processed;
		const estTimeLeft = remaining * (timeTaken / users.length);

		Logging.logDebug(
			`	Migrated ${users.length} users (skip ${skip}). Took ${timeTaken.toFixed(1)}ms. ` +
				`Est. time left: ${Math.round(estTimeLeft / 1000)}s (${processed}/${totalUsers})`
		);

		skip += batchSize;
	}
}
