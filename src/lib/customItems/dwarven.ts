import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';
import { setCustomItem } from './util';

// 2x faster chopping and wintertodt
setCustomItem(472, 'Dwarven greataxe', 'Dragon pickaxe', {}, 1_000_000);
// 2x faster mining
setCustomItem(476, 'Dwarven pickaxe', 'Dragon pickaxe', {}, 1_000_000);
// 2x faster smithing and crafting
setCustomItem(474, 'Dwarven greathammer', 'Dragon warhammer', {}, 1_000_000);
// 2x faster smelting
setCustomItem(12_594, 'Dwarven gauntlets', 'Cooking gauntlets', { tradeable: true, tradeable_on_ge: true }, 1_000_000);

setCustomItem(478, 'Dwarven knife', 'Bronze knife', {}, 1_000_000);
// setCustomItem(11923, 'Dwarven tinderbox', ('Tinderbox'));

setCustomItem(506, 'Dwarven bar', 'Steel bar', {}, 500_000);
setCustomItem(508, 'Dwarven ore', 'Iron ore', {}, 100_000);

setCustomItem(
	6741,
	'Dwarven warhammer',
	'Dragon warhammer',
	{
		equipment: {
			...getOSItem('Dragon warhammer').equipment!,
			requirements: {
				strength: 99
			}
		}
	},
	1_000_000_000
);

setCustomItem(8871, 'Dwarven crate', 'Mystery box', {}, 100_000);
setCustomItem(
	48_015,
	'Dwarven full helm',
	'Torva full helm',
	{
		equipment: {
			attack_stab: 7,
			attack_slash: 8,
			attack_crush: 26,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 5,
			defence_slash: 55,
			defence_crush: 115,
			defence_magic: -5,
			defence_ranged: 55,

			melee_strength: 3,
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
	48_016,
	'Dwarven platebody',
	'Torva platebody',
	{
		equipment: {
			attack_stab: 12,
			attack_slash: 12,
			attack_crush: 39,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 65,
			defence_slash: 65,
			defence_crush: 200,
			defence_magic: 0,
			defence_ranged: 105,

			melee_strength: 3,
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
	48_017,
	'Dwarven platelegs',
	'Torva platelegs',
	{
		equipment: {
			attack_stab: 8,
			attack_slash: 8,
			attack_crush: 33,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 50,
			defence_slash: 50,
			defence_crush: 190,
			defence_magic: 0,
			defence_ranged: 50,

			melee_strength: 3,
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
	48_018,
	'Dwarven boots',
	'Torva boots',
	{
		equipment: {
			attack_stab: 5,
			attack_slash: 5,
			attack_crush: 16,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 5,
			defence_slash: 5,
			defence_crush: 24,
			defence_magic: 0,
			defence_ranged: 15,

			melee_strength: 3,
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
	48_019,
	'Dwarven gloves',
	'Torva gloves',
	{
		equipment: {
			attack_stab: 5,
			attack_slash: 5,
			attack_crush: 16,
			attack_magic: -5,
			attack_ranged: 0,

			defence_stab: 5,
			defence_slash: 5,
			defence_crush: 18,
			defence_magic: 0,
			defence_ranged: 10,

			melee_strength: 3,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 1,
			slot: EquipmentSlot.Hands,
			requirements: null
		}
	},
	50_000_000
);
