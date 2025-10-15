import { notEmpty } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { assert } from '@/lib/util/logError.js';
import { flowerTable } from '@/mahoji/lib/abstracted_commands/hotColdCommand.js';

interface Usable {
	items: Item[];
	run: (user: MUser) => Promise<string>;
}
const usables: Usable[] = [];

interface UsableUnlock {
	item: Item;
	bitfield: BitField;
	resultMessage: string;
}
export const usableUnlocks: UsableUnlock[] = [
	{
		item: Items.getOrThrow('Torn prayer scroll'),
		bitfield: BitField.HasTornPrayerScroll,
		resultMessage: 'You used your Torn prayer scroll, and unlocked the Preserve prayer.'
	},
	{
		item: Items.getOrThrow('Dexterous prayer scroll'),
		bitfield: BitField.HasDexScroll,
		resultMessage: 'You used your Dexterous prayer scroll, and unlocked the Rigour prayer.'
	},
	{
		item: Items.getOrThrow('Arcane prayer scroll'),
		bitfield: BitField.HasArcaneScroll,
		resultMessage: 'You used your Arcane prayer scroll, and unlocked the Augury prayer.'
	},
	{
		item: Items.getOrThrow('Slepey tablet'),
		bitfield: BitField.HasSlepeyTablet,
		resultMessage: 'You used your Slepey tablet, and unlocked the Slepe teleport.'
	},
	{
		item: Items.getOrThrow('Runescroll of bloodbark'),
		bitfield: BitField.HasBloodbarkScroll,
		resultMessage: 'You used your Runescroll of bloodbark, and unlocked the ability to create Bloodbark armour.'
	},
	{
		item: Items.getOrThrow('Runescroll of swampbark'),
		bitfield: BitField.HasSwampbarkScroll,
		resultMessage: 'You used your Runescroll of Swampbark, and unlocked the ability to create Swampbark armour.'
	},
	{
		item: Items.getOrThrow("Saradomin's light"),
		bitfield: BitField.HasSaradominsLight,
		resultMessage: "You used your Saradomin's light."
	},
	{
		item: Items.getOrThrow('Frozen tablet'),
		bitfield: BitField.UsedFrozenTablet,
		resultMessage: 'You used your Frozen tablet.'
	},
	{
		item: Items.getOrThrow('Scarred tablet'),
		bitfield: BitField.UsedScarredTablet,
		resultMessage: 'You used your Scarred tablet.'
	},
	{
		item: Items.getOrThrow('Sirenic tablet'),
		bitfield: BitField.UsedSirenicTablet,
		resultMessage: 'You used your Sirenic tablet.'
	},
	{
		item: Items.getOrThrow('Strangled tablet'),
		bitfield: BitField.UsedStrangledTablet,
		resultMessage: 'You used your Strangled tablet.'
	},
	{
		item: Items.getOrThrow('Deadeye prayer scroll'),
		bitfield: BitField.HasDeadeyeScroll,
		resultMessage: 'You used your Deadeye prayer scroll, and unlocked the Deadeye prayer.'
	},
	{
		item: Items.getOrThrow('Mystic vigour prayer scroll'),
		bitfield: BitField.HasMysticVigourScroll,
		resultMessage: 'You used your Mystic vigour prayer scroll, and unlocked the Mystic vigour prayer.'
	}
];
for (const usableUnlock of usableUnlocks) {
	usables.push({
		items: [usableUnlock.item],
		run: async user => {
			if (user.bitfield.includes(usableUnlock.bitfield)) {
				return "You already used this item, you can't use it again.";
			}
			await user.removeItemsFromBank(new Bank().add(usableUnlock.item.id));
			await user.update({
				bitfield: {
					push: usableUnlock.bitfield
				}
			});
			return usableUnlock.resultMessage;
		}
	});
}

export const genericUsables: {
	items: [Item, Item] | [Item];
	cost: Bank;
	loot: Bank | (() => Bank) | null;
	response: (loot: Bank) => string;
}[] = [
	{
		items: [Items.getOrThrow('Banana'), Items.getOrThrow('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: () => 'You fed a Banana to your Monkey!'
	},
	{
		items: [Items.getOrThrow('Mithril seeds')],
		cost: new Bank().add('Mithril seeds').freeze(),
		loot: () => flowerTable.roll(),
		response: loot => `You planted a Mithril seed and got ${loot}!`
	}
];
for (const genericU of genericUsables) {
	usables.push({
		items: genericU.items,
		run: async user => {
			const cost = genericU.cost ? genericU.cost : undefined;
			const loot =
				genericU.loot === null ? undefined : genericU.loot instanceof Bank ? genericU.loot : genericU.loot();
			if (loot || cost) await user.transactItems({ itemsToAdd: loot, itemsToRemove: cost, collectionLog: true });
			return genericU.response(loot ?? new Bank());
		}
	});
}
export const allUsableItems = new Set(usables.map(i => i.items.map(i => i.id)).flat(2));

export async function useCommand(user: MUser, _firstItem: string, _secondItem?: string) {
	const firstItem = Items.getItem(_firstItem);
	const secondItem = _secondItem === undefined ? null : Items.getItem(_secondItem);
	if (!firstItem || (_secondItem !== undefined && !secondItem)) return "That's not a valid item.";
	const items = [firstItem, secondItem].filter(notEmpty);
	assert(items.length === 1 || items.length === 2);

	const { bank } = user;
	const checkBank = new Bank();
	for (const i of items) checkBank.add(i.id);
	if (!bank.has(checkBank)) return `You don't own ${checkBank}.`;

	const usable = usables.find(i => i.items.length === items.length && i.items.every(t => items.includes(t)));
	if (!usable) return `That's not a usable ${items.length === 1 ? 'item' : 'combination'}.`;
	return usable.run(user);
}
