import { Items } from 'oldschooljs';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { cleanString } from '../util';
import getIconAsBase64 from './util/getIconAsBase64';
import getOSItem from './util/getOSItem';

export const customPrices: Record<number, number> = [];

async function setCustomItem(
	id: number,
	name: string,
	baseItem: Item,
	newItemData?: Partial<Item>,
	price = 0
) {
	Items.set(id, {
		...baseItem,
		...newItemData,
		name,
		id,
		custom: true,
		icon: await getIconAsBase64(id)
	});
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
	// Set the item custom price
	customPrices[id] = price ? price : baseItem.tradeable_on_ge ? 1 : 0;
}

export async function initCustomItems() {
	await setCustomItem(19939, 'Untradeable Mystery Box', getOSItem('Mystery box'));
	await setCustomItem(6199, 'Tradeable Mystery Box', getOSItem('Mystery box'));
	await setCustomItem(3062, 'Pet Mystery Box', getOSItem('Mystery box'));
	await setCustomItem(3713, 'Holiday Mystery Box', getOSItem('Mystery box'));
	await setCustomItem(5507, 'Remy', getOSItem('Herbi'));
	await setCustomItem(3714, 'Shelldon', getOSItem('Herbi'));
	await setCustomItem(9620, 'Doug', getOSItem('Herbi'));
	await setCustomItem(9619, 'Lil Lamb', getOSItem('Herbi'));
	await setCustomItem(10092, 'Zippy', getOSItem('Herbi'));
	await setCustomItem(9058, 'Harry', getOSItem('Herbi'));
	await setCustomItem(10329, 'Wintertoad', getOSItem('Herbi'));
	await setCustomItem(3469, 'Klik', getOSItem('Herbi'));
	await setCustomItem(21313, 'Scruffy', getOSItem('Herbi'));
	await setCustomItem(9057, 'Zak', getOSItem('Herbi'));
	await setCustomItem(8441, 'Hammy', getOSItem('Herbi'));
	await setCustomItem(12592, 'Divine sigil', getOSItem('Elysian sigil'), {}, 930_000_000);
	await setCustomItem(
		3454,
		'Divine spirit shield',
		getOSItem('Elysian spirit shield'),
		{},
		900_000_000
	);
	await setCustomItem(500, 'Skipper', getOSItem('Herbi'));

	// Dwarven Items

	// 2x faster chopping and wintertodt
	await setCustomItem(472, 'Dwarven greataxe', getOSItem('Dragon pickaxe'));
	// 2x faster mining
	await setCustomItem(476, 'Dwarven pickaxe', getOSItem('Dragon pickaxe'));
	// 2x faster smithing and crafting
	await setCustomItem(474, 'Dwarven greathammer', getOSItem('Dragon warhammer'));
	// 2x faster smelting
	await setCustomItem(12594, 'Dwarven gauntlets', getOSItem('Cooking gauntlets'));

	await setCustomItem(478, 'Dwarven knife', getOSItem('Bronze knife'));
	// setCustomItem(11923, 'Dwarven tinderbox', getOSItem('Tinderbox'));

	await setCustomItem(506, 'Dwarven bar', getOSItem('Steel bar'));
	await setCustomItem(508, 'Dwarven ore', getOSItem('Iron ore'));

	await setCustomItem(6741, 'Dwarven warhammer', getOSItem('Dragon warhammer'));

	await setCustomItem(8871, 'Dwarven crate', getOSItem('Mystery box'));

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
	await setCustomItem(
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
		500_000_000
	);

	// Abyssal thread || 24212 = Victor's cape (50) [DUPLICATE]
	await setCustomItem(
		24212,
		'Abyssal thread',
		getOSItem('Giant pouch'),
		{
			duplicate: false,
			tradeable: true,
			tradeable_on_ge: true,
			wiki_name: 'Abyssal thread'
		},
		100_000_000
	);

	// Abyssal pouch || 24210 = Victor's cape (10) [DUPLICATE]
	await setCustomItem(24210, 'Abyssal pouch', getOSItem('Giant pouch'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Abyssal pouch'
	});

	// Ori Pet || 4149	 = Abyssal demon
	await setCustomItem(4149, 'Ori', getOSItem('Herbi'), {
		duplicate: false,
		tradeable: true,
		tradeable_on_ge: true,
		wiki_name: 'Ori'
	});

	// Abyssal bones || 24199 = Seren halo [DUPLICATE]
	await setCustomItem(
		24199,
		'Abyssal dragon bones',
		getOSItem('Superior dragon bones'),
		{
			duplicate: false,
			tradeable: true,
			tradeable_on_ge: true,
			wiki_name: 'Abyssal dragon bones'
		},
		50_000
	);
}
