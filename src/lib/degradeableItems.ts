import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import Monster from 'oldschooljs/dist/structures/Monster';

import { GearSetupType } from './gear/types';
import { KillableMonster } from './minions/types';
import { assert } from './util';
import getOSItem from './util/getOSItem';
import itemID from './util/itemID';
import { updateBankSetting } from './util/updateBankSetting';

interface DegradeableItem {
	item: Item;
	settingsKey:
		| 'tentacle_charges'
		| 'sang_charges'
		| 'void_staff_charges'
		| 'celestial_ring_charges'
		| 'ash_sanctifier_charges'
		| 'serp_helm_charges'
		| 'blood_fury_charges'
		| 'tum_shadow_charges'
		| 'blood_essence_charges'
		| 'trident_charges'
		| 'scythe_of_vitur_charges';
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
	emoji?: string;
}

interface DegradeableItemPVMBoost {
	item: Item;
	degradeable: DegradeableItem;
	attackStyle: GearSetupType;
	charges: ({
		killableMon,
		osjsMonster,
		totalHP,
		duration,
		user
	}: {
		killableMon?: KillableMonster;
		osjsMonster?: Monster;
		totalHP: number;
		duration: number;
		user: MUser;
	}) => number;
	boost: number;
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
		charges: (totalHP: number) => totalHP / 20,
		emoji: '<:Abyssal_tentacle:1068551359755989033>'
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
		},
		emoji: '<:Sanguinesti_staff_uncharged:455403545298993162>'
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
		charges: (duration: number) => duration,
		emoji: '<:Celestial_ring:1068551362587132084>'
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
		charges: () => 1000,
		emoji: '<:Ash_sanctifier:1068551364168405032>'
	},
	{
		item: getOSItem('Serpentine helm'),
		settingsKey: 'serp_helm_charges',
		itemsToRefundOnBreak: new Bank().add('Serpentine helm (uncharged)'),
		setup: 'melee',
		aliases: ['serp', 'serp helm', 'serpentine helm'],
		chargeInput: {
			cost: new Bank().add("Zulrah's scales"),
			charges: 1
		},
		unchargedItem: getOSItem('Serpentine helm (uncharged)'),
		convertOnCharge: true,
		charges: () => 1000,
		emoji: '<:Serpentine_helm:1068491236123619379>'
	},
	{
		item: getOSItem('Amulet of blood fury'),
		settingsKey: 'blood_fury_charges',
		itemsToRefundOnBreak: new Bank().add('Amulet of fury'),
		setup: 'melee',
		aliases: ['blood fury', 'amulet of blood fury'],
		chargeInput: {
			cost: new Bank().add('Blood shard'),
			charges: 10_000
		},
		unchargedItem: getOSItem('Amulet of fury'),
		convertOnCharge: true,
		charges: () => 1000,
		emoji: '<:Amulet_of_blood_fury:1068491286530752562>'
	},
	{
		item: getOSItem("Tumeken's shadow"),
		settingsKey: 'tum_shadow_charges',
		itemsToRefundOnBreak: new Bank().add("Tumeken's shadow (uncharged)"),
		setup: 'mage',
		aliases: ['ts', 'tum shadow', 'tumekens shadow'],
		chargeInput: {
			cost: new Bank().add('Soul rune', 2).add('Chaos rune', 5),
			charges: 1
		},
		unchargedItem: getOSItem("Tumeken's shadow (uncharged)"),
		convertOnCharge: true,
		charges: () => 1000,
		emoji: '<:Tumekens_shadow:1068491239302901831>'
	},
	{
		item: getOSItem('Blood essence (active)'),
		settingsKey: 'blood_essence_charges',
		itemsToRefundOnBreak: new Bank(),
		setup: 'skilling',
		aliases: ['blood essence'],
		chargeInput: {
			cost: new Bank().add('Blood essence'),
			charges: 1000
		},
		emoji: '',
		charges: () => 1000
	},
	{
		item: getOSItem('Trident of the swamp'),
		settingsKey: 'trident_charges',
		itemsToRefundOnBreak: new Bank().add('Uncharged toxic trident'),
		setup: 'mage',
		aliases: ['trident', 'trident of the swamp'],
		chargeInput: {
			cost: new Bank().add('Death rune').add('Chaos rune').add('Fire rune', 5).add("Zulrah's scales"),
			charges: 1
		},
		unchargedItem: getOSItem('Uncharged toxic trident'),
		convertOnCharge: true,
		emoji: '🔱',
		charges: () => 1000
	},
	{
		item: getOSItem('Scythe of vitur'),
		settingsKey: 'scythe_of_vitur_charges',
		itemsToRefundOnBreak: new Bank().add('Scythe of vitur (uncharged)'),
		setup: 'melee',
		aliases: ['scythe of vitur'],
		chargeInput: {
			cost: new Bank().add('Blood rune', 300).add('Vial of blood'),
			charges: 100
		},
		unchargedItem: getOSItem('Scythe of vitur (uncharged)'),
		convertOnCharge: true,
		emoji: '',
		charges: () => 1000
	}
];

export const degradeablePvmBoostItems: DegradeableItemPVMBoost[] = [
	{
		item: getOSItem("Tumeken's shadow"),
		degradeable: degradeableItems.find(di => di.item.id === itemID("Tumeken's shadow"))!,
		attackStyle: 'mage',
		charges: ({ totalHP }) => totalHP / 40,
		boost: 6
	},
	{
		item: getOSItem('Sanguinesti staff'),
		degradeable: degradeableItems.find(di => di.item.id === itemID('Sanguinesti staff'))!,
		attackStyle: 'mage',
		charges: ({ totalHP }) => totalHP / 25,
		boost: 5
	},
	{
		item: getOSItem('Trident of the swamp'),
		degradeable: degradeableItems.find(di => di.item.id === itemID('Trident of the swamp'))!,
		attackStyle: 'mage',
		charges: ({ totalHP }) => totalHP / 40,
		boost: 3
	},
	{
		item: getOSItem('Scythe of vitur'),
		degradeable: degradeableItems.find(di => di.item.id === itemID('Scythe of vitur'))!,
		attackStyle: 'melee',
		charges: ({ totalHP }) => totalHP / 40,
		boost: 5
	},
	{
		item: getOSItem('Abyssal tentacle'),
		degradeable: degradeableItems.find(di => di.item.id === itemID('Abyssal tentacle'))!,
		attackStyle: 'melee',
		charges: ({ totalHP }) => totalHP / 20,
		boost: 3
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
}): { hasEnough: true; currentCharges: number } | { hasEnough: false; currentCharges: number; userMessage: string } {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');
	const currentCharges = user.user[degItem.settingsKey];
	assert(typeof currentCharges === 'number');
	const newCharges = currentCharges - chargesToDegrade;
	if (newCharges < 0) {
		return {
			hasEnough: false,
			currentCharges,
			userMessage: `${user.usernameOrMention}, your ${item.name} has only ${currentCharges} charges remaining, but you need ${chargesToDegrade}.`
		};
	}
	return {
		hasEnough: true,
		currentCharges
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
		const hasEquipped = user.gear[degItem.setup].hasEquipped(item.id, false);
		const hasInBank = user.owns(item.id);
		await user.update({
			[degItem.settingsKey]: 0
		});
		const itemsDeleted = new Bank().add(item.id);

		updateBankSetting('degraded_items_cost', itemsDeleted);

		if (hasEquipped) {
			// If its equipped, unequip and delete it.
			const gear = { ...user.gear[degItem.setup].raw() };
			gear[item.equipment!.slot] = null;
			await user.update({
				[`gear_${degItem.setup}`]: gear
			});
			if (degItem.itemsToRefundOnBreak) {
				await user.addItemsToBank({ items: degItem.itemsToRefundOnBreak, collectionLog: false });
			}
		} else if (hasInBank) {
			// If its in bank, just remove 1 from bank.
			let itemsToAdd = undefined;
			if (degItem.itemsToRefundOnBreak) {
				itemsToAdd = degItem.itemsToRefundOnBreak;
			}
			await user.transactItems({ itemsToRemove: new Bank().add(item.id, 1), itemsToAdd });
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
