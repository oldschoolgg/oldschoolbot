import itemID from '../util/itemID';

interface TokkulShop {
	name: string;
	inputItem: number;
	tokkulReturn: number;
	tokkulCost?: number; // Prices are using the Karamja gloves 1
	aliases?: string[];
}

const TokkulShop: TokkulShop[] = [
	// Ore and Gem Store
	{
		name: 'Tin ore',
		inputItem: itemID('Tin ore'),
		tokkulReturn: 1,
		tokkulCost: 3,
		aliases: ['tin']
	},
	{
		name: 'Copper ore',
		inputItem: itemID('Copper ore'),
		tokkulReturn: 1,
		tokkulCost: 3,
		aliases: ['copper']
	},
	{
		name: 'Iron ore',
		inputItem: itemID('Iron ore'),
		tokkulReturn: 1,
		tokkulCost: 22,
		aliases: ['iron']
	},
	{
		name: 'Silver ore',
		inputItem: itemID('Silver ore'),
		tokkulReturn: 7,
		aliases: ['silver']
	},
	{
		name: 'Coal',
		inputItem: itemID('Coal'),
		tokkulReturn: 4
	},
	{
		name: 'Gold ore',
		inputItem: itemID('Gold ore'),
		tokkulReturn: 15,
		aliases: ['gold']
	},
	{
		name: 'Mithril ore',
		inputItem: itemID('Mithril ore'),
		tokkulReturn: 16,
		aliases: ['mithril']
	},
	{
		name: 'Adamantite ore',
		inputItem: itemID('Adamantite ore'),
		tokkulReturn: 40,
		aliases: ['adamantite', 'adamant', 'addy']
	},
	{
		name: 'Runite ore',
		inputItem: itemID('Runite ore'),
		tokkulReturn: 320,
		aliases: ['runite', 'rune ore', 'rune']
	},
	{
		name: 'Uncut sapphire',
		inputItem: itemID('Uncut sapphire'),
		tokkulReturn: 2,
		tokkulCost: 32,
		aliases: ['sapphire']
	},
	{
		name: 'Uncut emerald',
		inputItem: itemID('Uncut emerald'),
		tokkulReturn: 5,
		tokkulCost: 65,
		aliases: ['emerald']
	},
	{
		name: 'Uncut ruby',
		inputItem: itemID('Uncut ruby'),
		tokkulReturn: 10,
		aliases: ['ruby']
	},
	{
		name: 'Uncut diamond',
		inputItem: itemID('Uncut diamond'),
		tokkulReturn: 20,
		aliases: ['diamond']
	},
	{
		name: 'Uncut dragonstone',
		inputItem: itemID('Uncut dragonstone'),
		tokkulReturn: 100
	},
	{
		name: 'Uncut onyx',
		inputItem: itemID('Uncut onyx'),
		tokkulReturn: 20000,
		tokkulCost: 260000,
		aliases: ['onyx']
	},
	{
		name: 'Onyx bolt tips',
		inputItem: itemID('Onyx bolt tips'),
		tokkulReturn: 100,
		tokkulCost: 1300,
		aliases: ['onyx tips', 'onix bolts']
	},
	// Equipment Store
	{
		name: 'Obsidian throwing ring',
		inputItem: itemID('Toktz-xil-ul'),
		tokkulReturn: 25,
		tokkulCost: 325,
		aliases: ['toktz-xil-ul']
	},
	{
		name: 'Obsidian sword',
		inputItem: itemID('Toktz-xil-ak'),
		tokkulReturn: 4000,
		tokkulCost: 52000,
		aliases: ['toktz-xil-ak']
	},
	{
		name: 'Obsidian dagger',
		inputItem: itemID('Toktz-xil-ek'),
		tokkulReturn: 2500,
		tokkulCost: 32500,
		aliases: ['toktz-xil-ek']
	},
	{
		name: 'Obsidian maul',
		inputItem: itemID('Tzhaar-ket-om'),
		tokkulReturn: 5000,
		tokkulCost: 65001,
		aliases: ['tzhaar-ket-om']
	},
	{
		name: 'Obsidian staff',
		inputItem: itemID('Toktz-mej-tal'),
		tokkulReturn: 3500,
		tokkulCost: 45500,
		aliases: ['toktz-mej-tal']
	},
	{
		name: 'Obsidian mace',
		inputItem: itemID('Tzhaar-ket-em'),
		tokkulReturn: 3000,
		tokkulCost: 39000,
		aliases: ['tzhaar-ket-em']
	},
	{
		name: 'Obsidian cape',
		inputItem: itemID('Obsidian cape'),
		tokkulReturn: 6000,
		tokkulCost: 78000,
		aliases: ['obby cape']
	},
	{
		name: 'Obsidian shield',
		inputItem: itemID('Toktz-ket-xil'),
		tokkulReturn: 4500,
		tokkulCost: 58500,
		aliases: ['toktz-ket-xil', 'obby shield']
	},
	{
		name: 'Obsidian helmet',
		inputItem: itemID('Obsidian helmet'),
		tokkulReturn: 5632,
		tokkulCost: 73216,
		aliases: ['obby helmet']
	},
	{
		name: 'Obsidian platebody',
		inputItem: itemID('Obsidian platebody'),
		tokkulReturn: 8400,
		tokkulCost: 109200,
		aliases: ['obby platebody']
	},
	{
		name: 'Obsidian platelegs',
		inputItem: itemID('Obsidian platelegs'),
		tokkulReturn: 6700,
		tokkulCost: 87100,
		aliases: ['obby platelegs']
	},
	// Runes
	{
		name: 'Fire rune',
		inputItem: itemID('Fire rune'),
		tokkulReturn: 1,
		tokkulCost: 5,
		aliases: ['fire']
	},
	{
		name: 'Water rune',
		inputItem: itemID('Water rune'),
		tokkulReturn: 1,
		tokkulCost: 5,
		aliases: ['water']
	},
	{
		name: 'Air rune',
		inputItem: itemID('Air rune'),
		tokkulReturn: 1,
		tokkulCost: 5,
		aliases: ['air']
	},
	{
		name: 'Earth rune',
		inputItem: itemID('Earth rune'),
		tokkulReturn: 1,
		tokkulCost: 5,
		aliases: ['earth']
	},
	{
		name: 'Mind rune',
		inputItem: itemID('Mind rune'),
		tokkulReturn: 1,
		tokkulCost: 3,
		aliases: ['mind']
	},
	{
		name: 'Body rune',
		inputItem: itemID('Body rune'),
		tokkulReturn: 1,
		tokkulCost: 3,
		aliases: ['body']
	},
	{
		name: 'Chaos rune',
		inputItem: itemID('Chaos rune'),
		tokkulReturn: 9,
		tokkulCost: 117,
		aliases: ['chaos']
	},
	{
		name: 'Death rune',
		inputItem: itemID('Death rune'),
		tokkulReturn: 18,
		tokkulCost: 234,
		aliases: ['death']
	}
];

export default TokkulShop;
