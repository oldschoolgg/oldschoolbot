import deepMerge from 'deepmerge';
import { Items } from 'oldschooljs';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import getOSItem from './util/getOSItem';

function cleanString(str: string): string {
	return str.replace(/\s/g, '').toUpperCase();
}
export const customPrices: Record<number, number> = [];

export const customItems: number[] = [];

export function isCustomItem(itemID: number) {
	return customItems.includes(itemID);
}

export const hasSet = new Set();

function setCustomItem(
	id: number,
	name: string,
	baseItem: string,
	newItemData?: Partial<Item>,
	price = 0
) {
	if (hasSet.has(id)) throw new Error(`Tried to add 2 custom items with same id ${id}`);
	hasSet.add(id);
	const data = deepMerge({ ...getOSItem(baseItem) }, { ...newItemData, name, id });
	data.price = price || 1;

	Items.set(id, data);
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
	itemNameMap.set(name, id);

	// Add the item to the custom items array
	customItems.push(id);
}

setCustomItem(19939, 'Untradeable Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(6199, 'Tradeable Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(3062, 'Pet Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(3713, 'Holiday Mystery Box', 'Mystery box', {}, 100_000);
setCustomItem(13345, 'Tester Gift Box', 'Mystery box', {}, 100_000);
setCustomItem(5507, 'Remy', 'Herbi', {}, 1_000_000);
setCustomItem(3714, 'Shelldon', 'Herbi', {}, 1_000_000);
setCustomItem(9620, 'Doug', 'Herbi', {}, 1_000_000);
setCustomItem(9619, 'Lil Lamb', 'Herbi', {}, 1_000_000);
setCustomItem(10092, 'Zippy', 'Herbi', {}, 1_000_000);
setCustomItem(9058, 'Harry', 'Herbi', {}, 1_000_000);
setCustomItem(10329, 'Wintertoad', 'Herbi', {}, 1_000_000);
setCustomItem(3469, 'Klik', 'Herbi', {}, 1_000_000);
setCustomItem(21313, 'Scruffy', 'Herbi', {}, 1_000_000);
setCustomItem(9057, 'Zak', 'Herbi', {}, 1_000_000);
setCustomItem(8441, 'Hammy', 'Herbi', {}, 1_000_000);
setCustomItem(12592, 'Divine sigil', 'Elysian sigil', {}, 930_000_000);
setCustomItem(3454, 'Divine spirit shield', 'Elysian spirit shield', {}, 900_000_000);
setCustomItem(500, 'Skipper', 'Herbi', {}, 1_000_000);

// Dwarven Items

// 2x faster chopping and wintertodt
setCustomItem(472, 'Dwarven greataxe', 'Dragon pickaxe', {}, 1_000_000);
// 2x faster mining
setCustomItem(476, 'Dwarven pickaxe', 'Dragon pickaxe', {}, 1_000_000);
// 2x faster smithing and crafting
setCustomItem(474, 'Dwarven greathammer', 'Dragon warhammer', {}, 1_000_000);
// 2x faster smelting
setCustomItem(12594, 'Dwarven gauntlets', 'Cooking gauntlets', {}, 1_000_000);

setCustomItem(478, 'Dwarven knife', 'Bronze knife', {}, 1_000_000);
// setCustomItem(11923, 'Dwarven tinderbox', ('Tinderbox'));

setCustomItem(506, 'Dwarven bar', 'Steel bar', {}, 500_000);
setCustomItem(508, 'Dwarven ore', 'Iron ore', {}, 100_000);

setCustomItem(6741, 'Dwarven warhammer', 'Dragon warhammer', {}, 10_000_000);

setCustomItem(8871, 'Dwarven crate', 'Mystery box', {}, 100_000);

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

// Abyssal Cape || 24214 = Victor's cape (100) [DUPLICATE]
setCustomItem(
	24214,
	'Abyssal cape',
	'Infernal cape',
	{
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal cape',
		equipment: {
			attack_stab: 12,
			attack_slash: 12,
			attack_crush: 12,
			attack_magic: 6,
			attack_ranged: 6,
			defence_stab: 36,
			defence_slash: 36,
			defence_crush: 36,
			defence_magic: 36,
			defence_ranged: 36,
			melee_strength: 24,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 10,
			slot: EquipmentSlot.Cape,
			requirements: null
		}
	},
	100_000_000
);

// Abyssal thread || 24212 = Victor's cape (50) [DUPLICATE]
setCustomItem(24212, 'Abyssal thread', 'Giant pouch', {}, 10_000_000);

// Abyssal pouch || 24210 = Victor's cape (10) [DUPLICATE]
setCustomItem(24210, 'Abyssal pouch', 'Giant pouch', {}, 100_000);

// Ori Pet || 4149	 = Abyssal demon
setCustomItem(4149, 'Ori', 'Herbi', {}, 100_000);

// Abyssal bones || 24199 = Seren halo [DUPLICATE]
setCustomItem(24199, 'Abyssal dragon bones', 'Superior dragon bones', {}, 20_000);

setCustomItem(19567, 'Cob', 'Herbi');

setCustomItem(22949, 'Takon', 'Herbi');

setCustomItem(6796, 'Tiny lamp', 'Lamp', {}, 100_000);
setCustomItem(21642, 'Small lamp', 'Lamp', {}, 300_000);
setCustomItem(23516, 'Average lamp', 'Lamp', {}, 500_000);
setCustomItem(22320, 'Large lamp', 'Lamp', {}, 600_000);
setCustomItem(11157, 'Huge lamp', 'Lamp', {}, 1_000_000);

setCustomItem(1808, 'Peky', 'Herbi', {}, 1_000_000);

setCustomItem(1809, 'Obis', 'Herbi', {}, 1_000_000);

setCustomItem(1810, 'Plopper', 'Herbi', {}, 1_000_000);

setCustomItem(244, 'Brock', 'Herbi', {}, 1_000_000);

setCustomItem(76, 'Wilvus', 'Herbi', {}, 1_000_000);

setCustomItem(737, 'Smokey', 'Herbi', {}, 1_000_000);
setCustomItem(5020, 'Lottery ticket', 'Paramaya ticket');
setCustomItem(5021, 'Bank lottery ticket', 'Paramaya ticket');
// setCustomItem(25238, 'Dwarven defender', ('Dragon defender'));
setCustomItem(
	19839,
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
setCustomItem(19837, 'Clue scroll (grandmaster)', 'Clue scroll (easy)');
setCustomItem(19838, 'Reward casket (grandmaster)', 'Reward casket (master)');
setCustomItem(516, 'Nuts of monkey', 'Rune platelegs');

/**
 * Nex
 */
setCustomItem(3741, 'Frozen key', 'Key');
setCustomItem(11039, 'Key piece 1', 'Key');
setCustomItem(11040, 'Key piece 2', 'Key');
setCustomItem(11041, 'Key piece 3', 'Key');
setCustomItem(11042, 'Key piece 4', 'Key');

setCustomItem(
	432,
	'Torva full helm',
	'Rune full helm',
	{
		equipment: {
			attack_stab: 35,
			attack_slash: 18,
			attack_crush: 18,
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
	50_000_000
);
setCustomItem(
	709,
	'Torva platebody',
	'Rune platebody',
	{
		equipment: {
			attack_stab: 35,
			attack_slash: 18,
			attack_crush: 18,
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
	50_000_000
);
setCustomItem(
	2404,
	'Torva platelegs',
	'Rune platelegs',
	{
		equipment: {
			attack_stab: 35,
			attack_slash: 18,
			attack_crush: 18,
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
	50_000_000
);
setCustomItem(
	2838,
	'Torva boots',
	'Rune boots',
	{
		equipment: {
			attack_stab: 22,
			attack_slash: 2,
			attack_crush: 2,
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
	50_000_000
);
setCustomItem(
	4273,
	'Torva gloves',
	'Rune gloves',
	{
		equipment: {
			attack_stab: 26,
			attack_slash: 16,
			attack_crush: 16,
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
	50_000_000
);

setCustomItem(
	601,
	'Pernix cowl',
	'Rune full helm',
	{
		equipment: {
			attack_stab: -5,
			attack_slash: -5,
			attack_crush: -5,
			attack_magic: -12,
			attack_ranged: 20,

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
	50_000_000
);
setCustomItem(
	605,
	'Pernix body',
	'Rune platebody',
	{
		equipment: {
			attack_stab: -5,
			attack_slash: -5,
			attack_crush: -5,
			attack_magic: -12,
			attack_ranged: 45,

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
	50_000_000
);
setCustomItem(
	4272,
	'Pernix chaps',
	'Rune platelegs',
	{
		equipment: {
			attack_stab: -5,
			attack_slash: -5,
			attack_crush: -5,
			attack_magic: -12,
			attack_ranged: 25,

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
	50_000_000
);
setCustomItem(
	758,
	'Pernix boots',
	'Rune boots',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: -12,
			attack_ranged: 19,

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
	50_000_000
);
setCustomItem(
	759,
	'Pernix gloves',
	'Rune gloves',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: -5,
			attack_magic: -5,
			attack_ranged: 15,

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
	50_000_000
);

setCustomItem(
	788,
	'Virtus mask',
	'Rune full helm',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 20,
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
	50_000_000
);
setCustomItem(
	983,
	'Virtus robe top',
	'Rune platebody',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 45,
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
	50_000_000
);
setCustomItem(
	2409,
	'Virtus robe legs',
	'Rune platelegs',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 40,
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
	50_000_000
);
setCustomItem(
	9654,
	'Virtus boots',
	'Rune boots',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 22,
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
	50_000_000
);
setCustomItem(
	2423,
	'Virtus gloves',
	'Rune gloves',
	{
		equipment: {
			attack_stab: 15,
			attack_slash: 15,
			attack_crush: 15,
			attack_magic: 22,
			attack_ranged: 12,

			defence_stab: 9,
			defence_slash: 9,
			defence_crush: 9,
			defence_magic: 12,
			defence_ranged: 9,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 1,
			prayer: 1,
			slot: EquipmentSlot.Hands,
			requirements: null
		}
	},
	50_000_000
);

setCustomItem(
	2832,
	'Zaryte bow',
	'Twisted bow',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 0,
			attack_ranged: 190,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 2,
			magic_damage: 0,
			prayer: 6,
			slot: EquipmentSlot.TwoHanded,
			requirements: null
		}
	},
	50_000_000
);
setCustomItem(
	2834,
	'Virtus wand',
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
		}
	},
	50_000_000
);
setCustomItem(
	2836,
	'Virtus book',
	'Holy book',
	{
		equipment: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: 35,
			attack_ranged: 0,

			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 25,
			defence_ranged: 0,

			melee_strength: 0,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 5,
			slot: EquipmentSlot.Shield,
			requirements: null
		}
	},
	50_000_000
);

setCustomItem(21807, 'Ancient emblem', 'Ancient emblem');
setCustomItem(11196, 'Bloodsoaked feather', 'Feather');

/**
 *
 *
 * Primal
 *
 *
 */
setCustomItem(4614, 'Primal full helm', 'Rune full helm', {
	equipment: {
		attack_stab: 75,
		attack_slash: 78,
		attack_crush: 78,
		attack_magic: -5,
		attack_ranged: 0,

		defence_stab: 120,
		defence_slash: 125,
		defence_crush: 125,
		defence_magic: -5,
		defence_ranged: 125,

		melee_strength: 5,
		ranged_strength: 0,
		magic_damage: 0,
		prayer: 1,
		slot: EquipmentSlot.Head,
		requirements: null
	}
});
setCustomItem(4655, 'Primal platebody', 'Rune platebody', {
	equipment: {
		attack_stab: 55,
		attack_slash: 58,
		attack_crush: 58,
		attack_magic: -5,
		attack_ranged: 0,

		defence_stab: 260,
		defence_slash: 250,
		defence_crush: 250,
		defence_magic: 0,
		defence_ranged: 265,

		melee_strength: 5,
		ranged_strength: 0,
		magic_damage: 0,
		prayer: 1,
		slot: EquipmentSlot.Body,
		requirements: null
	}
});
setCustomItem(4622, 'Primal platelegs', 'Rune platelegs', {
	equipment: {
		attack_stab: 55,
		attack_slash: 58,
		attack_crush: 58,
		attack_magic: -5,
		attack_ranged: 0,

		defence_stab: 210,
		defence_slash: 210,
		defence_crush: 210,
		defence_magic: 0,
		defence_ranged: 200,

		melee_strength: 5,
		ranged_strength: 0,
		magic_damage: 0,
		prayer: 1,
		slot: EquipmentSlot.Legs,
		requirements: null
	}
});
setCustomItem(6167, 'Primal boots', 'Rune boots', {
	equipment: {
		attack_stab: 22,
		attack_slash: 2,
		attack_crush: 2,
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
});
setCustomItem(5839, 'Primal gauntlets', 'Rune gloves', {
	equipment: {
		attack_stab: 26,
		attack_slash: 16,
		attack_crush: 16,
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
});

/**
 * Exclusive Items
 *
 * Items from 40_000 to 45_000 will not be dropped by any mystery box, and are untradeable
 */
// Master capes
setCustomItem(40_000, 'Construction master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_001, 'Cooking master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_002, 'Crafting master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_003, 'Farming master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_004, 'Firemaking master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_005, 'Fishing master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_006, 'Fletching master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_007, 'Herblore master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_008, 'Hunter master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_009, 'Magic master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_010, 'Mining master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_011, 'Prayer master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_012, 'Runecraft master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_013, 'Smithing master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_014, 'Thieving master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_015, 'Woodcutting master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_016, 'Agility master cape', 'Abyssal cape', {}, 10_000_000);

setCustomItem(40_017, 'Attack master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_018, 'Strength master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_019, 'Defence master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_020, 'Hitpoints master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_021, 'Ranged master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_022, 'Dungeoneering master cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_023, 'Dungeoneering cape', 'Fire cape', {}, 20_000);
setCustomItem(40_024, 'Dungeoneering cape(t)', 'Fire cape', {}, 20_000);
setCustomItem(40_025, 'Dungeoneering hood', 'Rune full helm', {}, 20_000);
setCustomItem(40_053, 'Master quest cape', 'Abyssal cape', {}, 10_000_000);
setCustomItem(40_054, 'Support cape', 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_055, "Gatherer's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_056, "Combatant's cape", 'Abyssal cape', {}, 200_000_000);
setCustomItem(40_057, "Artisan's cape", 'Abyssal cape', {}, 200_000_000);

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
setCustomItem(40_039, 'Frosty', 'Herbi', {}, 20_000_000);
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

// Pets

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
setCustomItem(45_108, 'Ring of luck', 'Coal', {}, 1000);

// Pets
setCustomItem(47_000, 'Flappy', 'Herbi', {}, 1_000_000);
setCustomItem(47_001, 'Ishi', 'Herbi', {}, 1_000_000);
setCustomItem(47_002, 'Corgi', 'Herbi', {}, 1_000_000);
setCustomItem(47_010, 'Sandy', 'Herbi', {}, 1_000_000);

// Royal mystery box
setCustomItem(47_500, 'Diamond sceptre', 'Rune sword', {}, 1_000_000);
setCustomItem(47_501, 'Diamond crown', 'Bronze full helm', {}, 1_000_000);
setCustomItem(47_502, 'Royal mystery box', 'Mystery box', {}, 1_000_000);

// 1st age
setCustomItem(47_503, 'First age tiara', 'Rune full helm', {}, 1_000_000);
setCustomItem(47_504, 'First age amulet', 'Amulet of strength', {}, 1_000_000);
setCustomItem(47_505, 'First age cape', 'Fire cape', {}, 1_000_000);
setCustomItem(47_506, 'First age bracelet', 'Barrows gloves', {}, 1_000_000);
setCustomItem(47_507, 'First age ring', 'Berserker ring', {}, 1_000_000);

setCustomItem(47_508, 'Broken dwarven warhammer', 'Rune warhammer', {}, 1_000_000);

setCustomItem(47_509, 'Equippable mystery box', 'Mystery box', {}, 1_000_000);

setCustomItem(47_510, 'Deathtouched dart', 'Rune dart', {}, 5_000_000);

setCustomItem(
	47_511,
	'Drygore longsword',
	"Vesta's longsword",
	{
		equipment: {
			attack_stab: 66,
			attack_slash: 36,
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
			attack_stab: 22,
			attack_slash: 2,
			attack_crush: 22,
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
			attack_stab: 100,
			attack_slash: 75,
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
			attack_stab: 30,
			attack_slash: 15,
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
setCustomItem(47_518, 'Baby kalphite king', 'Herbi', {}, 1_000_000);
setCustomItem(47_519, 'Hoppy', 'Herbi', {}, 20_000_000);
setCustomItem(47_520, 'Craig', 'Herbi', {}, 20_000_000);

setCustomItem(47_521, 'Beach mystery box', 'Mystery box', {}, 1_000_000);
setCustomItem(47_522, 'Snappy the Turtle', 'Herbi', {}, 1_000_000);
setCustomItem(47_523, 'Beach ball', 'Coal', {}, 100_000);
setCustomItem(47_524, 'Water balloon', 'Coal', {}, 100_000);
setCustomItem(47_525, 'Ice cream', 'Coal', {}, 100_000);
setCustomItem(47_526, 'Crab hat', 'Coal', {}, 100_000);
setCustomItem(47_527, 'Steve', 'Herbi', {}, 1_000_000);

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
setCustomItem(50_009, 'Athelas seed', 'Magic seed', {}, 1_000_000);
setCustomItem(50_010, 'Athelas', 'Magic seed', {}, 1_000_000);
