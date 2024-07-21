import { Bank } from 'oldschooljs';

import { gloriesInventorySize, wealthInventorySize } from '../constants';

import Darts from '../skilling/skills/fletching/fletchables/darts';
import { getItem } from '../util/getOSItem';

export async function calculateAllFletchedItems(user: MUser) {
	const result = await prisma.$queryRawUnsafe<{ name: string; total: number }[]>(`SELECT data->>'fletchableName' AS name, SUM((data->>'quantity')::int) AS total
FROM activity
WHERE type = 'Fletching'
AND user_id = '${user.id}'::bigint
GROUP BY data->>'fletchableName';`);

	const bank = new Bank();
	for (const res of result) {
		const item = getItem(res.name);
		if (item) {
			bank.add(item.id, Number(res.total));
		}
	}
	return bank;
}

export function calculateDartsFletchedFromScratch({
	itemsFletched,
	itemsSmithed
}: {
	itemsSmithed: Bank;
	itemsFletched: Bank;
}) {
	const darts = new Bank();
	for (const dart of Darts) {
		if (!itemsFletched.has(dart.id)) continue;
		const dartTipItem = dart.inputItems.items().find(i => i[0].name !== 'Feather');
		if (!dartTipItem) continue;
		if (!itemsSmithed.has(dartTipItem[0].id)) continue;
		const fromScratchFletched = Math.min(itemsFletched.amount(dart.id), itemsSmithed.amount(dartTipItem[0].id));
		darts.add(dart.id, fromScratchFletched);
	}
	return darts;
}

export async function calculateTiarasMade(user: MUser) {
	const tiarasMade = await prisma.$queryRawUnsafe<{ tiara_id: string; total: bigint }[]>(`SELECT data->>'tiaraID' AS tiara_id, SUM((data->>'tiaraQuantity')::int) AS total
FROM activity
WHERE type = 'TiaraRunecraft'
AND user_id = '${user.id}'::bigint
GROUP BY data->>'tiaraID';`);
	const bank = new Bank();
	for (const tiara of tiarasMade) {
		bank.add(Number(tiara.tiara_id), Number(tiara.total));
	}
	return bank;
}

export async function calculateChargedItems(user: MUser) {
	const [totalGloriesInventoriesCharged, totalWealthInventoriesCharged] = await prisma.$transaction([
		prisma.$queryRawUnsafe<{ total: bigint }[]>(`SELECT SUM((data->>'quantity')::int) AS total
FROM activity
WHERE type = 'GloryCharging'
AND user_id = '${user.id}'::bigint;`),
		prisma.$queryRawUnsafe<{ total: bigint }[]>(`SELECT SUM((data->>'quantity')::int) AS total
FROM activity
WHERE type = 'WealthCharging'
AND user_id = '${user.id}'::bigint;`)
	]);

	const gloriesCharged = Number(totalGloriesInventoriesCharged[0].total) * gloriesInventorySize;
	const wealthCharged = Number(totalWealthInventoriesCharged[0].total) * wealthInventorySize;
	return {
		wealthCharged,
		gloriesCharged,
		bankOfChargedItems: new Bank()
			.add('Amulet of glory(6)', gloriesCharged)
			.add('Ring of wealth (5)', wealthCharged)
	};
}

export async function calculateTotalMahoganyHomesPoints(user: MUser) {
	const result = await prisma.$queryRawUnsafe<{ total: bigint }[]>(`SELECT SUM((data->>'points')::int) AS total
FROM activity
WHERE type = 'MahoganyHomes'
AND user_id = '${user.id}'::bigint
AND data->>'points' IS NOT NULL;`);
	return Number(result[0].total);
}
