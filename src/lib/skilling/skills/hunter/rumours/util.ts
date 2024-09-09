import { type Time, randArrItem, roll } from 'e';
import { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';
import { AdeptSack, BasicSack, ExpertSack, MasterSack } from 'oldschooljs/dist/simulation/openables/HuntersLootSack';
import { resolveItems } from 'oldschooljs/dist/util';
import type { UnifiedOpenable } from '../../../../openables';
import getOSItem from '../../../../util/getOSItem';
import type { Creature } from '../../../types';

export const RumourOptions = ['novice', 'adept', 'expert', 'master'] as const;
export type RumourOption = (typeof RumourOptions)[number];

export interface Rumour {
	creature: Creature;
	duration: Time.Second;
	quantity: number;
}

const sacks = [BasicSack, AdeptSack, ExpertSack, MasterSack];

const outfitPieces = resolveItems([
	'Guild hunter headwear',
	'Guild hunter top',
	'Guild hunter legs',
	'Guild hunter boots'
]);

export function openHunterSack({ item, qty, allItemsOwned }: { allItemsOwned: Bank; item: Item; qty: number }) {
	const sack = sacks.find(i => i.id === item.id);
	if (!sack) throw new Error(`No sack found for item ${item.name}.`);

	const loot = new Bank();
	const effectiveOwnedItems = allItemsOwned.clone();

	for (let i = 0; i < qty; i++) {
		const thisLoot = sack.table.roll();
		const unownedPieces = outfitPieces.filter(i => !effectiveOwnedItems.has(i));

		if (roll(50)) {
			if (sack.id === 29_248 || sack.id === 29_246) {
				if (roll(20)) {
					thisLoot.add('Quetzin');
				}
				if (roll(5)) {
					thisLoot.add("Huntsman's kit");
				} else {
					if (unownedPieces.length > 0) {
						thisLoot.add(unownedPieces[0]);
					} else {
						thisLoot.add(randArrItem(outfitPieces));
					}
				}
			} else if (sack.id === 29_244) {
				if (roll(5)) {
					thisLoot.add("Huntsman's kit");
				} else {
					if (unownedPieces.length > 0) {
						thisLoot.add(unownedPieces[0]);
					} else {
						thisLoot.add(randArrItem(outfitPieces));
					}
				}
			} else {
				if (unownedPieces.length > 0) {
					thisLoot.add(unownedPieces[0]);
				} else {
					thisLoot.add(randArrItem(outfitPieces));
				}
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
		openedItem: getOSItem(sack.id),
		aliases: sack.aliases,
		output: async args =>
			openHunterSack({
				item: args.self.openedItem,
				allItemsOwned: args.user.allItemsOwned,
				qty: args.quantity
			}),
		allItems: sack.table.allItems
	});
}
