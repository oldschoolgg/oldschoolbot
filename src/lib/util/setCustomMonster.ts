import { Bank, Monsters } from 'oldschooljs';
import type LootTable from 'oldschooljs/dist/structures/LootTable';
import type Monster from 'oldschooljs/dist/structures/Monster';

export function makeKillTable(table: LootTable) {
	return {
		kill: (quantity: number) => {
			const loot = new Bank();

			for (let i = 0; i < quantity; i++) {
				loot.add(table.roll());
			}

			return loot;
		}
	};
}

export default function setCustomMonster(
	id: number,
	name: string,
	table: LootTable,
	baseItem: Omit<Monster, 'kill'>,
	newItemData?: Partial<Monster>
) {
	if (Monsters.get(id) && process.env.TEST === undefined) {
		console.error(`Tried to set custom monster, but one already existed with the same ID: ${id}`);
	}
	Monsters.set(id, {
		...baseItem,
		...newItemData,
		name,
		id,
		kill: makeKillTable(table).kill,
		allItems: table.allItems,
		isCustom: true
	});
}
