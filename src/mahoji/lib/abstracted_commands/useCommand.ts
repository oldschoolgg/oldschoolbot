import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { mahojiUserSettingsUpdate } from '../../mahojiSettings';

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

export const allUsableItems = new Set(usableUnlocks.map(i => i.item.id));

export async function useCommand(mUser: User, user: KlasaUser, item: string) {
	const firstItem = getItem(item);
	if (!firstItem) return "That's not a valid item.";

	const bank = user.bank();
	if (!bank.has(firstItem.id)) {
		return "You don't own this item.";
	}
	const usable = usableUnlocks.find(u => u.item === firstItem);
	if (!usable) {
		return "That's not a usable item.";
	}
	if (mUser.bitfield.includes(usable.bitfield)) {
		return "You already used this item, you can't use it again.";
	}
	await user.removeItemsFromBank(new Bank().add(usable.item.id));
	await mahojiUserSettingsUpdate(mUser.id, {
		bitfield: {
			push: usable.bitfield
		}
	});
	return usable.resultMessage;
}
