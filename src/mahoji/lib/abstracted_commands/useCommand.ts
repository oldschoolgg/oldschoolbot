import { notEmpty, randInt, roll, Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import { addToDoubleLootTimer } from '../../../lib/doubleLoot';
import { allDyes, dyedItems } from '../../../lib/dyedItems';
import { keepEggs } from '../../../lib/easter';
import { gearImages } from '../../../lib/gear/functions/generateGearImage';
import { assert } from '../../../lib/util';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { flowerTable } from './hotColdCommand';

interface Usable {
	items: Item[];
	run: (user: MUser) => Promise<string>;
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
		item: getOSItem('Guthix engram'),
		bitfield: BitField.HasGuthixEngram,
		resultMessage: "You place the Guthix engram in Juna's cave, restoring some balance to the world..."
	},
	{
		item: getOSItem('Runescroll of bloodbark'),
		bitfield: BitField.HasBloodbarkScroll,
		resultMessage: 'You used your Runescroll of bloodbark, and unlocked the ability to create Bloodbark armour.'
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
	addToCL?: boolean;
}[] = [
	{
		items: [getOSItem('Banana'), getOSItem('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: () => 'You fed a Banana to your Monkey!'
	},
	{
		items: [getOSItem('Knife'), getOSItem('Turkey')],
		cost: new Bank().add('Turkey'),
		loot: new Bank().add('Turkey drumstick', 3),
		response: () => 'You cut your Turkey into 3 drumsticks!',
		addToCL: true
	},
	{
		items: [getOSItem('Shiny mango'), getOSItem('Magus scroll')],
		cost: new Bank().add('Shiny mango').add('Magus scroll'),
		loot: new Bank().add('Magical mango'),
		response: () => 'You enchanted your Shiny mango into a Magical mango!',
		addToCL: true
	},
	{
		items: [getOSItem('Blabberbeak'), getOSItem('Magical mango')],
		cost: new Bank().add('Magical mango').add('Blabberbeak'),
		loot: new Bank().add('Mangobeak'),
		response: () =>
			'You fed a Magical mango to Blabberbeak, and he transformed into a weird-looking mango bird, oops.',
		addToCL: true
	},
	{
		items: [getOSItem('Candle'), getOSItem('Celebratory cake')],
		cost: new Bank().add('Candle').add('Celebratory cake'),
		loot: new Bank().add('Celebratory cake with candle'),
		response: () => 'You stick a candle in your cake.',
		addToCL: true
	},
	{
		items: [getOSItem('Tinderbox'), getOSItem('Celebratory cake with candle')],
		cost: new Bank().add('Celebratory cake with candle'),
		loot: new Bank().add('Lit celebratory cake'),
		response: () => 'You light the candle in your cake.',
		addToCL: true
	},
	{
		items: [getOSItem('Klik'), getOSItem('Celebratory cake with candle')],
		cost: new Bank().add('Celebratory cake with candle'),
		loot: new Bank().add('Burnt celebratory cake'),
		response: () => 'You try to get Klik to light the candle... but he burnt the cake..',
		addToCL: true
	},
	{
		items: [getOSItem('Mithril seeds')],
		cost: new Bank().add('Mithril seeds').freeze(),
		loot: () => flowerTable.roll(),
		response: loot => `You planted a Mithril seed and got ${loot}!`
	},
	{
		items: [getOSItem('Gloom and doom potion'), getOSItem('Broomstick')],
		cost: new Bank().add('Gloom and doom potion').add('Broomstick'),
		loot: new Bank().add('Grim sweeper'),
		response: () =>
			'You pour the Gloom and doom potion on the Broomstick... it transforms into an evil.. deathly broom with a scythe on one end and a skull handle!',
		addToCL: true
	}
];
usables.push({
	items: [getOSItem('Ivy seed')],
	run: async user => {
		if (user.bitfield.includes(BitField.HasPlantedIvy)) {
			return 'You already planted Ivy in your PoH.';
		}
		if (user.skillsAsLevels.farming < 80) {
			return 'You need 80 Farming to plant the Ivy seeds in your PoH.';
		}
		await user.removeItemsFromBank(new Bank().add('Ivy seed'));
		await user.update({
			bitfield: {
				push: BitField.HasPlantedIvy
			}
		});
		return 'You planted Ivy seeds in your PoH! You can now chop Ivy.';
	}
});
usables.push({
	items: [getOSItem('Spooky gear frame unlock')],
	run: async user => {
		const gearFrame = gearImages[1];
		if (user.user.unlocked_gear_templates.includes(gearFrame.id)) {
			return 'You already have this gear frame unlocked.';
		}
		await user.removeItemsFromBank(new Bank().add('Spooky gear frame unlock'));
		await user.update({
			unlocked_gear_templates: {
				push: gearFrame.id
			}
		});
		return 'You unlocked a spooky gear frame! You can switch to it using `/config user gearframe`';
	}
});
usables.push({
	items: [getOSItem('Mysterious token')],
	run: async () => {
		return 'Nothing mysterious happens.';
	}
});

for (const group of dyedItems) {
	for (const dyedVersion of group.dyedVersions) {
		for (const dye of allDyes.filter(i => i !== dyedVersion.dye)) {
			const resultingItem = group.dyedVersions.find(i => i.dye === dye);
			if (!resultingItem) continue;
			genericUsables.push({
				items: [dyedVersion.item, dye],
				cost: new Bank().add(dyedVersion.item.id).add(dye.id),
				loot: new Bank().add(resultingItem.item.id),
				response: () =>
					`You used a ${dye.name} on your ${dyedVersion.item.name}, and received a ${resultingItem.item.name}.`,
				addToCL: false
			});
		}
	}
}

for (const genericU of genericUsables) {
	usables.push({
		items: genericU.items,
		run: async klasaUser => {
			if (genericU.cost) await klasaUser.removeItemsFromBank(genericU.cost);
			const loot =
				genericU.loot === null ? null : genericU.loot instanceof Bank ? genericU.loot : genericU.loot();
			if (loot) await klasaUser.addItemsToBank({ items: loot, collectionLog: genericU.addToCL ?? false });
			return genericU.response(loot ?? new Bank());
		}
	});
}
usables.push({
	items: [getOSItem('Double loot token')],
	run: async (user: MUser) => {
		await user.removeItemsFromBank(new Bank().add('Double loot token'));
		await addToDoubleLootTimer(Time.Minute * randInt(6, 36), `${user} used a Double Loot token!`);
		return 'You used your Double Loot Token!';
	}
});

for (const [, , egg] of keepEggs) {
	usables.push({
		items: [egg, getOSItem('Hoppy')],
		run: async (user: MUser) => {
			if (!user.owns(egg.id)) return `You don't have a ${egg.name}.`;
			if (!user.owns('Hoppy')) return "You don't have a Hoppy.";

			if (egg.name === 'Cute magic egg') {
				return 'Hoppy does not want to eat it.';
			}

			await user.removeItemsFromBank(new Bank().add(egg.id));
			const { loot, message } = roll(6)
				? {
						loot: new Bank().add('Chocolate rabbit'),
						message: 'Hoppy nibbled onto the egg, and sculpted it into a Chocolate rabbit.'
				  }
				: {
						loot: new Bank().add('Chocolate dust'),
						message: 'Hoppy eats the egg, and... you get back just some chocolate dust.'
				  };

			await user.addItemsToBank({ items: loot, collectionLog: true });
			return message;
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

	const usable = usables.find(i => i.items.length === items.length && items.every(t => i.items.includes(t)));
	if (!usable) return "That's not a usable item.";
	return usable.run(user);
}
