import { notEmpty } from 'e';
import { Bank, type Item } from 'oldschooljs';

import { BitField } from '../../../lib/constants';
import { assert } from '../../../lib/util';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { flowerTable } from './hotColdCommand';

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
const usableUnlocks: UsableUnlock[] = [
	{
		item: getOSItem('Torn prayer scroll'),
		bitfield: BitField.HasTornPrayerScroll,
		resultMessage: 'You used your Torn prayer scroll, and unlocked the Preserve prayer.'
	},
	{
		item: getOSItem('Dexterous prayer scroll'),
		bitfield: BitField.HasDexScroll,
		resultMessage: 'You used your Dexterous prayer scroll, and unlocked the Rigour prayer.'
	},
	{
		item: getOSItem('Arcane prayer scroll'),
		bitfield: BitField.HasArcaneScroll,
		resultMessage: 'You used your Arcane prayer scroll, and unlocked the Augury prayer.'
	},
	{
		item: getOSItem('Slepey tablet'),
		bitfield: BitField.HasSlepeyTablet,
		resultMessage: 'You used your Slepey tablet, and unlocked the Slepe teleport.'
	},
	{
		item: getOSItem('Runescroll of bloodbark'),
		bitfield: BitField.HasBloodbarkScroll,
		resultMessage: 'You used your Runescroll of bloodbark, and unlocked the ability to create Bloodbark armour.'
	},
	{
		item: getOSItem('Runescroll of swampbark'),
		bitfield: BitField.HasSwampbarkScroll,
		resultMessage: 'You used your Runescroll of Swampbark, and unlocked the ability to create Swampbark armour.'
	},
	{
		item: getOSItem("Saradomin's light"),
		bitfield: BitField.HasSaradominsLight,
		resultMessage: "You used your Saradomin's light."
	},
	{
		item: getOSItem('Frozen tablet'),
		bitfield: BitField.UsedFrozenTablet,
		resultMessage: 'You used your Frozen tablet.'
	},
	{
		item: getOSItem('Scarred tablet'),
		bitfield: BitField.UsedScarredTablet,
		resultMessage: 'You used your Scarred tablet.'
	},
	{
		item: getOSItem('Sirenic tablet'),
		bitfield: BitField.UsedSirenicTablet,
		resultMessage: 'You used your Sirenic tablet.'
	},
	{
		item: getOSItem('Strangled tablet'),
		bitfield: BitField.UsedStrangledTablet,
		resultMessage: 'You used your Strangled tablet.'
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

const genericUsables: {
	items: [Item, Item] | [Item];
	cost: Bank;
	loot: Bank | (() => Bank) | null;
	response: (loot: Bank) => string;
}[] = [
	{
		items: [getOSItem('Banana'), getOSItem('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: () => 'You fed a Banana to your Monkey!'
	},
	{
		items: [getOSItem('Mithril seeds')],
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
	const firstItem = getItem(_firstItem);
	const secondItem = _secondItem === undefined ? null : getItem(_secondItem);
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
