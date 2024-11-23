import { readFileSync, writeFileSync } from 'node:fs';
import { diff } from 'deep-object-diff';
import deepMerge from 'deepmerge';
import { deepClone, increaseNumByPercent, notEmpty, objectEntries, reduceNumByPercent } from 'e';
import fetch from 'node-fetch';

import { EquipmentSlot, type Item } from '../src/meta/types';
import Items, { CLUE_SCROLLS, CLUE_SCROLL_NAMES, USELESS_ITEMS } from '../src/structures/Items';
import itemID from '../src/util/itemID';
import { getItemOrThrow } from '../src/util/util';
import { itemChanges } from './manualItemChanges';

const ITEM_UPDATE_CONFIG = {
	SHOULD_UPDATE_PRICES: false
};

const previousItems = JSON.parse(readFileSync('./src/data/items/item_data.json', 'utf-8'));

const equipmentModifications = new Map();
const equipmentModSrc = [
	['Pink stained full helm', 'Bronze full helm'].map(itemID),
	['Pink stained platebody', 'Bronze platebody'].map(itemID),
	['Pink stained platelegs', 'Bronze platelegs'].map(itemID),
	['Bulging sack', 'Red cape'].map(itemID)
] as const;
for (const [toChange, toCopy] of equipmentModSrc) {
	equipmentModifications.set(toChange, toCopy);
}
const itemsBeingModified = new Set(equipmentModSrc.map(i => i[0]));

const newItemJSON: { [key: string]: Item } = {};

interface RawItemCollection {
	[index: string]: Item & {
		duplicate: boolean;
		noted: boolean;
		placeholder: boolean;
		linked_id_item: number | null;
	};
}

// This regex matches the nearly 600 individual clue-step items:
const clueStepRegex = /^Clue scroll \((beginner|easy|medium|hard|elite|master)\) - .*$/;

function itemShouldntBeAdded(item: any) {
	if (CLUE_SCROLLS.includes(item.id)) return false;

	return (
		(CLUE_SCROLL_NAMES.includes(item.name) && !CLUE_SCROLLS.includes(item.id)) ||
		USELESS_ITEMS.includes(item.id) ||
		item.duplicate === true ||
		item.noted ||
		item.linked_id_item ||
		item.placeholder ||
		item.name === 'Null' ||
		item.wiki_name?.includes(' (Worn)') ||
		(item.wiki_name && clueStepRegex.exec(item.wiki_name))
	);
}

export function moidLink(items: number[]) {
	if (items.length === 0) return 'No items.';
	return `https://chisel.weirdgloop.org/moid/item_id.html#${items.join(',')}`;
}

const formatDateForTimezones = (date: Date): { cali: string; sydney: string } => {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'short'
	};

	const caliDate = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'America/Los_Angeles' }).format(date);
	const sydneyDate = new Intl.DateTimeFormat('en-AU', { ...options, timeZone: 'Australia/Sydney' }).format(date);

	return {
		cali: caliDate,
		sydney: sydneyDate
	};
};

const manualItems: Item[] = [
	{
		id: 28_329,
		name: 'Ring of shadows',
		members: true,
		equipable: true,
		equipable_by_player: true,
		cost: 75_000,
		lowalch: 30_000,
		highalch: 45_000,
		weight: 0.004,
		wiki_name: 'Ring of shadows (uncharged)',
		wiki_url: 'https://oldschool.runescape.wiki/w/Ring_of_shadows#Uncharged',
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
		wiki_name: 'Ancient lamp',
		wiki_url: 'https://oldschool.runescape.wiki/w/Ancient_lamp',
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
		wiki_name: 'Scaly blue dragonhide',
		wiki_url: 'https://oldschool.runescape.wiki/w/Scaly_blue_dragonhide',
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
		wiki_name: "Butler's tray",
		wiki_url: 'https://oldschool.runescape.wiki/w/Butler%27s_tray',
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
		wiki_name: 'Costume needle',
		wiki_url: 'https://oldschool.runescape.wiki/w/Costume_needle',
		price: 1
	}
];

// Make these all worth 0gp. They're manipulated and fluctuate hugely constantly.
const itemsToIgnorePrices = [
	'Raw bird meat',
	'Red feather',
	'Yellow feather',
	'Orange feather',
	'Blue feather',
	'Stripy feather',
	'Ferret',
	'Ruby harvest',
	'Sapphire glacialis',
	'Snowy knight',
	'Black warlock',
	'Kebbit claws',
	'Barb-tail harpoon',
	'Kebbit spike',
	'Kebbit teeth',
	'Damaged monkey tail',
	'Monkey tail',
	'Spotted kebbit fur',
	'Dark kebbit fur',
	'Dashing kebbit fur',
	'Imp-in-a-box(2)',
	'Swamp lizard',
	'Orange salamander',
	'Red salamander',
	'Black salamander',
	'Larupia fur',
	'Tatty larupia fur',
	'Graahk fur',
	'Tatty graahk fur',
	'Kyatt fur',
	'Tatty kyatt fur',
	'Raw rabbit',
	'Rabbit foot',
	'Polar kebbit fur',
	'Raw beast meat',
	'Common kebbit fur',
	'Feldip weasel fur',
	'Desert devil fur',
	'Long kebbit spike',
	'Fish food',
	'Iron bolts (p+)',
	'Cream boots',
	'Brandy',
	'Premade sgg',
	'Spicy crunchies',
	'Premade veg batta',
	'Assorted flowers',
	'Purple hat',
	"Blood'n'tar snelm",
	"Blood'n'tar snelm",
	'Fremennik brown cloak',
	'Fremennik brown shirt',
	'Shirt',
	'Steel arrow(p++)',
	'Spider on shaft',
	'Tribal mask',
	'White dagger',
	'Sandstone (5kg)',
	'Minced meat',
	'Bagged dead tree',
	'Kitchen table',
	'Teak bed',
	'Bandana eyepatch',
	'Iron bolts (p+)',
	'Elemental helmet',
	'Butterfly net',
	'Light orb',
	'Steel hasta',
	'Defence mix(2)',
	'Arceuus banner',
	'Yellow cape',
	'Iron spear(p+)',
	'Egg and tomato',
	"Druid's robe top",
	'Bronze thrownaxe',
	'Steel thrownaxe',
	'Iron javelin(p)',
	'Black longsword',
	"Premade s'y crunch",
	'Redberry pie',
	'Serum 207 (2)',
	'Fremennik red shirt',
	'Dwellberry seed',
	'Iron javelin(p++)',
	'Steel knife(p+)',
	'Mithril dagger(p++)',
	'Thatch spar dense',
	'Villager armband',
	'Sliced mushrooms',
	'Raw fish pie',
	"Blue d'hide chaps (g)",
	'Oak armchair',
	'Teak armchair',
	'Beer barrel',
	'Carved oak bench',
	'Carved teak bench',
	'Oak stock',
	'Oak toy box',
	'Teak magic wardrobe',
	'Oak armour case',
	'Roast beast meat',
	"Relicym's mix(2)",
	'Antidote+ mix(1)'
]
	.map(getItemOrThrow)
	.map(i => i.id);

const keysToWarnIfRemovedOrAdded: (keyof Item)[] = ['equipable', 'equipment', 'weapon'];

export default async function prepareItems(): Promise<void> {
	const messages: string[] = [];
	const allItemsRaw: RawItemCollection = await fetch(
		'https://raw.githubusercontent.com/0xNeffarion/osrsreboxed-db/master/docs/items-complete.json'
	).then((res): Promise<any> => res.json());
	const allItems = deepClone(allItemsRaw);

	const allPrices = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
		headers: {
			'User-Agent': 'oldschooljs - @magnaboy'
		}
	})
		.then((res): Promise<any> => res.json())
		.then(res => res.data);

	if (!allPrices[20_997]) {
		throw new Error('Failed to fetch prices');
	}

	const newItems = [];
	const nameChanges = [];

	for (let item of Object.values(allItems)) {
		if (itemShouldntBeAdded(item)) continue;

		if (item.name === "Pharaoh's sceptre") {
			item = {
				...allItems[26_950],
				id: item.id
			};
		}

		for (const delKey of [
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
			'examine'
		]) {
			// @ts-ignore
			delete item[delKey];
		}

		for (const boolKey of [
			'incomplete',
			'members',
			'tradeable',
			'tradeable_on_ge',
			'stackable',
			'noteable',
			'equipable',
			'equipable_by_player',
			'equipable_weapon',
			'weight',
			'buy_limit',
			'wiki_name',
			'wiki_url',
			'equipment',
			'weapon'
		] as const) {
			if (!item[boolKey]) {
				delete item[boolKey];
			}
		}
		if (item.lowalch === null) item.lowalch = undefined;
		if (item.highalch === null) item.highalch = undefined;

		const previousItem = Items.get(item.id);
		if (!previousItem) {
			newItems.push(item);
		}

		const price = allPrices[item.id];
		if (price) {
			// Fix weird bug with prices: (high can be 1 and low 2.14b for example... blame Jamflex)
			if (price.high < price.low) price.high = price.low;
			// Calculate average of High + Low
			item.price = Math.ceil(Math.max(0, ((price.high as number) + (price.low as number)) / 2));
		} else {
			item.price = 0;
		}
		if (item.id === 995) {
			item.price = 1;
		}
		if (itemsToIgnorePrices.includes(item.id) || !item.tradeable) {
			item.price = 0;
		}

		let dontChange = false;
		if (previousItem && item.tradeable) {
			// If major price increase, just dont fucking change it.
			if (previousItem.price < item.price / 20 && previousItem.price !== 0) dontChange = true;
			// Prevent weird bug with expensive items: (An item with 2b val on GE had high = 1 & low = 100k)
			if (item.price < previousItem.price / 10) dontChange = true;
			// If price differs by 10000x just don't change it.
			if (price && price.high / 10000 > price.low) dontChange = true;
		}

		if (dontChange || !ITEM_UPDATE_CONFIG.SHOULD_UPDATE_PRICES) {
			item.price = previousItem?.price ?? item.price;
		}

		// Dont change price if its only a <10% difference and price is less than 100k
		if (
			previousItem &&
			item.price > reduceNumByPercent(previousItem?.price, 10) &&
			item.price < increaseNumByPercent(previousItem?.price, 10) &&
			item.price < 100_000
		) {
			item.price = previousItem.price;
		} else if (
			// Ignore <3% changes in any way
			previousItem &&
			item.price > reduceNumByPercent(previousItem?.price, 3) &&
			item.price < increaseNumByPercent(previousItem?.price, 3)
		) {
			item.price = previousItem.price;
		}

		if (previousItem && !itemsBeingModified.has(item.id)) {
			for (const key of keysToWarnIfRemovedOrAdded) {
				if (!item[key] && Boolean(previousItem?.[key])) {
					messages.push(`[ShapeChange]: ${item.name} (${item.id}) had ${key} removed`);
				}
				if (!previousItem[key] && Boolean(item?.[key])) {
					messages.push(`[ShapeChange]: ${item.name} (${item.id}) had ${key} added`);
				}
			}
			if (item.name !== previousItem.name) {
				nameChanges.push(`${previousItem.name} to ${item.name}`);
			}
			if (item.equipment?.slot !== previousItem.equipment?.slot) {
				messages.push(`[Gear Slot Change]: The gear slot of ${previousItem.name} slot changed.`);
			}
		}

		if (equipmentModifications.has(item.id)) {
			const copyItem = Items.get(equipmentModifications.get(item.id)!)!;
			item.equipment = copyItem.equipment;
			item.equipable_by_player = copyItem.equipable_by_player;
			item.equipable_weapon = copyItem.equipable_weapon;
			item.equipable = copyItem.equipable;
		}
		if (previousItem) {
			item.cost = previousItem.cost;
			item.lowalch = previousItem.lowalch;
			item.highalch = previousItem.highalch;
			item.wiki_url = previousItem.wiki_url;
			item.wiki_name = previousItem.wiki_name;
			if (previousItem.equipment?.requirements) {
				// @ts-ignore ignore
				item.equipment = {
					...item.equipment,
					requirements: previousItem.equipment.requirements
				};
			}
		}
		if (previousItem) {
			if (item.equipment?.requirements === null && previousItem.equipment?.requirements !== null) {
				messages.push(
					`WARNING: ${item.name} (${item.id}) had requirements removed: BEFORE[${JSON.stringify(
						previousItem.equipment?.requirements
					)}] AFTER[${JSON.stringify(item.equipment?.requirements)}]`
				);
			} else if (
				JSON.stringify(item.equipment?.requirements) !== JSON.stringify(previousItem.equipment?.requirements)
			) {
				messages.push(
					`WARNING: ${item.name} (${item.id}) had requirements changed: BEFORE[${JSON.stringify(
						previousItem.equipment?.requirements
					)}] AFTER[${JSON.stringify(item.equipment?.requirements)}]`
				);
			}
		}

		if (previousItem?.equipment?.requirements && !item.equipment?.requirements) {
			// @ts-ignore ignore
			item.equipment = {
				...item.equipment,
				requirements: previousItem.equipment.requirements
			};
		}

		if (itemChanges[item.id]) {
			item = deepMerge(item, itemChanges[item.id]) as any;
		}

		newItemJSON[item.id] = item;

		for (const item of manualItems) {
			newItemJSON[item.id] = item;
		}
	}

	newItemJSON[0] = undefined;

	if (nameChanges.length > 0) {
		messages.push(`Name Changes:\n	${nameChanges.join('\n	')}`);
	}

	const deletedItems: any[] = Object.values(previousItems)
		.filter((i: any) => !(newItemJSON as any)[i.id])
		.filter(notEmpty);

	messages.push(`
New Items: ${moidLink(newItems.map(i => i.id))}
Deleted Items: ${moidLink(deletedItems)}
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

	const date = new Date();
	const formattedDate = formatDateForTimezones(date);

	const diffOutput: any = diff(previousItems, newItemJSON);
	for (const [key, val] of objectEntries(diffOutput as any)) {
		if (!val || Object.values(val).every(t => !t)) {
			delete diffOutput[key];
		}
	}
	const baseFilename = `item-update-${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDay() + 1}`;
	writeFileSync(
		`./update-history/${baseFilename}.txt`,
		`Updated on ${formattedDate.sydney} Sydney / ${formattedDate.cali} California

${messages.join('\n')}`
	);
	writeFileSync(`./update-history/${baseFilename}.json`, `${JSON.stringify(diffOutput, null, '	')}`);
	writeFileSync('./src/data/items/item_data.json', `${JSON.stringify(newItemJSON, null, '	')}\n`);
}
