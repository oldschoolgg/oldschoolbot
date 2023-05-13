import { Bank } from 'oldschooljs';

import { prisma } from './settings/prisma';
import { ItemBank } from './types';
import { validateBankAndThrow } from './util';

export function makeTransactFromTableBankQueries({
	table,
	bankToAdd,
	bankToRemove
}: {
	table: typeof prisma.gEBank;
	bankToAdd?: Bank;
	bankToRemove?: Bank;
}) {
	const queries = [];

	if (bankToAdd) {
		for (const [item, quantity] of bankToAdd.items()) {
			queries.push(
				table.upsert({
					where: {
						item_id: item.id
					},
					update: {
						quantity: {
							increment: quantity
						}
					},
					create: {
						item_id: item.id,
						quantity
					}
				})
			);
		}
	}

	if (bankToRemove) {
		for (const [item, quantity] of bankToRemove.items()) {
			queries.push(
				table.update({
					where: {
						item_id: item.id
					},
					data: {
						quantity: {
							decrement: quantity
						}
					}
				})
			);
		}
	}

	return queries;
}

export async function transactFromTableBank({
	table,
	bankToAdd,
	bankToRemove
}: {
	table: typeof prisma.gEBank;
	bankToAdd?: Bank;
	bankToRemove?: Bank;
}) {
	const queries = makeTransactFromTableBankQueries({ table, bankToAdd, bankToRemove });
	await prisma.$transaction(queries);
}

export async function fetchTableBank(_tableName: 'ge_bank') {
	// const result = await prisma.$queryRawUnsafe<{ bank: ItemBank }[]>(
	// 	`SELECT json_object_agg(item_id, quantity) as bank FROM ${tableName} WHERE quantity != 0;`
	// );
	// const bank = new Bank(result[0].bank);
	// validateBankAndThrow(bank);
	const bank = new Bank();
	const all = await prisma.gEBank.findMany();
	for (const item of all) {
		bank.add(item.item_id, Number(item.quantity));
	}
	return bank;
}
