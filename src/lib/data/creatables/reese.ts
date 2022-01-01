import { resolveNameBank } from '../../util';
import { Createable } from '../createables';

export const reeseCreatables: Createable[] = [
	{
		name: 'Reese Blade of saeldor (c)',
		inputItems: resolveNameBank({
			'Blade of saeldor (inactive)': 1,
			'Crystal shard': 1500
		}),
		outputItems: resolveNameBank({ 'Blade of saeldor (c)': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Blade of saeldor (inactive)',
		inputItems: resolveNameBank({
			'Enhanced crystal weapon seed': 1,
			'Crystal shard': 150
		}),
		outputItems: resolveNameBank({ 'Blade of saeldor (inactive)': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Bow of faerdhinen (c)',
		inputItems: resolveNameBank({
			'Bow of faerdhinen (inactive)': 1,
			'Crystal shard': 1500
		}),
		outputItems: resolveNameBank({ 'Bow of faerdhinen (c)': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Bow of faerdhinen (inactive)',
		inputItems: resolveNameBank({
			'Enhanced crystal weapon seed': 1,
			'Crystal shard': 150
		}),
		outputItems: resolveNameBank({ 'Bow of faerdhinen (inactive)': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Crystal pickaxe',
		inputItems: resolveNameBank({
			'Crystal tool seed': 1,
			'Crystal shard': 180
		}),
		outputItems: resolveNameBank({ 'Crystal pickaxe': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Crystal harpoon',
		inputItems: resolveNameBank({
			'Crystal tool seed': 1,
			'Crystal shard': 180
		}),
		outputItems: resolveNameBank({ 'Crystal harpoon': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Crystal axe',
		inputItems: resolveNameBank({
			'Crystal tool seed': 1,
			'Crystal shard': 180
		}),
		outputItems: resolveNameBank({ 'Crystal axe': 1 }),
		QPRequired: 150
	},
	{
		name: 'Reese Enhanced crystal key',
		inputItems: resolveNameBank({
			'Crystal key': 1,
			'Crystal shard': 15
		}),
		outputItems: resolveNameBank({ 'Enhanced crystal key': 1 }),
		QPRequired: 150
	}
];
