// Base custom items are referenced elsewhere in the custom items files and must be loaded first
import './baseCustomItems';
import '../deletedItems';
import './invention';
import './customItemsFancy';
import './farming';
import './pets';
import './fishing';
import './nex';
import './nonCustomChanges';
import './baxBath';
import './dwarven';
import './moktang';
import './leagues';

import { EquipmentSlot, type ItemRequirements } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';
import { UN_EQUIPPABLE, maxedRequirements, setCustomItem } from './util';

setCustomItem(1579, "Thieves' armband", 'Rune gloves', {}, 100_000);
setCustomItem(
	19_939,
	'Untradeable Mystery Box',
	'Mystery box',
	{
		tradeable_on_ge: true,
		tradeable: true
	},
	100_000
);
setCustomItem(6199, 'Tradeable Mystery Box', 'Mystery box', { tradeable_on_ge: true, tradeable: true }, 100_000);
setCustomItem(3062, 'Pet Mystery Box', 'Mystery box', { tradeable_on_ge: true, tradeable: true }, 100_000);
setCustomItem(3713, 'Holiday Mystery Box', 'Mystery box', { tradeable_on_ge: true, tradeable: true }, 100_000);
setCustomItem(13_345, 'Tester Gift Box', 'Mystery box', {}, 100_000);
setCustomItem(12_592, 'Divine sigil', 'Elysian sigil', {}, 930_000_000);
setCustomItem(3454, 'Divine spirit shield', 'Elysian spirit shield', {}, 900_000_000);

// Abyssal Dragon
// Abyssal lance || 24218 = Guthixian icon [DUPLICATE]
// setCustomItem(24218, 'Abyssal lance', ('Dragonhunter lance'), {
// 	duplicate: false,
// 	tradeable: true,
// 	tradeable_on_ge: true,
// 	wiki_name: 'Abyssal lance',
// 	equipment: {
// 		attack_stab: 155,
// 		attack_slash: 135,
// 		attack_crush: 75,
// 		attack_magic: 0,
// 		attack_ranged: 0,
// 		defence_stab: 0,
// 		defence_slash: 0,
// 		defence_crush: 0,
// 		defence_magic: 0,
// 		defence_ranged: 0,
// 		melee_strength: 70,
// 		ranged_strength: 0,
// 		magic_damage: 0,
// 		prayer: 10,
// 		slot: EquipmentSlot.Weapon,
// 		requirements: null
// 	}
// });
//
// // Abyssal defender || 24216 = Victor's cape (500) [DUPLICATE]
// setCustomItem(24216, 'Abyssal defender', ('Dragonhunter lance'), {
// 	duplicate: false,
// 	tradeable: true,
// 	tradeable_on_ge: true,
// 	wiki_name: 'Abyssal defender',
// 	equipment: {
// 		attack_stab: 77,
// 		attack_slash: 67,
// 		attack_crush: 37,
// 		attack_magic: 0,
// 		attack_ranged: 0,
// 		defence_stab: 0,
// 		defence_slash: 0,
// 		defence_crush: 0,
// 		defence_magic: 0,
// 		defence_ranged: 0,
// 		melee_strength: 35,
// 		ranged_strength: 0,
// 		magic_damage: 0,
// 		prayer: 5,
// 		slot: EquipmentSlot.Shield,
// 		requirements: null
// 	}
// });

// Abyssal thread || 24212 = Victor's cape (50) [DUPLICATE]
setCustomItem(24_212, 'Abyssal thread', 'Giant pouch', { tradeable: true, tradeable_on_ge: true }, 10_000_000);

// Abyssal pouch || 24210 = Victor's cape (10) [DUPLICATE]
setCustomItem(24_210, 'Abyssal pouch', 'Giant pouch', { tradeable: true, tradeable_on_ge: true }, 100_000);

// Ori Pet || 4149	 = Abyssal demon

// Abyssal bones || 24199 = Seren halo [DUPLICATE]
setCustomItem(
	24_199,
	'Abyssal dragon bones',
	'Superior dragon bones',
	{ tradeable: true, tradeable_on_ge: true },
	20_000
);

setCustomItem(
	6796,
	'Tiny lamp',
	'Lamp',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	3_000_000
);
setCustomItem(
	21_642,
	'Small lamp',
	'Lamp',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	6_000_000
);
setCustomItem(
	23_516,
	'Average lamp',
	'Lamp',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	15_000_000
);
setCustomItem(
	22_320,
	'Large lamp',
	'Lamp',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000_000
);
setCustomItem(
	11_157,
	'Huge lamp',
	'Lamp',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000_000
);

setCustomItem(5020, 'Lottery ticket', 'Paramaya ticket', {
	customItemData: {
		isSuperUntradeable: true,
		cantDropFromMysteryBoxes: true,
		cantBeSacrificed: true
	}
});
setCustomItem(5021, 'Bank lottery ticket', 'Paramaya ticket', {
	customItemData: {
		isSuperUntradeable: true,
		cantDropFromMysteryBoxes: true,
		cantBeSacrificed: true
	}
});
// setCustomItem(25238, 'Dwarven defender', ('Dragon defender'));
setCustomItem(
	19_839,
	'Dwarven blessing',
	'Holy blessing',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 0,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,
			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 5,
			slot: EquipmentSlot.Ammo,
			requirements: null
		}
	},
	50_000_000
);
setCustomItem(19_837, 'Clue scroll (grandmaster)', 'Clue scroll (easy)', { tradeable: true, tradeable_on_ge: true });
setCustomItem(19_838, 'Reward casket (grandmaster)', 'Reward casket (master)', {
	tradeable: true,
	tradeable_on_ge: true
});
setCustomItem(516, 'Nuts of monkey', 'Rune platelegs');

/**
 * Exclusive Items
 *
 * Items from 40_000 to 45_000 will not be dropped by any mystery box, and are untradeable
 */
// Master capes
setCustomItem(40_000, 'Construction master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_001, 'Cooking master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_002, 'Crafting master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_003, 'Farming master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_004, 'Firemaking master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_005, 'Fishing master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_006, 'Fletching master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_007, 'Herblore master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_008, 'Hunter master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_009, 'Magic master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_010, 'Mining master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_011, 'Prayer master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_012, 'Runecraft master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_013, 'Smithing master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_014, 'Thieving master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_015, 'Woodcutting master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_016, 'Agility master cape', 'Abyssal cape', {}, 200_000_000);

setCustomItem(40_017, 'Attack master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_018, 'Strength master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_019, 'Defence master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_020, 'Hitpoints master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_021, 'Ranged master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_022, 'Dungeoneering master cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_023, 'Dungeoneering cape', 'Fire cape', {}, 20_000);
setCustomItem(40_024, 'Dungeoneering cape(t)', 'Fire cape', {}, 20_000);
setCustomItem(40_025, 'Dungeoneering hood', 'Rune full helm', {}, 20_000);
setCustomItem(40_053, 'Master quest cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_054, 'Support cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(
	40_055,
	"Gatherer's cape",
	'Abyssal cape',
	{
		equipment: {
			requirements: {
				farming: 120,
				fishing: 120,
				hunter: 120,
				mining: 120,
				woodcutting: 120,
				divination: 120
			} as Partial<ItemRequirements>
		}
	},
	200_000_000
);
setCustomItem(40_056, "Combatant's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_057, "Artisan's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(
	40_058,
	'Completionist cape',
	'Abyssal cape',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		},
		equipment: maxedRequirements
	},
	100_000_000
);
setCustomItem(
	40_059,
	'Completionist cape (t)',
	'Abyssal cape',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		},
		equipment: maxedRequirements
	},
	250_000_000
);

setCustomItem(40_026, 'Scroll of life', 'Coal', {}, 1_000_000);
setCustomItem(40_027, 'Herbicide', 'Coal', {}, 1_000_000);
setCustomItem(40_028, 'Scroll of efficiency', 'Coal', {}, 1_000_000);
setCustomItem(40_029, 'Scroll of cleansing', 'Coal', {}, 1_000_000);
setCustomItem(40_030, 'Amulet of zealots', 'Amulet of fury', {}, 1_000_000);
setCustomItem(40_031, 'Scroll of dexterity', 'Coal', {}, 1_000_000);
setCustomItem(40_032, 'Scroll of teleportation', 'Coal', {}, 1_000_000);

setCustomItem(
	40_033,
	'Gorajan warrior helmet',
	'Torva full helm',
	{
		equipment: {
			attack_stab: 30,
			attack_slash: 15,
			attack_crush: 15,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 70,
			defence_slash: 75,
			defence_crush: 75,
			defence_magic: -5,
			defence_ranged: 55,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Head,
			requirements: null
		}
	},
	55_000_000
);
setCustomItem(
	40_034,
	'Gorajan warrior top',
	'Torva platebody',
	{
		equipment: {
			attack_stab: 43,
			attack_slash: 19,
			attack_crush: 23,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 160,
			defence_slash: 150,
			defence_crush: 150,
			defence_magic: 0,
			defence_ranged: 165,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Body,
			requirements: null
		}
	},
	55_000_000
);
setCustomItem(
	40_035,
	'Gorajan warrior legs',
	'Torva platelegs',
	{
		equipment: {
			attack_stab: 37,
			attack_slash: 16,
			attack_crush: 19,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 130,
			defence_slash: 130,
			defence_crush: 130,
			defence_magic: 0,
			defence_ranged: 130,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Legs,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_036,
	'Gorajan warrior gloves',
	'Torva gloves',
	{
		equipment: {
			attack_stab: 19,
			attack_slash: 17,
			attack_crush: 10,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 18,
			defence_slash: 18,
			defence_crush: 18,
			defence_magic: 0,
			defence_ranged: 35,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Hands,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_037,
	'Gorajan warrior boots',
	'Torva boots',
	{
		equipment: {
			attack_stab: 19,
			attack_slash: 9,
			attack_crush: 10,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 24,
			defence_slash: 24,
			defence_crush: 24,
			defence_magic: 0,
			defence_ranged: 35,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Feet,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(40_038, 'Scroll of proficiency', 'Coal', {}, 1_000_000);
setCustomItem(40_040, 'Chaotic remnant', 'Coal', {}, 10_000_000);

setCustomItem(
	40_042,
	'Gorajan occult helmet',
	'Virtus mask',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 21,
			attack_ranged: -3,

			defence_stab: 35,
			defence_slash: 35,
			defence_crush: 35,
			defence_magic: 85,
			defence_ranged: 75,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 5,
			prayer: 1,
			slot: EquipmentSlot.Head,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_043,
	'Gorajan occult top',
	'Virtus robe top',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 46,
			attack_ranged: -5,

			defence_stab: 44,
			defence_slash: 44,
			defence_crush: 55,
			defence_magic: 65,
			defence_ranged: 5,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 5,
			prayer: 1,
			slot: EquipmentSlot.Body,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_044,
	'Gorajan occult legs',
	'Virtus robe legs',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 41,
			attack_ranged: -5,

			defence_stab: 22,
			defence_slash: 20,
			defence_crush: 15,
			defence_magic: 65,
			defence_ranged: 15,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 5,
			prayer: 1,
			slot: EquipmentSlot.Legs,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_045,
	'Gorajan occult gloves',
	'Virtus gloves',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 23,
			attack_ranged: -5,

			defence_stab: 9,
			defence_slash: 9,
			defence_crush: 9,
			defence_magic: 12,
			defence_ranged: 9,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 5,
			prayer: 1,
			slot: EquipmentSlot.Hands,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_046,
	'Gorajan occult boots',
	'Virtus boots',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 23,
			attack_ranged: -5,

			defence_stab: 9,
			defence_slash: 9,
			defence_crush: 9,
			defence_magic: 12,
			defence_ranged: 9,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 5,
			prayer: 1,
			slot: EquipmentSlot.Feet,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_047,
	'Gorajan archer helmet',
	'Pernix cowl',
	{
		equipment: {
			attack_stab: -5,
			attack_slash: -5,
			attack_crush: -5,
			attack_magic: -12,
			attack_ranged: 21,

			defence_stab: 25,
			defence_slash: 25,
			defence_crush: 17,
			defence_magic: 25,
			defence_ranged: 58,

			melee_strength: 0,
			ranged_strength: 5,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Head,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_048,
	'Gorajan archer top',
	'Pernix body',
	{
		equipment: {
			attack_stab: -5,
			attack_slash: -5,
			attack_crush: -5,
			attack_magic: -12,
			attack_ranged: 42,

			defence_stab: 25,
			defence_slash: 25,
			defence_crush: 25,
			defence_magic: 73,
			defence_ranged: 62,

			melee_strength: 0,
			ranged_strength: 5,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Body,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_049,
	'Gorajan archer legs',
	'Pernix chaps',
	{
		equipment: {
			attack_stab: -5,
			attack_slash: -5,
			attack_crush: -5,
			attack_magic: -12,
			attack_ranged: 26,

			defence_stab: 25,
			defence_slash: 15,
			defence_crush: 5,
			defence_magic: 45,
			defence_ranged: 38,

			melee_strength: 0,
			ranged_strength: 5,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Legs,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_050,
	'Gorajan archer gloves',
	'Pernix gloves',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: -5,
			attack_magic: -5,
			attack_ranged: 20,

			defence_stab: 4,
			defence_slash: 4,
			defence_crush: 1,
			defence_magic: 27,
			defence_ranged: 15,

			melee_strength: 0,
			ranged_strength: 5,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Hands,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(
	40_051,
	'Gorajan archer boots',
	'Pernix boots',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: -12,
			attack_ranged: 20,

			defence_stab: 4,
			defence_slash: 4,
			defence_crush: 3,
			defence_magic: 6,
			defence_ranged: 6,

			melee_strength: 0,
			ranged_strength: 5,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Feet,
			requirements: null
		}
	},
	55_000_000
);

setCustomItem(40_052, 'Scroll of mystery', 'Coal', {}, 1_000_000);

setCustomItem(40_060, 'Slayer master cape', 'Abyssal cape', {}, 200_000_000);

// ---------
setCustomItem(
	48_220,
	'Hellfire bow',
	'Twisted bow',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 220,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 25,
			magic_damage: 0,
			prayer: 10,
			slot: EquipmentSlot.TwoHanded,
			requirements: {
				ranged: 110
			}
		}
	},
	(getOSItem('Twisted bow').price + getOSItem('Zaryte bow').price) * 1.1
);
// ----------
// MMMR
setCustomItem(
	40_061,
	'Beginner rumble greegree',
	'Bronze dagger',
	{ customItemData: { isSuperUntradeable: true, cantBeSacrificed: true } },
	10_000
);
setCustomItem(
	40_062,
	'Intermediate rumble greegree',
	'Bronze dagger',
	{ customItemData: { isSuperUntradeable: true, cantBeSacrificed: true } },
	10_001
);
setCustomItem(
	40_063,
	'Ninja rumble greegree',
	'Bronze dagger',
	{ customItemData: { isSuperUntradeable: true, cantBeSacrificed: true } },
	10_002
);
setCustomItem(
	40_064,
	'Expert ninja rumble greegree',
	'Bronze dagger',
	{ customItemData: { isSuperUntradeable: true, cantBeSacrificed: true } },
	10_003
);
setCustomItem(
	40_065,
	'Elder rumble greegree',
	'Bronze dagger',
	{ customItemData: { isSuperUntradeable: true, cantBeSacrificed: true } },
	10_004
);
setCustomItem(
	40_066,
	'Gorilla rumble greegree',
	'Bronze dagger',
	{ customItemData: { isSuperUntradeable: true, cantBeSacrificed: true } },
	10_005
);

setCustomItem(40_067, 'Dwarven warnana', 'Dwarven warhammer', {}, 1_000_000_000);
setCustomItem(40_068, 'Twisted bownana', 'Twisted bow', {}, 500_000_000);
setCustomItem(40_069, 'Zaryte bownana', 'Zaryte bow', {}, 500_000_000);
setCustomItem(40_070, 'Hellfire bownana', 'Hellfire bow', {}, 500_000_000);

setCustomItem(
	40_071,
	'Hellfire bownana (broken)',
	'Twisted bow',
	{
		...UN_EQUIPPABLE
	},
	0
);

setCustomItem(40_072, 'Castle wars cape (beginner)', 'Fire cape', {}, 1_000_000);
setCustomItem(40_073, 'Castle wars cape (intermediate)', 'Fire cape', {}, 1_000_000);
setCustomItem(40_074, 'Castle wars cape (advanced)', 'Fire cape', {}, 1_000_000);
setCustomItem(40_075, 'Castle wars cape (expert)', 'Fire cape', {}, 1_000_000);
setCustomItem(40_076, 'Castle wars cape (legend)', 'Fire cape', {}, 1_000_000);

setCustomItem(40_077, 'Zaryte bow (ice)', 'Zaryte bow', {}, 500_000_000);
setCustomItem(40_078, 'Zaryte bow (shadow)', 'Zaryte bow', {}, 500_000_000);
setCustomItem(40_079, 'Zaryte bow (blood)', 'Zaryte bow', {}, 500_000_000);
setCustomItem(40_080, 'Zaryte bow (3a)', 'Zaryte bow', {}, 500_000_000);

setCustomItem(40_081, 'Twisted bow (ice)', 'Twisted bow', {}, 500_000_000);
setCustomItem(40_082, 'Twisted bow (shadow)', 'Twisted bow', {}, 500_000_000);
setCustomItem(40_083, 'Twisted bow (blood)', 'Twisted bow', {}, 500_000_000);
setCustomItem(40_084, 'Twisted bow (3a)', 'Twisted bow', {}, 500_000_000);

/**
 * Non-mystery box items
 *
 * Items from 45_000 - 50_000 will not be dropped by mystery boxes, but can be traded.
 */

// Birthday pack
setCustomItem(45_003, 'Glass of bubbly', 'Bronze dagger', {}, 1000);
setCustomItem(45_004, 'Party horn', 'Coal', {}, 1000);
setCustomItem(45_005, 'Party popper', 'Bronze dagger', {}, 1000);
setCustomItem(45_006, 'Party cake', 'Coal', {}, 1000);
setCustomItem(45_007, 'Cake hat', 'Coif', {}, 1000);
setCustomItem(45_008, 'Sparkler', 'Coal', {}, 1000);
setCustomItem(45_009, 'Party music box', 'Coal', {}, 1000);
setCustomItem(45_010, 'Birthday pack', 'Coal', {}, 1000);

// Gamblers box
setCustomItem(45_100, 'Gamblers bag', 'Coal', {}, 1000);
setCustomItem(45_101, '4 sided die', 'Coal', {}, 1000);
setCustomItem(45_102, '6 sided die', 'Coal', {}, 1000);
setCustomItem(45_103, '8 sided die', 'Coal', {}, 1000);
setCustomItem(45_104, '10 sided die', 'Coal', {}, 1000);
setCustomItem(45_105, '12 sided die', 'Coal', {}, 1000);
setCustomItem(45_106, '20 sided die', 'Coal', {}, 1000);
setCustomItem(45_107, '100 sided die', 'Coal', {}, 1000);
setCustomItem(45_108, 'Ring of luck', 'Berserker ring', {}, 1000);

// Royal mystery box
setCustomItem(47_500, 'Diamond sceptre', 'Rune sword', {}, 1_000_000);
setCustomItem(47_501, 'Diamond crown', 'Bronze full helm', {}, 1_000_000);
setCustomItem(47_502, 'Royal mystery box', 'Mystery box', { tradeable_on_ge: true, tradeable: true }, 1_000_000);

// 1st age
setCustomItem(47_503, 'First age tiara', 'Rune full helm', {}, 100_000_000);
setCustomItem(47_504, 'First age amulet', 'Amulet of strength', {}, 100_000_000);
setCustomItem(47_505, 'First age cape', 'Fire cape', { tradeable_on_ge: true, tradeable: true }, 100_000_000);
setCustomItem(47_506, 'First age bracelet', 'Barrows gloves', { tradeable_on_ge: true, tradeable: true }, 100_000_000);
setCustomItem(47_507, 'First age ring', 'Berserker ring', {}, 100_000_000);

setCustomItem(47_508, 'Broken dwarven warhammer', 'Rune warhammer', {}, 1_000_000_000);

setCustomItem(47_509, 'Equippable mystery box', 'Mystery box', { tradeable_on_ge: true, tradeable: true }, 1_000_000);

setCustomItem(47_510, 'Deathtouched dart', 'Rune dart', {}, 5_000_000);

setCustomItem(
	47_511,
	'Drygore longsword',
	"Vesta's longsword",
	{
		equipment: {
			attack_stab: 25,
			attack_slash: 130,
			attack_crush: 36,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 55,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Weapon,
			requirements: null
		}
	},
	200_000_000
);
setCustomItem(
	47_512,
	'Offhand drygore longsword',
	"Vesta's longsword",
	{
		equipment: {
			attack_stab: 2,
			attack_slash: 45,
			attack_crush: 5,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Shield,
			requirements: null
		}
	},
	100_000_000
);

setCustomItem(
	47_513,
	'Drygore mace',
	"Inquisitor's mace",
	{
		equipment: {
			attack_stab: 52,
			attack_slash: -10,
			attack_crush: 130,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 3,
			slot: EquipmentSlot.Weapon,
			requirements: null
		}
	},
	200_000_000
);
setCustomItem(
	47_514,
	'Offhand drygore mace',
	"Inquisitor's mace",
	{
		equipment: {
			attack_stab: 32,
			attack_slash: -20,
			attack_crush: 50,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 5,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 3,
			slot: EquipmentSlot.Shield,
			requirements: null
		}
	},
	100_000_000
);

setCustomItem(
	47_515,
	'Drygore rapier',
	'Ghrazi rapier',
	{
		equipment: {
			attack_stab: 120,
			attack_slash: 45,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 95,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Weapon,
			requirements: null
		}
	},
	200_000_000
);
setCustomItem(
	47_516,
	'Offhand drygore rapier',
	'Ghrazi rapier',
	{
		equipment: {
			attack_stab: 35,
			attack_slash: 9,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 10,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Shield,
			requirements: null
		}
	},
	100_000_000
);

setCustomItem(47_517, 'Perfect chitin', 'Magic seed', {}, 1_000_000);

setCustomItem(47_521, 'Beach mystery box', 'Mystery box', { tradeable_on_ge: true, tradeable: true }, 1_000_000);
setCustomItem(47_523, 'Beach ball', 'Coal', {}, 100_000);
setCustomItem(47_524, 'Water balloon', 'Coal', {}, 100_000);
setCustomItem(47_525, 'Ice cream', 'Coal', {}, 100_000);
setCustomItem(47_526, 'Crab hat', 'Santa hat', {}, 100_000);

setCustomItem(47_528, "Bryophyta's staff(i)", "Bryophyta's staff", {}, 1_000_000);

/**
 * -----------------------------------------------------------------------------------------------
 * Dyes
 * -----------------------------------------------------------------------------------------------
 */
// Ice
setCustomItem(41_053, 'Offhand drygore rapier (ice)', 'Offhand drygore rapier', {}, 200_000_000);
setCustomItem(41_054, 'Drygore rapier (ice)', 'Drygore rapier', {}, 200_000_000);
setCustomItem(41_055, 'Offhand drygore mace (ice)', 'Offhand Drygore mace', {}, 200_000_000);
setCustomItem(41_056, 'Drygore mace (ice)', 'Drygore mace', {}, 200_000_000);
setCustomItem(41_057, 'Offhand drygore longsword (ice)', 'Offhand drygore longsword', {}, 200_000_000);
setCustomItem(41_058, 'Drygore longsword (ice)', 'Drygore longsword', {}, 200_000_000);

// Blood
setCustomItem(41_059, 'Offhand drygore rapier (blood)', 'Offhand drygore rapier', {}, 200_000_000);
setCustomItem(41_060, 'Drygore rapier (blood)', 'Drygore rapier', {}, 200_000_000);
setCustomItem(41_061, 'Offhand drygore mace (blood)', 'Offhand Drygore mace', {}, 200_000_000);
setCustomItem(41_062, 'Drygore mace (blood)', 'Drygore mace', {}, 200_000_000);
setCustomItem(41_063, 'Offhand drygore longsword (blood)', 'Offhand drygore longsword', {}, 200_000_000);
setCustomItem(41_064, 'Drygore longsword (blood)', 'Drygore longsword', {}, 200_000_000);
// Shadow
setCustomItem(41_065, 'Offhand drygore rapier (shadow)', 'Offhand drygore rapier', {}, 200_000_000);
setCustomItem(41_066, 'Drygore rapier (shadow)', 'Drygore rapier', {}, 200_000_000);
setCustomItem(41_067, 'Offhand drygore mace (shadow)', 'Offhand Drygore mace', {}, 200_000_000);
setCustomItem(41_068, 'Drygore mace (shadow)', 'Drygore mace', {}, 200_000_000);
setCustomItem(41_069, 'Offhand drygore longsword (shadow)', 'Offhand drygore longsword', {}, 200_000_000);
setCustomItem(41_070, 'Drygore longsword (shadow)', 'Drygore longsword', {}, 200_000_000);
// 3a
setCustomItem(41_071, 'Offhand drygore rapier (3a)', 'Offhand drygore rapier', {}, 200_000_000);
setCustomItem(41_072, 'Drygore rapier (3a)', 'Drygore rapier', {}, 200_000_000);
setCustomItem(41_073, 'Offhand drygore mace (3a)', 'Offhand Drygore mace', {}, 200_000_000);
setCustomItem(41_074, 'Drygore mace (3a)', 'Drygore mace', {}, 200_000_000);
setCustomItem(41_075, 'Offhand drygore longsword (3a)', 'Offhand drygore longsword', {}, 200_000_000);
setCustomItem(41_076, 'Drygore longsword (3a)', 'Drygore longsword', {}, 200_000_000);

setCustomItem(41_077, 'Master runecrafter hat', 'Rune full helm', {}, 1_000_000);
setCustomItem(41_078, 'Master runecrafter robe', 'Rune platebody', {}, 1_000_000);
setCustomItem(41_079, 'Master runecrafter skirt', 'Rune platelegs', {}, 1_000_000);
setCustomItem(41_080, 'Master runecrafter boots', 'Rune boots', {}, 1_000_000);
setCustomItem(41_081, 'Elder pouch', 'Coal', {}, 1_000_000);
setCustomItem(41_082, 'Elder thread', 'Coal', {}, 1_000_000);
setCustomItem(41_083, 'Elder talisman', 'Coal', {}, 1_000_000);
setCustomItem(
	41_084,
	'Vasa cloak',
	'Infernal cape',
	{
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal cape',
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 38,
			attack_ranged: 0,
			defence_stab: 36,
			defence_slash: 36,
			defence_crush: 36,
			defence_magic: 36,
			defence_ranged: 36,
			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 2,
			prayer: 10,
			slot: EquipmentSlot.Cape,
			requirements: null
		}
	},
	20_000_000
);
setCustomItem(41_085, 'Tattered robes of Vasa', 'Coal', { highalch: 90_000_000 }, 1_000_000);

/**
 * Dyed DWWH Items
 */
setCustomItem(41_086, 'Dwarven warhammer (ice)', 'Dwarven warhammer', {}, 1_000_000_000);
setCustomItem(41_087, 'Dwarven warhammer (shadow)', 'Dwarven warhammer', {}, 1_000_000_000);
setCustomItem(41_088, 'Dwarven warhammer (blood)', 'Dwarven warhammer', {}, 1_000_000_000);
setCustomItem(41_089, 'Dwarven warhammer (3a)', 'Dwarven warhammer', {}, 1_000_000_000);

/**
 * Dyed DG Items
 */

setCustomItem(41_100, 'Gorajan warrior helmet (Primal)', 'Gorajan warrior helmet', {}, 55_000_000);
setCustomItem(41_101, 'Gorajan warrior top (Primal)', 'Gorajan warrior top', {}, 55_000_000);
setCustomItem(41_102, 'Gorajan warrior legs (Primal)', 'Gorajan warrior legs', {}, 55_000_000);
setCustomItem(41_103, 'Gorajan warrior gloves (Primal)', 'Gorajan warrior gloves', {}, 55_000_000);
setCustomItem(41_104, 'Gorajan warrior boots (Primal)', 'Gorajan warrior boots', {}, 55_000_000);

setCustomItem(40_105, 'Gorajan occult helmet (Celestial)', 'Gorajan occult helmet', {}, 55_000_000);
setCustomItem(40_106, 'Gorajan occult top (Celestial)', 'Gorajan occult top', {}, 55_000_000);
setCustomItem(40_107, 'Gorajan occult legs (Celestial)', 'Gorajan occult legs', {}, 55_000_000);
setCustomItem(40_108, 'Gorajan occult gloves (Celestial)', 'Gorajan occult gloves', {}, 55_000_000);
setCustomItem(40_109, 'Gorajan occult boots (Celestial)', 'Gorajan occult boots', {}, 55_000_000);

setCustomItem(40_110, 'Gorajan archer helmet (Sagittarian)', 'Gorajan archer helmet', {}, 55_000_000);
setCustomItem(40_111, 'Gorajan archer top (Sagittarian)', 'Gorajan archer top', {}, 55_000_000);
setCustomItem(40_112, 'Gorajan archer legs (Sagittarian)', 'Gorajan archer legs', {}, 55_000_000);
setCustomItem(40_113, 'Gorajan archer gloves (Sagittarian)', 'Gorajan archer gloves', {}, 55_000_000);
setCustomItem(40_114, 'Gorajan archer boots (Sagittarian)', 'Gorajan archer boots', {}, 55_000_000);

/**
 *
 * Dungeoneering
 *
 * 48_000 - 48_500
 */

setCustomItem(48_000, 'Chaotic rapier', 'Drygore rapier', {}, 20_000_000);
setCustomItem(48_001, 'Chaotic longsword', 'Drygore longsword', {}, 20_000_000);
setCustomItem(48_002, 'Chaotic maul', 'Drygore mace', {}, 20_000_000);
setCustomItem(48_003, 'Chaotic staff', "Zuriel's staff", {}, 20_000_000);
setCustomItem(48_004, 'Chaotic crossbow', 'Armadyl crossbow', {}, 20_000_000);

setCustomItem(48_005, 'Offhand Chaotic rapier', 'Offhand drygore rapier', {}, 20_000_000);
setCustomItem(48_006, 'Offhand Chaotic longsword', 'Offhand drygore longsword', {}, 20_000_000);
setCustomItem(48_007, 'Offhand Chaotic crossbow', 'Rune kiteshield', {}, 20_000_000);
setCustomItem(48_008, 'Farseer kiteshield', 'Rune kiteshield', {}, 20_000_000);
setCustomItem(
	48_009,
	'Arcane blast necklace',
	'Amulet of fury',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 25,
			attack_ranged: 0,
			defence_stab: 10,
			defence_slash: 10,
			defence_crush: 10,
			defence_magic: 10,
			defence_ranged: 10,
			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 15,
			prayer: 5,
			slot: EquipmentSlot.Neck,
			requirements: {
				defence: 99,
				// @ts-expect-error dgg
				dungeoneering: 99,
				magic: 99
			}
		}
	},
	20_000_000
);
setCustomItem(
	48_010,
	'Farsight snapshot necklace',
	'Amulet of fury',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 25,
			defence_stab: 10,
			defence_slash: 10,
			defence_crush: 0,
			defence_magic: 10,
			defence_ranged: 10,
			melee_strength: 0,
			ranged_strength: 10,
			magic_damage: 0,
			prayer: 5,
			slot: EquipmentSlot.Neck,
			requirements: {
				defence: 99,
				// @ts-expect-error dgg
				dungeoneering: 99,
				ranged: 99
			}
		}
	},
	20_000_000
);
setCustomItem(
	48_011,
	"Brawler's hook necklace",
	'Amulet of fury',
	{
		equipment: {
			attack_stab: 21,
			attack_slash: 21,
			attack_crush: 21,
			attack_magic: 0,
			attack_ranged: 0,
			defence_stab: 10,
			defence_slash: 10,
			defence_crush: 10,
			defence_magic: 10,
			defence_ranged: 10,
			melee_strength: 15,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 5,
			slot: EquipmentSlot.Neck,
			requirements: {
				defence: 99,
				// @ts-expect-error dgg
				dungeoneering: 99
			}
		}
	},
	20_000_000
);
setCustomItem(48_012, 'Gorajan shards', 'Coal', {}, 1_000_000);
setCustomItem(48_013, 'Gorajan bonecrusher', 'Coal', {}, 20_000_000);
setCustomItem(48_014, 'Gorajan bonecrusher (u)', 'Coal', {}, 20_000_000);
/**
 * END DUNGEONEERING
 */

setCustomItem(48_200, 'Scroll of farming', 'Coal', {}, 1_000_000);

setCustomItem(48_201, 'Shadow dye', 'Coal', {}, 100_000_000);
setCustomItem(48_202, 'Ice dye', 'Coal', {}, 100_000_000);
setCustomItem(48_203, 'Blood dye', 'Coal', {}, 100_000_000);
setCustomItem(48_204, 'Third age dye', 'Coal', {}, 100_000_000);
setCustomItem(
	48_205,
	'Ignis ring',
	'Berserker ring',
	{
		equipment: {
			attack_stab: 4,
			attack_slash: 5,
			attack_crush: 4,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 29,
			defence_slash: 29,
			defence_crush: 29,
			defence_magic: 29,
			defence_ranged: 32,

			melee_strength: 15,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Ring,
			requirements: {
				defence: 105
			}
		}
	},
	100_000_000
);
setCustomItem(
	48_206,
	'Ignis ring(i)',
	'Berserker ring',
	{
		equipment: {
			attack_stab: 9,
			attack_slash: 7,
			attack_crush: 8,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 38,
			defence_slash: 36,
			defence_crush: 38,
			defence_magic: 39,
			defence_ranged: 42,

			melee_strength: 21,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Ring,
			requirements: {
				defence: 105
			}
		}
	},
	100_000_000
);
setCustomItem(
	48_207,
	'Ignecarus scales',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);

setCustomItem(
	48_208,
	'Ignecarus dragonclaw',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);

setCustomItem(
	48_209,
	"Dragon's fury",
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);

setCustomItem(
	48_210,
	'Dragon egg',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);
/**
 * Independence Box
 */
setCustomItem(
	48_211,
	'Independence box',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(
	48_212,
	'Fireworks',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(
	48_213,
	'Liber tea',
	'Rune sword',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(
	48_214,
	"Sam's hat",
	'Rune full helm',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(48_215, 'Simple kibble', 'Coal', {}, 150_000);
setCustomItem(48_216, 'Delicious kibble', 'Coal', {}, 200_000);
setCustomItem(48_217, 'Extraordinary kibble', 'Coal', {}, 250_000);
setCustomItem(48_218, 'Magic crate', 'Coal', {}, 300_000);

setCustomItem(
	48_219,
	'Hellfire arrow',
	'Barbed arrow',
	{
		tradeable: true,
		tradeable_on_ge: true,
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 45,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 120,
			magic_damage: 0,
			prayer: 0,
			slot: EquipmentSlot.Ammo,
			requirements: {
				ranged: 110
			}
		}
	},
	10_000
);

setCustomItem(
	48_221,
	'Hellfire bow (broken)',
	'Twisted bow',
	{
		...UN_EQUIPPABLE
	},
	0
);

setCustomItem(48_222, 'Hellfire arrowtips', 'Dragon arrowtips', {}, 1000);
setCustomItem(48_223, 'Scroll of the hunt', 'Coal', {}, 1_000_000);

// MMMR

setCustomItem(48_224, 'Monkey egg', 'Egg', {}, 100_000_000);
setCustomItem(48_225, 'Banana enchantment scroll', 'Egg', {}, 1_000_000);
setCustomItem(48_226, 'Chimpling jar', 'Egg', {}, 100_000);
setCustomItem(48_228, 'Monkey dye', 'Egg', {}, 10_000_000);
setCustomItem(48_229, 'Marimbo statue', 'Egg', {}, 10_000_000);
setCustomItem(48_230, 'Big banana', 'Bronze kiteshield', {}, 100_000);

setCustomItem(48_324, 'Blacksmith crate', 'Mystery box', { tradeable: true, tradeable_on_ge: true }, 100_000);

setCustomItem(48_240, 'Ignecarus mask', 'Rune full helm', {}, 1_000_000);
setCustomItem(48_241, 'Malygos mask', 'Rune full helm', {}, 1_000_000);
setCustomItem(48_242, 'Daemonheim agility pass', 'Coal', {}, 1_000_000);
setCustomItem(48_243, 'Web cloak', 'Red cape', {}, 100_000);
setCustomItem(48_244, 'Toy kite', 'Bronze dagger', {}, 100_000);
setCustomItem(48_245, 'Grim reaper hood', 'Rune full helm', {}, 100_000);
setCustomItem(48_246, 'Chocatrice cape', 'Red cape', {}, 100_000);
setCustomItem(48_247, 'Warlock top', 'Bronze platebody', {}, 100_000);
setCustomItem(48_248, 'Warlock legs', 'Bronze platelegs', {}, 100_000);
setCustomItem(48_249, 'Warlock cloak', 'Red cape', {}, 100_000);
setCustomItem(48_250, 'Witch top', 'Bronze platebody', {}, 100_000);
setCustomItem(48_251, 'Witch skirt', 'Bronze platelegs', {}, 100_000);
setCustomItem(48_252, 'Witch cloak', 'Red cape', {}, 100_000);
setCustomItem(48_253, 'Ring of snow', 'Emerald ring', {}, 100_000);
setCustomItem(48_254, 'Dungeoneering dye', 'Coal', {}, 100_000);

setCustomItem(48_255, 'Human appendage', 'Coal', {}, 100_000);
setCustomItem(48_256, 'Sliced femur', 'Coal', {}, 100_000);
setCustomItem(48_257, 'Human blood', 'Coal', {}, 100_000);
setCustomItem(48_258, 'Human tooth', 'Coal', {}, 100_000);

setCustomItem(48_259, 'Chocolified skull', 'Coal', {}, 10_000);
setCustomItem(48_260, 'Eyescream', 'Coal', {}, 10_000);
setCustomItem(48_261, 'Rotten sweets', 'Coal', {}, 10_000);
setCustomItem(48_262, 'Toffeet', 'Coal', {}, 10_000);
setCustomItem(48_263, 'Candy teeth', 'Coal', {}, 10_000);
setCustomItem(48_264, 'Hairyfloss', 'Coal', {}, 10_000);
setCustomItem(48_265, 'Goblinfinger soup', 'Coal', {}, 10_000);
setCustomItem(48_266, "Benny's brain brew", 'Coal', {}, 10_000);
setCustomItem(48_267, 'Roasted newt', 'Coal', {}, 10_000);
setCustomItem(48_273, "Choc'rock", 'Coal', {}, 100_000);

setCustomItem(48_305, 'Haunted cloak', 'Red cape', {}, 10_000);
setCustomItem(48_306, "Pumpkinhead's headbringer", 'Dragon axe', {}, 10_000);
setCustomItem(48_307, "Pumpkinhead's pumpkin head", 'Rune full helm', {}, 10_000);
setCustomItem(48_308, 'Haunted amulet', 'Amulet of strength', {}, 10_000);
setCustomItem(48_309, 'Haunted gloves', 'Rune gloves', {}, 10_000);
setCustomItem(48_310, 'Haunted boots', 'Rune boots', {}, 10_000);
setCustomItem(48_312, 'Mysterious token', 'Coal', {}, 100_000);

setCustomItem(48_313, 'Baby raven', 'Herbi', {}, 1_000_000);
setCustomItem(48_314, 'Raven', 'Herbi', {}, 1_000_000);
setCustomItem(48_315, 'Shiny cat', 'Herbi', {}, 1_000_000);
setCustomItem(48_316, 'Baby duckling', 'Herbi', {}, 1_000_000);
setCustomItem(48_317, 'Magic kitten', 'Herbi', {}, 1_000_000);
setCustomItem(48_318, 'Magic cat', 'Herbi', {}, 1_000_000);
setCustomItem(
	48_319,
	'Infernal core',
	'Coal',
	{
		customItemData: {
			isSuperUntradeable: true
		}
	},
	10_000_000
);
setCustomItem(
	48_320,
	'Infernal bulwark',
	"Dinh's bulwark",
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 140,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 129,
			defence_slash: 135,
			defence_crush: 129,
			defence_magic: -19,
			defence_ranged: 169,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.TwoHanded,
			requirements: {
				defence: 105,
				strength: 105
			}
		},
		customItemData: {
			isSuperUntradeable: true
		}
	},
	50_000_000
);
setCustomItem(
	48_321,
	'Head of TzKal Zuk',
	'Coal',
	{
		customItemData: {
			isSuperUntradeable: true
		}
	},
	10_000_000
);
setCustomItem(
	48_322,
	'TzKal cape',
	'Abyssal cape',
	{
		equipment: {
			attack_stab: 20,
			attack_slash: 20,
			attack_crush: 20,
			attack_magic: 6,
			attack_ranged: 6,
			defence_stab: 44,
			defence_slash: 44,
			defence_crush: 44,
			defence_magic: 44,
			defence_ranged: 44,
			melee_strength: 34,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 12,
			slot: EquipmentSlot.Cape,
			requirements: {
				defence: 100
			}
		},
		customItemData: {
			isSuperUntradeable: true
		}
	},
	10_000_000
);
setCustomItem(
	48_323,
	'Infernal slayer helmet',
	'Gorajan warrior helmet',
	{
		customItemData: {
			isSuperUntradeable: true
		}
	},
	10_000_000
);

setCustomItem(
	48_326,
	"TzKal-Zuk's skin",
	'Coal',
	{
		customItemData: {
			isSuperUntradeable: true
		}
	},
	10_000_000
);
setCustomItem(
	48_327,
	'Infernal slayer helmet(i)',
	'Gorajan warrior helmet',
	{
		customItemData: {
			isSuperUntradeable: true
		}
	},
	10_000_000
);

setCustomItem(48_329, 'Raw turkey', 'Coal', {}, 100_000);
setCustomItem(48_330, 'Turkey', 'Coal', {}, 100_000);
setCustomItem(48_331, 'Turkey drumstick', 'Coal', {}, 100_000);
setCustomItem(48_332, 'Burnt turkey', 'Coal', {}, 100_000);
setCustomItem(48_333, 'Cornucopia', 'Coal', {}, 100_000);
setCustomItem(
	48_334,
	'Easter egg crate',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	48_335,
	'Decorative easter eggs',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	48_336,
	'Leia',
	'Herbi',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	48_337,
	'Chickaxe',
	'Dragon pickaxe',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

/**
 * Misc Items
 *
 * 50_000 - 60_000
 */
setCustomItem(50_001, 'Raw rocktail', 'Raw trout', {}, 10_000);
setCustomItem(50_002, 'Rocktail', 'Trout', {}, 10_000);

// Blacksmith
setCustomItem(50_003, 'Blacksmith helmet', 'Rune full helm', {}, 100_000);
setCustomItem(50_004, 'Blacksmith top', 'Rune platebody', {}, 100_000);
setCustomItem(50_005, 'Blacksmith apron', 'Rune platelegs', {}, 100_000);
setCustomItem(50_006, 'Blacksmith gloves', 'Leather gloves', {}, 100_000);
setCustomItem(50_007, 'Blacksmith boots', 'Rune boots', {}, 100_000);

setCustomItem(50_008, 'Mysterious seed', 'Magic seed', {}, 100_000);
setCustomItem(50_009, 'Athelas seed', 'Magic seed', {}, 50_000);
setCustomItem(50_010, 'Athelas', 'Magic seed', { buy_limit: 500 }, 100_000);

// Master farmer
setCustomItem(50_011, 'Ent hide', 'Magic seed', {}, 1_000_000);
setCustomItem(50_012, 'Master farmer hat', 'Rune full helm', {}, 1_000_000);
setCustomItem(50_013, 'Master farmer jacket', 'Rune platebody', {}, 1_000_000);
setCustomItem(50_014, 'Master farmer pants', 'Rune platelegs', {}, 1_000_000);
setCustomItem(50_015, 'Master farmer gloves', 'Leather gloves', {}, 1_000_000);
setCustomItem(50_016, 'Master farmer boots', 'Rune boots', {}, 1_000_000);

setCustomItem(50_017, 'Elder logs', 'Magic logs', {}, 19_000);
setCustomItem(50_018, 'Elder plank', 'Mahogany plank', {}, 10_000);
setCustomItem(50_019, 'Elder bow(u)', 'Magic logs', { highalch: 1025 }, 10_000);
setCustomItem(50_020, 'Elder bow', 'Mahogany plank', { highalch: 2100 }, 19_000);
setCustomItem(50_021, 'Elder rune', 'Fire rune', {}, 500);
setCustomItem(50_022, 'Jar of magic', 'Fire rune', {}, 1_000_000);
setCustomItem(50_023, 'Magus scroll', 'Fire rune', {}, 500_000);
setCustomItem(
	50_024,
	'Magical artifact',
	'Fire rune',
	{
		highalch: 50_000_000
	},
	50_000_000
);

setCustomItem(
	50_025,
	'Heat res. vial',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);

setCustomItem(
	50_026,
	'Heat res. brew',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(
	50_027,
	'Heat res. restore',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(
	50_028,
	'Athelas paste',
	'Fire rune',
	{
		highalch: 3000
	},
	6000
);
setCustomItem(
	50_035,
	'Scroll of longevity',
	'Fire rune',
	{
		highalch: 100_000
	},
	100_000
);

setCustomItem(
	50_036,
	'Mango',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(
	50_037,
	'Mango seed',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(
	50_038,
	'Avocado',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(
	50_039,
	'Avocado seed',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(
	50_040,
	'Lychee',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(
	50_041,
	'Lychee seed',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(
	50_042,
	'Elder bird house',
	'Fire rune',
	{
		highalch: 1000
	},
	1000
);

setCustomItem(50_043, 'Infernal impling jar', 'Coal', {}, 50_000);
setCustomItem(50_044, 'Eternal impling jar', 'Coal', {}, 50_000);
setCustomItem(50_045, 'Mystery impling jar', 'Coal', {}, 50_000);
setCustomItem(50_046, 'Rumble token', 'Coal', {}, 1000);
setCustomItem(50_047, 'Magic banana', 'Coal', {}, 1000);
setCustomItem(50_048, 'Monkey crate', 'Coal', {}, 10_000);

setCustomItem(
	50_049,
	'Frost dragon bones',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

/**
 *
 * Stone spirits
 *
 */
setCustomItem(
	50_050,
	'Copper stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_051,
	'Tin stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_052,
	'Iron stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_053,
	'Coal stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_054,
	'Silver stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_055,
	'Mithril stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_056,
	'Adamantite stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_057,
	'Gold stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_058,
	'Runite stone spirit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_059,
	'Brackish blade',
	'Dragon sword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(50_060, 'Neem drupe', 'Coal', {}, 1000);
setCustomItem(50_061, 'Neem oil', 'Coal', {}, 1000);
setCustomItem(50_063, 'Polypore spore', 'Coal', {}, 1000);
setCustomItem(
	50_064,
	'Gorajian mushroom',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_065,
	'Grifolic gloves',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_066,
	'Grifolic orb',
	"Mage's book",
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(50_067, 'Grifolic flake', 'Coal', {}, 1000);
setCustomItem(
	50_068,
	'Grifolic shield',
	'Dragon sq shield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_069,
	'Grifolic wand',
	'Master wand',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_070,
	'Ganodermic boots',
	'Wizard boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_071,
	'Ganodermic gloves',
	'Mystic gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(50_072, 'Ganodermic flake', 'Coal', {}, 1000);
setCustomItem(
	50_073,
	'Polypore stick',
	'Master wand',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(50_074, 'Mycelium visor web', 'Mystic hat', {}, 1000);
setCustomItem(50_075, 'Mycelium poncho web', 'Mystic robe top', {}, 1000);
setCustomItem(50_076, 'Mycelium leggings web', 'Mystic robe bottom', {}, 1000);
setCustomItem(
	50_077,
	'Ganodermic leggings',
	'Mystic robe bottom',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_078,
	'Ganodermic poncho',
	'Mystic robe top',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	50_079,
	'Ganodermic visor',
	'Mystic hat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_080,
	'Grifolic visor',
	'Mystic hat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_081,
	'Grifolic poncho',
	'Mystic robe top',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_082,
	'Grifolic leggings',
	'Mystic robe bottom',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_083,
	'Tombshroom spore',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_084,
	'Tombshroom',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_085,
	'Queen black dragonling',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(50_086, 'Royal dragonhide', 'Coal', {}, 1000);
setCustomItem(50_087, 'Royal dragon leather', 'Coal', {}, 1000);
setCustomItem(50_088, 'Royal bolts', 'Runite bolts', {}, 1000);
setCustomItem(
	50_089,
	'Royal dragonhide coif',
	'Armadyl helmet',
	{
		highalch: 3000 * 2,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_090,
	'Royal dragonhide body',
	'Armadyl chestplate',
	{
		highalch: 3000 * 3,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_091,
	'Royal dragonhide chaps',
	'Armadyl chainskirt',
	{
		highalch: 3000 * 2,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_092,
	'Royal dragonhide boots',
	'Leather boots',
	{
		highalch: 3000 * 1,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_093,
	'Royal dragonhide vambraces',
	"Black d'hide vambraces",
	{
		highalch: 3000 * 2,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_094,
	'Royal torsion spring',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_095,
	'Royal sight',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_096,
	'Royal frame',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	50_097,
	'Royal bolt stabiliser',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_098,
	'Royal crossbow',
	'Chaotic crossbow',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 123,
			defence_stab: 2,
			defence_slash: 2,
			defence_crush: 2,
			defence_magic: 12,
			defence_ranged: 12,
			melee_strength: 0,
			ranged_strength: 5,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.TwoHanded,
			requirements: {
				ranged: 105
			}
		}
	},
	1000
);
setCustomItem(
	50_099,
	'Dragonbone upgrade kit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_100,
	'Dragonbone mage hat',
	'Infinity hat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_101,
	'Dragonbone mage gloves',
	'Infinity gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_102,
	'Dragonbone mage bottoms',
	'Infinity bottoms',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_103,
	'Dragonbone mage boots',
	'Infinity boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_104,
	'Dragonbone gloves',
	'Barrows gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_105,
	'Dragonbone platelegs',
	'Dragon platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_106,
	'Dragonbone platebody',
	'Dragon platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_107,
	'Dragonbone full helm',
	'Dragon full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_108,
	'Dragonbone boots',
	'Dragon boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_109,
	'Dragonbone mage top',
	'Infinity top',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_110,
	'Royal dragon kiteshield',
	'Dragon kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	12_000_000
);
setCustomItem(
	50_111,
	'Royal dragon bones',
	'Dragon bones',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(50_112, 'Morchella mushroom spore', 'Coal', {}, 1000);
setCustomItem(
	50_113,
	'Morchella mushroom',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	50_114,
	'Polypore staff',
	'Kodai wand',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	50_116,
	'Squid dye',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000_000
);

setCustomItem(
	62_100,
	'Frozen santa hat',
	'Santa hat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_101,
	'Smokey bbq sauce',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_102,
	'Pumpkinhead pie',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_103,
	'Roasted ham',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_104,
	'Corn on the cob',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_105,
	"Dougs' chocolate mud",
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_106,
	"Shepherd's pie",
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_108,
	'Flappy meal',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_109,
	'Yule log',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_110,
	'Christmas pudding',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_111,
	'Christmas pudding amulet',
	'Amulet of strength',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_112,
	'Festive mistletoe',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_113,
	'Christmas tree kite',
	'Rune kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_114,
	'Gr-egg-oyle special',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_115,
	'Christmas tree hat',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_116,
	'Roast potatoes',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_117,
	'Ratatouille',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_118,
	'Fish n chips',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_119,
	'Pretzel',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_120,
	'Bacon',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_121,
	'Prawns',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_122,
	'Pavlova',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	50_000
);
setCustomItem(
	62_336,
	'Festive jumper (2021)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_337,
	'Festive present',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	62_338,
	'Festive wrapping paper',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	62_348,
	'Golden shard',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000_000
);
setCustomItem(
	62_356,
	'Smokey painting',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	5_000_000
);

setCustomItem(
	62_546,
	'Golden partyhat',
	'Yellow partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000_000
);
setCustomItem(
	50_117,
	'Eastern ferret',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100
);
setCustomItem(
	50_589,
	'Pink partyhat',
	'White partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	200_000_000
);

setCustomItem(
	50_599,
	'Divine water',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	50_600,
	'Dragon claw',
	'Dragon dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	50_601,
	'Offhand dragon claw',
	'Dragon dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		equipment: {
			...getOSItem('Dragon dagger').equipment!,
			slot: EquipmentSlot.Shield
		}
	},
	100_000
);

setCustomItem(
	50_602,
	'Ruined dragon armour lump',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	50_603,
	'Ruined dragon armour shard',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	50_604,
	'Ruined dragon armour slice',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	50_605,
	'Royal dragon platebody',
	'Dragon platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	52_616,
	'Double loot token',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	100_000_000
);

setCustomItem(
	152_616,
	'Tormented skull',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		examine: "Almost sounds like there's screaming coming from inside it..."
	},
	100_000_000
);

setCustomItem(
	52_620,
	'Celebratory cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	121_234,
	'Burnt celebratory cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	121_521,
	'Celebratory cake with candle',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	122_001,
	'Lit celebratory cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	122_002,
	"Olof's gold",
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);
setCustomItem(
	122_003,
	'Bingo ticket',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	1_000_000
);
setCustomItem(
	63_204,
	'Chimpchompa',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(52_617, 'Lava flower crown', 'Flower crown', { tradeable: true, tradeable_on_ge: true }, 10_000);
setCustomItem(52_618, 'Purple flower crown', 'Flower crown', { tradeable: true, tradeable_on_ge: true }, 10_000);
setCustomItem(52_630, 'Beehive', 'Coal', {}, 10_000);
setCustomItem(52_631, 'Honeycomb', 'Coal', {}, 10_000);
setCustomItem(52_632, 'Honey', 'Coal', {}, 10_000);
setCustomItem(52_633, 'Buzz', 'Herbi', { tradeable: true, tradeable_on_ge: true }, 1_000_000);
setCustomItem(
	52_634,
	'Elder table',
	'Coal',
	{ customItemData: { isSuperUntradeable: true, cantDropFromMysteryBoxes: true } },
	1
);
setCustomItem(70_001, 'Grimy korulsi', 'Coal', {}, 100_000);
setCustomItem(70_002, 'Korulsi', 'Coal', {}, 100_000);
setCustomItem(70_003, 'Korulsi seed', 'Coal', {}, 50_000);
setCustomItem(70_004, 'Enhanced saradomin brew', 'Coal', {}, 10_000);
setCustomItem(70_005, 'Enhanced super restore', 'Coal', {}, 10_000);
setCustomItem(70_006, 'Enhanced stamina potion', 'Coal', {}, 10_000);
setCustomItem(70_007, 'Enhanced divine water', 'Coal', {}, 10_000);
setCustomItem(
	70_008,
	'Dark crystal',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	15_000_000
);
setCustomItem(
	70_009,
	'Void staff (u)',
	'Master wand',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 200,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 20,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 15,
			prayer: 0,
			slot: EquipmentSlot.Weapon,
			requirements: null
		},
		highalch: 50_000_000,
		tradeable: true,
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	50_000_000
);
setCustomItem(
	70_010,
	'Void staff',
	'Battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 250,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 50,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 17.5,
			prayer: 0,
			slot: EquipmentSlot.Weapon,
			requirements: { magic: 90 }
		},
		highalch: 50_000_000
	},
	50_000_000
);
setCustomItem(
	70_011,
	'Dark animica',
	'Runite ore',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	25_000
);
setCustomItem(
	70_012,
	'Tattered tome',
	'Magic seed',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	25_000_000
);
setCustomItem(
	70_013,
	'Abyssal tome',
	'Book of law',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 45,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 35,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 2.5,
			prayer: 5,
			slot: EquipmentSlot.Shield,
			requirements: { magic: 90 }
		},
		highalch: 50_000_000
	},
	50_000_000
);
setCustomItem(
	70_014,
	'Abyssal gem',
	'Zenyte',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000_000
);
setCustomItem(
	70_016,
	'Spellbound ring',
	'Seers ring',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 20,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 20,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 0,
			slot: EquipmentSlot.Ring,
			requirements: { magic: 90 }
		},
		highalch: 10_000_000
	},
	10_000_000
);
setCustomItem(
	70_017,
	'Spellbound ring(i)',
	'Seers ring',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 25,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 25,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 0,
			slot: EquipmentSlot.Ring,
			requirements: { magic: 90 }
		},
		highalch: 10_000_000
	},
	10_000_000
);
setCustomItem(70_018, 'Grand crystal acorn', 'Coal', {}, 6000);
setCustomItem(
	70_019,
	'Rainbow cape',
	'Black cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	6000
);
setCustomItem(
	70_020,
	'Fuzzy dice',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_021,
	'Karambinana',
	'Dragon dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_023,
	'Ivy seed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_055,
	'Jolly roger cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_056,
	'Golden tricorn hat',
	'Black tricorn hat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_057,
	'Golden naval shirt',
	'Black naval shirt',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_058,
	'Golden navy slacks',
	'Black navy slacks',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_060,
	'Rune berserker shield',
	'Rune kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_061,
	'Rune spikeshield',
	'Rune kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_062,
	'Adamant berserker shield',
	'Adamant kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_063,
	'Adamant spikeshield',
	'Adamant kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_064,
	'Fist of guthix token',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_065,
	'Guthix engram',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_111,
	'Spooky graceful hood',
	'Graceful hood',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_112,
	'Spooky graceful top',
	'Graceful top',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_113,
	'Spooky graceful legs',
	'Graceful legs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_114,
	'Spooky graceful cape',
	'Graceful cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_115,
	'Spooky graceful boots',
	'Graceful boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_116,
	'Spooky graceful gloves',
	'Graceful gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_126,
	'Broomstick',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_127,
	'Witch hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_129,
	'Spooky mask',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_132,
	'Kuro',
	'Herbi',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	70_133,
	'Mooshroom',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_139,
	'Spooky partyhat',
	'White partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	70_141,
	'Penguin head',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_142,
	'Penguin torso',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_143,
	'Penguin legs',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_144,
	'Penguin boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_145,
	'Penguin gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_147,
	'Monkey hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_148,
	"Craftman's monocle",
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_150,
	'Fish mask',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_151,
	'Turkey hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_154,
	'Potion hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_155,
	'Map hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_156,
	'Sombrero',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_157,
	'Leprechaun top hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_158,
	'Oriental fan',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_160,
	"Fletcher's hat",
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_161,
	"Fletcher's top",
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_162,
	"Fletcher's legs",
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_163,
	"Fletcher's boots",
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_164,
	"Fletcher's gloves",
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
setCustomItem(
	70_165,
	'Stealing creation token',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_170,
	'Spooky gear frame unlock',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_171,
	'Spooky cat ears',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_172,
	'Gastly ghost cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	70_173,
	'Pumpkinpole',
	'Staff of fire',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_175,
	'Back pain',
	'Abyssal whip',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	70_177,
	"M'eye hat",
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_178,
	'Twinkly topper',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_179,
	'Spooky box',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_180,
	'Gloom and doom potion',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_181,
	'Boo-balloon',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_182,
	'Necronomicon',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		examine: 'A dangerous power emits from this book... beware.'
	},
	1000
);

setCustomItem(
	70_183,
	'Orange halloween mask',
	'Red halloween mask',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);
setCustomItem(
	70_185,
	'Handled candle',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_186,
	'Dirty hoe',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_187,
	'Pumpkin seed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_194,
	'Grim sweeper',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_195,
	'Turkey recipes',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_196,
	'Rubber turkey',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_197,
	'Offhand rubber turkey',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_200,
	'Christmas snowglobe',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_201,
	'Pumpkinhead praline',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_202,
	'Takon truffle',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_203,
	'Seer sweet',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_204,
	'Cob cup',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_205,
	'Craig creme',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	70_207,
	'Moktang mint',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_208,
	'Festive treats',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_210,
	'Pork sausage',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_211,
	'Reinbeer',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_212,
	'Christmas socks',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_214,
	'Christmas box',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	70_215,
	'Tinsel scarf',
	'Amulet of strength',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_217,
	'Snowman top hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_218,
	'Festive scarf',
	'Amulet of strength',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_219,
	'Snowman plushie',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_220,
	'Edible yoyo',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_227,
	'Mistleboe',
	'Hellfire bow',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_231,
	'Candy partyhat',
	'White partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	70_232,
	'Frosty',
	'Herbi',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	70_233,
	'Ho-ho hammer',
	'Dwarven warhammer',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1_000_000_000
);

setCustomItem(
	70_234,
	'Frosted wreath',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_235,
	'Christmas dye',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_237,
	'Offhand drygore rapier (xmas)',
	'Offhand drygore rapier',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000_000
);
setCustomItem(
	70_238,
	'Drygore rapier (xmas)',
	'Drygore rapier',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000_000
);
setCustomItem(
	70_239,
	'Offhand drygore mace (xmas)',
	'Offhand Drygore mace',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000_000
);
setCustomItem(
	70_240,
	'Drygore mace (xmas)',
	'Drygore mace',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000_000
);
setCustomItem(
	70_241,
	'Offhand drygore longsword (xmas)',
	'Offhand drygore longsword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000_000
);
setCustomItem(
	70_242,
	'Drygore longsword (xmas)',
	'Drygore longsword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000_000
);

setCustomItem(
	70_244,
	'Festive jumper (2022)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_245,
	'Christmas cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_246,
	'Dwarven pickaxe (xmas)',
	'Dwarven pickaxe',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_247,
	'Zaryte crossbow (xmas)',
	'Zaryte crossbow',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_248,
	'Pork crackling',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_249,
	'Vasa cloak (xmas)',
	'Vasa cloak',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_251,
	"Inventors' helmet",
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_252,
	"Inventors' torso",
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_253,
	"Inventors' legs",
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_254,
	"Inventors' gloves",
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_255,
	"Inventors' boots",
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_256,
	"Inventors' backpack",
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_257,
	'Materials bag',
	'Rune kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_258,
	'Santa claws',
	'Dragon claws',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_259,
	'Necromancer kit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_260,
	'Necromancer hood',
	"Dagon'hai hat",
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_261,
	'Necromancer robe top',
	"Dagon'hai robe top",
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_262,
	'Necromancer robe bottom',
	"Dagon'hai robe bottom",
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_263,
	'Shade skull',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_265,
	"Necromancer's air staff",
	'Mystic air staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_266,
	"Necromancer's earth staff",
	'Mystic earth staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_267,
	"Necromancer's fire staff",
	'Mystic fire staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_268,
	"Necromancer's lava staff",
	'Mystic lava staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_269,
	"Necromancer's mud staff",
	'Mystic mud staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_270,
	"Necromancer's steam staff",
	'Mystic steam staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_271,
	"Necromancer's water staff",
	'Mystic water staff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_272,
	'Skeletal battlestaff of air',
	'Air battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_273,
	'Skeletal battlestaff of earth',
	'Earth battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_274,
	'Skeletal battlestaff of fire',
	'Fire battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_275,
	'Skeletal battlestaff of water',
	'Water battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_276,
	'Skeletal lava battlestaff',
	'Lava battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_277,
	'Skeletal mud battlestaff',
	'Mud battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_278,
	'Skeletal steam battlestaff',
	'Steam battlestaff',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_289,
	'Gary',
	'Herbi',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_291,
	'Baby yaga house',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_292,
	'Dagannoth mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_293,
	'Dagannoth slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_294,
	'Jelly mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_295,
	'Jelly slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_296,
	'Abyssal mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_297,
	'Abyssal slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_298,
	'Kurask mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_299,
	'Kurask slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_300,
	'Black demonical mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_301,
	'Black demonical slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_302,
	'Troll mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_303,
	'Troll slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_304,
	'Ganodermic mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_305,
	'Ganodermic slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_306,
	'Gargoyle mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_307,
	'Gargoyle slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_308,
	'Dark beast mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_309,
	'Dark beast slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_310,
	'Dust devil mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_311,
	'Dust devil slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_312,
	'Crawling hand mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_313,
	'Crawling hand slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_314,
	'Basilisk mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_315,
	'Basilisk slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_316,
	'Bloodveld mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_317,
	'Bloodveld slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_318,
	"Banshee's mask",
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_319,
	'Banshee slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_320,
	'Cockatrice mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_321,
	'Cockatrice slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_322,
	'Aberrant mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_323,
	'Aberrant slayer helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

/**
 * Balzthahar Bonanza
 */

setCustomItem(
	70_351,
	'A stylish hat (female, maroon)',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_352,
	'A stylish hat (female, yellow)',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_353,
	'A stylish hat (male, green)',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_354,
	'A stylish hat (male, maroon)',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_355,
	'A stylish hat (male, yellow)',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_356,
	'A stylish hat (female, green)',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_357,
	'Acrobat hood',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_358,
	'Acrobat pants',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_359,
	'Acrobat shirt',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_360,
	'Acrobat shoes',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_361,
	'Circus ticket',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_362,
	'Clown hat',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_363,
	'Clown leggings',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_364,
	'Clown shirt',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_365,
	'Clown feet',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_366,
	"Giant's hand",
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_367,
	'Ringmaster pants',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_368,
	'Ringmaster shirt',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_369,
	'Shirt (female, green)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_370,
	'Shirt (female, maroon)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_371,
	'Shirt (female, yellow)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_372,
	'Shirt (male, green)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_373,
	'Shirt (male, maroon)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_374,
	'Shirt (male, yellow)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_375,
	'Shoes (female, flats)',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_376,
	'Shoes (female, straps)',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_377,
	'Shoes (male, boots)',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_378,
	'Shoes (male, shoes)',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_379,
	'Skirt (green)',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_380,
	'Skirt (maroon)',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_381,
	'Skirt (yellow)',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_382,
	'Tambourine',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_383,
	'Leggings (green)',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_384,
	'Leggings (maroon)',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_385,
	'Leggings (yellow)',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_386,
	'Ringmaster boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_387,
	'Ringmaster hat',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_388,
	'Ringmaster set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_389,
	'Acrobat set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_390,
	'Clown set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_391,
	'White mask',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_392,
	'Ring of cabbage',
	'Gold ring',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_393,
	"Queen's guard hat",
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_394,
	"Queen's guard shirt",
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_395,
	"Queen's guard trousers",
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_396,
	"Queen's guard shoes",
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	70_397,
	"Queen's guard staff",
	'Staff of air',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_398,
	'Sack of mystery boxes',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_399,
	'Fox ears',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_400,
	'Fox tail',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_401,
	'Prisoner top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_402,
	'Prisoner legs',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_403,
	'Chocolate pot',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_404,
	'Egg coating',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_405,
	'Cute magic egg',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	500_000
);
setCustomItem(
	70_406,
	'Fancy magic egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_407,
	'Big mysterious egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	70_408,
	'Fancy ancient egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	70_409,
	'Sweet small egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_410,
	'Mysterious magic egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_411,
	'Big ancient egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_412,
	'Fancy sweet egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_413,
	'Floppy bunny ears',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_414,
	'Easter egg backpack',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);
setCustomItem(
	70_415,
	'Chocolate rabbit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	71_405,
	'Eggy',
	'Herbi',
	{
		tradeable: true,
		tradeable_on_ge: true,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

/**
 *
 *
 * Depths of Alantis
 *
 */

setCustomItem(
	70_420,
	'Oceanic relic',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		highalch: 100_000_000
	},
	1_000_000
);

setCustomItem(
	70_421,
	'Piercing trident',
	'Merfolk trident',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1_000_000
);

setCustomItem(
	70_422,
	'Titan ballista',
	'Heavy ballista',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			...getOSItem('Heavy ballista').equipment!,
			requirements: {
				strength: 120
			}
		}
	},
	100_000
);

setCustomItem(
	70_423,
	'Obsidian javelin',
	'Dragon javelin',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_424,
	'Obsidian javelin heads',
	'Mithril javelin heads',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	70_425,
	'Aquifer aegis',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_426,
	'Shark tooth',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_427,
	'Shark tooth necklace',
	'Amulet of power',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_428,
	'Shark jaw',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_429,
	'Ring of piercing',
	'Archers ring',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 10,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 1,
			defence_ranged: 9,
			melee_strength: 0,
			ranged_strength: 2,
			magic_damage: 0,
			prayer: 0,
			slot: EquipmentSlot.Ring,
			requirements: null
		}
	},
	10_000
);
setCustomItem(
	70_430,
	'Ring of piercing (i)',
	'Ring of piercing',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 11,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 1,
			defence_ranged: 9,
			melee_strength: 0,
			ranged_strength: 3,
			magic_damage: 0,
			prayer: 0,
			slot: EquipmentSlot.Ring,
			requirements: null
		}
	},
	10_000
);

setCustomItem(
	70_431,
	'Atlantean trident',
	'Piercing trident',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_432,
	'Tidal collector',
	'Masori assembler',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		},
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 8,
			defence_stab: 1,
			defence_slash: 1,
			defence_crush: 1,
			defence_magic: 8,
			defence_ranged: 2,
			melee_strength: 0,
			ranged_strength: 2,
			magic_damage: 0,
			prayer: 0,
			slot: EquipmentSlot.Cape,
			requirements: {
				ranged: 70
			}
		}
	},
	10_000
);

setCustomItem(
	70_433,
	'Seamonkey staff (t1)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_434,
	'Seamonkey staff (t2)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_435,
	'Seamonkey staff (t3)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_436,
	'Seamonkey staff (t4)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_437,
	'Bruce',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	70_438,
	'Crush',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_439,
	'Pearl',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_440,
	'Bluey',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_441,
	'Oceanic dye',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	70_442,
	'Oceanic shroud (tier 1)',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_443,
	'Oceanic shroud (tier 2)',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);
setCustomItem(
	70_444,
	'Oceanic shroud (tier 3)',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_445,
	'Oceanic shroud (tier 4)',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_446,
	'Oceanic shroud (tier 5)',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	70_447,
	'Masori components',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	70_448,
	'Gorajan warrior helmet (Oceanic)',
	'Gorajan warrior helmet',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_449,
	'Gorajan warrior top (Oceanic)',
	'Gorajan warrior top',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_450,
	'Gorajan warrior legs (Oceanic)',
	'Gorajan warrior legs',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_451,
	'Gorajan warrior gloves (Oceanic)',
	'Gorajan warrior gloves',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_452,
	'Gorajan warrior boots (Oceanic)',
	'Gorajan warrior boots',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);

setCustomItem(
	70_453,
	'Gorajan occult helmet (Oceanic)',
	'Gorajan occult helmet',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_454,
	'Gorajan occult top (Oceanic)',
	'Gorajan occult top',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_455,
	'Gorajan occult legs (Oceanic)',
	'Gorajan occult legs',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_456,
	'Gorajan occult gloves (Oceanic)',
	'Gorajan occult gloves',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_457,
	'Gorajan occult boots (Oceanic)',
	'Gorajan occult boots',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);

setCustomItem(
	70_458,
	'Gorajan archer helmet (Oceanic)',
	'Gorajan archer helmet',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_459,
	'Gorajan archer top (Oceanic)',
	'Gorajan archer top',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_460,
	'Gorajan archer legs (Oceanic)',
	'Gorajan archer legs',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_461,
	'Gorajan archer gloves (Oceanic)',
	'Gorajan archer gloves',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);
setCustomItem(
	70_462,
	'Gorajan archer boots (Oceanic)',
	'Gorajan archer boots',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	55_000_000
);

setCustomItem(
	70_463,
	'TzKal cape (Volcanic)',
	'TzKal cape',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	5_000_000
);

setCustomItem(
	70_464,
	'TzKal cape (Oceanic)',
	'TzKal cape',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	5_000_000
);

setCustomItem(
	71_425,
	'Message in a bottle',
	'Coal',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	1_000_000
);

setCustomItem(
	71_426,
	'Hellfire bow (ice)',
	'Hellfire bow',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_427,
	'Hellfire bow (Oceanic)',
	'Hellfire bow',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_428,
	'OSB Jumper',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_429,
	'BSO Jumper',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_430,
	'Paint box',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_431,
	"Skipper's tie",
	'Amulet of power',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_432,
	"Remy's chef hat",
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_433,
	'Supply crate (s1)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_434,
	'Supply crate key (s1)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_435,
	'Archon headdress',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_436,
	'Archon tassets',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_437,
	'Archon crest',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_438,
	'Archon gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_439,
	'Archon boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_440,
	'Infernal slayer helmet(i) (ice)',
	'Infernal slayer helmet(i)',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	100_000
);

setCustomItem(
	71_441,
	'Chincannon',
	'Toxic blowpipe',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_442,
	'Acrylic hood',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_443,
	'Acrylic top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_444,
	'Acrylic bottom',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_445,
	'Acrylic boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_446,
	'Golden cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_447,
	'Ban hammer',
	'Bronze 2h sword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_448,
	'The Interrogator',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_449,
	'Birthday love note',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_450,
	'Veteran cape (1 year)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_451,
	'Veteran cape (2 year)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_452,
	'Veteran cape (3 year)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_453,
	'Veteran cape (4 year)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_454,
	'Bunch of flowers',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_455,
	'Golden cape shard',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_456,
	'Veteran hood (1 year)',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_457,
	'Veteran hood (2 year)',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);
setCustomItem(
	71_458,
	'Veteran hood (3 year)',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_459,
	'Veteran hood (4 year)',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	100_000
);

setCustomItem(
	71_460,
	"Koschei's toothpick",
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_461,
	'Imperial helmet',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_462,
	'Imperial cuirass',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_463,
	'Imperial legs',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_464,
	'Imperial gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_465,
	'Imperial sabatons',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_466,
	'Rubber flappy',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_467,
	'Birthday crate (s2)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_468,
	'Birthday crate key (s2)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_469,
	'Cake partyhat',
	'Red partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_470,
	'Delicious birthday cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_471,
	'Buggy',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	71_472,
	'Shelldon shield',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_473,
	'Bug jar',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_474,
	'Perfect pot of flour',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_475,
	'Perfect bucket of milk',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_476,
	'Perfect egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_477,
	'Full bug jar',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_478,
	'Acrylic set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_479,
	'Completionist hood',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		},
		equipment: maxedRequirements
	},
	10_000
);

setCustomItem(
	71_480,
	'Baby zamorak hawk',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_481,
	'Juvenile zamorak hawk',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_482,
	'Zamorak hawk',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_483,
	'Baby guthix raptor',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_484,
	'Juvenile guthix raptor',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_485,
	'Guthix raptor',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_486,
	'Baby saradomin owl',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_487,
	'Juvenile saradomin owl',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_488,
	'Saradomin owl',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_489,
	'Saradomin egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_490,
	'Guthix egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_491,
	'Zamorak egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

// Zamorak warpriest
setCustomItem(
	71_492,
	'Warpriest of Zamorak helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_493,
	'Warpriest of Zamorak cuirass',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_494,
	'Warpriest of Zamorak greaves',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_495,
	'Warpriest of Zamorak boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_496,
	'Warpriest of Zamorak gauntlets',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_497,
	'Warpriest of Zamorak cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_498,
	'Warpriest of Zamorak set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

// Saradomin warpriest
setCustomItem(
	71_499,
	'Warpriest of Saradomin helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_500,
	'Warpriest of Saradomin cuirass',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_501,
	'Warpriest of Saradomin greaves',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_502,
	'Warpriest of Saradomin boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_503,
	'Warpriest of Saradomin gauntlets',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_504,
	'Warpriest of Saradomin cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_505,
	'Warpriest of Saradomin set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

// Armadyl warpriest
setCustomItem(
	71_506,
	'Warpriest of Armadyl helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_507,
	'Warpriest of Armadyl cuirass',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_508,
	'Warpriest of Armadyl greaves',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_509,
	'Warpriest of Armadyl boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_510,
	'Warpriest of Armadyl gauntlets',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_511,
	'Warpriest of Armadyl cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_512,
	'Warpriest of Armadyl set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

// Bandos warpriest
setCustomItem(
	71_513,
	'Warpriest of Bandos helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_514,
	'Warpriest of Bandos cuirass',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_515,
	'Warpriest of Bandos greaves',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_516,
	'Warpriest of Bandos boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);
setCustomItem(
	71_517,
	'Warpriest of Bandos gauntlets',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_518,
	'Warpriest of Bandos cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_519,
	'Warpriest of Bandos set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_520,
	'Vasa cloak (saradomin)',
	'Vasa cloak',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_521,
	'Vasa cloak (zamorak)',
	'Vasa cloak',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_522,
	'Carapace',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_523,
	'Carapace boots',
	'Adamant boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_524,
	'Carapace gloves',
	'Adamant gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_525,
	'Carapace helm',
	'Adamant full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_526,
	'Carapace legs',
	'Adamant platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_527,
	'Carapace shield',
	'Adamant kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_528,
	'Carapace torso',
	'Adamant platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	71_529,
	'Dragonstone upgrade kit',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_530,
	'Dragonstone full helm(u)',
	'Dragonstone full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_531,
	'Dragonstone platebody(u)',
	'Dragonstone platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_532,
	'Dragonstone platelegs(u)',
	'Dragonstone platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_533,
	'Dragonstone boots(u)',
	'Dragonstone boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_534,
	'Dragonstone gauntlets(u)',
	'Dragonstone gauntlets',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_536,
	'Dark Temple key',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_537,
	'Elite black knight sword',
	'Black 2h sword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_538,
	'Elite black knight kiteshield',
	'Black kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_539,
	'Elite black knight helm',
	'Black full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_540,
	'Elite black knight platebody',
	'Black platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_541,
	'Elite black knight platelegs',
	'Black platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_542,
	'Zamorakian codex',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_543,
	'Herbert',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_560,
	'Dungsoaked message',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_561,
	'Bloodsoaked cowhide',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_562,
	'Bloodsoaked fur',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_563,
	'Torn fur',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_564,
	"Bloodsoaked children's book",
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true
		}
	},
	10_000
);

setCustomItem(
	71_565,
	'Mysterious clue (1)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			cantBeDropped: true
		}
	},
	10_000
);

setCustomItem(
	71_566,
	'Mysterious clue (2)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			cantBeDropped: true
		}
	},
	10_000
);

setCustomItem(
	71_567,
	'Mysterious clue (3)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			cantBeDropped: true
		}
	},
	10_000
);

setCustomItem(
	71_568,
	'Mysterious clue (4)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			cantBeDropped: true
		}
	},
	10_000
);
setCustomItem(
	71_569,
	'Mysterious clue (5)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			cantBeDropped: true
		}
	},
	10_000
);

setCustomItem(
	71_570,
	'Mysterious clue (6)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			cantBeSacrificed: true,
			cantBeDropped: true
		}
	},
	10_000
);

setCustomItem(
	71_571,
	'Penguin egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_700,
	'Torva armour set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_572,
	'Skip',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_701,
	'Pernix armour set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_573,
	'Frostclaw cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_574,
	'Cold heart',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_702,
	'Virtus armour set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_575,
	'Yeti hide',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_703,
	'Drygore rapier set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_576,
	'Raw yeti meat',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_704,
	'Drygore mace set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	71_580,
	'Spooky crate (s3)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_581,
	'Spooky crate key (s3)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	71_582,
	'Spooky spider parasol',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_583,
	'Voodoo doll',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_584,
	'Count Draynor torso',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_585,
	'Count Draynor bottoms',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_586,
	'Count Draynor cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_587,
	'Count Draynor hands',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_588,
	'Count Draynor shoes',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_589,
	'Count Draynor fangs',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_590,
	'Ghostweave',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_591,
	'Ghostly ringmaster gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_592,
	'Ghostly ringmaster shirt',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_593,
	'Ghostly ringmaster boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_594,
	'Ghostly ringmaster pants',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_595,
	'Ghostly jester tights',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_596,
	'Ghostly jester top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_597,
	'Ghostly jester boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_598,
	'Ghostly jester gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_599,
	'Ghostly chicken head',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_600,
	'Ghostly chicken gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_601,
	'Ghostly chicken legs',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_602,
	'Ghostly chicken wings',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_603,
	'Ghostly chicken feet',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_604,
	'Ghostly lederhosen boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_605,
	'Ghostly lederhosen top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_606,
	'Ghostly lederhosen shorts',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_607,
	'Ghostly lederhosen hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_608,
	'Ghostly ringmaster hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_609,
	'Ghostly jester hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_610,
	'Ghostly lederhosen gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_611,
	'Cob cap',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_612,
	'Pumpkin peepers',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_613,
	'Ghostly zombie mask',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_614,
	'Ghostly zombie boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_615,
	'Ghostly zombie shirt',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_616,
	'Ghostly zombie trousers',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_617,
	'Ghostly zombie gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_618,
	'Spooky sombrero',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_619,
	'Demonic halloween mask',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_620,
	'Spooky dye',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	10_000
);

setCustomItem(
	71_621,
	'The Grim Reaper',
	'Scythe of vitur',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_622,
	'Dwarven pumpkinsmasher',
	'Dwarven warhammer',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1_000_000_000
);

setCustomItem(
	71_623,
	'Deathly collector',
	'Tidal collector',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	10_000
);

setCustomItem(
	71_705,
	'Drygore longsword set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_706,
	'Dwarven armour set',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_900,
	'Maledict hat',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_901,
	'Maledict top',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_902,
	'Maledict legs',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_903,
	'Maledict cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_904,
	'Maledict boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_905,
	'Maledict amulet',
	'Amulet of strength',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_906,
	'Maledict ring',
	'Diamond ring',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_907,
	'Maledict gloves',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_908,
	'Maledict codex',
	'Rune kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_909,
	'Covenant of grimace',
	'Rune dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_910,
	'Bag of tricks',
	'Rune dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_911,
	"Fool's ace",
	'Rune dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_912,
	"Pandora's box",
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_913,
	'Splooky fwizzle',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	100_000
);

setCustomItem(
	71_916,
	'Mini mortimer',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_917,
	'Doopy',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_919,
	'Demonic piercer',
	'Hellfire bow',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1_000_000
);

setCustomItem(
	71_920,
	'Bat bat',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_921,
	'Casper',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_922,
	'TzKal cape (spooky)',
	'TzKal cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	100_000
);

setCustomItem(
	71_923,
	'Soul shield',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_924,
	'Evil partyhat',
	'Red partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_925,
	'Spooky sheet',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	100_000
);

setCustomItem(
	71_926,
	'Spooky aura',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	100_000
);

setCustomItem(
	71_927,
	'Cosmic dice',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_928,
	'Purple halloween mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_930,
	'Echo',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	71_931,
	'Blood chalice',
	'Rune dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_932,
	'Hemoglyphs',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_933,
	'Bloodstone obelisk',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_934,
	'Vampyric plushie',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_935,
	'Drakan fangs',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_936,
	'Silver stake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_937,
	'Vampyre hunter boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_938,
	'Vampyre hunter legs',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_939,
	'Vampyre hunter hat',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_940,
	'Vampyre hunter top',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_941,
	'Vampyre hunter cuffs',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_943,
	'Blightbrand',
	'Dragon dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_944,
	'Blood orange seed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_945,
	'Blood orange',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	71_946,
	'Completionist hood (t)',
	'Dragon full helm',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		},
		equipment: maxedRequirements
	},
	50_000_000
);

/*
 * START Christmas 2023
 *
 */

setCustomItem(
	72_000,
	'Grinch head',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_001,
	'Grinch top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_002,
	'Grinch legs',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_003,
	'Grinch feet',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_004,
	'Grinch hands',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_005,
	'Grinch santa hat',
	'Santa hat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_006,
	'Festive partyhat',
	'Red partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_007,
	'Christmas jumper (frosty)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_008,
	'Christmas cape (wintertodt blue)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_009,
	'Christmas cape (jolly red)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_010,
	'Christmas cape (snowy tree)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_011,
	'Christmas cape (rainbow)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_012,
	'Christmas cape (classic)',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_013,
	'Christmas jumper (jolly red)',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_014,
	'Christmas jumper (green)',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_015,
	'Infernal slayer helmet(i) (xmas)',
	'Infernal slayer helmet(i)',
	{
		customItemData: {
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_016,
	'Festive crate (s4)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_017,
	'Festive crate key (s4)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_018,
	'Santa costume top (male)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_019,
	'Santa costume top (female)',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_020,
	'Santa costume skirt',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_021,
	'Santa costume pants',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_022,
	'Santa costume gloves',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_023,
	'Santa costume boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_024,
	'Raw rat milk',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_025,
	'Scorched rat milk',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_026,
	'Fresh rat milk',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_027,
	'Pristine chocolate bar',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_028,
	'Cocoa bean',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_029,
	'Chomped chocolate bits',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_030,
	'Ashy flour',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_031,
	'Snail oil',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_032,
	'Grimy salt',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_033,
	'Milk with spoon',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_034,
	'Banana-butter',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_035,
	'Smokey egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_036,
	'Hairy banana-butter',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_037,
	'Christmas cake recipe',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_038,
	'Ginger root',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_039,
	'Dodgy bread',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_040,
	'Gingerbread',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_041,
	'Christmas cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_042,
	'Burnt christmas cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);
setCustomItem(
	72_043,
	'Mistle-bow-tie',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_044,
	'Rudolph',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_045,
	'Note from pets',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	72_050,
	'Frosty parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_051,
	'Frosty wings',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_052,
	'Frosty cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_053,
	'Frosty staff',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_054,
	'Tinsel twirler',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	72_055,
	'Metallic chocolate dust',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

/**
 *
 * END Christmas 2023
 *
 */

/**
 *
 * Divination
 *
 */
setCustomItem(
	73_000,
	'Divination master cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	200_000
);

setCustomItem(
	73_001,
	'Divination hood',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	20_000
);

setCustomItem(
	73_002,
	'Divination cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	20_000
);

setCustomItem(
	73_003,
	'Divination cape(t)',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	20_000
);

setCustomItem(
	73_004,
	'Bright energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_005,
	'Brilliant energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_006,
	'Flickering energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_007,
	'Elder energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_008,
	'Gleaming energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_009,
	'Glowing energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_010,
	'Pale energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_011,
	'Incandescent energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_012,
	'Luminous energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_013,
	'Lustrous energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_014,
	'Vibrant energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_015,
	'Sparkling energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_016,
	'Radiant energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_017,
	'Advax berry seed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_018,
	'Advax berry',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_019,
	'Spirit weed seed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_020,
	'Grimy spirit weed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_021,
	'Spirit weed',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_022,
	'Boon of elder energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_023,
	'Boon of lustrous energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_024,
	'Boon of vibrant energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_025,
	'Boon of gleaming energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_026,
	'Boon of sparkling energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_027,
	'Boon of glowing energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_028,
	'Boon of bright energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_029,
	'Boon of flickering energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_030,
	'Boon of incandescent energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_031,
	'Boon of luminous energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_032,
	'Boon of radiant energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_033,
	'Boon of brilliant energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_034,
	"Diviner's headwear",
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_035,
	"Diviner's robe",
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_036,
	"Diviner's legwear",
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_037,
	"Diviner's handwear",
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_038,
	"Diviner's footwear",
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

// 73_039 Wisp-buster

setCustomItem(
	73_040,
	'Guthixian cache boost',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_041,
	'Cache portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

// 73_042 Divine hand

setCustomItem(
	73_043,
	'Graceful portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_044,
	'Rogues portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_045,
	'Ancient energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_046,
	'Boon of ancient energy',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_047,
	'Dungeon portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_048,
	'Lucky portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_049,
	'Divination potion',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_050,
	'Divine egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_051,
	'Jar of memories',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_052,
	'Rebirth portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_053,
	'Spiritual mining portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_054,
	'Pacifist hunting portent',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

// 73_055 Drygore axe

setCustomItem(
	73_056,
	'Eagle egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_057,
	'Solite',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_058,
	'Solite platelegs',
	'Torva platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_059,
	'Solite gloves',
	'Torva gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_060,
	'Solite helm',
	'Torva full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_061,
	'Solite chestplate',
	'Torva platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_062,
	'Solite cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_063,
	'Solite boots',
	'Torva boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_064,
	'Solite shield',
	'Rune kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_065,
	'Solite blade',
	'Dragon scimitar',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_066,
	'Solervus helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_067,
	'Solervus platebody',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_068,
	'Solervus platelegs',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_069,
	'Solervus gloves',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_070,
	'Solervus boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_071,
	'Solervus cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_072,
	'Axe of the high sungod',
	'Dragon axe',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		equipment: {
			slot: EquipmentSlot.TwoHanded,
			attack_stab: 30,
			attack_slash: 130 + 45 + 20,
			attack_crush: 36 + 5,
			attack_magic: -10,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 145,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 3,
			requirements: {
				attack: 100,
				strength: 100
			}
		}
	},
	1
);

setCustomItem(
	73_073,
	'Sunlight sprouter',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_074,
	'Axe of the high sungod (u)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_075,
	'Lunite',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_076,
	'Noom',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

// 73_077 Moonlight mutator

setCustomItem(
	73_078,
	'Lunite platelegs',
	'Torva platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_079,
	'Lunite gloves',
	'Torva gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_080,
	'Lunite helm',
	'Torva full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_081,
	'Lunite chestplate',
	'Torva platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_082,
	'Lunite cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_083,
	'Lunite boots',
	'Torva boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_084,
	'Celestial helm',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_085,
	'Celestial platebody',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_086,
	'Celestial platelegs',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_087,
	'Celestial gloves',
	'Rune gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_088,
	'Celestial boots',
	'Rune boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_089,
	'Celestial cape',
	'Fire cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_090,
	'Atomic energy',
	'Coal',
	{
		buy_limit: 4_000_000,
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_091,
	'Sun-metal scraps',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_092,
	'Sun-metal bar',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_093,
	'Axe handle base',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_094,
	'Sundial scimitar',
	'Dragon scimitar',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_095,
	'Sun-god axe head',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_096,
	'Axe handle',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_097,
	'Demonic jibwings',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_098,
	'Abyssal jibwings',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_099,
	'3rd age jibwings',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_100,
	'Impling locator',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_101,
	'Divine ring',
	'Ruby ring',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_102,
	'Demonic jibwings (e)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_103,
	'Abyssal jibwings (e)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_104,
	'3rd age jibwings (e)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_105,
	'Moondash charm',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_106,
	'Herbal zygomite spores',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_107,
	'Barky zygomite spores',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_109,
	'Fruity zygomite spores',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_110,
	'Moonlight essence',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_111,
	'Fungo',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	73_112,
	'Golden bunny ears',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_113,
	'Easter-egg delight',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_114,
	'Easter-egg salad',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_115,
	'Cute bunny cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_116,
	'Easter jumper',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_117,
	'Bunny plushie',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_118,
	'Easter tunic',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_119,
	'Easter breeches',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_120,
	'Easter shoes',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_121,
	'Easter crate (s5)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		},
		buy_limit: 100
	},
	1
);

setCustomItem(
	73_122,
	'Easter crate key (s5)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1
);

setCustomItem(
	73_123,
	'Clue scroll (elder)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_124,
	'Reward casket (elder)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_125,
	'Octo',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_126,
	'First age robe top',
	'Proselyte hauberk',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000_000
);

setCustomItem(
	73_127,
	'First age robe bottom',
	'Proselyte cuisse',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000_000
);

setCustomItem(
	73_128,
	'Elder scroll piece',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1_000_000
);

setCustomItem(
	73_129,
	'Commander cap',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_130,
	'Commander top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_131,
	'Commander trousers',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_132,
	'Commander gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_133,
	'Commander boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_134,
	'Lord marshal cap',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_135,
	'Lord marshal top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_136,
	'Lord marshal trousers',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_137,
	'Lord marshal gloves',
	'Bronze gloves',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_138,
	'Lord marshal boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_139,
	'Akumu mask',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1
);

setCustomItem(
	73_140,
	'Demon statuette',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		highalch: 80_000_000
	},
	100_000_000
);

setCustomItem(
	73_141,
	'2nd age range coif',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_142,
	'2nd age range top',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_143,
	'2nd age range legs',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_144,
	'2nd age bow',
	'Rune 2h sword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_145,
	'2nd age mage mask',
	'Rune full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_146,
	'2nd age mage top',
	'Rune platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_147,
	'2nd age mage bottom',
	'Rune platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_148,
	'2nd age staff',
	'Rune 2h sword',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_500_000_000
);

setCustomItem(
	73_149,
	'Clue bag',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	2_500_000
);

setCustomItem(
	73_150,
	'Apple parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_151,
	'Watermelon parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_152,
	'Lime parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_153,
	'Lemon parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_154,
	'Strawberry parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_155,
	'Blueberry parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_156,
	'Grape parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_157,
	'Coconut parasol',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_158,
	'Detective hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_159,
	'Detective trenchcoat',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_160,
	'Detective pants',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_161,
	'Inventors tools',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	500_000
);

setCustomItem(
	73_162,
	'Spiders leg bottom',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_163,
	'Baby venatrix',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	500_000
);

setCustomItem(
	73_164,
	'Offhand spidergore rapier',
	'Offhand drygore rapier',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		},
		equipment: {
			attack_stab: 44,
			attack_slash: 9,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 11,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Shield,
			requirements: null
		}
	},
	100_000_000
);

setCustomItem(
	73_165,
	'Nightmarish ashes',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	73_166,
	'Cursed onyx',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	73_167,
	'Lumina',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	10_000
);

setCustomItem(
	73_168,
	'Mini akumu',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1_000_000
);

setCustomItem(
	73_169,
	'Deathly toxic potion',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_170,
	'Toxic zygomite spores',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

// addInvention(73_179, 'Webshooter');

setCustomItem(
	73_180,
	'Venatrix webbing',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_181,
	'Venatrix eggs',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_182,
	'Elder knowledge',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_171,
	'Cluckers',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			superTradeableButTradeableOnGE: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_172,
	'Queen goldemar blouse',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_173,
	'Queen goldemar skirt',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_174,
	'Queen goldemar beard',
	'Amulet of strength',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_175,
	'Dwarven frying pan',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_176,
	'Offhand dwarven spatula',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_177,
	'Dwarfqueen tiara',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true,
			isSuperUntradeable: true
		}
	},
	1
);

setCustomItem(
	73_178,
	'Large egg',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(73_185, 'Frost mask', 'Bronze full helm', {}, 100_000);

setCustomItem(
	73_186,
	'Nex plushie',
	'Coal',
	{
		tradeable: false
	},
	100_000
);

setCustomItem(73_187, 'Dunce hat', 'Bronze full helm', {}, 100_000);

setCustomItem(73_188, 'Dunce top', 'Bronze platebody', {}, 100_000);

setCustomItem(73_189, 'Dunce legs', 'Bronze platelegs', {}, 100_000);

setCustomItem(73_190, 'Dunce gloves', 'Bronze gloves', {}, 100_000);

setCustomItem(73_191, 'Dunce shoes', 'Bronze boots', {}, 100_000);

setCustomItem(73_192, 'Chilli chocolate', 'Coal', {}, 100_000);

setCustomItem(73_193, 'Zak plushie', 'Coal', { tradeable: false }, 100_000);

setCustomItem(
	73_200,
	'Birthday crate (s6)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	73_201,
	'Birthday crate key (s6)',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			cantBeSacrificed: true,
			isDiscontinued: true
		}
	},
	100_000
);

setCustomItem(
	73_202,
	'Ethereal partyhat',
	'Red partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_203,
	'Swan hat',
	'Red partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_204,
	'Swan scarf',
	'Amulet of strength',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_205,
	'Rose tinted glasses',
	'Red partyhat',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_206,
	'Blabberbeak jumper',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_207,
	'BSO banner',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_208,
	'Blueberry birthday cake',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_209,
	'Gambling skillcape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isDiscontinued: true
		}
	},
	1_000_000
);

setCustomItem(
	73_210,
	'Raw plopper bacon',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	73_211,
	'Cooked plopper bacon',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	1000
);

setCustomItem(
	73_212,
	'Monkey cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_213,
	'BSO flowers',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_214,
	'Ceremonial top',
	'Bronze platebody',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_215,
	'Ceremonial legs',
	'Bronze platelegs',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_216,
	'Ceremonial boots',
	'Bronze boots',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_217,
	'Ceremonial cape',
	'Red cape',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_218,
	'Ceremonial hat',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_219,
	'Plopper nose',
	'Bronze full helm',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_220,
	'Hoppy plushie',
	'Coal',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_221,
	'Dice plushie',
	'Bronze dagger',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);

setCustomItem(
	73_222,
	'Offhand dice plushie',
	'Bronze kiteshield',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true
		}
	},
	100_000
);
