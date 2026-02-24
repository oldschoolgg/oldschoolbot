import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const CaveGoblinTable: LootTable = new LootTable()
	.add('Bat shish')
	.add("Coated frogs' legs")
	.add('Fingers')
	.add('Frogburger')
	.add('Frogspawn gumbo')
	.add('Green gloop soup')
	.add('Coins', [10, 50], 7)
	.add('Bullseye lantern', 1)
	.add('Cave goblin wire', 1)
	.add('Iron ore', [1, 4])
	.add('Oil lantern', 1)
	.add('Swamp tar', 1)
	.add('Tinderbox', 1)
	.add('Unlit torch', 1);

export const CaveGoblin: SimpleMonster = new SimpleMonster({
	id: 6434,
	name: 'Cave goblin',
	pickpocketTable: CaveGoblinTable,
	aliases: ['cave goblin']
});
