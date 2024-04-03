import { randArrItem, roll } from 'e';
import { Bank, Items, LootTable } from 'oldschooljs';
import TreeHerbSeedTable from 'oldschooljs/dist/simulation/subtables/TreeHerbSeedTable';

import { divinationEnergies } from './bso/divination';
import { Emoji, OSB_VIRTUS_IDS } from './constants';
import {
	allPetIDs,
	chambersOfXericCL,
	cmbClothes,
	customBossesDropsThatCantBeDroppedInMBs,
	theatreOfBloodHardUniques,
	theatreOfBloodNormalUniques,
	toaCL
} from './data/CollectionsExport';
import { baseHolidayItems, PartyhatTable } from './data/holidayItems';
import { allTrophyItems } from './data/trophies';
import { chickenChanceFromEgg } from './easter2024';
import { keyCrates } from './keyCrates';
import { FishTable } from './minions/data/killableMonsters/custom/SeaKraken';
import { UnifiedOpenable } from './openables';
import { PaintBoxTable } from './paintColors';
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
	.add('Abyssal protector')
	.add("Tumeken's guardian")
	.add('Muphin')
	.add('Baron')
	.add('Butch')
	.add("Lil'viathan")
	.add('Wisp');

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
	.add('Cob')
	.add('Gregoyle');

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
	.tertiary(4, 'Festive jumper (2021)')
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

export const spookyTable = new LootTable()
	.tertiary(10, 'Mysterious token')
	.add(spookyEpic, 1, 1)
	.add(spookyRare, 1, 3)
	.add(spookyCommon, 1, 8);

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
	"Osmumten's fang",
	'Nihil shard',
	'Ancient godsword',
	'Nihil dust',
	'Ancient hilt',
	'Nihil horn',
	'Zaryte crossbow',
	'Zaryte vambraces',
	'Justiciar armour set',
	25_484, // Webweaver bow (u)
	25_485, // Webweaver bow
	25_486, // Ursine chainmace (u)
	25_487, // Ursine chainmace
	25_488, // Accursed sceptre (u)
	25_489, // Accursed sceptre
	25_490, // Voidwaker
	25_491, // Accursed sceptre (au)
	25_492, // Accursed sceptre (a)
	26_984, // Lost bag
	26_986, // Lost bag
	26_988, // Lost bag
	27_214, // Scarab dung
	27_216, // Fossilised dung
	27_219, // Fang
	27_221, // Big banana
	27_223, // Eldritch ashes
	27_225, // Grain
	27_226, // Masori mask
	27_229, // Masori body
	27_232, // Masori chaps
	27_235, // Masori mask (f)
	27_238, // Masori body (f)
	27_241, // Masori chaps (f)
	27_246, // Osmumten's fang (or)
	27_248, // Cursed phalanx
	27_251, // Elidinis' ward (f)
	27_253, // Elidinis' ward (or)
	27_255, // Menaphite ornament kit
	27_257, // Icthlarin's shroud (tier 1)
	27_259, // Icthlarin's shroud (tier 2)
	27_261, // Icthlarin's shroud (tier 3)
	27_263, // Icthlarin's shroud (tier 4)
	27_265, // Icthlarin's shroud (tier 5)
	27_267, // Icthlarin's hood (tier 5)
	27_269, // Armadylean plate
	27_272, // Lily of the sands
	27_275, // Tumeken's shadow
	27_277, // Tumeken's shadow (uncharged)
	27_279, // Thread of elidinis
	27_281, // Divine rune pouch
	27_283, // Breach of the scarab
	27_285, // Eye of the corruptor
	27_287, // Keris partisan of corruption
	27_289, // Jewel of the sun
	27_291, // Keris partisan of the sun
	27_293, // Cache of runes
	27_295, // Water container
	27_296, // Mirror
	27_297, // Neutralising potion
	27_298, // Maisa's message
	27_299, // Antique lamp
	27_300, // Akila's journal
	27_302, // Het's capture
	27_304, // Apmeken's capture
	27_306, // Scabaras' capture
	27_308, // Crondis' capture
	27_310, // The wardens
	27_312, // The jackal's torch
	27_314, // Supplies
	27_315, // Nectar (4)
	27_317, // Nectar (3)
	27_319, // Nectar (2)
	27_321, // Nectar (1)
	27_323, // Silk dressing (2)
	27_325, // Silk dressing (1)
	27_327, // Tears of elidinis (4)
	27_329, // Tears of elidinis (3)
	27_331, // Tears of elidinis (2)
	27_333, // Tears of elidinis (1)
	27_335, // Blessed crystal scarab (2)
	27_337, // Blessed crystal scarab (1)
	27_339, // Liquid adrenaline (2)
	27_341, // Liquid adrenaline (1)
	27_343, // Smelling salts (2)
	27_345, // Smelling salts (1)
	27_347, // Ambrosia (2)
	27_349, // Ambrosia (1)
	27_351, // Honey locust
	27_352, // Tumeken's guardian
	27_354, // Elidinis' guardian
	27_355, // Masori armour set (f)
	27_358, // Tome of fire
	27_359, // Masori assembler (broken)
	27_361, // Masori assembler max cape (broken)
	27_363, // Masori assembler max cape
	27_365, // Masori assembler max cape (l)
	27_366, // Masori assembler max hood
	27_368, // Dawn scarab egg
	27_369, // Ancient key
	27_370, // Mask of rebirth
	27_372, // Masori crafting kit
	27_374, // Masori assembler
	27_376, // Masori assembler (l)
	27_377, // Remnant of akkha
	27_378, // Remnant of ba-ba
	27_379, // Remnant of kephri
	27_380, // Remnant of zebak
	27_381, // Ancient remnant
	27_382, // Akkhito
	27_383, // Babi
	27_384, // Kephriti
	27_385, // Zebo
	27_386, // Tumeken's damaged guardian
	27_387, // Elidinis' damaged guardian
	27_388, // Adventurer's top (t1)
	27_390, // Adventurer's trousers (t1)
	27_392, // Adventurer's hood (t1)
	27_394, // Adventurer's boots (t1)
	27_396, // Adventurer's top (t2)
	27_398, // Adventurer's trousers (t2)
	27_400, // Adventurer's hood (t2)
	27_402, // Adventurer's boots (t2)
	27_404, // Adventurer's top (t3)
	27_406, // Adventurer's trousers (t3)
	27_408, // Adventurer's hood (t3)
	27_410, // Adventurer's boots (t3)
	27_412, // Adventurer's vambraces
	27_414, // Giant stopwatch
	27_416, // Speedy teleport scroll
	27_418, // Bronze speedrun trophy
	27_420, // Silver speedrun trophy
	27_422, // Gold speedrun trophy
	27_424, // Platinum speedrun trophy
	27_426, // Dynamite(p)
	27_427, // Clue scroll (special)
	27_428, // Hood of ruin
	27_430, // Robe top of ruin
	27_432, // Robe bottom of ruin
	27_434, // Gloves of ruin
	27_436, // Socks of ruin
	27_438, // Cloak of ruin
	27_440, // Infinite money bag
	27_442, // Adventurer's cape
	27_444, // Graceful hood
	27_447, // Graceful cape
	27_450, // Graceful top
	27_453, // Graceful legs
	27_456, // Graceful gloves
	27_459, // Graceful boots
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
	...theatreOfBloodNormalUniques,
	...toaCL,
	'Heavy ballista',
	'Unstrung heavy ballista',
	'Monkey tail',
	...allTrophyItems,
	27_499,
	27_501,
	27_503,
	27_505,
	27_507,
	27_509,
	27_511,
	27_513,
	27_515,
	27_516,
	27_517,
	27_518,
	27_519,
	27_520,
	27_521,
	27_522,
	27_523,
	27_524,
	27_525,
	27_526,
	27_527,
	27_528,
	27_529,
	27_530,
	27_531,
	27_532,
	27_533,
	27_534,
	27_535,
	27_536,
	27_537,
	27_543,
	27_544,
	27_546,
	27_548,
	27_550,
	27_551,
	27_552,
	27_553,
	27_554,
	27_555,
	27_556,
	27_557,
	27_558,
	27_560,
	27_561,
	27_562,
	27_563,
	27_564,
	27_566,
	27_568,
	27_570,
	27_572,
	27_574,
	27_576,
	27_578,
	27_580,
	27_582,
	27_583,
	27_584,
	27_585,
	27_586,
	27_588,
	27_590,
	27_592,
	27_593,
	27_595,
	27_596,
	27_597,
	27_598,
	27_599,
	27_600,
	27_601,
	27_602,
	27_603,
	27_604,
	27_605,
	27_606,
	27_607,
	27_608,
	27_610,
	27_612,
	27_614,
	27_616,
	27_622,
	27_624,
	27_626,
	27_627,
	27_629,
	27_632,
	27_635,
	27_638,
	27_641,
	27_643,
	27_645,
	27_648,
	27_649,
	27_650,
	27_651,
	27_652,
	27_655,
	27_657,
	27_660,
	27_662,
	27_665,
	27_667,
	27_670,
	27_673,
	27_676,
	27_679,
	27_681,
	27_684,
	27_687,
	27_690,
	27_693,
	27_695,
	27_697,
	27_699,
	27_701,
	27_703,
	27_705,
	27_707,
	27_709,
	27_711,
	27_713,
	27_715,
	27_717,
	27_719,
	27_721,
	27_723,
	27_725,
	27_727,
	27_729,
	27_731,
	27_733,
	27_735,
	27_737,
	27_739,
	27_741,
	27_743,
	27_745,
	27_747,
	27_749,
	27_751,
	27_753,
	27_755,
	27_757,
	27_759,
	27_761,
	27_763,
	27_765,
	27_767,
	27_769,
	27_771,
	27_773,
	27_775,
	27_777,
	27_779,
	27_783,
	27_785,
	27_788,
	27_790,
	...OSB_VIRTUS_IDS,
	'Scurry',
	'Trailblazer reloaded dragon trophy',
	'Trailblazer reloaded rune trophy',
	'Trailblazer reloaded adamant trophy',
	'Trailblazer reloaded mithril trophy',
	'Trailblazer reloaded steel trophy',
	'Trailblazer reloaded iron trophy',
	'Trailblazer reloaded bronze trophy'
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

const christmasPetFoodTable = new LootTable()
	.add('Pumpkinhead praline')
	.add('Takon truffle')
	.add('Seer sweet')
	.add('Cob cup')
	.add('Craig creme')
	.add('Moktang mint')
	.add('Festive treats')
	.add('Pork sausage')
	.add('Pork crackling')
	.add('Reinbeer');

const christmasLootTable = new LootTable()
	.tertiary(18, 'Christmas box')
	.add(
		new LootTable()
			.add('Festive jumper (2022)', 1, 2)
			.add('Christmas cape', 1, 2)
			.add('Christmas socks', 1, 2)
			.add('Tinsel scarf', 1, 4)
			.add('Frosted wreath', 1, 4)
			.add('Edible yoyo', 1, 4)
			.add(christmasPetFoodTable, 1, 5)
	)
	.add(christmasPetFoodTable, 1, 4)
	.add(
		new LootTable()
			.add('Pavlova')
			.add('Prawns')
			.add('Roast potatoes')
			.add('Cake')
			.add('Chocolate cake')
			.add('Chocolate bar')
			.add('Bucket of milk')
			.add('Chocchip crunchies'),
		1,
		4
	);

const ChristmasBoxTable = new LootTable()
	.add('Candy partyhat')
	.add(christmasLootTable, 1, 4)
	.add('Christmas dye', 1, 3)
	.add('Coal', 1, 2);

const DivineEggTable = new LootTable().tertiary(100, 'Jar of memories');

for (const energy of divinationEnergies) {
	let weight = divinationEnergies.length + 1 - (divinationEnergies.indexOf(energy) + 1);
	weight *= weight;
	DivineEggTable.add(energy.item.id, weight, weight);
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
		aliases: ['royal mystery box'],
		output: RoyalMysteryBoxTable,
		allItems: RoyalMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Beach mystery box',
		id: itemID('Beach mystery box'),
		openedItem: getOSItem('Beach mystery box'),
		aliases: ['Beach mystery box'],
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
		allItems: spookyTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Christmas box',
		id: itemID('Christmas box'),
		openedItem: getOSItem('Christmas box'),
		aliases: ['christmas box'],
		output: ChristmasBoxTable,
		allItems: ChristmasBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Paint box',
		id: itemID('Paint box'),
		openedItem: getOSItem('Paint box'),
		aliases: ['paint box'],
		output: PaintBoxTable,
		allItems: PaintBoxTable.allItems,
		excludeFromOpenAll: true,
		smokeyApplies: false
	},
	{
		name: 'Divine egg',
		id: itemID('Divine egg'),
		openedItem: getOSItem('Divine egg'),
		aliases: ['divine egg'],
		output: DivineEggTable,
		allItems: DivineEggTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Large egg',
		id: itemID('Large egg'),
		openedItem: getOSItem('Large egg'),
		aliases: ['large egg'],
		output: new LootTable().tertiary(chickenChanceFromEgg, 'Cluckers'),
		allItems: [],
		smokeyApplies: false
	}
];

for (const crate of keyCrates) {
	bsoOpenables.push({
		name: crate.item.name,
		id: crate.item.id,
		openedItem: crate.item,
		aliases: [crate.item.name],
		output: crate.table,
		allItems: crate.table.allItems,
		extraCostPerOpen: new Bank().add(crate.key.id),
		excludeFromOpenAll: true,
		smokeyApplies: false
	});
}

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
