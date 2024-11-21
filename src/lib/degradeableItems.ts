import { percentChance } from 'e';
import { Bank, type Item, type Monster } from 'oldschooljs';

import type { GearSetupType, PrimaryGearSetupType } from './gear/types';
import type { KillableMonster } from './minions/types';
import type { ChargeBank } from './structures/Bank';
import { assert } from './util';
import getOSItem from './util/getOSItem';
import itemID from './util/itemID';
import { updateBankSetting } from './util/updateBankSetting';

export interface DegradeableItem {
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
		| 'scythe_of_vitur_charges'
		| 'venator_bow_charges';
	itemsToRefundOnBreak: Bank;
	refundVariants: {
		variant: Item;
		refund: Bank;
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
	attackStyle: PrimaryGearSetupType;
	charges: ({
		killableMon,
		osjsMonster,
		totalHP,
		duration
	}: {
		killableMon?: KillableMonster;
		osjsMonster?: Monster;
		totalHP: number;
		duration: number;
	}) => number;
	boost: number;
}

interface RefundResult {
	item: Item;
	refundedCharges: number;
	totalCharges: number;
	userMessage: string;
}

export const degradeableItems: DegradeableItem[] = [
	{
		item: getOSItem('Abyssal tentacle'),
		settingsKey: 'tentacle_charges',
		itemsToRefundOnBreak: new Bank().add('Kraken tentacle').freeze(),
		refundVariants: [],
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
		refundVariants: [
			{
				variant: getOSItem('Holy sanguinesti staff'),
				refund: new Bank().add('Holy sanguinesti staff (uncharged)').freeze()
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
		refundVariants: [],
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
		refundVariants: [],
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
		refundVariants: [],
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
		refundVariants: [],
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
		refundVariants: [],
		setup: 'mage',
		aliases: ['ts', 'tum shadow', 'tumekens shadow'],
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
		refundVariants: [],
		setup: 'skilling',
		aliases: ['blood essence'],
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
		refundVariants: [],
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
		refundVariants: [
			{
				variant: getOSItem('Holy scythe of vitur'),
				refund: new Bank().add('Holy scythe of vitur (uncharged)').freeze()
			},
			{
				variant: getOSItem('Sanguine scythe of vitur'),
				refund: new Bank().add('Sanguine scythe of vitur (uncharged)').freeze()
			}
		],
		setup: 'melee',
		aliases: ['scythe of vitur'],
		chargeInput: {
			cost: new Bank().add('Blood rune', 200).add('Vial of blood').freeze(),
			charges: 100
		},
		unchargedItem: getOSItem('Scythe of vitur (uncharged)'),
		convertOnCharge: true,
		emoji: ''
	},
	{
		item: getOSItem('Venator bow'),
		settingsKey: 'venator_bow_charges',
		itemsToRefundOnBreak: new Bank().add('Venator bow (uncharged)').freeze(),
		refundVariants: [],
		setup: 'range',
		aliases: ['venator bow', 'ven bow'],
		chargeInput: {
			cost: new Bank().add('Ancient essence', 1).freeze(),
			charges: 1
		},
		unchargedItem: getOSItem('Venator bow (uncharged)'),
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
	},
	{
		item: getOSItem('Venator bow'),
		degradeable: degradeableItems.find(di => di.item.id === itemID('Venator bow'))!,
		attackStyle: 'range',
		charges: ({ totalHP }) => totalHP / 25,
		boost: 3
	},
	{
		item: getOSItem('Amulet of blood fury'),
		degradeable: degradeableItems.find(di => di.item.id === itemID('Amulet of blood fury'))!,
		attackStyle: 'melee',
		charges: ({ totalHP }) => totalHP / 25,
		boost: 2
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

	// 5% chance to not consume a charge when Ghommal's lucky penny is equipped
	let pennyReduction = 0;
	if (user.hasEquipped("Ghommal's lucky penny")) {
		for (let i = 0; i < chargesToDegrade; i++) {
			if (percentChance(5)) {
				pennyReduction++;
			}
		}
	}
	chargesToDegrade -= pennyReduction;

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
			// Get the users equipped item.
			let refundItems = degItem.itemsToRefundOnBreak;
			for (const variant of degItem.refundVariants) {
				if (user.gear[degItem.setup].hasEquipped(variant.variant.id, false, false)) {
					refundItems = variant.refund;
				}
			}
			// Unequip and delete the users item.
			const gear = { ...user.gear[degItem.setup].raw() };
			gear[item.equipment!.slot] = null;
			await user.update({
				[`gear_${degItem.setup}`]: gear
			});
			// Give the user the uncharged version of their charged item.
			await user.addItemsToBank({ items: refundItems, collectionLog: false });
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
		chargesToDegrade: chargesToDegrade,
		userMessage: `Your ${item.name} degraded by ${chargesToDegrade} charges`
	};
}

export async function checkDegradeableItemCharges({ item, user }: { item: Item; user: MUser }) {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');

	const currentCharges = user.user[degItem.settingsKey];
	assert(typeof currentCharges === 'number');
	return currentCharges;
}

export async function degradeChargeBank(user: MUser, chargeBank: ChargeBank) {
	const hasChargesResult = user.hasCharges(chargeBank);
	if (!hasChargesResult.hasCharges) {
		throw new Error(
			`Tried to degrade a charge bank (${chargeBank}) for ${
				user.logName
			}, but they don't have the required charges: ${JSON.stringify(hasChargesResult)}`
		);
	}

	const results = [];

	for (const [key, chargesToDegrade] of chargeBank.entries()) {
		const { item } = degradeableItems.find(i => i.settingsKey === key)!;
		const result = await degradeItem({ item, chargesToDegrade, user });
		results.push(result.userMessage);
	}

	if (user.hasEquipped("Ghommal's lucky penny")) results.push("5% reduced charges for Ghommal's lucky penny");

	return results.join(', ');
}

export async function refundChargeBank(user: MUser, chargeBank: ChargeBank): Promise<RefundResult[]> {
	const results: RefundResult[] = [];

	for (const [key, chargesToRefund] of chargeBank.entries()) {
		const degItem = degradeableItems.find(i => i.settingsKey === key);
		if (!degItem) {
			throw new Error(`Invalid degradeable item settings key: ${key}`);
		}

		const currentCharges = user.user[degItem.settingsKey];
		const newCharges = currentCharges + chargesToRefund;

		// Prepare result message
		const userMessage = `Refunded ${chargesToRefund} charges for ${degItem.item.name}.`;

		// Create result object
		const result: RefundResult = {
			item: degItem.item,
			refundedCharges: chargesToRefund,
			totalCharges: newCharges,
			userMessage
		};

		// Push result to results array
		results.push(result);

		// Update user
		await user.update({
			[degItem.settingsKey]: newCharges
		});
	}

	return results;
}
