import { randInt } from '@oldschoolgg/rng';
import { Bank } from 'oldschooljs';

import type { GemstoneFish } from '@/lib/skilling/skills/fishing/fishing.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';

const juvenileGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Juvenile gemscale')!;
const adolescentGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Adolescent gemscale')!;
const matureGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Mature gemscale')!;
const elderGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Elder gemscale')!;
const ancientGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Ancient gemscale')!;

const gemscaleBreakdown: Record<number, { item: string; quantity: [number, number] }> = {
	[juvenileGemscale.id]:   { item: 'Celestyte',      quantity: [1, 2] },
	[adolescentGemscale.id]: { item: 'Verdantyte',     quantity: [1, 3] },
	[matureGemscale.id]:     { item: 'Starfire agate', quantity: [2, 4] },
	[ancientGemscale.id]:    { item: 'Oneiryte',       quantity: [2, 5] },
	[elderGemscale.id]:      { item: 'Firaxyte',       quantity: [3, 6] },
};

export async function gemscaleBreakdownCommand(user: MUser, fishName: string | undefined, quantity: number | undefined) {
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

	let totalGems = 0;
	for (let i = 0; i < toBreak; i++) {
		totalGems += randInt(breakdown.quantity[0], breakdown.quantity[1]);
	}

	await user.transactItems({
		itemsToRemove: new Bank().add(targetFish.id, toBreak),
		itemsToAdd: new Bank().add(breakdown.item, totalGems)
	});

	return `You broke down ${toBreak.toLocaleString()}x ${targetFish.name} into ${totalGems.toLocaleString()}x ${breakdown.item}.`;
}