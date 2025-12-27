import { readFileSync, writeFileSync } from 'node:fs';
import { objectValues } from '@oldschoolgg/toolkit';
import { diff } from 'deep-object-diff';
import deepMerge from 'deepmerge';

import { checkItemVisibility, EquipmentSlot, type FullItem, type Item, ItemVisibility } from '@/meta/item.js';
import { Items } from '@/structures/Items.js';
import bsoItemsJson from '../../../data/bso/bso_items.json' with { type: 'json' };
import { itemChanges } from './manualItemChanges.js';
import { ITEMS_TO_IGNORE_PRICES, moidLink } from './util/misc.js';

const ITEM_KEYS_TO_DELETE = [
	'quest_item',
	'placeholder',
	'duplicate',
	'last_updated',
	'icon',
	'noted',
	'linked_id_item',
	'linked_id_noted',
	'linked_id_placeholder',
	'stacked',
	'release_date',
	'quest_item',
	'weight',
	'examine',
	'wiki_url'
];
const BOOLEAN_KEYS_TO_FOLD = [
	'members',
	'tradeable',
	'tradeable_on_ge',
	'stackable',
	'noteable',
	'equipable',
	'buy_limit',
	'equipment',
	'weapon'
];
const previousItems = JSON.parse(readFileSync('./src/assets/item_data.json', 'utf-8'));

const equipmentModifications = new Map();
const equipmentModSrc = [
	Items.resolveItems(['Pink stained full helm', 'Bronze full helm']),
	Items.resolveItems(['Pink stained platebody', 'Bronze platebody']),
	Items.resolveItems(['Pink stained platelegs', 'Bronze platelegs']),
	Items.resolveItems(['Bulging sack', 'Red cape'])
] as const;
for (const [toChange, toCopy] of equipmentModSrc) {
	equipmentModifications.set(toChange, toCopy);
}

const itemsToRename = [
	{
		id: 30_105,
		name: 'Tooth half of key (moon key)'
	},
	{
		id: 30_107,
		name: 'Loop half of key (moon key)'
	},
	{
		id: 32388,
		name: 'Medallion fragment (1)'
	},
	{
		id: 32389,
		name: 'Medallion fragment (2)'
	},
	{
		id: 32390,
		name: 'Medallion fragment (3)'
	},
	{
		id: 32391,
		name: 'Medallion fragment (4)'
	},
	{
		id: 32392,
		name: 'Medallion fragment (5)'
	},
	{
		id: 32393,
		name: 'Medallion fragment (6)'
	},
	{
		id: 32394,
		name: 'Medallion fragment (7)'
	},
	{
		id: 32395,
		name: 'Medallion fragment (8)'
	}
];

const newItemJSON: { [key: string]: Item } = {};

function itemShouldntBeAdded(item: any) {
	return checkItemVisibility(item) === ItemVisibility.NeverAdd;
}

const manualItems: Item[] = [
	{
		id: 28_329,
		name: 'Ring of shadows',
		members: true,
		equipable: true,
		cost: 75_000,
		lowalch: 30_000,
		highalch: 45_000,
		equipment: {
			attack_stab: 4,
			attack_slash: 4,
			attack_crush: 4,
			attack_magic: 5,
			attack_ranged: 4,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 5,
			defence_ranged: 0,
			melee_strength: 2,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 2,
			slot: EquipmentSlot.Ring,
			requirements: null
		},
		price: 0
	},
	{
		id: 28_409,
		name: 'Ancient lamp',
		cost: 1,
		price: 0
	},
	{
		id: 27_897,
		name: 'Scaly blue dragonhide',
		members: true,
		tradeable: true,
		tradeable_on_ge: true,
		noteable: true,
		cost: 100,
		lowalch: 40,
		highalch: 60,
		price: 2011
	},
	{
		id: 29912,
		name: "Butler's tray",
		members: true,
		tradeable: false,
		tradeable_on_ge: false,
		noteable: true,
		cost: 100,
		lowalch: 1,
		highalch: 1,
		price: 1,
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
			prayer: 0,
			slot: EquipmentSlot.Weapon,
			requirements: null
		}
	},
	{
		id: 29920,
		name: 'Costume needle',
		members: true,
		tradeable: false,
		tradeable_on_ge: false,
		noteable: true,
		cost: 100,
		lowalch: 1,
		highalch: 1,
		price: 1
	}
];

export default async function prepareItems(): Promise<void> {
	const messages: string[] = [];
	const allItems = JSON.parse(readFileSync('../../scraper/src/data/full-items.json', 'utf-8')).data as Record<
		string,
		FullItem
	>;
	const newItems: Item[] = [];

	for (const _item of Object.values(allItems)) {
		const previousItem = Items.get(_item.id);
		let item: Item = {
			id: _item.id,
			name: _item.name,
			members: _item.members,
			tradeable: _item.tradeable,
			tradeable_on_ge: _item.tradeable_on_ge,
			stackable: _item.stackable,
			noteable: _item.noteable,
			cost: previousItem?.cost ?? _item.value,
			buy_limit: _item.buy_limit,
			equipment: _item.equipment
		};
		for (const bool of ['equipable'] as const) {
			if (item[bool]) {
				_item[bool] = item[bool];
			}
		}

		if (itemShouldntBeAdded(item)) continue;

		if (item.name === "Pharaoh's sceptre") {
			// @ts-expect-error
			item = {
				...allItems[26_950],
				id: item.id
			};
		}

		for (const [_key, value] of Object.entries(item)) {
			const key = _key as keyof typeof item;
			if (ITEM_KEYS_TO_DELETE.includes(key)) {
				delete item[key];
			}
			if (BOOLEAN_KEYS_TO_FOLD.includes(key) && !value) {
				delete item[key];
			}
		}

		if (!previousItem && bsoItemsJson[item.id.toString() as keyof typeof bsoItemsJson]) {
			throw new Error(`!!!!!!! New item added ${item.name}[${item.id}] clashes with BSO item !!!!!!!`);
		}

		if (ITEMS_TO_IGNORE_PRICES.includes(item.id)) {
			delete item.price;
		} else {
			item.price = previousItem?.price ?? item.price;
		}

		const rename = itemsToRename.find(i => i.id === item.id);
		if (rename) {
			item.name = rename.name;
		}

		if (equipmentModifications.has(item.id)) {
			const copyItem = Items.get(equipmentModifications.get(item.id)!)!;
			item.equipment = copyItem.equipment;
			item.equipable = copyItem.equipable as true | undefined;
		}

		if (previousItem) {
			// item.cost = previousItem.cost;
			if (previousItem.equipment?.requirements) {
				// @ts-expect-error ignore
				item.equipment = {
					...item.equipment,
					requirements: previousItem.equipment.requirements
				};
			}
		}

		if (previousItem?.equipment?.requirements && !item.equipment?.requirements) {
			// @ts-expect-error ignore
			item.equipment = {
				...item.equipment,
				requirements: previousItem.equipment.requirements
			};
		}

		if (previousItem && item.id < 30_000) {
			item = previousItem;
		}

		if (itemChanges[item.id]) {
			item = deepMerge(item, itemChanges[item.id]) as any;
		}

		newItemJSON[item.id] = item;

		for (const item of manualItems) {
			newItemJSON[item.id] = item;
		}
	}

	// @ts-expect-error
	newItemJSON[0] = undefined;

	const deletedItems: Item[] = objectValues(previousItems)
		.filter(i => !newItemJSON[i.id])
		.filter(i => i !== null && i !== undefined);

	messages.push(`
New Items: ${moidLink(newItems.map(i => i.id))}
Deleted Items: ${moidLink(deletedItems.map(i => i.id))}
`);

	if (deletedItems.length > 0) {
		messages.push(`
Use these to find out how many people have the deleted items in their banks, and how many of each item they have.

SELECT
  ${deletedItems
		.map(
			item => `COUNT(*) FILTER (WHERE bank->>'${item.id}' IS NOT NULL) AS people_with_item_${item.id},
  SUM((bank->>'${item.id}')::int) AS sum_item_${item.id},`
		)
		.join('\n')}

FROM users;

SELECT id, SUM(kv.value::int) AS total_quantity
FROM users, jsonb_each_text(bank::jsonb) AS kv(itemID, value)
WHERE itemID::int = ANY(ARRAY[${deletedItems.map(i => i.id).join(',')}]::int[])
GROUP BY id
`);
	}

	const diffOutput: any = diff(previousItems, newItemJSON);
	for (const [key, val] of Object.entries(diffOutput as any)) {
		if (!val || Object.values(val).every(t => !t)) {
			delete diffOutput[key];
		}
	}
	writeFileSync('./src/assets/item_data.json', `${JSON.stringify(newItemJSON, null, '	')}\n`);
}
