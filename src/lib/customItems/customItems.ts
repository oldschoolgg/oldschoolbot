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

import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';
import { setCustomItem, UN_EQUIPPABLE } from './util';

setCustomItem(19_939, 'Untradeable Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(6199, 'Tradeable Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(3062, 'Pet Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(3713, 'Holiday Mystery Box', 'Mystery box', {}, 100_000);
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
setCustomItem(24_212, 'Abyssal thread', 'Giant pouch', {}, 10_000_000);

// Abyssal pouch || 24210 = Victor's cape (10) [DUPLICATE]
setCustomItem(24_210, 'Abyssal pouch', 'Giant pouch', {}, 100_000);

// Ori Pet || 4149	 = Abyssal demon

// Abyssal bones || 24199 = Seren halo [DUPLICATE]
setCustomItem(24_199, 'Abyssal dragon bones', 'Superior dragon bones', {}, 20_000);

setCustomItem(
	6796,
	'Tiny lamp',
	'Lamp',
	{
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
setCustomItem(19_837, 'Clue scroll (grandmaster)', 'Clue scroll (easy)');
setCustomItem(19_838, 'Reward casket (grandmaster)', 'Reward casket (master)');
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
setCustomItem(40_055, "Gatherer's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_056, "Combatant's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_057, "Artisan's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_058, 'Completionist cape', 'Abyssal cape', {}, 500_000_000);
setCustomItem(40_059, 'Completionist cape (t)', 'Abyssal cape', {}, 500_000_000);

setCustomItem(40_026, 'Scroll of life', 'Coal', {}, 1_000_000);
setCustomItem(40_027, 'Herbicide', 'Coal', {}, 1_000_000);
setCustomItem(40_028, 'Scroll of efficiency', 'Coal', {}, 1_000_000);
setCustomItem(40_029, 'Scroll of cleansing', 'Coal', {}, 1_000_000);
setCustomItem(40_030, 'Amulet of zealots', 'Amulet of fury', {}, 1_000_000);
setCustomItem(40_031, 'Scroll of dexterity', 'Coal', {}, 1_000_000);
setCustomItem(40_032, 'Scroll of teleportation', 'Coal', {}, 1_000_000);

setCustomItem(40_033, 'Gorajan warrior helmet', 'Torva full helm', {}, 55_000_000);
setCustomItem(40_034, 'Gorajan warrior top', 'Torva platebody', {}, 55_000_000);
setCustomItem(40_035, 'Gorajan warrior legs', 'Torva platelegs', {}, 55_000_000);
setCustomItem(40_036, 'Gorajan warrior gloves', 'Torva gloves', {}, 55_000_000);
setCustomItem(40_037, 'Gorajan warrior boots', 'Torva boots', {}, 55_000_000);

setCustomItem(40_038, 'Scroll of proficiency', 'Coal', {}, 1_000_000);
setCustomItem(40_040, 'Chaotic remnant', 'Coal', {}, 10_000_000);

setCustomItem(40_042, 'Gorajan occult helmet', 'Virtus mask', {}, 55_000_000);
setCustomItem(40_043, 'Gorajan occult top', 'Virtus robe top', {}, 55_000_000);
setCustomItem(40_044, 'Gorajan occult legs', 'Virtus robe legs', {}, 55_000_000);
setCustomItem(40_045, 'Gorajan occult gloves', 'Virtus gloves', {}, 55_000_000);
setCustomItem(40_046, 'Gorajan occult boots', 'Virtus boots', {}, 55_000_000);

setCustomItem(40_047, 'Gorajan archer helmet', 'Pernix cowl', {}, 55_000_000);
setCustomItem(40_048, 'Gorajan archer top', 'Pernix body', {}, 55_000_000);
setCustomItem(40_049, 'Gorajan archer legs', 'Pernix chaps', {}, 55_000_000);
setCustomItem(40_050, 'Gorajan archer gloves', 'Pernix gloves', {}, 55_000_000);
setCustomItem(40_051, 'Gorajan archer boots', 'Pernix boots', {}, 55_000_000);

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
setCustomItem(47_502, 'Royal mystery box', 'Mystery box', {}, 1_000_000);

// 1st age
setCustomItem(47_503, 'First age tiara', 'Rune full helm', {}, 100_000_000);
setCustomItem(47_504, 'First age amulet', 'Amulet of strength', {}, 100_000_000);
setCustomItem(47_505, 'First age cape', 'Fire cape', {}, 100_000_000);
setCustomItem(47_506, 'First age bracelet', 'Barrows gloves', {}, 100_000_000);
setCustomItem(47_507, 'First age ring', 'Berserker ring', {}, 100_000_000);

setCustomItem(47_508, 'Broken dwarven warhammer', 'Rune warhammer', {}, 1_000_000_000);

setCustomItem(47_509, 'Equippable mystery box', 'Mystery box', {}, 1_000_000);

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

setCustomItem(47_521, 'Beach mystery box', 'Mystery box', {}, 1_000_000);
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
			magic_damage: 0,
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

setCustomItem(48_324, 'Blacksmith crate', 'Mystery box', {}, 100_000);

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
setCustomItem(48_312, 'Mysterious token', 'Coal', {}, 1_000_000);

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
setCustomItem(50_010, 'Athelas', 'Magic seed', {}, 100_000);

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
	10_000
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
	10_000
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
	10_000
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
	10_000
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
	10_000
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
	10_000
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
	10_000
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
	10_000
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
	10_000
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
setCustomItem(50_067, 'Grifolic flake ', 'Coal', {}, 1000);
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
	'Festive jumper',
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
setCustomItem(52_617, 'Lava flower crown', 'Rainbow flower crown', { tradeable: false }, 10_000);
setCustomItem(52_618, 'Purple flower crown', 'Rainbow flower crown', { tradeable: false }, 10_000);
setCustomItem(52_630, 'Beehive', 'Coal', {}, 10_000);
setCustomItem(52_631, 'Honeycomb', 'Coal', {}, 10_000);
setCustomItem(52_632, 'Honey', 'Coal', {}, 10_000);
setCustomItem(52_633, 'Buzz', 'Herbi', {}, 1_000_000);
setCustomItem(
	52_634,
	'Elder table',
	'Coal',
	{ customItemData: { isSuperUntradeable: true, cantDropFromMysteryBoxes: true } },
	1
);
setCustomItem(70_001, 'Grimy Korulsi', 'Coal', { tradeable: true }, 100_000);
setCustomItem(70_002, 'Korulsi', 'Coal', { tradeable: true }, 100_000);
setCustomItem(70_003, 'Korulsi seed', 'Coal', { tradeable: true }, 50_000);
setCustomItem(70_004, 'Enhanced saradomin brew', 'Coal', { tradeable: true }, 10_000);
setCustomItem(70_005, 'Enhanced super restore', 'Coal', { tradeable: true }, 10_000);
setCustomItem(70_006, 'Enhanced stamina potion', 'Coal', { tradeable: true }, 10_000);
setCustomItem(70_007, 'Enhanced divine water', 'Coal', { tradeable: true }, 10_000);
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
	'Coal',
	{
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
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: false
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
			prayer: 0,
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
setCustomItem(70_018, 'Grand crystal acorn', 'Coal', { tradeable: true }, 6000);
