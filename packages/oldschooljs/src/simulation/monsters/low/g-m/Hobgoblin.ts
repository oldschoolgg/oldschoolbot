import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import CommonSeedDropTable from '../../../subtables/CommonSeedDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const HerbTable = new LootTable()
	.add('Grimy guam leaf', 1, 10)
	.add('Grimy marrentill', 1, 10)
	.add('Grimy tarromin', 1, 5)
	.add('Grimy ranarr weed', 1, 2)
	.add('Grimy irit leaf', 1, 140)
	.add('Grimy avantoe', 1, 2)
	.add('Grimy kwuarm', 1, 1)
	.add('Grimy cadantine', 1, 1)
	.add('Grimy lantadyme', 1, 3)
	.add('Grimy dwarf weed', 1, 3);

export const HobgoblinTable = new LootTable()
	.tertiary(5000, 'Hobgoblin champion scroll')
	.tertiary(70, 'Clue scroll (beginner)')
	.every('Bones')

	// Weapons
	.add('Iron sword', 1, 3)
	.add('Steel dagger', 1, 3)
	.add('Steel longsword', 1, 1)

	// Runes/ammunition
	.add('Law rune', 2, 3)
	.add('Water rune', 2, 2)
	.add('Fire rune', 7, 2)
	.add('Body rune', 6, 2)
	.add('Chaos rune', 3, 2)
	.add('Nature rune', 4, 2)
	.add('Cosmic rune', 2, 1)
	.add('Iron javelin', 5, 1)

	.add(HerbTable, 1, 7)
	.add(CommonSeedDropTable, 1, 12)
	.add('Coins', 15, 34)
	.add('Coins', 5, 12)
	.add('Coins', 28, 4)
	.add('Coins', 62, 4)
	.add('Coins', 42, 3)
	.add('Coins', 1, 3)
	.add('Coins', 1, 1)
	.add('Limpwurt root', 1, 21)
	.add('Goblin mail', 1, 2)
	.add(GemTable, 1, 2);

export default new SimpleMonster({
	id: 3049,
	name: 'Hobgoblin',
	table: HobgoblinTable,
	aliases: ['hobgoblin']
});
