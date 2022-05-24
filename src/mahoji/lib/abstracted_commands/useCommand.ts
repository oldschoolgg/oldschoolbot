import { User } from '@prisma/client';
import { notEmpty, randInt, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import { addToDoubleLootTimer } from '../../../lib/doubleLoot';
import { dyedItems } from '../../../lib/dyedItems';
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
	},
	{
		item: getOSItem('Scroll of farming'),
		bitfield: BitField.HasScrollOfFarming,
		resultMessage:
			'You have used your Scroll of farming - you feel your Farming skills have improved and are now able to use more Farming patches.'
	},
	{
		item: getOSItem('Scroll of longevity'),
		bitfield: BitField.HasScrollOfLongevity,
		resultMessage:
			'You have used your Scroll of longevity - your future slayer tasks will always have 2x more quantity.'
	},
	{
		item: getOSItem('Scroll of the hunt'),
		bitfield: BitField.HasScrollOfTheHunt,
		resultMessage: 'You have used your Scroll of the hunt - you feel your hunting skills have improved.'
	},
	{
		item: getOSItem('Banana enchantment scroll'),
		bitfield: BitField.HasBananaEnchantmentScroll,
		resultMessage: 'You have used your Banana enchantment scroll - you feel your monkey magic skills have improved.'
	},
	{
		item: getOSItem('Daemonheim agility pass'),
		bitfield: BitField.HasDaemonheimAgilityPass,
		resultMessage: 'You show your pass to the Daemonheim guards, and they grant you access to their rooftops.'
	},
	{
		item: getOSItem('Double loot token'),
		bitfield: BitField.HasDaemonheimAgilityPass,
		resultMessage: 'You show your pass to the Daemonheim guards, and they grant you access to their rooftops.'
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
	},
	{
		items: [getOSItem('Knife'), getOSItem('Turkey')],
		cost: new Bank().add('Turkey'),
		loot: new Bank().add('Turkey drumstick', 3),
		response: 'You cut your Turkey into 3 drumsticks!'
	},
	{
		items: [getOSItem('Shiny mango'), getOSItem('Magus scroll')],
		cost: new Bank().add('Shiny mango').add('Magus scroll'),
		loot: new Bank().add('Magical mango'),
		response: 'You enchanted your Shiny mango into a Magical mango!'
	},
	{
		items: [getOSItem('Blabberbeak'), getOSItem('Magical mango')],
		cost: new Bank().add('Magical mango').add('Blabberbeak'),
		loot: new Bank().add('Mangobeak'),
		response: 'You fed a Magical mango to Blabberbeak, and he transformed into a weird-looking mango bird, oops.'
	},
	{
		items: [getOSItem('Candle'), getOSItem('Celebratory cake')],
		cost: new Bank().add('Candle').add('Celebratory cake'),
		loot: new Bank().add('Celebratory cake with candle'),
		response: 'You stick a candle in your cake.'
	},
	{
		items: [getOSItem('Tinderbox'), getOSItem('Celebratory cake with candle')],
		cost: new Bank().add('Celebratory cake with candle'),
		loot: new Bank().add('Lit celebratory cake'),
		response: 'You light the candle in your cake.'
	},
	{
		items: [getOSItem('Klik'), getOSItem('Celebratory cake with candle')],
		cost: new Bank().add('Celebratory cake with candle'),
		loot: new Bank().add('Burnt celebratory cake'),
		response: 'You try to get Klik to light the candle... but he burnt the cake..'
	}
];

const allDyes = ['Dungeoneering dye', 'Blood dye', 'Ice dye', 'Shadow dye', 'Third age dye', 'Monkey dye'].map(
	getOSItem
);
for (const group of dyedItems) {
	for (const dyedVersion of group.dyedVersions) {
		for (const dye of allDyes.filter(i => i !== dyedVersion.dye)) {
			const resultingItem = group.dyedVersions.find(i => i.dye === dye);
			if (!resultingItem) continue;
			genericUsables.push({
				items: [dyedVersion.item, dye],
				cost: new Bank().add(dyedVersion.item.id).add(dye.id),
				loot: new Bank().add(resultingItem.item.id),
				response: `You used a ${dye.name} on your ${dyedVersion.item.name}, and received a ${resultingItem.item.name}.`
			});
		}
	}
}

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
usables.push({
	items: [getOSItem('Double loot token')],
	run: async (user: KlasaUser) => {
		await user.removeItemsFromBank(new Bank().add('Double loot token'));
		await addToDoubleLootTimer(Time.Minute * randInt(6, 36), `${user} used a Double Loot token!`);
		return 'You used your Double Loot Token!';
	}
});
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
