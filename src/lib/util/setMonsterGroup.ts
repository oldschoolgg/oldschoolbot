import { randInt } from 'e';
import { Bank, MonsterKillOptions, Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';
import SimpleMonster from 'oldschooljs/dist/structures/SimpleMonster';

export interface SetMonsterGroupOptions {
	id: number;
	name: string;
	monsters: SimpleMonster[];
	newItemData?: Partial<Monster>;
	randomStart?: boolean;
}

export function makeGroupMonsterKillTable(tables: SimpleMonster[], randomStart = false) {
	return (quantity: number, options: MonsterKillOptions) => {
		const loot = new Bank();

		const randomizer = randomStart ? randInt(1, tables.length) - 1 : 0;

		for (let i = 0; i < quantity; i++) {
			loot.add(tables[(i + randomizer) % tables.length].kill(1, options));
		}
		return loot;
	};
}
// Possibly change monsters to GroupMonsters[] => { weight: %, monster: SimpleMonster }
export default function setMonsterGroup(options: SetMonsterGroupOptions) {
	Monsters.set(options.id, {
		...(options.monsters[0] as Monster),
		kill: makeGroupMonsterKillTable(options.monsters, options.randomStart),
		allItems: options.monsters.flatMap(t => t.table!.allItems),
		...options.newItemData,
		name: options.name,
		id: options.id
	});
}
