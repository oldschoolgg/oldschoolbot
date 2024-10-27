import { Bank } from 'oldschooljs';

import type { ItemBank } from './types';

export function makeTransactFromTableBankQueries({
	bankToAdd,
	bankToRemove
}: {
	bankToAdd?: Bank;
	bankToRemove?: Bank;
}) {
	const queries = [];

	if (bankToAdd) {
		for (const [item, quantity] of bankToAdd.items()) {
			queries.push(
				prisma.$queryRawUnsafe(`INSERT INTO ge_bank(item_id, quantity) VALUES(${item.id}, ${quantity})
ON CONFLICT(item_id)
DO UPDATE SET quantity = "ge_bank"."quantity" + ${quantity};`)
			);
		}
	}

	if (bankToRemove) {
		for (const [item, quantity] of bankToRemove.items()) {
			queries.push(
				prisma.$queryRawUnsafe(`UPDATE ge_bank
								 SET quantity = "ge_bank"."quantity" - ${quantity}
								 WHERE item_id = ${item.id};`)
			);
		}
	}

	return queries;
}

export async function fetchTableBank() {
	const result = await prisma.$queryRawUnsafe<{ bank: ItemBank }[]>(
		'SELECT json_object_agg(item_id, quantity) as bank FROM ge_bank WHERE quantity != 0;'
	);
	const bank = new Bank(result[0].bank);
	bank.validateOrThrow();
	return bank;
}
