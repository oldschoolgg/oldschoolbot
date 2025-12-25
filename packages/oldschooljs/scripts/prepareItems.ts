// import { readFileSync, writeFileSync } from 'node:fs';
// import { increaseNumByPercent, objectValues, reduceNumByPercent } from '@oldschoolgg/toolkit';
// import { diff } from 'deep-object-diff';
// import deepMerge from 'deepmerge';
// import { clone } from 'remeda';

// import { EquipmentSlot, type Item } from '@/meta/item.js';
// import { Items } from '@/structures/Items.js';
// import { USELESS_ITEMS } from '@/structures/ItemsClass.js';
// import bsoItemsJson from '../../../data/bso/bso_items.json' with { type: 'json' };
// import { fetchPrices } from './fetchPrices.js';
// import { fetchRawItems } from './fetchRawItems.js';
// import { itemChanges } from './manualItemChanges.js';
// import { CLUE_SCROLL_IDS, CLUE_SCROLL_NAMES, CLUE_STEP_REGEX, ITEMS_TO_IGNORE_PRICES, moidLink } from './util/misc.js';

// const ITEM_UPDATE_CONFIG = {
// 	SHOULD_UPDATE_PRICES: false
// };

// const ITEM_KEYS_TO_DELETE = [
// 	'quest_item',
// 	'placeholder',
// 	'duplicate',
// 	'last_updated',
// 	'icon',
// 	'noted',
// 	'linked_id_item',
// 	'linked_id_noted',
// 	'linked_id_placeholder',
// 	'stacked',
// 	'release_date',
// 	'quest_item',
// 	'weight',
// 	'examine',
// 	'wiki_url'
// ];
// const KEYS_TO_WARN_ON_CHANGE: (keyof Item)[] = ['equipable', 'equipment', 'weapon'];
// const BOOLEAN_KEYS_TO_FOLD = [
// 	'members',
// 	'tradeable',
// 	'tradeable_on_ge',
// 	'stackable',
// 	'noteable',
// 	'equipable',
// 	'buy_limit',
// 	'equipment',
// 	'weapon'
// ];
// const previousItems = JSON.parse(readFileSync('./src/assets/item_data.json', 'utf-8'));

// const equipmentModifications = new Map();
// const equipmentModSrc = [
// 	Items.resolveItems(['Pink stained full helm', 'Bronze full helm']),
// 	Items.resolveItems(['Pink stained platebody', 'Bronze platebody']),
// 	Items.resolveItems(['Pink stained platelegs', 'Bronze platelegs']),
// 	Items.resolveItems(['Bulging sack', 'Red cape'])
// ] as const;
// for (const [toChange, toCopy] of equipmentModSrc) {
// 	equipmentModifications.set(toChange, toCopy);
// }

// const itemsToRename = [
// 	{
// 		id: 30_105,
// 		name: 'Tooth half of key (moon key)'
// 	},
// 	{
// 		id: 30_107,
// 		name: 'Loop half of key (moon key)'
// 	},
// 	{
// 		id: 32388,
// 		name: 'Medallion fragment (1)'
// 	},
// 	{
// 		id: 32389,
// 		name: 'Medallion fragment (2)'
// 	},
// 	{
// 		id: 32390,
// 		name: 'Medallion fragment (3)'
// 	},
// 	{
// 		id: 32391,
// 		name: 'Medallion fragment (4)'
// 	},
// 	{
// 		id: 32392,
// 		name: 'Medallion fragment (5)'
// 	},
// 	{
// 		id: 32393,
// 		name: 'Medallion fragment (6)'
// 	},
// 	{
// 		id: 32394,
// 		name: 'Medallion fragment (7)'
// 	},
// 	{
// 		id: 32395,
// 		name: 'Medallion fragment (8)'
// 	}
// ];

// const itemsBeingModified = new Set([...equipmentModSrc.map(i => i[0]), ...itemsToRename.map(i => i.id)]);

// const newItemJSON: { [key: string]: Item } = {};

// function itemShouldntBeAdded(item: any) {
// 	if (CLUE_SCROLL_IDS.includes(item.id)) return false;

// 	return (
// 		(CLUE_SCROLL_NAMES.includes(item.name) && !CLUE_SCROLL_IDS.includes(item.id)) ||
// 		USELESS_ITEMS.includes(item.id) ||
// 		item.duplicate === true ||
// 		item.noted ||
// 		item.linked_id_item ||
// 		item.placeholder ||
// 		item.name.toLowerCase() === 'null' ||
// 		item.wiki_name?.includes(' (Worn)') ||
// 		(item.wiki_name && CLUE_STEP_REGEX.exec(item.wiki_name))
// 	);
// }

// const manualItems: Item[] = [
// 	{
// 		id: 28_329,
// 		name: 'Ring of shadows',
// 		members: true,
// 		equipable: true,
// 		cost: 75_000,
// 		lowalch: 30_000,
// 		highalch: 45_000,
// 		equipment: {
// 			attack_stab: 4,
// 			attack_slash: 4,
// 			attack_crush: 4,
// 			attack_magic: 5,
// 			attack_ranged: 4,
// 			defence_stab: 0,
// 			defence_slash: 0,
// 			defence_crush: 0,
// 			defence_magic: 5,
// 			defence_ranged: 0,
// 			melee_strength: 2,
// 			ranged_strength: 0,
// 			magic_damage: 0,
// 			prayer: 2,
// 			slot: EquipmentSlot.Ring,
// 			requirements: null
// 		},
// 		price: 0
// 	},
// 	{
// 		id: 28_409,
// 		name: 'Ancient lamp',
// 		cost: 1,
// 		price: 0
// 	},
// 	{
// 		id: 27_897,
// 		name: 'Scaly blue dragonhide',
// 		members: true,
// 		tradeable: true,
// 		tradeable_on_ge: true,
// 		noteable: true,
// 		cost: 100,
// 		lowalch: 40,
// 		highalch: 60,
// 		price: 2011
// 	},
// 	{
// 		id: 29912,
// 		name: "Butler's tray",
// 		members: true,
// 		tradeable: false,
// 		tradeable_on_ge: false,
// 		noteable: true,
// 		cost: 100,
// 		lowalch: 1,
// 		highalch: 1,
// 		price: 1,
// 		equipment: {
// 			attack_stab: 0,
// 			attack_slash: 0,
// 			attack_crush: 0,
// 			attack_magic: 0,
// 			attack_ranged: 0,
// 			defence_stab: 0,
// 			defence_slash: 0,
// 			defence_crush: 0,
// 			defence_magic: 0,
// 			defence_ranged: 0,
// 			melee_strength: 0,
// 			ranged_strength: 0,
// 			magic_damage: 0,
// 			prayer: 0,
// 			slot: EquipmentSlot.Weapon,
// 			requirements: null
// 		}
// 	},
// 	{
// 		id: 29920,
// 		name: 'Costume needle',
// 		members: true,
// 		tradeable: false,
// 		tradeable_on_ge: false,
// 		noteable: true,
// 		cost: 100,
// 		lowalch: 1,
// 		highalch: 1,
// 		price: 1
// 	}
// ];

// export default async function prepareItems(): Promise<void> {
// 	const messages: string[] = [];
// 	const allItemsRaw = await fetchRawItems();
// 	const allItems = clone(allItemsRaw);

// 	const allPrices = await fetchPrices();
// 	const newItems: Item[] = [];
// 	const nameChanges: string[] = [];

// 	for (let item of Object.values(allItems)) {
// 		if (itemShouldntBeAdded(item)) continue;

// 		if (item.name === "Pharaoh's sceptre") {
// 			item = {
// 				...allItems[26_950],
// 				id: item.id
// 			};
// 		}

// 		for (const [_key, value] of Object.entries(item)) {
// 			const key = _key as keyof typeof item;
// 			if (ITEM_KEYS_TO_DELETE.includes(key)) {
// 				delete item[key];
// 			}
// 			if (BOOLEAN_KEYS_TO_FOLD.includes(key) && !value) {
// 				delete item[key];
// 			}
// 		}

// 		const previousItem = Items.get(item.id);
// 		if (!previousItem) {
// 			newItems.push(item);
// 			if (bsoItemsJson[item.id.toString() as keyof typeof bsoItemsJson]) {
// 				throw new Error(`!!!!!!! New item added ${item.name}[${item.id}] clashes with BSO item !!!!!!!`);
// 			}
// 		}

// 		const price = allPrices[item.id];
// 		if (price) {
// 			// Fix weird bug with prices: (high can be 1 and low 2.14b for example... blame Jamflex)
// 			if (price.high < price.low) price.high = price.low;
// 			// Calculate average of High + Low
// 			item.price = Math.ceil(Math.max(0, ((price.high as number) + (price.low as number)) / 2));
// 		} else {
// 			delete item.price;
// 		}

// 		if (ITEMS_TO_IGNORE_PRICES.includes(item.id)) {
// 			delete item.price;
// 		}

// 		let dontChange = false;
// 		if (previousItem?.price && item.tradeable) {
// 			if (item.price === undefined) item.price = previousItem.price;
// 			// If major price increase, just dont fucking change it.
// 			if (previousItem.price < item.price / 20 && previousItem.price !== 0) dontChange = true;
// 			// Prevent weird bug with expensive items: (An item with 2b val on GE had high = 1 & low = 100k)
// 			if (item.price < previousItem.price / 10) dontChange = true;
// 			// If price differs by 10000x just don't change it.
// 			if (price && price.high / 10000 > price.low) dontChange = true;
// 		}

// 		if (dontChange || !ITEM_UPDATE_CONFIG.SHOULD_UPDATE_PRICES) {
// 			item.price = previousItem?.price ?? item.price;
// 		}

// 		// Preventing possibly unwanted changes
// 		// if (previousItem) {
// 		// 	item.name = previousItem.name;
// 		// 	item.buy_limit = previousItem?.buy_limit;
// 		// 	item.weapon = previousItem?.weapon;
// 		// 	item.equipment = previousItem?.equipment;
// 		// }

// 		// Dont change price if its only a <10% difference and price is less than 100k
// 		if (item.price) {
// 			if (
// 				previousItem?.price &&
// 				item.price > reduceNumByPercent(previousItem?.price, 10) &&
// 				item.price < increaseNumByPercent(previousItem?.price, 10) &&
// 				item.price < 100_000
// 			) {
// 				item.price = previousItem.price;
// 			} else if (
// 				// Ignore <3% changes in any way
// 				previousItem?.price &&
// 				item.price > reduceNumByPercent(previousItem?.price, 3) &&
// 				item.price < increaseNumByPercent(previousItem?.price, 3)
// 			) {
// 				item.price = previousItem.price;
// 			}
// 		}
// 		if (previousItem && !itemsBeingModified.has(item.id)) {
// 			for (const key of KEYS_TO_WARN_ON_CHANGE) {
// 				if (!item[key] && Boolean(previousItem?.[key])) {
// 					messages.push(`[ShapeChange]: ${item.name} (${item.id}) had ${key} removed`);
// 				}
// 				if (!previousItem[key] && Boolean(item?.[key])) {
// 					messages.push(`[ShapeChange]: ${item.name} (${item.id}) had ${key} added`);
// 				}
// 			}
// 			if (item.name !== previousItem.name) {
// 				nameChanges.push(`${previousItem.name} to ${item.name}`);
// 			}
// 			if (item.equipment?.slot !== previousItem.equipment?.slot) {
// 				messages.push(`[Gear Slot Change]: The gear slot of ${previousItem.name} slot changed.`);
// 			}
// 		}

// 		const rename = itemsToRename.find(i => i.id === item.id);
// 		if (rename) {
// 			item.name = rename.name;
// 		}

// 		if (equipmentModifications.has(item.id)) {
// 			const copyItem = Items.get(equipmentModifications.get(item.id)!)!;
// 			item.equipment = copyItem.equipment;
// 			item.equipable = copyItem.equipable;
// 		}
// 		if (previousItem) {
// 			item.cost = previousItem.cost;
// 			item.lowalch = previousItem.lowalch;
// 			item.highalch = previousItem.highalch;
// 			if (previousItem.equipment?.requirements) {
// 				// @ts-expect-error ignore
// 				item.equipment = {
// 					...item.equipment,
// 					requirements: previousItem.equipment.requirements
// 				};
// 			}
// 		}
// 		if (previousItem) {
// 			if (item.equipment?.requirements === null && previousItem.equipment?.requirements !== null) {
// 				messages.push(
// 					`WARNING: ${item.name} (${item.id}) had requirements removed: BEFORE[${JSON.stringify(
// 						previousItem.equipment?.requirements
// 					)}] AFTER[${JSON.stringify(item.equipment?.requirements)}]`
// 				);
// 			} else if (
// 				JSON.stringify(item.equipment?.requirements) !== JSON.stringify(previousItem.equipment?.requirements)
// 			) {
// 				messages.push(
// 					`WARNING: ${item.name} (${item.id}) had requirements changed: BEFORE[${JSON.stringify(
// 						previousItem.equipment?.requirements
// 					)}] AFTER[${JSON.stringify(item.equipment?.requirements)}]`
// 				);
// 			}
// 		}

// 		if (previousItem?.equipment?.requirements && !item.equipment?.requirements) {
// 			// @ts-expect-error ignore
// 			item.equipment = {
// 				...item.equipment,
// 				requirements: previousItem.equipment.requirements
// 			};
// 		}

// 		if (previousItem) {
// 			// @ts-expect-error
// 			item = previousItem;
// 		}

// 		if (itemChanges[item.id]) {
// 			item = deepMerge(item, itemChanges[item.id]) as any;
// 		}

// 		newItemJSON[item.id] = item;

// 		for (const item of manualItems) {
// 			newItemJSON[item.id] = item;
// 		}
// 	}

// 	// @ts-expect-error
// 	newItemJSON[0] = undefined;

// 	if (nameChanges.length > 0) {
// 		messages.push(`Name Changes:\n	${nameChanges.join('\n	')}`);
// 	}

// 	const deletedItems: Item[] = objectValues(previousItems)
// 		.filter(i => !newItemJSON[i.id])
// 		.filter(i => i !== null && i !== undefined);

// 	messages.push(`
// New Items: ${moidLink(newItems.map(i => i.id))}
// Deleted Items: ${moidLink(deletedItems.map(i => i.id))}
// `);

// 	if (deletedItems.length > 0) {
// 		messages.push(`
// Use these to find out how many people have the deleted items in their banks, and how many of each item they have.

// SELECT
//   ${deletedItems
// 				.map(
// 					item => `COUNT(*) FILTER (WHERE bank->>'${item.id}' IS NOT NULL) AS people_with_item_${item.id},
//   SUM((bank->>'${item.id}')::int) AS sum_item_${item.id},`
// 				)
// 				.join('\n')}

// FROM users;

// SELECT id, SUM(kv.value::int) AS total_quantity
// FROM users, jsonb_each_text(bank::jsonb) AS kv(itemID, value)
// WHERE itemID::int = ANY(ARRAY[${deletedItems.map(i => i.id).join(',')}]::int[])
// GROUP BY id
// `);
// 	}

// 	const diffOutput: any = diff(previousItems, newItemJSON);
// 	for (const [key, val] of Object.entries(diffOutput as any)) {
// 		if (!val || Object.values(val).every(t => !t)) {
// 			delete diffOutput[key];
// 		}
// 	}
// 	writeFileSync('./src/assets/item_data.json', `${JSON.stringify(newItemJSON, null, '	')}\n`);
// }
