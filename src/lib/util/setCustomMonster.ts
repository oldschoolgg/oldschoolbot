import { Bank, Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import Monster from 'oldschooljs/dist/structures/Monster';

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
	Monsters.set(id, {
		...baseItem,
		...newItemData,
		name,
		id,
		kill: makeKillTable(table).kill,
		allItems: table.allItems
	});
}
