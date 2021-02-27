import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import TreeHerbSeedTable from 'oldschooljs/dist/simulation/subtables/TreeHerbSeedTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { allPetIDs } from '../../commands/Minion/equippet';
import { Emoji } from '../constants';
import { FishTable } from '../minions/data/killableMonsters/custom/SeaKraken';
import { allKeyPieces, allNexItems } from '../nex';
import BirthdayPresentTable from '../simulation/birthdayPresent';
import CasketTable from '../simulation/casket';
import CrystalChestTable from '../simulation/crystalChest';
import { itemID, itemNameFromID, removeDuplicatesFromArray } from '../util';
import resolveItems from '../util/resolveItems';
import { LampTable } from '../xpLamps';
import { coxLog, customBossLog } from './collectionLog';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: (() => number) | LootTable;
	emoji: Emoji;
}

export const ALL_PRIMAL = resolveItems([
	'Primal full helm',
	'Primal platebody',
	'Primal platelegs',
	'Primal gauntlets',
	'Primal boots',
	'Offhand drygore longsword',
	'Drygore longsword'
]);

const HolidayItems = new LootTable()
	.add('Chicken head')
	.add('Chicken wings')
	.add('Chicken legs')
	.add('Chicken feet')
	.add('Scythe')
	.add('Pumpkin')
	.add('Red halloween mask')
	.add('Blue halloween mask')
	.add('Green halloween mask')
	.add("Black h'ween mask")
	.add('Skeleton mask')
	.add('Skeleton shirt')
	.add('Skeleton leggings')
	.add('Skeleton gloves')
	.add('Skeleton boots')
	.add('Jack lantern mask')
	.add('Yo-yo')
	.add('Reindeer hat')
	.add('Bunny ears')
	.add('Easter egg')
	.add('Wintumber tree')
	.add('Santa hat')
	.add('Bobble hat')
	.add('Bobble scarf')
	.add('Jester hat')
	.add('Jester scarf')
	.add('Tri-jester hat')
	.add('Tri-jester scarf')
	.add('Woolly hat')
	.add('Woolly scarf')
	.add('Red marionette')
	.add('Green marionette')
	.add('Blue marionette')
	.add('Rubber chicken')
	.add('Disk of returning')
	.add('Zombie head')
	.add('Half full wine jug')
	.add('Christmas cracker')
	.add('War ship')
	.add("Black h'ween mask")
	.add('Cow mask')
	.add('Cow top')
	.add('Cow trousers')
	.add('Cow gloves')
	.add('Cow shoes')
	.add('Easter basket')
	.add('Druidic wreath')
	.add('Grim reaper hood')
	.add('Santa mask')
	.add('Santa jacket')
	.add('Santa pantaloons')
	.add('Santa gloves')
	.add('Santa boots')
	.add('Antisanta mask')
	.add('Antisanta jacket')
	.add('Antisanta pantaloons')
	.add('Antisanta gloves')
	.add('Antisanta boots')
	.add('Bunny feet')
	.add('Bunny top')
	.add('Bunny legs')
	.add('Bunny paws')
	.add('Mask of balance')
	.add('Anti-panties')
	.add('Gravedigger mask')
	.add('Gravedigger top')
	.add('Gravedigger leggings')
	.add('Gravedigger gloves')
	.add('Gravedigger boots')
	.add('Black santa hat')
	.add('Inverted santa hat')
	.add('Gnome child hat')
	.add('Cabbage cape')
	.add('Cruciferous codex')
	.add('Banshee mask')
	.add('Banshee top')
	.add('Banshee robe')
	.add('Snow globe')
	.add('Giant present')
	.add('Sack of presents')
	.add('4th birthday hat')
	.add('Birthday balloons')
	.add('Easter egg helm')
	.add('Eggshell platebody')
	.add('Eggshell platelegs')
	.add('Jonas mask')
	.add('Snow imp costume head')
	.add('Snow imp costume body')
	.add('Snow imp costume legs')
	.add('Snow imp costume gloves')
	.add('Snow imp costume feet')
	.add('Snow imp costume tail')
	.add('Star-face')
	.add('Tree top')
	.add('Tree skirt')
	.add('Candy cane')
	.add('Birthday cake')
	.add('Giant easter egg')
	.add('Bunnyman mask')
	.add('Spooky hood')
	.add('Spooky robe')
	.add('Spooky skirt')
	.add('Spooky gloves')
	.add('Spooky boots')
	.add('Spookier hood')
	.add('Spookier robe')
	.add('Spookier skirt')
	.add('Spookier gloves')
	.add('Spookier boots')
	.add('Pumpkin lantern')
	.add('Skeleton lantern')
	.add('Blue gingerbread shield')
	.add('Green gingerbread shield')
	.add('Cat ears')
	.add('Hell cat ears')
	.add('Magic egg ball')
	.add('Carrot sword')
	.add("'24-carat' sword");

const PetsTable = new LootTable()
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
	.add('Little nightmare');

const PartyhatTable = new LootTable()
	.oneIn(50, 'Black partyhat')
	.oneIn(20, 'Rainbow partyhat')
	.add('Red Partyhat')
	.add('Yellow partyhat')
	.add('Blue partyhat')
	.add('Purple partyhat')
	.add('Green partyhat')
	.add('White partyhat');

const DwarvenCrateTable = new LootTable()
	.add('Dwarven ore')
	.add('Dwarven stout', 2)
	.add('Dwarven lore', 2)
	.add('Dwarven rock cake', 2)
	.add('Dwarven helmet')
	.add('Hammer')
	.add('Steel pickaxe')
	.add('Pickaxe handle')
	.add('Beer')
	.add('Kebab');

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
	.every(baseTGBTable, [2, 4])
	.every('Clue scroll grandmaster', [1, 3])
	.add('Rocktail', [30, 60])
	.add('Tradeable mystery box', [1, 3])
	.add(baseTGBTable);

const Openables: Openable[] = [
	{
		name: 'Birthday present',
		itemID: 11918,
		aliases: ['present', 'birthday present'],
		table: BirthdayPresentTable,
		emoji: Emoji.BirthdayPresent
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
		table: () => getRandomItem(true),
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Holiday Mystery box',
		itemID: 3713,
		aliases: ['holiday mystery box', 'hmb', 'holiday', 'holiday item mystery box', 'himb'],
		table: HolidayItems,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Pet Mystery box',
		itemID: 3062,
		aliases: ['pet mystery box', 'pmb'],
		table: PetsTable,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Untradeables Mystery box',
		itemID: 19939,
		aliases: ['untradeables mystery box', 'umb'],
		table: () => getRandomItem(false),
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
		emoji: Emoji.BirthdayPresent
	},
	{
		name: 'Dwarven crate',
		itemID: itemID('Dwarven crate'),
		aliases: ['dwarven crate', 'dc'],
		table: DwarvenCrateTable,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Builders supply crate',
		itemID: 24884,
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
			.tertiary(12, 'Cake hat'),
		emoji: Emoji.BirthdayPresent
	}
];

export const MysteryBoxes = new LootTable()
	.oneIn(40, itemNameFromID(3062)!)
	.oneIn(150, itemNameFromID(3713)!)
	.add(6199)
	.add(19939);

export function getRandomMysteryBox() {
	return MysteryBoxes.roll()[0].item;
}

let allItemsIDs = Openables.map(
	i => (typeof i.table !== 'function' && i.table.allItems) || []
).flat(Infinity) as number[];
allItemsIDs = removeDuplicatesFromArray(allItemsIDs);
const cantBeDropped = [
	...Object.values(coxLog).flat(Infinity),
	...Object.values(customBossLog).flat(Infinity),
	itemID('Dwarven crate'),
	itemID('Halloween mask set'),
	itemID('Partyhat set'),
	itemID('Ancestral robes set'),
	itemID('Kodai wand'),
	itemID('Twisted ancestral hat'),
	itemID('Twisted ancestral robe top'),
	itemID('Twisted ancestral robe bottom'),
	itemID('Partyhat & specs'),
	itemID('Dwarven warhammer'),
	itemID('Dwarven ore'),
	itemID('Dwarven bar'),
	itemID('Dwarven pickaxe'),
	itemID('Dwarven greataxe'),
	itemID('Dwarven greathammer'),
	itemID('Dwarven knife'),
	itemID('Dwarven blessing'),
	itemID('Helm of raedwald'),
	itemID('Clue hunter garb'),
	itemID('Clue hunter gloves'),
	itemID('Clue hunter trousers'),
	itemID('Clue hunter boots'),
	itemID('Clue hunter cloak'),
	itemID('Cob'),
	22664, // JMOD Scythe of Vitur,
	...resolveItems([
		'Red Partyhat',
		'Yellow partyhat',
		'Blue partyhat',
		'Purple partyhat',
		'Green partyhat',
		'White partyhat',
		'Christmas cracker',
		'Santa hat',
		'Ancient emblem',
		'Bloodsoaked feather'
	]),
	...allPetIDs,
	...allKeyPieces,
	...allNexItems,
	...ALL_PRIMAL
] as number[];

export const tmbTable = Items.filter(i => {
	if (allItemsIDs.includes(i.id) || cantBeDropped.includes(i.id)) {
		return false;
	}
	return (i as Item).tradeable_on_ge && !(i as Item).duplicate;
}).map(i => i.id);

export const umbTable = Items.filter(i => {
	if (allItemsIDs.includes(i.id) || cantBeDropped.includes(i.id)) {
		return false;
	}
	return !(i as Item).tradeable && !(i as Item).duplicate;
}).map(i => i.id);

function getRandomItem(tradeables: boolean): number {
	const table = tradeables ? tmbTable : umbTable;
	let result = table[Math.floor(Math.random() * table.length)];
	if (cantBeDropped.includes(result)) return getRandomItem(tradeables);
	if (result >= 40_000 && result <= 50_000) return getRandomItem(tradeables);
	return result;
}

export default Openables;
