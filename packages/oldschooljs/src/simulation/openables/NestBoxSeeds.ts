import { EMPTY_BIRD_NEST_ID } from '../../constants';
import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const NestBoxSeedsTable = new LootTable()
	// source: https://oldschool.runescape.wiki/w/Bird_nest
	.every(EMPTY_BIRD_NEST_ID)
	.add('Acorn', 1, 248)
	.add('Sweetcorn seed', 6, 346)
	.add('Strawberry seed', 6, 325)
	.add('Limpwurt seed', 2, 224)
	.add('Watermelon seed', 2, 219)
	.add('Snape grass seed', 2, 119)
	.add('Willow seed', 1, 44)
	.add('Maple seed', 1, 19)
	.add('Pineapple seed', 1, 45)
	.add('Cadantine seed', 1, 92)
	.add('Lantadyme seed', 1, 90)
	.add('Dwarf weed seed', 1, 63)
	.add('Teak seed', 1, 67)
	.add('Mahogany seed', 1, 74)
	.add('Torstol seed', 1, 14)
	.add('Calquat tree seed', 1, 32)
	.add('Papaya tree seed', 1, 21)
	.add('Palm tree seed', 1, 6)
	.add('Dragonfruit tree seed', 1, 6)
	.add('Ranarr seed', 1, 12)
	.add('Snapdragon seed', 1, 8)
	.add('Yew seed', 1, 9)
	.add('Magic seed', 1, 4)
	.add('Spirit seed', 1, 15)
	.add('Celastrus seed', 1, 6)
	.add('Redwood tree seed', 1, 1);

export default new SimpleOpenable({
	id: 12_793,
	name: 'Nest box (seeds)',
	aliases: ['nest box (seeds)', 'seeds nest box', 'nest box seeds', 'seed nest box'],
	table: NestBoxSeedsTable
});
