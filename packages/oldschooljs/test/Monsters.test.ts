import { beforeAll, describe, test } from 'vitest';

import { Monsters, SimpleMonster } from '../src';
import LootTable from '../src/structures/LootTable';
import { itemTupleToTable } from '../src/util';
import { checkThreshold } from './testUtil';

describe('Monsters', () => {
	const currentMonIDs = new Set();
	const currentAliases = new Set();

	const subSubTable = new LootTable().add('Coal');
	const quantityTable = new LootTable().add('Dragon claws');
	const emptyTable = new LootTable({ limit: 100 }).add('Rune crossbow');

	const subTable = new LootTable()
		.add('Needle')
		.add('Amethyst')
		.add('Knife')
		.add(
			itemTupleToTable([
				['Iron bar', 1],
				['Steel bar', 1]
			])
		)
		.add(subSubTable);

	beforeAll(async () => {
		for (const monster of Monsters.values()) {
			if (!monster.aliases.some(alias => alias === monster.name.toLowerCase())) {
				throw `${monster.name} should have its name as an alias.`;
			}
			// Make sure all aliases are lowercase
			for (const alias of monster.aliases) {
				if (alias.toLowerCase() !== alias) {
					throw `Aliases for ${monster.name} should be lowercased.`;
				}
				if (currentAliases.has(alias)) throw `Alias of '${alias}' is duplicated.`;
				currentAliases.add(alias);
			}

			if (currentMonIDs.has(monster.id)) throw `${monster.name} has the same ID as another monster.`;
			currentMonIDs.add(monster.id);
		}
	});

	const TesterMonster = new SimpleMonster({
		id: 1,
		name: '',
		table: new LootTable()
			.every('Dragon bones')
			.every('Bones')
			.tertiary(100, 'Ranger boots')
			.tertiary(10, 'Twisted bow')
			.add('Bandos page 1')
			.add('Bandos page 2')
			.add('Bandos page 3')
			.add('Bandos page 4')
			.add(subTable)
			.add(quantityTable, 100)
			.add(emptyTable)
	});

	test('Test Monster', () => {
		const number = 500_000;

		const expectedRates = {
			'Dragon bones': 1,
			Bones: 1,
			'Ranger boots': 100,
			'Twisted bow': 10,
			'Bandos page 1': TesterMonster.table!.length,
			'Bandos page 2': TesterMonster.table!.length,
			'Bandos page 3': TesterMonster.table!.length,
			'Bandos page 4': TesterMonster.table!.length,
			Knife: TesterMonster.table!.length * subTable.length,
			Amethyst: TesterMonster.table!.length * subTable.length,
			Needle: TesterMonster.table!.length * subTable.length,
			Coal: (TesterMonster.table!.length * subTable.length) / subSubTable.length,
			'Iron bar': TesterMonster.table!.length * subTable.length,
			'Steel bar': TesterMonster.table!.length * subTable.length,
			'Dragon claws': TesterMonster.table!.length / 100,
			'Rune crossbow': TesterMonster.table!.length * 100
		};
		const loot = TesterMonster.kill(number);
		return checkThreshold(expectedRates, loot, number);
	});
	test('Duplicate IDs', () => {
		const ids: number[] = [];
		for (const monster of Monsters.values()) {
			if (ids.includes(monster.id)) throw new Error(`${monster.id} is duplicated`);
			ids.push(monster.id);
		}
	});
});
