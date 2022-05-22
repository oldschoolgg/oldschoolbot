import { User } from '@prisma/client';
import { notEmpty, randInt, Time } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import { addToDoubleLootTimer } from '../../../lib/doubleLoot';
import { dyedItems } from '../../../lib/dyedItems';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../../mahojiSettings';

interface UsableUnlock {
	item: Item;
	resultMessage: string;
	bitfield: BitField;
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

const otherUsables = [
	{
		item: getOSItem('Double loot token'),
		run: async (user: KlasaUser) => {
			await user.removeItemsFromBank(new Bank().add('Double loot token'));
			await addToDoubleLootTimer(Time.Minute * randInt(6, 36), `${user} used a Double Loot token!`);
			return 'You used your Double Loot Token!';
		}
	}
];

const combinedUsables: { items: [Item, Item]; cost?: Bank; loot?: Bank; response: string }[] = [
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

export const allUsableItems = new Set(usableUnlocks.map(i => i.item.id));

export async function useCommand(
	interaction: SlashCommandInteraction,
	mUser: User,
	user: KlasaUser,
	itemOrItems: string
) {
	if (itemOrItems.includes(',')) {
		const items = itemOrItems.split(',').map(getItem).filter(notEmpty);
		if (items.length !== 2) return 'Invalid items.';

		// Redying
		// e.g. [Blood Dye, Dwarven warhammer (blood)]
		const baseItem = dyedItems.find(i => i.dyedVersions.some(o => items.includes(o.item)));
		const dyeToApply = baseItem?.dyedVersions.find(i => items.includes(i.dye));
		const dyedVariantTheyHave = baseItem?.dyedVersions.find(i => items.includes(i.item));
		if (baseItem && dyeToApply && dyedVariantTheyHave) {
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to use a ${dyeToApply.dye.name} on your ${dyedVariantTheyHave.item.name}?`
			);
			const cost = new Bank().add(dyedVariantTheyHave.item.id).add(dyeToApply.dye.id);
			if (!user.owns(cost)) {
				return "You don't own that.";
			}
			await user.removeItemsFromBank(cost);
			await user.addItemsToBank({ items: new Bank().add(dyeToApply.item.id), collectionLog: false });
			return `You redyed your ${dyedVariantTheyHave.item.name} into a ${dyeToApply.item.name} using a ${dyeToApply.dye.name}.`;
		}

		const doubleUsable = combinedUsables.find(i => items.every(t => i.items.includes(t)));
		if (!doubleUsable) return "This isn't a valid combination of items you can use.";
		for (const item of items) {
			if (!user.owns(item.id)) return `You don't own ${item.name}.`;
		}
		if (doubleUsable.cost) {
			if (!user.owns(doubleUsable.cost)) return `You don't own ${doubleUsable.cost}.`;
			await user.removeItemsFromBank(doubleUsable.cost);
		}
		if (doubleUsable.loot) await user.addItemsToBank({ items: doubleUsable.loot, collectionLog: true });
		return doubleUsable.response;
	}
	const firstItem = getItem(itemOrItems);
	if (!firstItem) return "That's not a valid item.";

	const bank = user.bank();
	if (!bank.has(firstItem.id)) {
		return "You don't own this item.";
	}
	const usable = usableUnlocks.find(u => u.item === firstItem);
	if (usable) {
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

	const other = otherUsables.find(i => i.item === firstItem);
	if (other) {
		return other.run(user);
	}
	return "That's not an item you can use.";
}
