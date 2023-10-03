import { Bank } from 'oldschooljs';

import { Createable } from '../createables';

export const forestryCreatables: Createable[] = [
	{
		name: 'Secateurs attachment',
		inputItems: new Bank().add('Secateurs blade').add('Iron bar'),
		outputItems: new Bank().add('Secateurs attachment', 50)
	},
	{
		name: 'Nature offerings',
		inputItems: new Bank().add('Ritual mulch').add('Dwarf weed'),
		outputItems: new Bank().add('Nature offerings', 40)
	},
	{
		name: 'Leprechaun charm',
		inputItems: new Bank().add('Clover insignia').add('Emerald').add('Ball of wool'),
		outputItems: new Bank().add('Leprechaun charm', 10),
		requiredSkills: {
			crafting: 70,
			woodcutting: 70,
			farming: 35
		}
	},
	{
		name: 'Bee on a stick',
		inputItems: new Bank().add('Powdered pollen').add('Logs').add('Ball of wool'),
		outputItems: new Bank().add('Bee on a stick', 10),
		requiredSkills: {
			hunter: 50,
			woodcutting: 35
		}
	},
	{
		name: 'Sturdy harness',
		inputItems: new Bank().add('Log brace').add('Steel nails', 45).add('Rope', 2).add('Adamantite bar', 3),
		outputItems: new Bank().add('Sturdy harness'),
		requiredSkills: {
			smithing: 75,
			woodcutting: 75
		}
	},
	{
		name: 'Clothes pouch',
		inputItems: new Bank().add('Clothes pouch blueprint').add('Thread').add('Leather'),
		outputItems: new Bank().add('Clothes pouch'),
		requiredSkills: {
			crafting: 50,
			woodcutting: 50
		}
	},
	{
		name: 'Forestry basket',
		inputItems: new Bank().add('Forestry kit').add('Log basket').add('Sturdy harness'),
		outputItems: new Bank().add('Forestry basket'),
		requiredSkills: {
			smithing: 75,
			woodcutting: 75,
		}
	}
];
