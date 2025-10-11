import { uniqueArr } from '@oldschoolgg/toolkit';

import { allCollectionLogsFlat } from '@/lib/data/Collections.js';

export async function syncCollectionLogSlotTable() {
	await prisma.$transaction([prisma.cLCategoryItem.deleteMany(), prisma.cLCategory.deleteMany()]);
	await prisma.$transaction(
		allCollectionLogsFlat
			.map(cl => {
				const items = uniqueArr(cl.items).sort((a, b) => a - b);
				return [
					prisma.cLCategory.upsert({
						where: { name: cl.name },
						create: {
							name: cl.name,
							counts: cl.counts ?? true,
							total_items: items.length
						},
						update: {
							name: cl.name,
							counts: cl.counts ?? true,
							total_items: items.length
						}
					}),
					prisma.cLCategoryItem.createMany({
						data: items.map(item => ({
							category_name: cl.name,
							item_id: item
						}))
					})
				];
			})
			.flat(100)
	);
}

export async function updateUserCl(userId: string) {
	await prisma.$queryRaw`
WITH src AS (
  SELECT id, "collectionLogBank" AS cl
  FROM users
  WHERE id = ${userId}
),
pairs AS (
  SELECT
    (e.key)::int AS item_id,
    (
      GREATEST(
        1::numeric,
        LEAST(
          2147483647::numeric,
          CASE
            WHEN jsonb_typeof(e.value) IN ('number','string') THEN (e.value)::text::numeric
            ELSE 1::numeric
          END
        )
      )
    )::int AS quantity
  FROM src s,
       LATERAL jsonb_each(s.cl) AS e(key, value)
),
upserted AS (
  INSERT INTO user_items (user_id, item_id, quantity)
  SELECT ${userId}, p.item_id, p.quantity
  FROM pairs p
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = EXCLUDED.quantity
  RETURNING item_id
)
DELETE FROM user_items
WHERE user_id = ${userId}
  AND item_id NOT IN (SELECT item_id FROM pairs);
`;
}
