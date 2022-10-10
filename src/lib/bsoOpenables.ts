import { randArrItem, roll } from 'e';
import { Bank, Items, LootTable } from 'oldschooljs';
import TreeHerbSeedTable from 'oldschooljs/dist/simulation/subtables/TreeHerbSeedTable';

import { Emoji } from './constants';
import {
	allPetIDs,
	chambersOfXericCL,
	cmbClothes,
	customBossesDropsThatCantBeDroppedInMBs,
	theatreOfBloodHardUniques,
	theatreOfBloodNormalUniques
} from './data/CollectionsExport';
import { baseHolidayItems, PartyhatTable } from './data/holidayItems';
import { FishTable } from './minions/data/killableMonsters/custom/SeaKraken';
import { UnifiedOpenable } from './openables';
import { ChimplingImpling, EternalImpling, InfernalImpling, MysteryImpling } from './simulation/customImplings';
import { RuneTable } from './simulation/seedTable';
import { ExoticSeedsTable } from './simulation/sharedTables';
import { clAdjustedDroprate } from './util';
import getOSItem from './util/getOSItem';
import itemID from './util/itemID';
import resolveItems from './util/resolveItems';
import { LampTable } from './xpLamps';

const MR_E_DROPRATE_FROM_UMB_AND_TMB = 5000;
const MR_E_DROPRATE_FROM_PMB = 200;
const MR_E_DROPRATE_FROM_EMB = 500;

export const MysteryBoxes = new LootTable()
	.oneIn(55, 'Pet Mystery Box')
	.oneIn(165, 'Holiday Mystery Box')
	.oneIn(35, 'Equippable mystery box')
	.oneIn(35, 'Clothing Mystery Box')
	.add('Tradeable Mystery Box')
	.add('Untradeable Mystery Box');

export const magicCreateCrate = new LootTable()
	.add('Pure essence', [500, 1000], 4)
	.add(ExoticSeedsTable)
	.add('Coins', [50_000, 1_000_000])
	.tertiary(150, 'Magus scroll')
	.tertiary(100, LampTable)
	.add('Clue scroll (beginner)', 1, 2)
	.add('Clue scroll (easy)', 1, 2)
	.add('Clue scroll (medium)', 1)
	.add(RuneTable, [1, 10], 3);

export const PMBTable = new LootTable()
	.oneIn(MR_E_DROPRATE_FROM_PMB, 'Mr. E')
	.add('Heron')
	.add('Rock golem')
	.add('Beaver')
	.add('Baby chinchompa')
	.add('Giant squirrel')
	.add('Tangleroot')
	.add('Rocky')
	.add('Rift guardian')
	.add("Pet k'ril tsutsaroth")
	.add('Pet general graardor')
	.add('Pet zilyana')
	.add("Pet kree'arra")
	.add('Pet dagannoth rex')
	.add('Pet dagannoth prime')
	.add('Pet dagannoth supreme')
	.add('Pet snakeling')
	.add('Vorki')
	.add('Pet dark core')
	.add('Olmlet')
	.add("Lil' zik")
	.add('Kalphite princess')
	.add('Baby mole')
	.add('Sraracha')
	.add("Vet'ion jr.")
	.add('Callisto cub')
	.add('Venenatis spiderling')
	.add("Scorpia's offspring")
	.add('Prince black dragon')
	.add('Pet chaos elemental')
	.add('Skotos')
	.add('Tzrek-jad')
	.add('Jal-nib-rek')
	.add('Noon')
	.add('Abyssal orphan')
	.add('Pet kraken')
	.add('Hellpuppy')
	.add('Pet smoke devil')
	.add('Ikkle hydra')
	.add('Bloodhound')
	.add('Herbi')
	.add('Chompy chick')
	.add('Pet penance queen')
	.add('Phoenix')
	.add('Smolcano')
	.add('Youngllef')
	.add('Little nightmare')
	.add("Lil' creator")
	.add('Tiny tempor')
	.add('Abyssal protector');

const DwarvenCrateTable = new LootTable()
	.add('Dwarven ore')
	.add('Dwarven stout', 2, 2)
	.add('Dwarven lore', 2)
	.add('Dwarven rock cake', 2)
	.add('Dwarven helmet', 1, 3)
	.add('Hammer', 1, 5)
	.add('Steel pickaxe')
	.add('Pickaxe handle', 1, 3)
	.add('Beer', 1, 3)
	.add('Kebab', 1, 3);

const BlacksmithCrateTable = new LootTable()
	.add('Blacksmith helmet')
	.add('Blacksmith top')
	.add('Blacksmith apron')
	.add('Blacksmith gloves')
	.add('Blacksmith boots');

export const BlacksmithOutfit = BlacksmithCrateTable.allItems;

export const SpoilsOfWarBaseTable = new LootTable()
	.add('Pure essence', [4000, 6000], 6)
	.add('Coins', [20_000, 30_000], 5)
	.add('Raw lobster', [30, 60], 5)
	.add('Raw swordfish', [30, 60], 5)
	.add('Raw shark', [30, 60], 5)
	.add('Blood rune', [150, 300], 5)
	.add('Death rune', [150, 300], 5)
	.add('Nature rune', [150, 300], 5)
	.add('Adamant bolts', [200, 400], 5)
	.add('Runite bolts', [100, 200], 5)
	.add('Adamant arrow', [200, 400], 5)
	.add('Rune arrow', [100, 200], 5)
	.add('Coal', [150, 300], 5)
	.add('Mithril ore', [80, 100], 5)
	.add('Coins', [2000, 3000], 4)
	.add('Uncut ruby', [15, 30], 4)
	.add('Uncut diamond', [15, 30], 4)
	.add('Soul rune', [150, 300], 2)
	.add('Soul rune', [500, 600], 2)
	.add('Rune full helm')
	.add('Rune platebody')
	.add('Rune platelegs')
	.add('Runite ore', [4, 8])
	.add('Tooth half of key')
	.add('Loop half of key')
	.add('Snapdragon seed')
	.add('Ranarr seed')
	.add(
		new LootTable()
			.add('Dragon med helm')
			.add('Dragon scimitar')
			.add('Dragon mace')
			.add('Dragon dagger')
			.add('Dragon longsword')
			.add('Bones')
			.add('Cabbage')
	);

export const SpoilsOfWarTable = new LootTable().tertiary(400, "Lil' creator").every(SpoilsOfWarBaseTable, 3);

export const NestBoxes = new LootTable()
	.add('Nest box (seeds)', 1, 12)
	.add('Nest box (ring)', 1, 5)
	.add('Nest box (empty)', 1, 3);

const baseTGBTable = new LootTable()
	.add('Tradeable mystery box', [1, 3])
	.add('Reward casket (master)', [3, 6])
	.add('Reward casket (beginner)', [3, 9])
	.add('Reward casket (hard)', [3, 7])
	.add('Dwarven crate', 2)
	.add(NestBoxes, 100)
	.add('Holiday Mystery box')
	.add('Pet Mystery box')
	.add('Untradeable Mystery box')
	.add('Abyssal dragon bones', [100, 500], 2)
	.add('Coins', [20_000_000, 100_000_000], 2)
	.add(LampTable, [1, 3])
	.add('Clue scroll (beginner)', [5, 10], 2)
	.add('Clue scroll (easy)', [4, 9], 2)
	.add('Clue scroll (medium)', [4, 9], 2)
	.add('Clue scroll (hard)', [3, 6], 2)
	.add('Clue scroll (elite)', [4, 9], 2)
	.add('Clue scroll (master)', [2, 5], 2)
	.add('Manta ray', [100, 600], 2)
	.add(FishTable, [1, 15])
	.add(TreeHerbSeedTable, [1, 15])
	.add('Prayer potion(4)', [5, 40])
	.add('Saradomin brew(4)', [5, 40])
	.add('Super restore(4)', [5, 20])
	.add('Monkey nuts', 2)
	.add('Shark', [100, 200], 2)
	.add('Beer', [500, 5000])
	.add('Tchiki monkey nuts')
	.add('Magic seed', [20, 50]);

const testerGiftTable = new LootTable()
	.every(baseTGBTable, [3, 7])
	.every('Clue scroll (grandmaster)', [1, 3])
	.every(LampTable, [1, 2])
	.add('Rocktail', [30, 60])
	.add('Tradeable mystery box', [1, 3])
	.add(baseTGBTable);

export const IronmanPMBTable = new LootTable()
	.add(PMBTable, 1, PMBTable.length)
	.add('Smokey')
	.add('Craig')
	.add('Hoppy')
	.add('Flappy')
	.add('Cob');

const MonkeyCrateTable = new LootTable()
	.add('Avocado seed', [2, 5], 2)
	.add('Lychee seed', [2, 5], 2)
	.add('Mango seed', [2, 5])
	.add('Magic banana')
	.add(
		new LootTable()
			.add('Clue scroll (hard)')
			.add('Clue scroll (elite)')
			.add('Clue scroll (master)')
			.add('Clue scroll (grandmaster)')
	)
	.add(MysteryBoxes)
	.add(LampTable);

const FestivePresentTable = new LootTable()
	.tertiary(50, 'Seer')
	.tertiary(20, 'Frozen santa hat')
	.tertiary(3, 'Golden shard')
	.tertiary(4, 'Festive jumper')
	.add('Toy soldier')
	.add('Toy doll')
	.add('Toy cat');

const IndependenceBoxTable = new LootTable().add('Fireworks').add('Fireworks').add('Liber tea').add("Sam's hat");

export const spookyEpic = new LootTable().add('Spooky partyhat').add('Orange halloween mask');
const spookyRare = new LootTable()
	.add('Necronomicon')
	.add("M'eye hat")
	.add('Back pain')
	.add('Witch hat')
	.add('Spooky mask');
const spookyCommon = new LootTable()
	.add('Toffeet')
	.add('Chocolified skull')
	.add('Eyescream')
	.add("Choc'rock")
	.add('Rotten sweets')
	.add('Gloom and doom potion')
	.add('Handled candle');

export const spookyTable = new LootTable().add(spookyEpic, 1, 1).add(spookyRare, 1, 3).add(spookyCommon, 1, 8);

const RoyalMysteryBoxTable = new LootTable().add('Diamond crown', 1, 2).add('Diamond sceptre', 1, 2).add('Corgi');
const GamblersBagTable = new LootTable()
	.add('4 sided die', 1, 6)
	.add('6 sided die', 1, 6)
	.add('8 sided die', 1, 4)
	.add('10 sided die', 1, 4)
	.add('12 sided die', 1, 3)
	.add('20 sided die', 1, 3)
	.add('100 sided die');

const BirthdayPackTable = new LootTable()
	.add('Glass of bubbly')
	.add('Party horn')
	.add('Party popper')
	.add('Party cake')
	.add('Sparkler', [2, 10])
	.add('Party music box')
	.tertiary(20, 'Cake hat');

export const BeachMysteryBoxTable = new LootTable()
	.add('Snappy the Turtle')
	.add('Beach ball')
	.add('Water balloon')
	.add('Ice cream')
	.add('Crab hat');

const ClothingMysteryBoxTable = new LootTable();
for (const item of cmbClothes) ClothingMysteryBoxTable.add(item);

const cantBeDropped = resolveItems([
	'Abyssal pouch',
	'Dwarven crate',
	'Halloween mask set',
	'Partyhat set',
	'Ancestral robes set',
	'Kodai wand',
	'Twisted ancestral hat',
	'Twisted ancestral robe top',
	'Twisted ancestral robe bottom',
	'Partyhat & specs',
	'Dwarven warhammer',
	'Dwarven ore',
	'Dwarven bar',
	'Dwarven pickaxe',
	'Dwarven greataxe',
	'Dwarven greathammer',
	'Dwarven gauntlets',
	'Dwarven knife',
	'Dwarven blessing',
	'Helm of raedwald',
	'Clue hunter garb',
	'Clue hunter gloves',
	'Clue hunter trousers',
	'Clue hunter boots',
	'Clue hunter cloak',
	'Cob',
	'Bank lottery ticket',
	'Tester gift box',
	'Coins',
	22_664, // JMOD Scythe of Vitur,
	'Red Partyhat',
	'Yellow partyhat',
	'Blue partyhat',
	'Purple partyhat',
	'Green partyhat',
	'White partyhat',
	'Christmas cracker',
	'Santa hat',
	'Ancient emblem',
	'Bloodsoaked feather',
	'Bandosian components',
	'Masori headdress',
	"Osmumten's fang",
	'Nihil shard',
	'Ancient godsword',
	'Nihil dust',
	'Ancient hilt',
	'Nihil horn',
	'Zaryte crossbow',
	'Zaryte vambraces',
	'Justiciar armour set',
	...allPetIDs,
	...PMBTable.allItems,
	...baseHolidayItems.allItems,
	...chambersOfXericCL,
	...customBossesDropsThatCantBeDroppedInMBs,
	...PartyhatTable.allItems,
	...BirthdayPackTable.allItems,
	...GamblersBagTable.allItems,
	...RoyalMysteryBoxTable.allItems,
	...BeachMysteryBoxTable.allItems,
	...IndependenceBoxTable.allItems,
	...cmbClothes,
	...theatreOfBloodHardUniques,
	...theatreOfBloodNormalUniques
]);

export const tmbTable: number[] = [];
export const umbTable: number[] = [];
export const embTable: number[] = [];
for (const item of Items.values()) {
	if (item.customItemData?.cantDropFromMysteryBoxes === true) {
		cantBeDropped.push(item.id);
		continue;
	}

	if ((item.id >= 40_000 && item.id <= 50_000) || cantBeDropped.includes(item.id)) {
		continue;
	}

	if (
		item.tradeable_on_ge ||
		(Boolean(item.tradeable) && Boolean(item.equipable_by_player) && Boolean(item.equipment?.slot))
	) {
		tmbTable.push(item.id);
	} else if (!item.tradeable) {
		umbTable.push(item.id);
	}
	if (Boolean(item.equipable_by_player) && Boolean(item.equipment?.slot)) {
		embTable.push(item.id);
	}
}

export const allMbTables = [...new Set([...tmbTable, ...umbTable, ...embTable])];

function makeOutputFromArrayOfItemIDs(fn: () => number, quantity: number) {
	const loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		loot.add(fn());
	}
	return { bank: loot };
}

export const bsoOpenables: UnifiedOpenable[] = [
	{
		name: 'Tradeables Mystery box',
		id: 6199,
		openedItem: getOSItem(6199),
		aliases: ['mystery', 'mystery box', 'tradeables mystery box', 'tmb'],

		output: async ({ user, quantity, totalLeaguesPoints }) => ({
			bank: getMysteryBoxItem(user, totalLeaguesPoints, true, quantity)
		}),
		emoji: Emoji.MysteryBox,
		allItems: [],
		isMysteryBox: true,
		smokeyApplies: true
	},
	{
		name: 'Untradeables Mystery box',
		id: 19_939,
		openedItem: getOSItem(19_939),
		aliases: ['untradeables mystery box', 'umb'],
		output: async ({ user, quantity, totalLeaguesPoints }) => ({
			bank: getMysteryBoxItem(user, totalLeaguesPoints, false, quantity)
		}),
		allItems: [],
		isMysteryBox: true,
		smokeyApplies: true
	},
	{
		name: 'Equippable mystery box',
		id: itemID('Equippable mystery box'),
		openedItem: getOSItem('Equippable mystery box'),
		aliases: ['equippable mystery box', 'emb'],
		output: async ({ quantity }) => makeOutputFromArrayOfItemIDs(randomEquippable, quantity),
		allItems: [],
		isMysteryBox: true,
		smokeyApplies: true
	},
	{
		name: 'Clothing Mystery Box',
		id: 50_421,
		openedItem: getOSItem(50_421),
		aliases: ['cmb', 'clothing mystery box'],
		output: ClothingMysteryBoxTable,
		allItems: ClothingMysteryBoxTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Holiday Mystery box',
		id: 3713,
		openedItem: getOSItem(3713),
		aliases: ['holiday mystery box', 'hmb', 'holiday', 'holiday item mystery box', 'himb'],
		output: baseHolidayItems,
		allItems: baseHolidayItems.allItems,
		smokeyApplies: true
	},
	{
		name: 'Pet Mystery box',
		id: 3062,
		openedItem: getOSItem(3062),
		aliases: ['pet mystery box', 'pmb'],
		output: async ({ user, quantity }) => ({
			bank: user.isIronman ? IronmanPMBTable.roll(quantity) : PMBTable.roll(quantity)
		}),
		allItems: PMBTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Tester Gift box',
		id: itemID('Tester gift box'),
		openedItem: getOSItem('Tester Gift box'),
		aliases: ['tester gift box', 'tgb'],
		output: testerGiftTable,
		allItems: testerGiftTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Dwarven crate',
		id: itemID('Dwarven crate'),
		openedItem: getOSItem('Dwarven crate'),
		aliases: ['dwarven crate', 'dc'],
		output: DwarvenCrateTable,
		allItems: DwarvenCrateTable.allItems
	},
	{
		name: 'Blacksmith crate',
		id: itemID('Blacksmith crate'),
		openedItem: getOSItem('Blacksmith crate'),
		aliases: ['blacksmith crate', 'bsc'],
		output: BlacksmithCrateTable,
		allItems: BlacksmithCrateTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Birthday pack',
		id: itemID('Birthday pack'),
		openedItem: getOSItem('Birthday pack'),
		aliases: ['bp', 'birthday pack'],
		output: BirthdayPackTable,
		allItems: BirthdayPackTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Gamblers bag',
		id: itemID('Gamblers bag'),
		openedItem: getOSItem('Gamblers bag'),
		aliases: ['gamblers bag', 'gb'],
		output: GamblersBagTable,
		allItems: GamblersBagTable.allItems,
		smokeyApplies: true,
		excludeFromOpenAll: true
	},
	{
		name: 'Royal mystery box',
		id: itemID('Royal mystery box'),
		openedItem: getOSItem('Royal mystery box'),
		aliases: ['royal mystery box', 'rmb'],
		output: RoyalMysteryBoxTable,
		allItems: RoyalMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Beach mystery box',
		id: itemID('Beach mystery box'),
		openedItem: getOSItem('Beach mystery box'),
		aliases: ['Beach mystery box', 'bmb'],
		output: BeachMysteryBoxTable,
		allItems: BeachMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Independence box',
		id: itemID('Independence box'),
		openedItem: getOSItem('Independence box'),
		aliases: ['independence box'],
		output: IndependenceBoxTable,
		allItems: IndependenceBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Magic crate',
		id: itemID('Magic crate'),
		openedItem: getOSItem('Magic crate'),
		aliases: ['magic crate'],
		output: magicCreateCrate,
		allItems: magicCreateCrate.allItems,
		smokeyApplies: true
	},
	{
		name: 'Monkey crate',
		id: itemID('Monkey crate'),
		openedItem: getOSItem('Monkey crate'),
		aliases: ['monkey crate'],
		output: MonkeyCrateTable,
		emoji: '<:Monkey_crate:885774318041202708>',
		allItems: MonkeyCrateTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Festive present',
		id: itemID('Festive present'),
		openedItem: getOSItem('Festive present'),
		aliases: ['festive present'],
		output: FestivePresentTable,
		allItems: FestivePresentTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Chimpling jar',
		id: itemID('Chimpling jar'),
		openedItem: getOSItem('Chimpling jar'),
		aliases: ChimplingImpling.aliases,
		output: ChimplingImpling.table,
		allItems: ChimplingImpling.table.allItems
	},
	{
		name: 'Mystery impling jar',
		id: itemID('Mystery impling jar'),
		openedItem: getOSItem('Mystery impling jar'),
		aliases: MysteryImpling.aliases,
		output: MysteryImpling.table,
		allItems: MysteryImpling.table.allItems
	},
	{
		name: 'Eternal impling jar',
		id: itemID('Eternal impling jar'),
		openedItem: getOSItem('Eternal impling jar'),
		aliases: EternalImpling.aliases,
		output: EternalImpling.table,
		allItems: EternalImpling.table.allItems
	},
	{
		name: 'Infernal impling jar',
		id: itemID('Infernal impling jar'),
		openedItem: getOSItem('Infernal impling jar'),
		aliases: InfernalImpling.aliases,
		output: InfernalImpling.table,
		allItems: InfernalImpling.table.allItems
	},
	{
		name: 'Spooky box',
		id: itemID('Spooky box'),
		openedItem: getOSItem('Spooky box'),
		aliases: ['spooky box'],
		output: spookyTable,
		allItems: spookyTable.allItems
	}
];

function randomEquippable(): number {
	const res = randArrItem(embTable);
	if (cantBeDropped.includes(res)) return randomEquippable();
	if (res >= 40_000 && res <= 50_000) return randomEquippable();
	if (roll(MR_E_DROPRATE_FROM_EMB)) {
		return itemID('Mr. E');
	}
	return res;
}

function findMysteryBoxItem(table: number[]): number {
	let result = randArrItem(table);
	if (cantBeDropped.includes(result)) return findMysteryBoxItem(table);
	if (result >= 40_000 && result <= 50_000) return findMysteryBoxItem(table);
	return result;
}

const leaguesUnlockedMysteryBoxItems = [
	{
		item: getOSItem('Fuzzy dice'),
		unlockedAt: 5000
	},
	{
		item: getOSItem('Karambinana'),
		unlockedAt: 10_000
	}
];

export function getMysteryBoxItem(
	user: MUser,
	totalLeaguesPoints: number,
	tradeables: boolean,
	quantity: number
): Bank {
	const mrEDroprate = clAdjustedDroprate(user, 'Mr. E', MR_E_DROPRATE_FROM_UMB_AND_TMB, 1.2);
	const table = tradeables ? tmbTable : umbTable;
	let loot = new Bank();

	const elligibleLeaguesRewards = leaguesUnlockedMysteryBoxItems
		.filter(i => totalLeaguesPoints >= i.unlockedAt)
		.map(i => ({ ...i, dropRate: clAdjustedDroprate(user, i.item.id, 500, 1.5) }));

	outer: for (let i = 0; i < quantity; i++) {
		if (roll(mrEDroprate)) {
			loot.add('Mr. E');
			continue;
		}
		for (const leagueReward of elligibleLeaguesRewards) {
			if (roll(leagueReward.dropRate)) {
				loot.add(leagueReward.item.id);
				continue outer;
			}
		}
		loot.add(findMysteryBoxItem(table));
	}

	return loot;
}
