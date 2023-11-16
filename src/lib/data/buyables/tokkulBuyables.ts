import itemID from '../../util/itemID';

interface BaseTKSItem {
	name: string;
	itemID: number;
	stock?: number;
	rinShopStock?: number;
	rinIMShopStock?: number;
	aliases?: string[];
	requireFireCape?: boolean;
}

interface TokkulShopItem extends BaseTKSItem {
	tokkulCost?: number;
	tokkulReturn: number;
	diaryTokkulCost?: number;
	diaryTokkulReturn?: number;
}

const TokkulShopItems: TokkulShopItem[] = [
	// Ore and Gem Store
	{
		name: 'Tin ore',
		itemID: itemID('Tin ore'),
		stock: 5,
		rinShopStock: 25,
		tokkulCost: 4,
		tokkulReturn: 0,
		diaryTokkulCost: 3,
		diaryTokkulReturn: 1,
		aliases: ['tin']
	},
	{
		name: 'Copper ore',
		itemID: itemID('Copper ore'),
		stock: 5,
		rinShopStock: 25,
		tokkulCost: 4,
		tokkulReturn: 0,
		diaryTokkulCost: 3,
		diaryTokkulReturn: 1,
		aliases: ['copper']
	},
	{
		name: 'Iron ore',
		itemID: itemID('Iron ore'),
		stock: 2,
		rinShopStock: 12,
		tokkulCost: 25,
		tokkulReturn: 2,
		diaryTokkulCost: 22,
		diaryTokkulReturn: 5,
		aliases: ['iron']
	},
	{
		name: 'Silver ore',
		itemID: itemID('Silver ore'),
		rinShopStock: 15,
		tokkulCost: 112,
		tokkulReturn: 11,
		diaryTokkulCost: 97,
		diaryTokkulReturn: 26,
		aliases: ['silver']
	},
	{
		name: 'Coal',
		itemID: itemID('Coal'),
		rinShopStock: 20,
		tokkulCost: 67,
		tokkulReturn: 6,
		diaryTokkulCost: 58,
		diaryTokkulReturn: 15,
		aliases: ['coal']
	},
	{
		name: 'Gold ore',
		itemID: itemID('Gold ore'),
		rinShopStock: 12,
		tokkulCost: 225,
		tokkulReturn: 22,
		diaryTokkulCost: 195,
		diaryTokkulReturn: 52,
		aliases: ['gold']
	},
	{
		name: 'Mithril ore',
		itemID: itemID('Mithril ore'),
		rinShopStock: 4,
		tokkulCost: 243,
		tokkulReturn: 24,
		diaryTokkulCost: 210,
		diaryTokkulReturn: 56,
		aliases: ['mithril']
	},
	{
		name: 'Adamantite ore',
		itemID: itemID('Adamantite ore'),
		rinShopStock: 2,
		tokkulCost: 600,
		tokkulReturn: 60,
		diaryTokkulCost: 520,
		diaryTokkulReturn: 140,
		aliases: ['adamantite', 'adamant', 'addy']
	},
	{
		name: 'Runite ore',
		itemID: itemID('Runite ore'),
		rinShopStock: 1,
		tokkulCost: 4800,
		tokkulReturn: 480,
		diaryTokkulCost: 4160,
		diaryTokkulReturn: 1120,
		aliases: ['runite', 'rune ore', 'rune']
	},
	{
		name: 'Uncut sapphire',
		itemID: itemID('Uncut sapphire'),
		stock: 1,
		rinShopStock: 16,
		rinIMShopStock: 10,
		tokkulCost: 37,
		tokkulReturn: 3,
		diaryTokkulCost: 32,
		diaryTokkulReturn: 8,
		aliases: ['sapphire']
	},
	{
		name: 'Uncut emerald',
		itemID: itemID('Uncut emerald'),
		stock: 1,
		rinShopStock: 12,
		rinIMShopStock: 7,
		tokkulCost: 75,
		tokkulReturn: 7,
		diaryTokkulCost: 65,
		diaryTokkulReturn: 17,
		aliases: ['emerald']
	},
	{
		name: 'Uncut ruby',
		itemID: itemID('Uncut ruby'),
		rinShopStock: 8,
		rinIMShopStock: 4,
		tokkulCost: 150,
		tokkulReturn: 15,
		diaryTokkulCost: 130,
		diaryTokkulReturn: 35,
		aliases: ['ruby']
	},
	{
		name: 'Uncut diamond',
		itemID: itemID('Uncut diamond'),
		rinShopStock: 6,
		rinIMShopStock: 2,
		tokkulCost: 300,
		tokkulReturn: 30,
		diaryTokkulCost: 260,
		diaryTokkulReturn: 70,
		aliases: ['diamond']
	},
	{
		name: 'Uncut dragonstone',
		itemID: itemID('Uncut dragonstone'),
		tokkulReturn: 150,
		diaryTokkulReturn: 350,
		aliases: ['dragonstone']
	},
	{
		name: 'Uncut onyx',
		itemID: itemID('Uncut onyx'),
		stock: 1,
		tokkulCost: 300_000,
		tokkulReturn: 30_000,
		diaryTokkulCost: 260_000,
		diaryTokkulReturn: 70_000,
		aliases: ['onyx']
	},
	{
		name: 'Onyx bolt tips',
		itemID: itemID('Onyx bolt tips'),
		stock: 50,
		tokkulCost: 1500,
		tokkulReturn: 150,
		diaryTokkulCost: 1300,
		diaryTokkulReturn: 350,
		aliases: ['onyx tips', 'onix bolts']
	},
	// Equipment Store
	{
		name: 'Obsidian throwing ring',
		itemID: itemID('Toktz-xil-ul'),
		stock: 500,
		tokkulReturn: 25,
		tokkulCost: 375,
		diaryTokkulReturn: 57,
		diaryTokkulCost: 325,
		aliases: ['toktz-xil-ul']
	},
	{
		name: 'Obsidian sword',
		itemID: itemID('Toktz-xil-ak'),
		stock: 1,
		tokkulReturn: 4000,
		tokkulCost: 60_000,
		diaryTokkulReturn: 9332,
		diaryTokkulCost: 52_000,
		aliases: ['toktz-xil-ak']
	},
	{
		name: 'Obsidian dagger',
		itemID: itemID('Toktz-xil-ek'),
		stock: 1,
		tokkulReturn: 2500,
		tokkulCost: 37_500,
		diaryTokkulReturn: 5827,
		diaryTokkulCost: 32_500,
		aliases: ['toktz-xil-ek']
	},
	{
		name: 'Obsidian maul',
		itemID: itemID('Tzhaar-ket-om'),
		stock: 1,
		tokkulReturn: 5000,
		tokkulCost: 75_001,
		diaryTokkulReturn: 11_665,
		diaryTokkulCost: 65_001,
		aliases: ['tzhaar-ket-om']
	},
	{
		name: 'Obsidian staff',
		itemID: itemID('Toktz-mej-tal'),
		stock: 1,
		tokkulReturn: 3500,
		tokkulCost: 52_500,
		diaryTokkulReturn: 8166,
		diaryTokkulCost: 45_500,
		aliases: ['toktz-mej-tal']
	},
	{
		name: 'Obsidian mace',
		itemID: itemID('Tzhaar-ket-em'),
		stock: 1,
		tokkulReturn: 3000,
		tokkulCost: 45_000,
		diaryTokkulReturn: 7000,
		diaryTokkulCost: 39_000,
		aliases: ['tzhaar-ket-em']
	},
	{
		name: 'Obsidian cape',
		itemID: itemID('Obsidian cape'),
		stock: 1,
		tokkulReturn: 6000,
		tokkulCost: 90_000,
		diaryTokkulReturn: 14_000,
		diaryTokkulCost: 78_000,
		aliases: ['obby cape']
	},
	{
		name: 'Obsidian shield',
		itemID: itemID('Toktz-ket-xil'),
		stock: 1,
		tokkulReturn: 4500,
		tokkulCost: 67_500,
		diaryTokkulReturn: 10_500,
		diaryTokkulCost: 58_500,
		aliases: ['toktz-ket-xil', 'obby shield']
	},
	{
		name: 'Obsidian helmet',
		itemID: itemID('Obsidian helmet'),
		stock: 1,
		tokkulReturn: 5632,
		tokkulCost: 84_480,
		diaryTokkulReturn: 13_141,
		diaryTokkulCost: 73_216,
		aliases: ['obby helmet'],
		requireFireCape: true
	},
	{
		name: 'Obsidian platebody',
		itemID: itemID('Obsidian platebody'),
		stock: 1,
		tokkulReturn: 8400,
		tokkulCost: 126_000,
		diaryTokkulReturn: 19_600,
		diaryTokkulCost: 109_200,
		aliases: ['obby platebody'],
		requireFireCape: true
	},
	{
		name: 'Obsidian platelegs',
		itemID: itemID('Obsidian platelegs'),
		stock: 1,
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
		itemID: itemID('Fire rune'),
		stock: 5000,
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['fire']
	},
	{
		name: 'Water rune',
		itemID: itemID('Water rune'),
		stock: 5000,
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['water']
	},
	{
		name: 'Air rune',
		itemID: itemID('Air rune'),
		stock: 5000,
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['air']
	},
	{
		name: 'Earth rune',
		itemID: itemID('Earth rune'),
		stock: 5000,
		tokkulReturn: 0,
		tokkulCost: 6,
		diaryTokkulReturn: 0,
		diaryTokkulCost: 5,
		aliases: ['earth']
	},
	{
		name: 'Mind rune',
		itemID: itemID('Mind rune'),
		stock: 5000,
		tokkulReturn: 1,
		tokkulCost: 4,
		diaryTokkulReturn: 1,
		diaryTokkulCost: 3,
		aliases: ['mind']
	},
	{
		name: 'Body rune',
		itemID: itemID('Body rune'),
		stock: 5000,
		tokkulReturn: 1,
		tokkulCost: 4,
		diaryTokkulReturn: 1,
		diaryTokkulCost: 3,
		aliases: ['body']
	},
	{
		name: 'Chaos rune',
		itemID: itemID('Chaos rune'),
		stock: 2500,
		tokkulReturn: 9,
		tokkulCost: 135,
		diaryTokkulReturn: 20,
		diaryTokkulCost: 117,
		aliases: ['chaos']
	},
	{
		name: 'Death rune',
		itemID: itemID('Death rune'),
		stock: 2500,
		tokkulReturn: 18,
		tokkulCost: 270,
		diaryTokkulReturn: 42,
		diaryTokkulCost: 234,
		aliases: ['death']
	}
];

export default TokkulShopItems;
