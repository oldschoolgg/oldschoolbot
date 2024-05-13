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
	},
	{
		name: 'Dragonstone full helm(u)',
		inputItems: new Bank().add('Dragonstone upgrade kit').add('Dragonstone full helm'),
		outputItems: new Bank().add('Dragonstone full helm(u)')
	},
	{
		name: 'Dragonstone platebody(u)',
		inputItems: new Bank().add('Dragonstone upgrade kit').add('Dragonstone platebody'),
		outputItems: new Bank().add('Dragonstone platebody(u)')
	},
	{
		name: 'Dragonstone platelegs(u)',
		inputItems: new Bank().add('Dragonstone upgrade kit').add('Dragonstone platelegs'),
		outputItems: new Bank().add('Dragonstone platelegs(u)')
	},
	{
		name: 'Dragonstone boots(u)',
		inputItems: new Bank().add('Dragonstone upgrade kit').add('Dragonstone boots'),
		outputItems: new Bank().add('Dragonstone boots(u)')
	},
	{
		name: 'Dragonstone gauntlets(u)',
		inputItems: new Bank().add('Dragonstone upgrade kit').add('Dragonstone gauntlets'),
		outputItems: new Bank().add('Dragonstone gauntlets(u)')
	}
];
