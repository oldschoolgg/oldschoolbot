import { User } from '@prisma/client';
import { notEmpty } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import { assert } from '../../../lib/util';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { mahojiUserSettingsUpdate } from '../../mahojiSettings';

interface Usable {
	items: Item[];
	run: (user: KlasaUser, mahojiUser: User) => Promise<string>;
}
export const usables: Usable[] = [];

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
	}
];
for (const usableUnlock of usableUnlocks) {
	usables.push({
		items: [usableUnlock.item],
		run: async (klasaUser, mahojiUser) => {
			if (mahojiUser.bitfield.includes(usableUnlock.bitfield)) {
				return "You already used this item, you can't use it again.";
			}
			await klasaUser.removeItemsFromBank(new Bank().add(usableUnlock.item.id));
			await mahojiUserSettingsUpdate(mahojiUser.id, {
				bitfield: {
					push: usableUnlock.bitfield
				}
			});
			return usableUnlock.resultMessage;
		}
	});
}

const genericUsables: { items: [Item, Item]; cost: Bank; loot: Bank | null; response: string }[] = [
	{
		items: [getOSItem('Banana'), getOSItem('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: 'You fed a Banana to your Monkey!'
	}
];
for (const genericU of genericUsables) {
	usables.push({
		items: genericU.items,
		run: async klasaUser => {
			if (genericU.cost) await klasaUser.removeItemsFromBank(genericU.cost);
			if (genericU.loot) await klasaUser.addItemsToBank({ items: genericU.loot });
			return genericU.response;
		}
	});
}
export const allUsableItems = new Set(usables.map(i => i.items.map(i => i.id)).flat(2));

export async function useCommand(mUser: User, user: KlasaUser, _firstItem: string, _secondItem?: string) {
	const firstItem = getItem(_firstItem);
	const secondItem = _secondItem === undefined ? null : getItem(_secondItem);
	if (!firstItem || (_secondItem !== undefined && !secondItem)) return "That's not a valid item.";
	const items = [firstItem, secondItem].filter(notEmpty);
	assert(items.length === 1 || items.length === 2);

	const bank = user.bank();
	const checkBank = new Bank();
	for (const i of items) checkBank.add(i.id);
	if (!bank.has(checkBank)) return `You don't own ${checkBank}.`;

	const usable = usables.find(i => i.items.length === items.length && items.every(t => i.items.includes(t)));
	if (!usable) return "That's not a usable item.";
	return usable.run(user, mUser);
}
