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
	}
];
