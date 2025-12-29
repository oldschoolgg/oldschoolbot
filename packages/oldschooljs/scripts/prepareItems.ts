import { readFileSync, writeFileSync } from 'node:fs';
import { objectValues } from '@oldschoolgg/toolkit';
import deepMerge from 'deepmerge';
import { clone } from 'remeda';

import { checkItemVisibility, EquipmentSlot, type FullItem, type Item, ItemVisibility } from '@/meta/item.js';
import { Items } from '@/structures/Items.js';
import bsoItemsJson from '../../../data/bso/bso_items.json' with { type: 'json' };
import { itemChanges } from './manualItemChanges.js';
import { ITEMS_TO_IGNORE_PRICES } from './util/misc.js';

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
		price: 1
	}
];

type ItemWithoutID = Omit<Item, 'id'>;

async function prepareItems(): Promise<void> {
	const messages: string[] = [];
	const previousItems = JSON.parse(readFileSync('./src/assets/item_data.json', 'utf-8'));
	const newItemJSON: { [key: string]: ItemWithoutID } = clone(previousItems);

	const allItems = JSON.parse(readFileSync('../scraper/src/data/full-items.json', 'utf-8')).data as Record<
		string,
		FullItem
	>;
	const newItems: ItemWithoutID[] = [];

	for (const _item of Object.values(allItems)) {
		const id = Number(_item.id);
		const previousItem = previousItems[id] as Item | undefined;
		if (previousItem) {
			if (id >= 31_000) {
				previousItem.name = _item.name;
			}
			newItemJSON[id] = previousItem;
			continue;
		}

		let item: ItemWithoutID = {
			name: _item.name,
			members: _item.members,
			tradeable: _item.tradeable,
			tradeable_on_ge: _item.tradeable_on_ge,
			stackable: _item.stackable,
			// @ts-expect-error
			equipable: _item.equipable,
			noteable: previousItem?.noteable
		};

		if (_item.equipment) {
			item.equipment = previousItem?.equipment ?? {
				attack_stab: _item.equipment.attack_stab,
				attack_slash: _item.equipment.attack_slash,
				attack_crush: _item.equipment.attack_crush,
				attack_magic: _item.equipment.attack_magic,
				attack_ranged: _item.equipment.attack_ranged,
				defence_stab: _item.equipment.defence_stab,
				defence_slash: _item.equipment.defence_slash,
				defence_crush: _item.equipment.defence_crush,
				defence_magic: _item.equipment.defence_magic,
				defence_ranged: _item.equipment.defence_ranged,
				melee_strength: _item.equipment.melee_strength,
				ranged_strength: _item.equipment.ranged_strength,
				magic_damage: _item.equipment.magic_damage,
				prayer: _item.equipment.prayer,
				slot: _item.equipment.slot,
				requirements: _item.equipment.requirements
			};
		}

		const cost = previousItem?.cost ?? _item.value;
		if (cost) {
			item.cost = cost;
		}
		if (previousItem?.buy_limit) {
			item.buy_limit = previousItem.buy_limit;
		}

		if (itemShouldntBeAdded(item) && !previousItem) {
			console.log(`Skipping item that shouldn't be added: ${item.name}[${id}]`);
			continue;
		}

		if (item.name === "Pharaoh's sceptre") {
			item = previousItems[id];
			continue;
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

		if (!previousItem && bsoItemsJson[id.toString() as keyof typeof bsoItemsJson]) {
			throw new Error(`!!!!!!! New item added ${item.name}[${id}] clashes with BSO item !!!!!!!`);
		}

		if (ITEMS_TO_IGNORE_PRICES.includes(id)) {
			delete item.price;
		} else {
			item.price = previousItem?.price ?? item.price;
		}

		const rename = itemsToRename.find(i => i.id === id);
		if (rename) {
			item.name = rename.name;
		}

		if (equipmentModifications.has(id)) {
			const copyItem = Items.get(equipmentModifications.get(id)!)!;
			item.equipment = copyItem.equipment;
			item.equipable = copyItem.equipable as true | undefined;
		}

		if (previousItem) {
			if (previousItem.highalch) {
				item.highalch = previousItem.highalch;
			}
			if (previousItem.lowalch) {
				item.lowalch = previousItem.lowalch;
			}
			if (!previousItem.buy_limit && item.buy_limit) {
				delete item.buy_limit;
			}
			// item.cost = previousItem.cost;
			if (previousItem.equipment?.requirements) {
				// @ts-expect-error ignore
				item.equipment = {
					...item.equipment,
					requirements: previousItem.equipment.requirements
				};
			}
		}

		item.equipment = previousItem?.equipment;

		if (previousItem && id < 30_000) {
			item = previousItem;
		}

		if (itemChanges[id]) {
			item = deepMerge(item, itemChanges[id]) as any;
		}

		if (!previousItem && id < 30_000) {
			continue;
		}
		newItemJSON[id] = item;
	}

	for (const item of manualItems) {
		newItemJSON[item.id] = item;
	}
	// @ts-expect-error
	newItemJSON[0] = undefined;

	const deletedItems: Item[] = objectValues(previousItems)
		.filter(i => !newItemJSON[i.id])
		.filter(i => i !== null && i !== undefined);

	messages.push(`
New Items: ${newItems.map(i => i.name)}
Deleted Items: ${deletedItems.map(i => i.name)}
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

	writeFileSync('./src/assets/item_data.json', `${JSON.stringify(newItemJSON, null, '	')}\n`);
}

prepareItems();
