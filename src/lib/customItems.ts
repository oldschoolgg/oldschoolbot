import { Items } from 'oldschooljs';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import getOSItem from './util/getOSItem';

function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z+]/gi, '').toUpperCase();
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
	baseItem: Item,
	newItemData?: Partial<Item>,
	price = 0
) {
	if (hasSet.has(id)) throw new Error(`Tried to add 2 custom items with same id ${id}`);
	hasSet.add(id);
	Items.set(id, {
		...baseItem,
		...newItemData,
		name,
		id
	});
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
	itemNameMap.set(name, id);
	// Set the item custom price
	customPrices[id] = price || 1;
	// Add the item to the custom items array
	customItems.push(id);
}

setCustomItem(19939, 'Untradeable Mystery Box', getOSItem('Mystery box'), {}, 100_000);
setCustomItem(6199, 'Tradeable Mystery Box', getOSItem('Mystery box'), {}, 100_000);
setCustomItem(3062, 'Pet Mystery Box', getOSItem('Mystery box'), {}, 100_000);
setCustomItem(3713, 'Holiday Mystery Box', getOSItem('Mystery box'), {}, 100_000);
setCustomItem(13345, 'Tester Gift Box', getOSItem('Mystery box'), {}, 100_000);
setCustomItem(5507, 'Remy', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(3714, 'Shelldon', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(9620, 'Doug', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(9619, 'Lil Lamb', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(10092, 'Zippy', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(9058, 'Harry', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(10329, 'Wintertoad', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(3469, 'Klik', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(21313, 'Scruffy', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(9057, 'Zak', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(8441, 'Hammy', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(12592, 'Divine sigil', getOSItem('Elysian sigil'), {}, 930_000_000);
setCustomItem(3454, 'Divine spirit shield', getOSItem('Elysian spirit shield'), {}, 900_000_000);
setCustomItem(500, 'Skipper', getOSItem('Herbi'), {}, 1_000_000);

// Dwarven Items

// 2x faster chopping and wintertodt
setCustomItem(472, 'Dwarven greataxe', getOSItem('Dragon pickaxe'), {}, 1_000_000);
// 2x faster mining
setCustomItem(476, 'Dwarven pickaxe', getOSItem('Dragon pickaxe'), {}, 1_000_000);
// 2x faster smithing and crafting
setCustomItem(474, 'Dwarven greathammer', getOSItem('Dragon warhammer'), {}, 1_000_000);
// 2x faster smelting
setCustomItem(12594, 'Dwarven gauntlets', getOSItem('Cooking gauntlets'), {}, 1_000_000);

setCustomItem(478, 'Dwarven knife', getOSItem('Bronze knife'), {}, 1_000_000);
// setCustomItem(11923, 'Dwarven tinderbox', getOSItem('Tinderbox'));

setCustomItem(506, 'Dwarven bar', getOSItem('Steel bar'), {}, 500_000);
setCustomItem(508, 'Dwarven ore', getOSItem('Iron ore'), {}, 100_000);

setCustomItem(6741, 'Dwarven warhammer', getOSItem('Dragon warhammer'), {}, 10_00_000);

setCustomItem(8871, 'Dwarven crate', getOSItem('Mystery box'), {}, 100_000);

// Abyssal Dragon
// Abyssal lance || 24218 = Guthixian icon [DUPLICATE]
// setCustomItem(24218, 'Abyssal lance', getOSItem('Dragonhunter lance'), {
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
// setCustomItem(24216, 'Abyssal defender', getOSItem('Dragonhunter lance'), {
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
	getOSItem('Infernal cape'),
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
setCustomItem(24212, 'Abyssal thread', getOSItem('Giant pouch'), {}, 10_000_000);

// Abyssal pouch || 24210 = Victor's cape (10) [DUPLICATE]
setCustomItem(24210, 'Abyssal pouch', getOSItem('Giant pouch'), {}, 100_000);

// Ori Pet || 4149	 = Abyssal demon
setCustomItem(4149, 'Ori', getOSItem('Herbi'), {}, 100_000);

// Abyssal bones || 24199 = Seren halo [DUPLICATE]
setCustomItem(24199, 'Abyssal dragon bones', getOSItem('Superior dragon bones'), {}, 20_000);

setCustomItem(19567, 'Cob', getOSItem('Herbi'));

setCustomItem(22949, 'Takon', getOSItem('Herbi'));

setCustomItem(6796, 'Tiny lamp', getOSItem('Lamp'), {}, 100_000);
setCustomItem(21642, 'Small lamp', getOSItem('Lamp'), {}, 300_000);
setCustomItem(23516, 'Average lamp', getOSItem('Lamp'), {}, 500_000);
setCustomItem(22320, 'Large lamp', getOSItem('Lamp'), {}, 600_000);
setCustomItem(11157, 'Huge lamp', getOSItem('Lamp'), {}, 1_000_000);

setCustomItem(1808, 'Peky', getOSItem('Herbi'), {}, 1_000_000);

setCustomItem(1809, 'Obis', getOSItem('Herbi'), {}, 1_000_000);

setCustomItem(1810, 'Plopper', getOSItem('Herbi'), {}, 1_000_000);

setCustomItem(244, 'Brock', getOSItem('Herbi'), {}, 1_000_000);

setCustomItem(76, 'Wilvus', getOSItem('Herbi'), {}, 1_000_000);

setCustomItem(737, 'Smokey', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(5020, 'Lottery ticket', getOSItem('Paramaya ticket'));
setCustomItem(5021, 'Bank lottery ticket', getOSItem('Paramaya ticket'));
// setCustomItem(25238, 'Dwarven defender', getOSItem('Dragon defender'));
setCustomItem(
	19839,
	'Dwarven blessing',
	getOSItem('Holy blessing'),
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
setCustomItem(19837, 'Clue scroll (grandmaster)', getOSItem('Clue scroll (easy)'));
setCustomItem(19838, 'Reward casket (grandmaster)', getOSItem('Reward casket (master)'));
setCustomItem(516, 'Nuts of monkey', getOSItem('Rune platelegs'));

/**
 * Nex
 */
setCustomItem(3741, 'Frozen key', getOSItem('Key'));
setCustomItem(11039, 'Key piece 1', getOSItem('Key'));
setCustomItem(11040, 'Key piece 2', getOSItem('Key'));
setCustomItem(11041, 'Key piece 3', getOSItem('Key'));
setCustomItem(11042, 'Key piece 4', getOSItem('Key'));

setCustomItem(
	432,
	'Torva full helm',
	getOSItem('Rune full helm'),
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
	getOSItem('Rune platebody'),
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
	getOSItem('Rune platelegs'),
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
	getOSItem('Rune boots'),
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
	getOSItem('Rune gloves'),
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
	getOSItem('Rune full helm'),
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
	getOSItem('Rune platebody'),
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
	getOSItem('Rune platelegs'),
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
	getOSItem('Rune boots'),
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
	getOSItem('Rune gloves'),
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
	getOSItem('Rune full helm'),
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
	getOSItem('Rune platebody'),
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
	getOSItem('Rune platelegs'),
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
	getOSItem('Rune boots'),
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
	getOSItem('Rune gloves'),
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
	getOSItem('Twisted bow'),
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
	getOSItem('Master wand'),
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
	getOSItem('Holy book'),
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

setCustomItem(21807, 'Ancient emblem', getOSItem('Ancient emblem'));
setCustomItem(11196, 'Bloodsoaked feather', getOSItem('Feather'));

/**
 *
 *
 * Primal
 *
 *
 */
setCustomItem(4614, 'Primal full helm', getOSItem('Rune full helm'), {
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
setCustomItem(4655, 'Primal platebody', getOSItem('Rune platebody'), {
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
setCustomItem(4622, 'Primal platelegs', getOSItem('Rune platelegs'), {
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
setCustomItem(6167, 'Primal boots', getOSItem('Rune boots'), {
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
setCustomItem(5839, 'Primal gauntlets', getOSItem('Rune gloves'), {
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
setCustomItem(6519, 'Offhand drygore longsword', getOSItem('Elysian spirit shield'), {
	equipment: {
		attack_stab: 60,
		attack_slash: 60,
		attack_crush: 50,
		attack_magic: -5,
		attack_ranged: -5,

		defence_stab: 5,
		defence_slash: 5,
		defence_crush: 5,
		defence_magic: 0,
		defence_ranged: 0,

		melee_strength: 1,
		ranged_strength: 0,
		magic_damage: 0,
		prayer: 1,
		slot: EquipmentSlot.Shield,
		requirements: null
	}
});
setCustomItem(6515, 'Drygore longsword', getOSItem('Ghrazi rapier'), {
	equipment: {
		attack_stab: 120,
		attack_slash: 120,
		attack_crush: 80,
		attack_magic: -5,
		attack_ranged: -5,

		defence_stab: 5,
		defence_slash: 5,
		defence_crush: 5,
		defence_magic: 0,
		defence_ranged: 0,

		melee_strength: 1,
		ranged_strength: 0,
		magic_damage: 0,
		prayer: 1,
		slot: EquipmentSlot.Weapon,
		requirements: null
	}
});

/**
 * Exclusive Items
 *
 * Items from 40_000 to 45_000 will not be dropped by any mystery box, and are untradeable
 */
// Master capes
setCustomItem(40_000, 'Construction master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_001, 'Cooking master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_002, 'Crafting master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_003, 'Farming master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_004, 'Firemaking master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_005, 'Fishing master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_006, 'Fletching master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_007, 'Herblore master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_008, 'Hunter master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_009, 'Magic master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_010, 'Mining master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_011, 'Prayer master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_012, 'Runecraft master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_013, 'Smithing master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_014, 'Thieving master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_015, 'Woodcutting master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_016, 'Agility master cape', getOSItem('Abyssal cape'), {}, 10_000_000);

setCustomItem(40_017, 'Attack master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_018, 'Strength master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_019, 'Defence master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_020, 'Hitpoints master cape', getOSItem('Abyssal cape'), {}, 10_000_000);
setCustomItem(40_021, 'Ranged master cape', getOSItem('Abyssal cape'), {}, 10_000_000);

// Pets

/**
 * Non-mystery box items
 *
 * Items from 45_000 - 50_000 will not be dropped by mystery boxes, but can be traded.
 */

// Birthday pack
setCustomItem(45_003, 'Glass of bubbly', getOSItem('Bronze dagger'), {}, 1000);
setCustomItem(45_004, 'Party horn', getOSItem('Coal'), {}, 1000);
setCustomItem(45_005, 'Party popper', getOSItem('Bronze dagger'), {}, 1000);
setCustomItem(45_006, 'Party cake', getOSItem('Coal'), {}, 1000);
setCustomItem(45_007, 'Cake hat', getOSItem('Coif'), {}, 1000);
setCustomItem(45_008, 'Sparkler', getOSItem('Coal'), {}, 1000);
setCustomItem(45_009, 'Party music box', getOSItem('Coal'), {}, 1000);
setCustomItem(45_010, 'Birthday pack', getOSItem('Coal'), {}, 1000);

// Gamblers box
setCustomItem(45_100, 'Gamblers bag', getOSItem('Coal'), {}, 1000);
setCustomItem(45_101, '4 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_102, '6 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_103, '8 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_104, '10 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_105, '12 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_106, '20 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_107, '100 sided die', getOSItem('Coal'), {}, 1000);
setCustomItem(45_108, 'Ring of luck', getOSItem('Coal'), {}, 1000);

// Pets
setCustomItem(47_000, 'Flappy', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(47_001, 'Ishi', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(47_002, 'Corgi', getOSItem('Herbi'), {}, 1_000_000);
setCustomItem(47_010, 'Sandy', getOSItem('Herbi'), {}, 1_000_000);

// Royal mystery box
setCustomItem(47_500, 'Diamond sceptre', getOSItem('Rune sword'), {}, 1_000_000);
setCustomItem(47_501, 'Diamond crown', getOSItem('Bronze full helm'), {}, 1_000_000);
setCustomItem(47_502, 'Royal mystery box', getOSItem('Mystery box'), {}, 1_000_000);

// 1st age
setCustomItem(47_503, 'First age tiara', getOSItem('Rune full helm'), {}, 1_000_000);
setCustomItem(47_504, 'First age amulet', getOSItem('Amulet of strength'), {}, 1_000_000);
setCustomItem(47_505, 'First age cape', getOSItem('Fire cape'), {}, 1_000_000);
setCustomItem(47_506, 'First age bracelet', getOSItem('Barrows gloves'), {}, 1_000_000);
setCustomItem(47_507, 'First age ring', getOSItem('Berserker ring'), {}, 1_000_000);

setCustomItem(47_508, 'Broken dwarven warhammer', getOSItem('Rune warhammer'), {}, 1_000_000);

setCustomItem(47_509, 'Equippable mystery box', getOSItem('Mystery box'), {}, 500_000);

setCustomItem(47_510, 'Deathtouched dart', getOSItem('Rune dart'), {}, 1_000_000);

/**
 * Misc Items
 *
 * 50_000 - 60_000
 */
setCustomItem(50_001, 'Raw rocktail', getOSItem('Raw trout'), {}, 10_000);
setCustomItem(50_002, 'Rocktail', getOSItem('Trout'), {}, 10_000);

// Blacksmith
setCustomItem(50_003, 'Blacksmith helmet', getOSItem('Rune full helm'), {}, 10_000);
setCustomItem(50_004, 'Blacksmith top', getOSItem('Rune platebody'), {}, 10_000);
setCustomItem(50_005, 'Blacksmith apron', getOSItem('Rune platelegs'), {}, 10_000);
setCustomItem(50_006, 'Blacksmith gloves', getOSItem('Leather gloves'), {}, 10_000);
setCustomItem(50_007, 'Blacksmith boots', getOSItem('Rune boots'), {}, 10_000);

setCustomItem(50_008, 'Mysterious seed', getOSItem('Magic seed'), {}, 100_000);
