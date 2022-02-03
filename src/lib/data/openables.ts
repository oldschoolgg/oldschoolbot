import { randArrItem, roll, uniqueArr } from 'e';
import { Items } from 'oldschooljs';
import TreeHerbSeedTable from 'oldschooljs/dist/simulation/subtables/TreeHerbSeedTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../constants';
import { FishTable } from '../minions/data/killableMonsters/custom/SeaKraken';
import BirthdayPresentTable from '../simulation/birthdayPresent';
import CasketTable from '../simulation/casket';
import CrystalChestTable from '../simulation/crystalChest';
import { RuneTable } from '../simulation/seedTable';
import { ExoticSeedsTable } from '../simulation/sharedTables';
import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
import { LampTable } from '../xpLamps';
import {
	allPetIDs,
	chambersOfXericCL,
	cmbClothes,
	customBossesDropsThatCantBeDroppedInMBs,
	frozenKeyPieces
} from './CollectionsExport';
import { baseHolidayItems, PartyhatTable } from './holidayItems';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: (() => number) | LootTable;
	emoji: Emoji | string;
	excludeFromBoxes?: boolean;
}

const MR_E_DROPRATE_FROM_UMB_AND_TMB = 5000;
const MR_E_DROPRATE_FROM_PMB = 200;
const MR_E_DROPRATE_FROM_EMB = 500;

export const MysteryBoxes = new LootTable()
	.oneIn(40, 'Pet Mystery Box')
	.oneIn(150, 'Holiday Mystery Box')
	.oneIn(30, 'Equippable mystery box')
	.oneIn(30, 'Clothing Mystery Box')
	.add('Tradeable Mystery Box')
	.add('Untradeable Mystery Box');

export const odsCrate = new LootTable()
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
	.add('Tiny tempor');

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
const BaseGemBagTable = new LootTable()
	.add('Uncut sapphire', 1, 4993)
	.add('Uncut emerald', 1, 3468)
	.add('Uncut ruby', 1, 1180)
	.add('Uncut diamond', 1, 309)
	.add('Uncut dragonstone', 1, 62)
	.oneIn(100_000_000, 'Uncut onyx');

const BagFullOfGemsTable = new LootTable().every(BaseGemBagTable, 40);

const Openables: Openable[] = [
	{
		name: 'Birthday present',
		itemID: 11_918,
		aliases: ['present', 'birthday present'],
		table: BirthdayPresentTable,
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Casket',
		itemID: 405,
		aliases: ['casket'],
		table: CasketTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Crystal chest',
		itemID: 989,
		aliases: ['crystal chest', 'crystal key'],
		table: CrystalChestTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Tradeables Mystery box',
		itemID: 6199,
		aliases: ['mystery', 'mystery box', 'tradeables mystery box', 'tmb'],
		table: () => getMysteryBoxItem(true),
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Holiday Mystery box',
		itemID: 3713,
		aliases: ['holiday mystery box', 'hmb', 'holiday', 'holiday item mystery box', 'himb'],
		table: baseHolidayItems,
		emoji: Emoji.MysteryBox,
		excludeFromBoxes: true
	},
	{
		name: 'Pet Mystery box',
		itemID: 3062,
		aliases: ['pet mystery box', 'pmb'],
		table: PMBTable,
		emoji: Emoji.MysteryBox,
		excludeFromBoxes: true
	},
	{
		name: 'Untradeables Mystery box',
		itemID: 19_939,
		aliases: ['untradeables mystery box', 'umb'],
		table: () => getMysteryBoxItem(false),
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Tester Gift box',
		itemID: itemID('Tester gift box'),
		aliases: ['tester gift box', 'tgb'],
		table: testerGiftTable,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Christmas cracker',
		itemID: itemID('Christmas cracker'),
		aliases: ['cracker', 'christmas cracker'],
		table: PartyhatTable,
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Dwarven crate',
		itemID: itemID('Dwarven crate'),
		aliases: ['dwarven crate', 'dc'],
		table: DwarvenCrateTable,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Blacksmith crate',
		itemID: itemID('Blacksmith crate'),
		aliases: ['blacksmith crate', 'bsc'],
		table: BlacksmithCrateTable,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Builders supply crate',
		itemID: 24_884,
		aliases: ['builders supply crate'],
		table: new LootTable()
			.add('Oak plank', [28, 30])
			.add('Teak plank', [15, 16])
			.add('Mahogany plank', [6, 7])
			.add('Steel bar', [23, 24])
			.add('Soft clay', [45, 48])
			.add('Bolt of cloth', 15)
			.add('Limestone brick', 9),
		emoji: Emoji.Casket
	},
	{
		name: 'Infernal eel',
		itemID: 21_293,
		aliases: ['infernal eel'],
		table: new LootTable()
			.add('Tokkul', [14, 20], 86)
			.add('Lava scale shard', [1, 5], 8)
			.add('Onyx bolt tips', 1, 6),
		emoji: Emoji.Casket
	},
	{
		name: 'Birthday pack',
		itemID: itemID('Birthday pack'),
		aliases: ['bp', 'birthday pack'],
		table: new LootTable()
			.add('Glass of bubbly')
			.add('Party horn')
			.add('Party popper')
			.add('Party cake')
			.add('Sparkler', [2, 10])
			.add('Party music box')
			.tertiary(20, 'Cake hat'),
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Spoils of war',
		itemID: itemID('Spoils of war'),
		aliases: ['Spoils of war'],
		table: SpoilsOfWarTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Gamblers bag',
		itemID: itemID('Gamblers bag'),
		aliases: ['gamblers bag', 'gb'],
		table: new LootTable()
			.add('4 sided die', 1, 6)
			.add('6 sided die', 1, 6)
			.add('8 sided die', 1, 4)
			.add('10 sided die', 1, 4)
			.add('12 sided die', 1, 3)
			.add('20 sided die', 1, 3)
			.add('100 sided die'),
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Royal mystery box',
		itemID: itemID('Royal mystery box'),
		aliases: ['royal mystery box', 'rmb'],
		table: new LootTable().add('Diamond crown', 1, 2).add('Diamond sceptre', 1, 2).add('Corgi'),
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Equippable mystery box',
		itemID: itemID('Equippable mystery box'),
		aliases: ['equippable mystery box', 'emb'],
		table: randomEquippable,
		emoji: Emoji.BirthdayPresent
	},
	{
		name: 'Beach mystery box',
		itemID: itemID('Beach mystery box'),
		aliases: ['Beach mystery box', 'bmb'],
		table: new LootTable()
			.add('Snappy the Turtle')
			.add('Beach ball')
			.add('Water balloon')
			.add('Ice cream')
			.add('Crab hat'),
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Independence box',
		itemID: itemID('Independence box'),
		aliases: ['independence box'],
		table: new LootTable().add('Fireworks').add('Fireworks').add('Liber tea').add("Sam's hat"),
		emoji: Emoji.BirthdayPresent,
		excludeFromBoxes: true
	},
	{
		name: 'Magic crate',
		itemID: itemID('Magic crate'),
		aliases: ['magic crate'],
		table: odsCrate,
		emoji: Emoji.BirthdayPresent
	},
	{
		name: 'Bag full of gems',
		itemID: itemID('Bag full of gems'),
		aliases: ['bag full of gems', 'gem bag'],
		table: BagFullOfGemsTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Monkey crate',
		itemID: itemID('Monkey crate'),
		aliases: ['monkey crate'],
		table: new LootTable()
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
			.add(LampTable),
		emoji: '<:Monkey_crate:885774318041202708>'
	},
	{
		name: 'Festive present',
		itemID: itemID('Festive present'),
		aliases: ['festive present'],
		table: new LootTable()
			.tertiary(50, 'Seer')
			.tertiary(20, 'Frozen santa hat')
			.tertiary(3, 'Golden shard')
			.tertiary(4, 'Festive jumper')
			.add('Toy soldier')
			.add('Toy doll')
			.add('Toy cat'),
		emoji: Emoji.Casket
	},
	{
		name: 'Clothing Mystery Box',
		itemID: 50_421,
		aliases: ['cmb', 'clothing mystery box'],
		table: () => randArrItem(cmbClothes),
		emoji: Emoji.MysteryBox
	}
];

export function getRandomMysteryBox() {
	return MysteryBoxes.roll().items()[0][0].id;
}

let allItemsIDs = Openables.filter(o => o.excludeFromBoxes)
	.map(i => (typeof i.table !== 'function' && i.table.allItems) || [])
	.flat(Infinity) as number[];
allItemsIDs = uniqueArr(allItemsIDs);
const cantBeDropped = resolveItems([
	...chambersOfXericCL,
	...customBossesDropsThatCantBeDroppedInMBs,
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
	...allPetIDs,
	...frozenKeyPieces,
	'Bandosian components',
	'Masori headdress',
	"Osmumten's fang",
	'Nihil shard',
	'Ancient godsword',
	'Nihil dust',
	'Ancient hilt',
	'Nihil horn',
	'Zaryte crossbow',
	'Zaryte vambraces'
]);

export const tmbTable: number[] = [];
export const umbTable: number[] = [];
export const embTable: number[] = [];
for (const item of Items.values()) {
	if (item.customItemData?.cantDropFromMysteryBoxes === true) {
		cantBeDropped.push(item.id);
		continue;
	}

	if ((item.id >= 40_000 && item.id <= 50_000) || allItemsIDs.includes(item.id) || cantBeDropped.includes(item.id)) {
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

function randomEquippable(): number {
	const res = randArrItem(embTable);
	if (cantBeDropped.includes(res)) return randomEquippable();
	if (res >= 40_000 && res <= 50_000) return randomEquippable();
	if (roll(MR_E_DROPRATE_FROM_EMB)) {
		return itemID('Mr. E');
	}
	return res;
}

export function getMysteryBoxItem(tradeables: boolean): number {
	const table = tradeables ? tmbTable : umbTable;
	let result = randArrItem(table);
	if (cantBeDropped.includes(result)) return getMysteryBoxItem(tradeables);
	if (result >= 40_000 && result <= 50_000) return getMysteryBoxItem(tradeables);
	if (roll(MR_E_DROPRATE_FROM_UMB_AND_TMB)) {
		return itemID('Mr. E');
	}
	return result;
}

export default Openables;
