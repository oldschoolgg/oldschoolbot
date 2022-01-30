import itemID from '../../util/itemID';

interface TokkulShopItem {
	name: string;
	inputItem: number;
	tokkulReturn: number;
	tokkulCost?: number;
	diaryTokkulCost?: number;
	diaryTokkulReturn?: number;
	aliases?: string[];
	requireFireCape?: boolean;
	buyLimitFactor?: number;
}

const TokkulShopItems: TokkulShopItem[] = [
	// Ore and Gem Store
	{
		name: 'Tin ore',
		inputItem: itemID('Tin ore'),
		tokkulReturn: 1,
		tokkulCost: 4,
		diaryTokkulReturn: 1,
		diaryTokkulCost: 3,
		aliases: ['tin'],
		buyLimitFactor: 500
	},
	{
		name: 'Copper ore',
		inputItem: itemID('Copper ore'),
		tokkulReturn: 1,
		tokkulCost: 4,
		diaryTokkulReturn: 1,
		diaryTokkulCost: 3,
		aliases: ['copper'],
		buyLimitFactor: 500
	},
	{
		name: 'Iron ore',
		inputItem: itemID('Iron ore'),
		tokkulReturn: 1,
		tokkulCost: 25,
		diaryTokkulReturn: 3,
		diaryTokkulCost: 22,
		aliases: ['iron'],
		buyLimitFactor: 500
	},
	{
		name: 'Silver ore',
		inputItem: itemID('Silver ore'),
		tokkulReturn: 7,
		diaryTokkulReturn: 15,
		aliases: ['silver'],
		buyLimitFactor: 500
	},
	{
		name: 'Coal',
		inputItem: itemID('Coal'),
		tokkulReturn: 4,
		diaryTokkulReturn: 9,
		buyLimitFactor: 800
	},
	{
		name: 'Gold ore',
		inputItem: itemID('Gold ore'),
		tokkulReturn: 15,
		diaryTokkulReturn: 34,
		aliases: ['gold'],
		buyLimitFactor: 600
	},
	{
		name: 'Mithril ore',
		inputItem: itemID('Mithril ore'),
		tokkulReturn: 16,
		diaryTokkulReturn: 37,
		aliases: ['mithril'],
		buyLimitFactor: 500
	},
	{
		name: 'Adamantite ore',
		inputItem: itemID('Adamantite ore'),
		tokkulReturn: 40,
		diaryTokkulReturn: 93,
		aliases: ['adamantite', 'adamant', 'addy'],
		buyLimitFactor: 300
	},
	{
		name: 'Runite ore',
		inputItem: itemID('Runite ore'),
		tokkulReturn: 320,
		diaryTokkulReturn: 746,
		aliases: ['runite', 'rune ore', 'rune'],
		buyLimitFactor: 200
	},
	{
		name: 'Uncut sapphire',
		inputItem: itemID('Uncut sapphire'),
		tokkulReturn: 2,
		tokkulCost: 37,
		diaryTokkulReturn: 5,
		diaryTokkulCost: 32,
		aliases: ['sapphire'],
		buyLimitFactor: 30
	},
	{
		name: 'Uncut emerald',
		inputItem: itemID('Uncut emerald'),
		tokkulReturn: 5,
		tokkulCost: 75,
		diaryTokkulReturn: 11,
		diaryTokkulCost: 65,
		aliases: ['emerald'],
		buyLimitFactor: 30
	},
	{
		name: 'Uncut ruby',
		inputItem: itemID('Uncut ruby'),
		tokkulReturn: 10,
		diaryTokkulReturn: 23,
		aliases: ['ruby'],
		buyLimitFactor: 30
	},
	{
		name: 'Uncut diamond',
		inputItem: itemID('Uncut diamond'),
		tokkulReturn: 20,
		diaryTokkulReturn: 46,
		aliases: ['diamond'],
		buyLimitFactor: 20
	},
	{
		name: 'Uncut dragonstone',
		inputItem: itemID('Uncut dragonstone'),
		tokkulReturn: 100,
		diaryTokkulReturn: 233,
		buyLimitFactor: 10
	},
	{
		name: 'Uncut onyx',
		inputItem: itemID('Uncut onyx'),
		tokkulReturn: 20_000,
		tokkulCost: 300_000,
		diaryTokkulReturn: 46_662,
		diaryTokkulCost: 260_000,
		aliases: ['onyx'],
		buyLimitFactor: 3
	},
	{
		name: 'Onyx bolt tips',
		inputItem: itemID('Onyx bolt tips'),
		tokkulReturn: 100,
		tokkulCost: 1500,
		diaryTokkulReturn: 233,
		diaryTokkulCost: 1300,
		aliases: ['onyx tips', 'onix bolts'],
		buyLimitFactor: 100
	},
	// Equipment Store
	{
		name: 'Obsidian throwing ring',
		inputItem: itemID('Toktz-xil-ul'),
		tokkulReturn: 25,
		tokkulCost: 375,
		diaryTokkulReturn: 57,
		diaryTokkulCost: 325,
		aliases: ['toktz-xil-ul']
	},
	{
		name: 'Obsidian sword',
		inputItem: itemID('Toktz-xil-ak'),
		tokkulReturn: 4000,
		tokkulCost: 60_000,
		diaryTokkulReturn: 9332,
		diaryTokkulCost: 52_000,
		aliases: ['toktz-xil-ak']
	},
	{
		name: 'Obsidian dagger',
		inputItem: itemID('Toktz-xil-ek'),
		tokkulReturn: 2500,
		tokkulCost: 37_500,
		diaryTokkulReturn: 5827,
		diaryTokkulCost: 32_500,
		aliases: ['toktz-xil-ek']
	},
	{
		name: 'Obsidian maul',
		inputItem: itemID('Tzhaar-ket-om'),
		tokkulReturn: 5000,
		tokkulCost: 75_001,
		diaryTokkulReturn: 11_665,
		diaryTokkulCost: 65_001,
		aliases: ['tzhaar-ket-om']
	},
	{
		name: 'Obsidian staff',
		inputItem: itemID('Toktz-mej-tal'),
		tokkulReturn: 3500,
		tokkulCost: 52_500,
		diaryTokkulReturn: 8166,
		diaryTokkulCost: 45_500,
		aliases: ['toktz-mej-tal']
	},
	{
		name: 'Obsidian mace',
		inputItem: itemID('Tzhaar-ket-em'),
		tokkulReturn: 3000,
		tokkulCost: 45_000,
		diaryTokkulReturn: 7000,
		diaryTokkulCost: 39_000,
		aliases: ['tzhaar-ket-em']
	},
	{
		name: 'Obsidian cape',
		inputItem: itemID('Obsidian cape'),
		tokkulReturn: 6000,
		tokkulCost: 90_000,
		diaryTokkulReturn: 14_000,
		diaryTokkulCost: 78_000,
		aliases: ['obby cape']
	},
	{
		name: 'Obsidian shield',
		inputItem: itemID('Toktz-ket-xil'),
		tokkulReturn: 4500,
		tokkulCost: 67_500,
		diaryTokkulReturn: 10_500,
		diaryTokkulCost: 58_500,
		aliases: ['toktz-ket-xil', 'obby shield']
	},
	{
		name: 'Obsidian helmet',
		inputItem: itemID('Obsidian helmet'),
		tokkulReturn: 5632,
		tokkulCost: 84_480,
		diaryTokkulReturn: 13_141,
		diaryTokkulCost: 73_216,
		aliases: ['obby helmet'],
		requireFireCape: true
	},
	{
		name: 'Obsidian platebody',
		inputItem: itemID('Obsidian platebody'),
		tokkulReturn: 8400,
		tokkulCost: 126_000,
		diaryTokkulReturn: 19_600,
		diaryTokkulCost: 109_200,
		aliases: ['obby platebody'],
		requireFireCape: true
	},
	{
		name: 'Obsidian platelegs',
		inputItem: itemID('Obsidian platelegs'),
		tokkulReturn: 6700,
		tokkulCost: 100_500,
		diaryTokkulReturn: 15_633,
		diaryTokkulCost: 87_100,
		aliases: ['obby platelegs'],
		requireFireCape: true
	},
	// Runes
	{
		name: 'Fire rune',
		inputItem: itemID('Fire rune'),
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['fire'],
		buyLimitFactor: 5000
	},
	{
		name: 'Water rune',
		inputItem: itemID('Water rune'),
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['water'],
		buyLimitFactor: 5000
	},
	{
		name: 'Air rune',
		inputItem: itemID('Air rune'),
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['air'],
		buyLimitFactor: 5000
	},
	{
		name: 'Earth rune',
		inputItem: itemID('Earth rune'),
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['earth'],
		buyLimitFactor: 5000
	},
	{
		name: 'Mind rune',
		inputItem: itemID('Mind rune'),
		tokkulReturn: 1,
		tokkulCost: 4,
		diaryTokkulReturn: 1,
		diaryTokkulCost: 3,
		aliases: ['mind'],
		buyLimitFactor: 5000
	},
	{
		name: 'Body rune',
		inputItem: itemID('Body rune'),
		tokkulReturn: 1,
		tokkulCost: 4,
		diaryTokkulReturn: 1,
		diaryTokkulCost: 3,
		aliases: ['body'],
		buyLimitFactor: 5000
	},
	{
		name: 'Chaos rune',
		inputItem: itemID('Chaos rune'),
		tokkulReturn: 9,
		tokkulCost: 135,
		diaryTokkulReturn: 20,
		diaryTokkulCost: 117,
		aliases: ['chaos'],
		buyLimitFactor: 5000
	},
	{
		name: 'Death rune',
		inputItem: itemID('Death rune'),
		tokkulReturn: 18,
		tokkulCost: 270,
		diaryTokkulReturn: 42,
		diaryTokkulCost: 234,
		aliases: ['death'],
		buyLimitFactor: 5000
	}
];

export default TokkulShopItems;
