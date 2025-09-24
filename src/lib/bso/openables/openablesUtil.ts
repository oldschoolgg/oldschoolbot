import { ItemGroups, resolveItems } from 'oldschooljs';

import { OSB_VIRTUS_IDS } from '@/lib/bso/bsoConstants.js';
import {
	BeachMysteryBoxTable,
	BirthdayPackTable,
	GamblersBagTable,
	IndependenceBoxTable,
	PMBTable,
	RoyalMysteryBoxTable
} from '@/lib/bso/openables/tables.js';
import {
	allPetIDs,
	chambersOfXericCL,
	cmbClothes,
	customBossesDropsThatCantBeDroppedInMBs,
	theatreOfBloodHardUniques,
	theatreOfBloodNormalUniques
} from '@/lib/data/CollectionsExport.js';
import { baseHolidayItems, PartyhatTable } from '@/lib/data/holidayItems.js';
import { allTrophyItems } from '@/lib/data/itemAliases.js';

export const cantBeDropped = resolveItems([
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
	...ItemGroups.toaCL,
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
