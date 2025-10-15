import { Bank } from 'oldschooljs';

import { Prisma, type TableBankType } from '@/prisma/main.js';

function toPairs(b?: Bank): Array<[number, bigint]> {
	if (!b) return [];
	const out: Array<[number, bigint]> = [];
	for (const [item, qty] of b.items()) out.push([item.id, BigInt(qty)]);
	return out;
}

async function getOrCreateBankId(userId: string, type: TableBankType) {
	const b = await prisma.tableBank.upsert({
		where: { user_id_type: { user_id: userId, type } },
		create: { user_id: userId, type },
		update: {}
	});
	return b.id;
}

export class TableBankManager {
	static async update({
		userId,
		type = 'Bank',
		itemsToAdd,
		itemsToRemove
	}: {
		userId: string;
		type?: TableBankType | 'Bank' | 'CollectionLog';
		itemsToAdd?: Bank;
		itemsToRemove?: Bank;
	}) {
		const bankId = await getOrCreateBankId(userId, type as TableBankType);
		const adds = toPairs(itemsToAdd);
		const rems = toPairs(itemsToRemove);

		await prisma.$transaction(async tx => {
			if (adds.length) {
				const vAdd = Prisma.join(adds.map(([id, q]) => Prisma.sql`(${bankId}, ${id}::int, ${q}::bigint)`));
				const addSql = Prisma.sql`
          INSERT INTO table_bank_item (bank_id, item_id, quantity)
          VALUES ${vAdd}
          ON CONFLICT (bank_id, item_id)
          DO UPDATE SET quantity = table_bank_item.quantity + EXCLUDED.quantity;
        `;
				await tx.$executeRaw(addSql);
			}

			if (rems.length) {
				const vRem = Prisma.join(rems.map(([id, q]) => Prisma.sql`(${id}::int, ${q}::bigint)`));

				const subtractSql = Prisma.sql`
          WITH d(item_id, qty) AS (VALUES ${vRem})
          UPDATE table_bank_item t
          SET quantity = t.quantity - d.qty
          FROM d
          WHERE t.bank_id = ${bankId}::int AND t.item_id = d.item_id;
        `;

				await tx.$executeRaw(subtractSql);

				await tx.$executeRaw(Prisma.sql`
          DELETE FROM table_bank_item
          WHERE bank_id = ${bankId}::int
            AND item_id IN (${Prisma.join(rems.map(([id]) => id))})
            AND quantity = 0;
        `);
			}
		});
	}

	static async fetch({
		userId,
		type = 'Bank'
	}: {
		userId: string;
		type?: TableBankType | 'Bank' | 'CollectionLog';
	}): Promise<Bank> {
		const bankId = await getOrCreateBankId(userId, type as TableBankType);
		const rows = await prisma.$queryRaw<any[]>(
			Prisma.sql`SELECT COALESCE(
  json_agg(json_build_array(item_id::int, quantity::bigint) ORDER BY item_id),
  '[]'::json
) AS pairs
FROM table_bank_item
WHERE bank_id = ${bankId}::int
  AND quantity <> 0;`
		);
		return new Bank(new Map(rows[0].pairs));
	}
}
