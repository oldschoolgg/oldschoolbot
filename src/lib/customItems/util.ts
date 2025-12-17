import { deepMerge, replaceWhitespaceAndUppercase } from '@oldschoolgg/toolkit';
import type { DeepPartial } from '@sapphire/utilities';
import { type Item, type ItemRequirements, Items } from 'oldschooljs';

export const customPrices: Record<number, number> = [];

export const customItems: number[] = [];
export const overwrittenItemNames: Map<string, Item> = new Map();

export function isCustomItem(itemID: number) {
	return customItems.includes(itemID);
}

export const hasSet: Item[] = [];

// Prevent old item names from matching customItems
export function isDeletedItemName(nameToTest: string) {
	const cleanNameToTest = replaceWhitespaceAndUppercase(nameToTest);
	if (overwrittenItemNames.get(cleanNameToTest)) {
		return true;
	}
	return false;
}

export function setCustomItem(id: number, name: string, baseItem: string, newItemData?: DeepPartial<Item>, price = 0) {
	if (hasSet.some(i => i.id === id)) {
		throw new Error(`Tried to add 2 custom items with same id ${id}, called ${name}`);
	}
	if (hasSet.some(i => i.name === name) && name !== 'Smokey') {
		throw new Error(`Tried to add 2 custom items with same name, called ${name}`);
	}
	if (id >= 40_000 && id <= 45_000) {
		newItemData = deepMerge<DeepPartial<Item>>(newItemData ?? {}, {
			customItemData: {
				isSuperUntradeable: true,
				cantDropFromMysteryBoxes: true
			}
		});
	}
	if (newItemData?.customItemData?.superTradeableButTradeableOnGE && !newItemData.customItemData.isSuperUntradeable) {
		throw new Error('Tried to add a custom item with superTradeableButTradeableOnGE, but not isSuperUntradeable');
	}

	const data: Item = deepMerge({ ...Items.getOrThrow(baseItem) }, { ...newItemData, name, id }) as Item;
	data.price = price || 1;

	// Track names of re-mapped items to break the link:
	const oldItem = Items.get(id);
	if (oldItem && replaceWhitespaceAndUppercase(oldItem.name) !== replaceWhitespaceAndUppercase(name)) {
		// If the custom item has the same name as the original item don't break the link
		overwrittenItemNames.set(replaceWhitespaceAndUppercase(oldItem.name), oldItem);
	}
	Items.set(id, data);
	const cleanName = replaceWhitespaceAndUppercase(name);
	Items.itemNameMap.set(cleanName, id);
	Items.itemNameMap.set(name, id);

	// Add the item to the custom items array
	customItems.push(id);
	hasSet.push(data);
}

export const UN_EQUIPPABLE = {
	equipable: undefined,
	equipment: undefined,
	equipable_by_player: undefined
};

export const maxedRequirements = {
	requirements: {
		agility: 120,
		cooking: 120,
		fishing: 120,
		mining: 120,
		smithing: 120,
		woodcutting: 120,
		firemaking: 120,
		runecraft: 120,
		crafting: 120,
		prayer: 120,
		fletching: 120,
		farming: 120,
		herblore: 120,
		thieving: 120,
		hunter: 120,
		construction: 120,
		magic: 120,
		attack: 120,
		strength: 120,
		defence: 120,
		ranged: 120,
		hitpoints: 120,
		dungeoneering: 120,
		slayer: 120,
		invention: 120,
		divination: 120
	} as Partial<ItemRequirements>
};
