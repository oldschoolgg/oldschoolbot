import type { CollectionLogID } from '@/prisma/main.js';
import { allCollectionLogsFlat } from '@/lib/data/Collections.js';
import { strToEnumCase } from '@/lib/util/smallUtils.js';

export async function syncCollectionLogSlotTable() {
	await prisma.$transaction([prisma.cLCategoryItem.deleteMany(), prisma.cLCategory.deleteMany()]);
	await prisma.$transaction(
		allCollectionLogsFlat
			.map(cl => {
				const id = strToEnumCase(cl.name) as CollectionLogID;
				const items = Array.from(cl.items).sort((a, b) => a - b);
				return [
					prisma.cLCategory.upsert({
						where: { name: cl.name },
						create: {
							id,
							name: cl.name,
							counts: cl.counts ?? true,
							total_items: items.length
						},
						update: {
							id,
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
