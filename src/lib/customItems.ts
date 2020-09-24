import { Items } from 'oldschooljs';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { cleanString } from '../util';
import getOSItem from './util/getOSItem';

function setCustomItem(id: number, name: string, baseItem: Item, newItemData?: Partial<Item>) {
	Items.set(id, {
		...baseItem,
		...newItemData,
		name,
		id
	});
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
}

export function initCustomItems() {
	setCustomItem(19939, 'Untradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(6199, 'Tradeable Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3062, 'Pet Mystery Box', getOSItem('Mystery box'));
	setCustomItem(3713, 'Holiday Mystery Box', getOSItem('Mystery box'));
	setCustomItem(5507, 'Remy', getOSItem('Herbi'));
	setCustomItem(3714, 'Shelldon', getOSItem('Herbi'));
	setCustomItem(9620, 'Doug', getOSItem('Herbi'));
	setCustomItem(9619, 'Lil Lamb', getOSItem('Herbi'));
	setCustomItem(10092, 'Zippy', getOSItem('Herbi'));
	setCustomItem(9058, 'Harry', getOSItem('Herbi'));
	setCustomItem(10329, 'Wintertoad', getOSItem('Herbi'));
	setCustomItem(3469, 'Klik', getOSItem('Herbi'));
	setCustomItem(21313, 'Scruffy', getOSItem('Herbi'));
	setCustomItem(9057, 'Zak', getOSItem('Herbi'));
	setCustomItem(8441, 'Hammy', getOSItem('Herbi'));
	setCustomItem(12592, 'Divine sigil', getOSItem('Elysian sigil'));
	setCustomItem(3454, 'Divine spirit shield', getOSItem('Elysian spirit shield'));
	setCustomItem(500, 'Skipper', getOSItem('Herbi'));

	// Dwarven Items

	// 2x faster chopping and wintertodt
	setCustomItem(472, 'Dwarven greataxe', getOSItem('Dragon pickaxe'));
	// 2x faster mining
	setCustomItem(476, 'Dwarven pickaxe', getOSItem('Dragon pickaxe'));
	// 2x faster smithing and crafting
	setCustomItem(474, 'Dwarven greathammer', getOSItem('Dragon warhammer'));
	// 2x faster smelting
	setCustomItem(12594, 'Dwarven gauntlets', getOSItem('Cooking gauntlets'));

	setCustomItem(478, 'Dwarven knife', getOSItem('Bronze knife'));
	// setCustomItem(11923, 'Dwarven tinderbox', getOSItem('Tinderbox'));

	setCustomItem(506, 'Dwarven bar', getOSItem('Steel bar'));
	setCustomItem(508, 'Dwarven ore', getOSItem('Iron ore'));

	setCustomItem(6741, 'Dwarven warhammer', getOSItem('Dragon warhammer'));

	setCustomItem(8871, 'Dwarven crate', getOSItem('Mystery box'));

	// Abyssal Dragon
	// Abyssal lance || 24218 = Guthixian icon [DUPLICATE]
	setCustomItem(24218, 'Abyssal lance', getOSItem('Dragonhunter lance'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal lance',
		equipment: {
			attack_stab: 155,
			attack_slash: 135,
			attack_crush: 75,
			attack_magic: 0,
			attack_ranged: 0,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,
			melee_strength: 70,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 10,
			slot: EquipmentSlot.Weapon,
			requirements: null
		}
	});

	// Abyssal defender || 24216 = Victor's cape (500) [DUPLICATE]
	setCustomItem(24216, 'Abyssal defender', getOSItem('Dragonhunter lance'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal defender',
		equipment: {
			attack_stab: 77,
			attack_slash: 67,
			attack_crush: 37,
			attack_magic: 0,
			attack_ranged: 0,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 0,
			defence_ranged: 0,
			melee_strength: 35,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 5,
			slot: EquipmentSlot.Shield,
			requirements: null
		}
	});

	// Abyssal Cape || 24214 = Victor's cape (100) [DUPLICATE]
	setCustomItem(24214, 'Abyssal cape', getOSItem('Infernal cape'), {
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
	});

	// Abyssal thread || 24212 = Victor's cape (50) [DUPLICATE]
	setCustomItem(24212, 'Abyssal thread', getOSItem('Giant pouch'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal thread'
	});

	// Abyssal pouch || 24210 = Victor's cape (10) [DUPLICATE]
	setCustomItem(24210, 'Abyssal pouch', getOSItem('Giant pouch'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal pouch'
	});

	// Ori Pet || 24208 = Victor's cape (1) [DUPLICATE]
	setCustomItem(24208, 'Dragcula', getOSItem('Herbi'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Dragcula'
	});

	// Dragula Pet || 24205 = Brassica halo [DUPLICATE]
	setCustomItem(24205, 'Ori', getOSItem('Herbi'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Ori'
	});

	// Mally Pet || 24202 = Ancient halo [DUPLICATE]
	setCustomItem(24202, 'Mally', getOSItem('Herbi'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Malyguzin'
	});

	// Abyssal bones || 24199 = Seren halo [DUPLICATE]
	setCustomItem(24199, 'Abyssal dragon bones', getOSItem('Superior dragon bones'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal dragon bones'
	});
}
