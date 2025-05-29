import { Bank, type Item } from 'oldschooljs';
import { shuffle } from 'remeda';

import { roll } from '../util.js';

type PrimitiveDroppable = Item | string | number;

type DroppableTable = {
	type: 'DropsLeastOwnedFirst';
	drops: PrimitiveDroppable[];
	chance: number;
	clIncreaseIfAllOwned?: number;
};

interface DeciderCtx {
	quantity: number;
	collectionLog: Bank;
	tables: DroppableTable[];
}

export function decideLoot({ tables, collectionLog, quantity }: DeciderCtx) {
	const loot = new Bank();

	for (let i = 0; i < quantity; i++) {
		for (const table of tables) {
			const effectiveCL = collectionLog.clone().add(loot);

			switch (table.type) {
				case 'DropsLeastOwnedFirst': {
					const shuffledDrops = shuffle(table.drops).sort(
						(a, b) => effectiveCL.amount(a) - effectiveCL.amount(b)
					);
					const ownsAllDrops = table.drops.every(d => effectiveCL.has(d));
					let chance = table.chance;
					// If every item owned, increase chance
					if (table.clIncreaseIfAllOwned && ownsAllDrops) {
						chance *= table.clIncreaseIfAllOwned * (effectiveCL.amount(table.drops[0]) + 1);
					}
					if (roll(chance)) {
						const unowned = shuffledDrops.find(d => !effectiveCL.has(d)) ?? shuffledDrops[0];
						loot.add(unowned);
					}
				}
			}
		}
	}

	return loot;
}

export function decideUserLoot(args: { user: MUser } & Omit<DeciderCtx, 'collectionLog'>) {
	return decideLoot({ ...args, collectionLog: args.user.cl });
}
