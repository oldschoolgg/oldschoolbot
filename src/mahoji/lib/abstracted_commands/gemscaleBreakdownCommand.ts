import { randInt } from '@oldschoolgg/rng';
import { Bank } from 'oldschooljs';

import type { GemstoneFish } from '@/lib/skilling/skills/fishing/fishing.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';

const juvenileGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Juvenile gemscale')!;
const adolescentGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Adolescent gemscale')!;
const matureGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Mature gemscale')!;
const elderGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Elder gemscale')!;
const ancientGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Ancient gemscale')!;

const gemscaleBreakdown: Record<number, { quantity: [number, number] }> = {
	[juvenileGemscale.id]: { quantity: [1, 2] },
	[adolescentGemscale.id]: { quantity: [1, 3] },
	[matureGemscale.id]: { quantity: [2, 4] },
	[ancientGemscale.id]: { quantity: [2, 5] },
	[elderGemscale.id]: { quantity: [3, 6] }
};

const allGems = ['Celestyte', 'Verdantyte', 'Starfire agate', 'Oneiryte', 'Firaxyte'];
const PRISMARE_CHANCE = 100;

export async function gemscaleBreakdownCommand(
	user: MUser,
	fishName: string | undefined,
	quantity: number | undefined
) {
	if (!fishName) return 'Please specify a gemscale type to break down (e.g. "Elder gemscale").';
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
		const gem = allGems[randInt(0, allGems.length - 1)];
		loot.add(gem, gemCount);

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

	return `You broke down ${toBreak.toLocaleString()}x ${targetFish.name} and received: ${gemSummary}${prismareLine}.`;
}
