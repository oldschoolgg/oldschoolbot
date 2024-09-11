import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const hunterCreatables: Createable[] = [
	{
		name: "Hunter's spear",
		inputItems: new Bank().add('Teak logs').add('Jerboa tail').add('Hunter spear tips', 5),
		outputItems: new Bank().add("Hunter's spear", 5)
	},
	{
		name: 'Mixed hide top',
		inputItems: new Bank().add('Mixed hide base').add('Sunlight antelope fur', 2),
		outputItems: new Bank().add('Mixed hide top')
	},
	{
		name: 'Mixed hide legs',
		inputItems: new Bank().add('Mixed hide base').add('Fox fur', 3),
		outputItems: new Bank().add('Mixed hide top')
	},
	{
		name: 'Mixed hide boots',
		inputItems: new Bank().add('Mixed hide base').add('Sunlight antelope fur'),
		outputItems: new Bank().add('Mixed hide top')
	},
	{
		name: 'Mixed hide cape',
		inputItems: new Bank().add('Mixed hide base').add('Jaguar fur'),
		outputItems: new Bank().add('Mixed hide top')
	},
	{
		name: "Hunters' sunlight crossbow",
		inputItems: new Bank().add("Hunters' crossbow").add('Sunlight antelope antler'),
		outputItems: new Bank().add("Hunters' sunlight crossbow"),
		requiredSkills: { fletching: 74 }
	},
	{
		name: 'Basic quetzal whistle',
		inputItems: new Bank().add('Basic quetzal whistle blueprint').add('Willow logs'),
		outputItems: new Bank().add('Basic quetzal whistle')
	},
	{
		name: 'Enhanced quetzal whistle',
		inputItems: new Bank().add('Basic quetzal whistle').add('Enhanced quetzal whistle blueprint').add('Yew logs'),
		outputItems: new Bank().add('Enhanced quetzal whistle')
	},
	{
		name: 'Enhanced quetzal whistle (Torn)',
		inputItems: new Bank()
			.add('Basic quetzal whistle')
			.add('Torn enhanced quetzal whistle blueprint')
			.add('Yew logs'),
		outputItems: new Bank().add('Enhanced quetzal whistle')
	},
	{
		name: 'Perfected quetzal whistle',
		inputItems: new Bank()
			.add('Enhanced quetzal whistle')
			.add('Perfected quetzal whistle blueprint')
			.add('Redwood logs'),
		outputItems: new Bank().add('Perfected quetzal whistle')
	},
	{
		name: 'Perfected quetzal whistle (Torn)',
		inputItems: new Bank()
			.add('Enhanced quetzal whistle')
			.add('Torn perfected quetzal whistle blueprint')
			.add('Redwood logs'),
		outputItems: new Bank().add('Perfected quetzal whistle')
	}
];
