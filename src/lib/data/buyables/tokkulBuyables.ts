import itemID from '../../util/itemID';

interface TokkulShopItem {
	name: string;
	inputItem: number;
	tokkulReturn: number;
	tokkulCost?: number;
	aliases?: string[];
	requireFireCape?: boolean;
}

const TokkulShopItems: TokkulShopItem[] = [
	// Ore and Gem Store
	{
		name: 'Tin ore',
		inputItem: itemID('Tin ore'),
		tokkulReturn: 1,
		tokkulCost: 4,
		aliases: ['tin']
	},
	{
		name: 'Copper ore',
		inputItem: itemID('Copper ore'),
		tokkulReturn: 1,
		tokkulCost: 4,
		aliases: ['copper']
	},
	{
		name: 'Iron ore',
		inputItem: itemID('Iron ore'),
		tokkulReturn: 1,
		tokkulCost: 25,
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
		tokkulCost: 37,
		aliases: ['sapphire']
	},
	{
		name: 'Uncut emerald',
		inputItem: itemID('Uncut emerald'),
		tokkulReturn: 5,
		tokkulCost: 75,
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
		tokkulReturn: 20_000,
		tokkulCost: 300_000,
		aliases: ['onyx']
	},
	{
		name: 'Onyx bolt tips',
		inputItem: itemID('Onyx bolt tips'),
		tokkulReturn: 100,
		tokkulCost: 1_500,
		aliases: ['onyx tips', 'onix bolts']
	},
	// Equipment Store
	{
		name: 'Obsidian throwing ring',
		inputItem: itemID('Toktz-xil-ul'),
		tokkulReturn: 25,
		tokkulCost: 375,
		aliases: ['toktz-xil-ul']
	},
	{
		name: 'Obsidian sword',
		inputItem: itemID('Toktz-xil-ak'),
		tokkulReturn: 4_000,
		tokkulCost: 60_000,
		aliases: ['toktz-xil-ak']
	},
	{
		name: 'Obsidian dagger',
		inputItem: itemID('Toktz-xil-ek'),
		tokkulReturn: 2_500,
		tokkulCost: 37_500,
		aliases: ['toktz-xil-ek']
	},
	{
		name: 'Obsidian maul',
		inputItem: itemID('Tzhaar-ket-om'),
		tokkulReturn: 5_000,
		tokkulCost: 75_001,
		aliases: ['tzhaar-ket-om']
	},
	{
		name: 'Obsidian staff',
		inputItem: itemID('Toktz-mej-tal'),
		tokkulReturn: 3_500,
		tokkulCost: 52_500,
		aliases: ['toktz-mej-tal']
	},
	{
		name: 'Obsidian mace',
		inputItem: itemID('Tzhaar-ket-em'),
		tokkulReturn: 3_000,
		tokkulCost: 45_000,
		aliases: ['tzhaar-ket-em']
	},
	{
		name: 'Obsidian cape',
		inputItem: itemID('Obsidian cape'),
		tokkulReturn: 6_000,
		tokkulCost: 90_000,
		aliases: ['obby cape']
	},
	{
		name: 'Obsidian shield',
		inputItem: itemID('Toktz-ket-xil'),
		tokkulReturn: 4_500,
		tokkulCost: 67_500,
		aliases: ['toktz-ket-xil', 'obby shield']
	},
	{
		name: 'Obsidian helmet',
		inputItem: itemID('Obsidian helmet'),
		tokkulReturn: 5_632,
		tokkulCost: 84_480,
		aliases: ['obby helmet'],
		requireFireCape: true
	},
	{
		name: 'Obsidian platebody',
		inputItem: itemID('Obsidian platebody'),
		tokkulReturn: 8_400,
		tokkulCost: 126_000,
		aliases: ['obby platebody'],
		requireFireCape: true
	},
	{
		name: 'Obsidian platelegs',
		inputItem: itemID('Obsidian platelegs'),
		tokkulReturn: 6_700,
		tokkulCost: 100_500,
		aliases: ['obby platelegs'],
		requireFireCape: true
	},
	// Runes
	{
		name: 'Fire rune',
		inputItem: itemID('Fire rune'),
		tokkulReturn: 1,
		tokkulCost: 6,
		aliases: ['fire']
	},
	{
		name: 'Water rune',
		inputItem: itemID('Water rune'),
		tokkulReturn: 1,
		tokkulCost: 6,
		aliases: ['water']
	},
	{
		name: 'Air rune',
		inputItem: itemID('Air rune'),
		tokkulReturn: 1,
		tokkulCost: 6,
		aliases: ['air']
	},
	{
		name: 'Earth rune',
		inputItem: itemID('Earth rune'),
		tokkulReturn: 1,
		tokkulCost: 6,
		aliases: ['earth']
	},
	{
		name: 'Mind rune',
		inputItem: itemID('Mind rune'),
		tokkulReturn: 1,
		tokkulCost: 4,
		aliases: ['mind']
	},
	{
		name: 'Body rune',
		inputItem: itemID('Body rune'),
		tokkulReturn: 1,
		tokkulCost: 4,
		aliases: ['body']
	},
	{
		name: 'Chaos rune',
		inputItem: itemID('Chaos rune'),
		tokkulReturn: 9,
		tokkulCost: 135,
		aliases: ['chaos']
	},
	{
		name: 'Death rune',
		inputItem: itemID('Death rune'),
		tokkulReturn: 18,
		tokkulCost: 270,
		aliases: ['death']
	}
];

export default TokkulShopItems;
