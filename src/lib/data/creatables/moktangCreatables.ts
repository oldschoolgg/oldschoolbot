import { Bank } from 'oldschooljs';

import { MaterialBank } from '../../invention/MaterialBank';
import { Createable } from '../createables';

export const moktangCreatables: Createable[] = [
	{
		name: 'Volcanic pickaxe',
		inputItems: new Bank({
			'Volcanic shards': 2,
			'Dwarven pickaxe': 1,
			'Obsidian shards': 250
		}),
		outputItems: new Bank({ 'Volcanic pickaxe': 1 })
	},
	{
		name: 'Offhand volcanic pickaxe',
		inputItems: new Bank({
			'Volcanic shards': 1,
			'Dwarven pickaxe': 1,
			'Obsidian shards': 150
		}),
		outputItems: new Bank({ 'Offhand volcanic pickaxe': 1 })
	},
	{
		name: 'Moktang totem',
		inputItems: new Bank({
			'Elder rune': 20
		}),
		outputItems: new Bank({ 'Moktang totem': 1 }),
		materialCost: new MaterialBank({
			rocky: 50,
			magic: 20
		})
	}
];
