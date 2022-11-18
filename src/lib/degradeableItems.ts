import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { GearSetupType } from './gear/types';
import { assert } from './util';
import getOSItem from './util/getOSItem';
import { updateBankSetting } from './util/updateBankSetting';

interface DegradeableItem {
	item: Item;
	settingsKey:
		| 'tentacle_charges'
		| 'sang_charges'
		| 'void_staff_charges'
		| 'celestial_ring_charges'
		| 'ash_sanctifier_charges';
	itemsToRefundOnBreak: Bank;
	setup: GearSetupType;
	aliases: string[];
	chargeInput: {
		cost: Bank;
		charges: number;
	};
	unchargedItem?: Item;
	convertOnCharge?: boolean;
	charges: (totalHP: number, duration: number, user: MUser) => number;
}

export const degradeableItems: DegradeableItem[] = [
	{
		item: getOSItem('Abyssal tentacle'),
		settingsKey: 'tentacle_charges',
		itemsToRefundOnBreak: new Bank().add('Kraken tentacle'),
		setup: 'melee',
		aliases: ['tentacle', 'tent'],
		chargeInput: {
			cost: new Bank().add('Abyssal whip'),
			charges: 10_000
		},
		charges: (totalHP: number) => totalHP / 20
	},
	{
		item: getOSItem('Sanguinesti staff'),
		settingsKey: 'sang_charges',
		itemsToRefundOnBreak: new Bank().add('Sanguinesti staff (uncharged)'),
		setup: 'mage',
		aliases: ['sang', 'sang staff', 'sanguinesti staff', 'sanguinesti'],
		chargeInput: {
			cost: new Bank().add('Blood rune', 3),
			charges: 1
		},
		unchargedItem: getOSItem('Sanguinesti staff (uncharged)'),
		convertOnCharge: true,
		charges: (totalHP: number) => totalHP / 20
	},
	{
		item: getOSItem('Void staff'),
		settingsKey: 'void_staff_charges',
		itemsToRefundOnBreak: new Bank().add('Void staff (u)'),
		setup: 'mage',
		aliases: ['void staff'],
		chargeInput: {
			cost: new Bank().add('Elder rune', 5),
			charges: 1
		},
		convertOnCharge: true,
		unchargedItem: getOSItem('Void staff (u)'),
		charges: (_totalHP: number, duration: number, user: MUser) => {
			const mageGear = user.gear.mage;
			const minutesDuration = Math.ceil(duration / Time.Minute);
			if (user.hasEquipped('Magic master cape')) {
				return Math.ceil(minutesDuration / 3);
			} else if (mageGear.hasEquipped('Vasa cloak')) {
				return Math.ceil(minutesDuration / 2);
			}
			return minutesDuration;
		}
	},
	{
		item: getOSItem('Celestial ring'),
		settingsKey: 'celestial_ring_charges',
		itemsToRefundOnBreak: new Bank().add('Celestial ring (uncharged)'),
		setup: 'skilling',
		aliases: ['celestial ring'],
		chargeInput: {
			cost: new Bank().add('Stardust', 10),
			charges: 10
		},
		unchargedItem: getOSItem('Celestial ring (uncharged)'),
		convertOnCharge: true,
		charges: (duration: number) => duration
	},
	{
		item: getOSItem('Ash sanctifier'),
		settingsKey: 'ash_sanctifier_charges',
		itemsToRefundOnBreak: new Bank().add('Ash sanctifier'),
		setup: 'skilling',
		aliases: ['ash sanctifier'],
		chargeInput: {
			cost: new Bank().add('Death rune', 1),
			charges: 10
		},
		unchargedItem: getOSItem('Ash sanctifier'),
		// Unused
		charges: () => 1000
	}
];

export function checkUserCanUseDegradeableItem({
	item,
	chargesToDegrade,
	user
}: {
	item: Item;
	chargesToDegrade: number;
	user: MUser;
}): { hasEnough: true } | { hasEnough: false; userMessage: string } {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');
	const currentCharges = user.user[degItem.settingsKey];
	assert(typeof currentCharges === 'number');
	const newCharges = currentCharges - chargesToDegrade;
	if (newCharges < 0) {
		return {
			hasEnough: false,
			userMessage: `${user.usernameOrMention}, your ${item.name} has only ${currentCharges} charges remaining, but you need ${chargesToDegrade}.`
		};
	}
	return {
		hasEnough: true
	};
}

export async function degradeItem({
	item,
	chargesToDegrade,
	user
}: {
	item: Item;
	chargesToDegrade: number;
	user: MUser;
}) {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');

	const currentCharges = user.user[degItem.settingsKey];
	assert(typeof currentCharges === 'number');
	const newCharges = Math.floor(currentCharges - chargesToDegrade);

	if (newCharges <= 0) {
		// If no more charges left, break and refund the item.
		const hasEquipped = user.gear[degItem.setup].equippedWeapon() === item;
		const hasInBank = user.owns(item.id);
		await user.update({
			[degItem.settingsKey]: 0
		});
		const itemsDeleted = new Bank().add(item.id);

		updateBankSetting('degraded_items_cost', itemsDeleted);

		if (hasEquipped) {
			// If its equipped, unequip and delete it.
			const gear = { ...user.gear[degItem.setup].raw() };
			gear.weapon = null;
			await user.update({
				[`gear_${degItem.setup}`]: gear
			});
			if (degItem.itemsToRefundOnBreak) {
				await user.addItemsToBank({ items: degItem.itemsToRefundOnBreak, collectionLog: false });
			}
		} else if (hasInBank) {
			// If its in bank, just remove 1 from bank.
			await user.removeItemsFromBank(new Bank().add(item.id, 1));
			if (degItem.itemsToRefundOnBreak) {
				await user.addItemsToBank({ items: degItem.itemsToRefundOnBreak, collectionLog: false });
			}
		} else {
			// If its not in bank OR equipped, something weird has gone on.
			throw new Error(
				`${user.usernameOrMention} had missing ${item.name} when trying to degrade by ${chargesToDegrade}`
			);
		}

		return {
			userMessage: `Your ${item.name} ran out of charges and broke.`
		};
	}
	// If it has charges left still, just remove those charges and nothing else.
	await user.update({
		[degItem.settingsKey]: newCharges
	});
	const chargesAfter = user.user[degItem.settingsKey];
	assert(typeof chargesAfter === 'number' && chargesAfter > 0);
	return {
		userMessage: `Your ${item.name} degraded by ${chargesToDegrade} charges, and now has ${chargesAfter} remaining.`
	};
}

export async function checkDegradeableItemCharges({ item, user }: { item: Item; user: MUser }) {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');

	const currentCharges = user.user[degItem.settingsKey];
	assert(typeof currentCharges === 'number');
	return currentCharges;
}
