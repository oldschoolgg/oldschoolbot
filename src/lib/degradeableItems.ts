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
		| 'celestial_ring_charges'
		| 'ash_sanctifier_charges'
		| 'serp_helm_charges'
		| 'blood_fury_charges'
		| 'tum_shadow_charges'
		| 'blood_essence_charges'
		| 'trident_charges'
		| 'scythe_of_vitur_charges';
	itemsToRefundOnBreak: Bank;
	itemVariants: {
		chargedVariant: Item;
		unchargedVariant: Item;
	}[];
	setup: GearSetupType;
	aliases: string[];
	chargeInput: {
		cost: Bank;
		charges: number;
	};
	unchargedItem?: Item;
	convertOnCharge?: boolean;
	emoji: string;
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
		itemsToRefundOnBreak: new Bank().add('Kraken tentacle').freeze(),
		itemVariants: [],
		setup: 'melee',
		aliases: ['tentacle', 'tent'],
		chargeInput: {
			cost: new Bank().add('Abyssal whip').freeze(),
			charges: 10_000
		},
		emoji: '<:Abyssal_tentacle:1068551359755989033>'
	},
	{
		item: getOSItem('Sanguinesti staff'),
		settingsKey: 'sang_charges',
		itemsToRefundOnBreak: new Bank().add('Sanguinesti staff (uncharged)').freeze(),
		itemVariants: [
			{
				chargedVariant: getOSItem('Holy sanguinesti staff'),
				unchargedVariant: getOSItem('Holy sanguinesti staff (uncharged)')
			}
		],
		setup: 'mage',
		aliases: ['sang', 'sang staff', 'sanguinesti staff', 'sanguinesti'],
		chargeInput: {
			cost: new Bank().add('Blood rune', 3).freeze(),
			charges: 1
		},
		unchargedItem: getOSItem('Sanguinesti staff (uncharged)'),
		convertOnCharge: true,
		emoji: '<:Sanguinesti_staff_uncharged:455403545298993162>'
	},
	{
		item: getOSItem('Celestial ring'),
		settingsKey: 'celestial_ring_charges',
		itemsToRefundOnBreak: new Bank().add('Celestial ring (uncharged)').freeze(),
		itemVariants: [],
		setup: 'skilling',
		aliases: ['celestial ring'],
		chargeInput: {
			cost: new Bank().add('Stardust', 10).freeze(),
			charges: 10
		},
		unchargedItem: getOSItem('Celestial ring (uncharged)'),
		convertOnCharge: true,
		emoji: '<:Celestial_ring:1068551362587132084>'
	},
	{
		item: getOSItem('Ash sanctifier'),
		settingsKey: 'ash_sanctifier_charges',
		itemsToRefundOnBreak: new Bank().add('Ash sanctifier').freeze(),
		itemVariants: [],
		setup: 'skilling',
		aliases: ['ash sanctifier'],
		chargeInput: {
			cost: new Bank().add('Death rune', 1).freeze(),
			charges: 10
		},
		unchargedItem: getOSItem('Ash sanctifier'),
		emoji: '<:Ash_sanctifier:1068551364168405032>'
	},
	{
		item: getOSItem('Serpentine helm'),
		settingsKey: 'serp_helm_charges',
		itemsToRefundOnBreak: new Bank().add('Serpentine helm (uncharged)').freeze(),
		itemVariants: [],
		setup: 'melee',
		aliases: ['serp', 'serp helm', 'serpentine helm'],
		chargeInput: {
			cost: new Bank().add("Zulrah's scales").freeze(),
			charges: 1
		},
		unchargedItem: getOSItem('Serpentine helm (uncharged)'),
		convertOnCharge: true,
		emoji: '<:Serpentine_helm:1068491236123619379>'
	},
	{
		item: getOSItem('Amulet of blood fury'),
		settingsKey: 'blood_fury_charges',
		itemsToRefundOnBreak: new Bank().add('Amulet of fury').freeze(),
		itemVariants: [],
		setup: 'melee',
		aliases: ['blood fury', 'amulet of blood fury'],
		chargeInput: {
			cost: new Bank().add('Blood shard').freeze(),
			charges: 10_000
		},
		unchargedItem: getOSItem('Amulet of fury'),
		convertOnCharge: true,
		emoji: '<:Amulet_of_blood_fury:1068491286530752562>'
	},
	{
		item: getOSItem("Tumeken's shadow"),
		settingsKey: 'tum_shadow_charges',
		itemsToRefundOnBreak: new Bank().add("Tumeken's shadow (uncharged)").freeze(),
		itemVariants: [],
		setup: 'mage',
		aliases: ['shadow', 'ts', 'tum shadow', 'tumekens shadow'],
		chargeInput: {
			cost: new Bank().add('Soul rune', 2).add('Chaos rune', 5).freeze(),
			charges: 1
		},
		unchargedItem: getOSItem("Tumeken's shadow (uncharged)"),
		convertOnCharge: true,
		emoji: '<:Tumekens_shadow:1068491239302901831>'
	},
	{
		item: getOSItem('Blood essence (active)'),
		settingsKey: 'blood_essence_charges',
		itemsToRefundOnBreak: new Bank().freeze(),
		itemVariants: [],
		setup: 'skilling',
		aliases: ['blood ess'],
		chargeInput: {
			cost: new Bank().add('Blood essence').freeze(),
			charges: 1000
		},
		emoji: ''
	},
	{
		item: getOSItem('Trident of the swamp'),
		settingsKey: 'trident_charges',
		itemsToRefundOnBreak: new Bank().add('Uncharged toxic trident').freeze(),
		itemVariants: [],
		setup: 'mage',
		aliases: ['trident', 'trident of the swamp'],
		chargeInput: {
			cost: new Bank().add('Death rune').add('Chaos rune').add('Fire rune', 5).add("Zulrah's scales").freeze(),
			charges: 1
		},
		unchargedItem: getOSItem('Uncharged toxic trident'),
		convertOnCharge: true,
		emoji: '🔱'
	},
	{
		item: getOSItem('Scythe of vitur'),
		settingsKey: 'scythe_of_vitur_charges',
		itemsToRefundOnBreak: new Bank().add('Scythe of vitur (uncharged)').freeze(),
		itemVariants: [
			{
				chargedVariant: getOSItem('Holy scythe of vitur'),
				unchargedVariant: getOSItem('Holy scythe of vitur (uncharged)')
			},
			{
				chargedVariant: getOSItem('Sanguine scythe of vitur'),
				unchargedVariant: getOSItem('Sanguine scythe of vitur (uncharged)')
			}
		],
		setup: 'melee',
		aliases: ['scy', 'scythe'],
		chargeInput: {
			cost: new Bank().add('Blood rune', 300).add('Vial of blood').freeze(),
			charges: 100
		},
		unchargedItem: getOSItem('Scythe of vitur (uncharged)'),
		convertOnCharge: true,
		emoji: ''
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
		// If the user runs out for charges for a degradeable item, break and refund the item.
		const hasEquipped = user.gear[degItem.setup].hasEquipped(item.id, false);
		const hasInBank = user.hasEquippedOrInBank(item.id);
		const itemsDeleted = new Bank();

		// Update the settingsKey to 0 to prevent negative charges
		await user.update({
			[degItem.settingsKey]: 0
		});

		if (hasEquipped) {
			// Get the users equipped item and check for variants
			let refundItems = degItem.itemsToRefundOnBreak;
			let removeItems = degItem.item.id;
			for (const variant of degItem.itemVariants!) {
				if (user.gear[degItem.setup].hasEquipped(variant.chargedVariant.id, false, false)) {
					removeItems = variant.chargedVariant.id;
					refundItems = new Bank().add(variant.unchargedVariant).freeze();
					break;
				}
			}
			// Unequip and delete the item from the users gear setup
			const gear = { ...user.gear[degItem.setup].raw() };
			gear[item.equipment!.slot] = null;
			await user.update({
				[`gear_${degItem.setup}`]: gear
			});
			console.log(removeItems);
			itemsDeleted.add(removeItems);
			// Add the uncharged version to the users bank
			await user.addItemsToBank({ items: refundItems, collectionLog: false });
		} else if (hasInBank) {
			// Get the item in the users bank and check for variants
			let refundItems = degItem.itemsToRefundOnBreak;
			let removeItems = degItem.item.id;
			for (const variant of degItem.itemVariants!) {
				if (user.hasEquippedOrInBank(variant.chargedVariant.id)) {
					refundItems = new Bank().add(variant.unchargedVariant).freeze();
					removeItems = variant.chargedVariant.id;
					break;
				}
			}
			itemsDeleted.add(removeItems);
			// Remove the charged item from the users bank and add the uncharged version to the users bank
			await user.transactItems({ itemsToRemove: new Bank().add(removeItems).freeze(), itemsToAdd: refundItems });
		} else {
			// If its not in bank OR equipped, something weird has gone on.
			throw new Error(
				`${user.usernameOrMention} had missing ${item.name} when trying to degrade by ${chargesToDegrade}`
			);
		}

		// Update degraded_items_cost with the items deleted
		await updateBankSetting('degraded_items_cost', itemsDeleted);

		// Notify the user when a degradable item has broken.
		return {
			userMessage: `Your ${item.name} ran out of charges and broke.`
		};
	}

	// If the degradeable item still has charges remaining, remove those charges and show the user a message of remaining charges.
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
