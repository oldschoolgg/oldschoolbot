import { randInt } from 'node-rng';
import { Bank } from 'oldschooljs';

import type { GemstoneFish } from '@/lib/skilling/skills/fishing/fishing.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';

const juvenileGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Juvenile gemscale')!;
const adolescentGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Adolescent gemscale')!;
const matureGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Mature gemscale')!;
const ancientGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Ancient gemscale')!;
const elderGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Elder gemscale')!;

const gemscaleBreakdown: Record<number, { quantity: [number, number] }> = {
	[juvenileGemscale.id]: { quantity: [2, 4] },
	[adolescentGemscale.id]: { quantity: [4, 7] },
	[matureGemscale.id]: { quantity: [6, 10] },
	[ancientGemscale.id]: { quantity: [10, 16] },
	[elderGemscale.id]: { quantity: [15, 25] }
};

const allGems = ['Celestyte', 'Verdantyte', 'Starfire agate', 'Oneiryte', 'Firaxyte'];
const PRISMARE_CHANCE = 50;

export async function gemscaleBreakdownCommand(
	user: MUser,
	fishName: string | undefined,
	quantity: number | undefined
) {
	if (!fishName || fishName.toLowerCase() === 'all') {
		const itemsToRemove = new Bank();
		const loot = new Bank();
		const breakdownCounts: { name: string; count: number }[] = [];

		for (const fish of Fishing.gemstoneFishes) {
			const hasQuantity = user.bank.amount(fish.id);
			if (hasQuantity > 0) {
				const toBreak = quantity ? Math.min(quantity, hasQuantity) : hasQuantity;
				itemsToRemove.add(fish.id, toBreak);
				breakdownCounts.push({ name: fish.name, count: toBreak });

				const breakdown = gemscaleBreakdown[fish.id];
				for (let i = 0; i < toBreak; i++) {
					const gemCount = randInt(breakdown.quantity[0], breakdown.quantity[1]);
					if (gemCount > 0) {
						for (let g = 0; g < gemCount; g++) {
							const gem = allGems[randInt(0, allGems.length - 1)];
							loot.add(gem, 1);
						}
					}
					if (randInt(1, PRISMARE_CHANCE) === 1) {
						loot.add('Prismare', 1);
					}
				}
			}
		}

		if (itemsToRemove.length === 0) {
			return "You don't have any gemscales in your bank to break down.";
		}

		await user.transactItems({
			itemsToRemove,
			itemsToAdd: loot
		});

		const brokenDownSummary = breakdownCounts
			.map(({ name, count }) => `${count.toLocaleString()}x ${name}`)
			.join(', ');

		const gemSummary = allGems
			.map(gem => ({ gem, qty: loot.amount(gem) }))
			.filter(({ qty }) => qty > 0)
			.map(({ gem, qty }) => `${qty.toLocaleString()}x ${gem}`)
			.join(', ');

		const prismare = loot.amount('Prismare');
		const prismareLine = prismare > 0 ? `, ${prismare.toLocaleString()}x Prismare` : '';

		return `You broke down ${brokenDownSummary} and received: ${gemSummary || 'nothing'}${prismareLine}.`;
	}

	const targetFish = Fishing.gemstoneFishes.find((f: GemstoneFish) =>
		f.name.toLowerCase().includes(fishName.toLowerCase())
	);

	if (!targetFish) {
		return `Unknown gemscale type. Valid options are: ${Fishing.gemstoneFishes.map((f: GemstoneFish) => f.name).join(', ')}.`;
	}

	const breakdown = gemscaleBreakdown[targetFish.id];
	const hasQuantity = user.bank.amount(targetFish.id);

	if (hasQuantity === 0) {
		return `You don't have any ${targetFish.name} to break down.`;
	}

	const toBreak = quantity ? Math.min(quantity, hasQuantity) : hasQuantity;

	const loot = new Bank();
	for (let i = 0; i < toBreak; i++) {
		const gemCount = randInt(breakdown.quantity[0], breakdown.quantity[1]);
		if (gemCount > 0) {
			for (let g = 0; g < gemCount; g++) {
				const gem = allGems[randInt(0, allGems.length - 1)];
				loot.add(gem, 1);
			}
		}

		if (randInt(1, PRISMARE_CHANCE) === 1) {
			loot.add('Prismare', 1);
		}
	}

	await user.transactItems({
		itemsToRemove: new Bank().add(targetFish.id, toBreak),
		itemsToAdd: loot
	});

	const gemSummary = allGems
		.map(gem => ({ gem, qty: loot.amount(gem) }))
		.filter(({ qty }) => qty > 0)
		.map(({ gem, qty }) => `${qty.toLocaleString()}x ${gem}`)
		.join(', ');

	const prismare = loot.amount('Prismare');
	const prismareLine = prismare > 0 ? `, ${prismare.toLocaleString()}x Prismare` : '';

	return `You broke down ${toBreak.toLocaleString()}x ${targetFish.name} and received: ${gemSummary || 'nothing'}${prismareLine}.`;
}
