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
		name: 'Smoker canister',
		inputItems: new Bank().add('Smoker fuel').add('Steel bar').add('Leather'),
		outputItems: new Bank().add('Smoker canister', 10),
		requiredSkills: {
			herblore: 37,
			smithing: 53,
			woodcutting: 53
		}
	},
	{
		name: 'Trap disarmer',
		inputItems: new Bank().add('Trap disarmer blueprint').add('Bronze wire').add('Iron bar'),
		outputItems: new Bank().add('Trap disarmer', 10),
		requiredSkills: {
			hunter: 16,
			woodcutting: 15
		}
	},
	{
		name: 'Petal circlet',
		inputItems: new Bank().add('Crystal charm').add('Assorted flowers').add('Ball of wool'),
		outputItems: new Bank().add('Petal circlet', 10),
		requiredSkills: {
			fletching: 50,
			woodcutting: 50
		}
	},
	{
		name: 'Padded spoon',
		inputItems: new Bank().add('Egg cushion').add('Limestone'),
		outputItems: new Bank().add('Padded spoon', 10),
		requiredSkills: {
			mining: 35,
			woodcutting: 25
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
			woodcutting: 75
		}
	},
	{
		name: 'Pheasant hat',
		inputItems: new Bank().add('Pheasant tail feathers', 15).add('Thread'),
		outputItems: new Bank().add('Pheasant hat'),
		requiredSkills: {
			crafting: 2
		}
	},
	{
		name: 'Pheasant legs',
		inputItems: new Bank().add('Pheasant tail feathers', 15).add('Thread'),
		outputItems: new Bank().add('Pheasant legs'),
		requiredSkills: {
			crafting: 2
		}
	},
	{
		name: 'Pheasant boots',
		inputItems: new Bank().add('Pheasant tail feathers', 15).add('Thread'),
		outputItems: new Bank().add('Pheasant boots'),
		requiredSkills: {
			crafting: 2
		}
	},
	{
		name: 'Pheasant cape',
		inputItems: new Bank().add('Pheasant tail feathers', 15).add('Thread'),
		outputItems: new Bank().add('Pheasant cape'),
		requiredSkills: {
			crafting: 2
		}
	},
	{
		name: 'Bronze felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Bronze axe'),
		outputItems: new Bank().add('Bronze felling axe')
	},
	{
		name: 'Iron felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Iron axe'),
		outputItems: new Bank().add('Iron felling axe')
	},
	{
		name: 'Steel felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Steel axe'),
		outputItems: new Bank().add('Steel felling axe')
	},
	{
		name: 'Black felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Black axe'),
		outputItems: new Bank().add('Black felling axe')
	},
	{
		name: 'Mithril felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Mithril axe'),
		outputItems: new Bank().add('Mithril felling axe')
	},
	{
		name: 'Adamant felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Adamant axe'),
		outputItems: new Bank().add('Adamant felling axe')
	},
	{
		name: 'Rune felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Rune axe'),
		outputItems: new Bank().add('Rune felling axe')
	},
	{
		name: 'Dragon felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Dragon axe'),
		outputItems: new Bank().add('Dragon felling axe')
	},
	{
		name: 'Crystal felling axe',
		inputItems: new Bank().add('Felling axe handle').add('Crystal axe'),
		outputItems: new Bank().add('Crystal felling axe')
	},
	{
		name: '3rd age felling axe',
		inputItems: new Bank().add('Felling axe handle').add('3rd age axe'),
		outputItems: new Bank().add('3rd age felling axe')
	}
];
