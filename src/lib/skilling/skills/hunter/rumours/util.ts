import { AdeptSack, Bank, BasicSack, ExpertSack, type Item, Items, MasterSack, resolveItems } from 'oldschooljs';

import type { UnifiedOpenable } from '@/lib/openables.js';

export const RumourOptions = ['novice', 'adept', 'expert', 'master'] as const;
export type RumourOption = (typeof RumourOptions)[number];
export type RumourBlockList = Partial<Record<RumourOption, number>>;

export interface Rumour {
	creatureID: number;
	duration: number;
	quantity: number;
}

const sacks = [BasicSack, AdeptSack, ExpertSack, MasterSack];

const outfitPieces = resolveItems([
	'Guild hunter headwear',
	'Guild hunter top',
	'Guild hunter legs',
	'Guild hunter boots'
]);

export const tierToHunterLevel = {
	novice: 46,
	adept: 57,
	expert: 72,
	master: 91
};

export function openHunterSack({
	item,
	qty,
	allItemsOwned,
	hunterXP,
	rng
}: {
	allItemsOwned: Bank;
	item: Item;
	qty: number;
	hunterXP: number;
	rng: RNGProvider;
}) {
	const sack = sacks.find(i => i.id === item.id);
	if (!sack) throw new Error(`No sack found for item ${item.name}.`);

	const loot = new Bank();
	const effectiveOwnedItems = allItemsOwned.clone();

	for (let i = 0; i < qty; i++) {
		const thisLoot = sack.table.roll();
		const unownedPieces = outfitPieces.filter(i => !effectiveOwnedItems.has(i));

		if (rng.roll(50)) {
			if (sack.id === 29_248 || sack.id === 29_246) {
				if (rng.roll(20)) {
					thisLoot.add('Quetzin');
				}
				if (rng.roll(5)) {
					thisLoot.add("Huntsman's kit");
				} else {
					if (unownedPieces.length > 0) {
						thisLoot.add(unownedPieces[0]);
					} else {
						thisLoot.add(rng.pick(outfitPieces));
					}
				}
			} else if (sack.id === 29_244) {
				if (rng.roll(5)) {
					thisLoot.add("Huntsman's kit");
				} else {
					if (unownedPieces.length > 0) {
						thisLoot.add(unownedPieces[0]);
					} else {
						thisLoot.add(rng.pick(outfitPieces));
					}
				}
			} else {
				if (unownedPieces.length > 0) {
					thisLoot.add(unownedPieces[0]);
				} else {
					thisLoot.add(rng.pick(outfitPieces));
				}
			}
		}

		if (!thisLoot.has('Quetzin') && hunterXP >= 200_000_000) {
			if (sack.id === 29_248 || sack.id === 29_246) {
				if (rng.roll(67)) thisLoot.add('Quetzin');
			}
		}

		loot.add(thisLoot);

		effectiveOwnedItems.add(thisLoot);
	}
	return { bank: loot };
}

export const hunterSackOpenables: UnifiedOpenable[] = [];

for (const sack of sacks) {
	hunterSackOpenables.push({
		name: sack.name,
		id: sack.id,
		openedItem: Items.getOrThrow(sack.id),
		aliases: sack.aliases,
		output: async args =>
			openHunterSack({
				item: args.self.openedItem,
				allItemsOwned: args.user.allItemsOwned,
				qty: args.quantity,
				hunterXP: args.user.skillsAsXP.hunter,
				rng: args.rng
			}),
		allItems: [
			...new Set([...sack.table.allItems, ...outfitPieces, ...resolveItems(['Quetzin', "Huntsman's kit"])])
		]
	});
}
