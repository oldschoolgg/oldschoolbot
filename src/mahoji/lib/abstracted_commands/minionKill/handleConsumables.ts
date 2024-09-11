import { Time } from 'e';
import { EItem } from 'oldschooljs';

import { getSimilarItems } from '../../../../lib/data/similarItems';
import type { Consumable } from '../../../../lib/minions/types';
import { FloatBank } from '../../../../lib/structures/Bank';
import type { GearBank } from '../../../../lib/structures/GearBank';
import itemID from '../../../../lib/util/itemID';

// TODO: should use a FloatBank instead of a Bank
export const calculateTripConsumableCost = (c: Consumable, quantity: number, duration: number) => {
	const consumableCost = c.itemCost.clone();
	if (c.qtyPerKill) {
		consumableCost.multiply(quantity);
	} else if (c.qtyPerMinute) {
		consumableCost.multiply(duration / Time.Minute);
	}
	for (const [item, qty] of consumableCost.items()) {
		consumableCost.set(item.id, Math.ceil(qty));
	}
	return consumableCost;
};

export function getItemCostFromConsumables({
	consumableCosts,
	gearBank,
	quantity,
	timeToFinish,
	maxTripLength
}: {
	timeToFinish: number;
	quantity: number;
	consumableCosts: Consumable[];
	gearBank: GearBank;
	maxTripLength: number;
}) {
	if (consumableCosts.length === 0) return;

	const duration = timeToFinish * quantity;
	const floatCosts = new FloatBank();

	for (const cc of consumableCosts) {
		let consumable = cc;

		if (
			consumable.alternativeConsumables &&
			!gearBank.bank.has(calculateTripConsumableCost(consumable, quantity, duration))
		) {
			for (const c of consumable.alternativeConsumables) {
				if (gearBank.bank.has(calculateTripConsumableCost(c, quantity, duration))) {
					consumable = c;
					break;
				}
			}
		}

		let itemMultiple = consumable.qtyPerKill ?? consumable.qtyPerMinute ?? null;
		if (itemMultiple) {
			if (consumable.isRuneCost) {
				// Free casts for kodai + sotd
				if (gearBank.hasEquipped('Kodai wand')) {
					itemMultiple = Math.ceil(0.85 * itemMultiple);
				} else if (gearBank.hasEquipped('Staff of the dead')) {
					itemMultiple = Math.ceil((6 / 7) * itemMultiple);
				}
			}

			let multiply = itemMultiple;

			// Calculate the duration for 1 kill and check how much will be used in 1 kill
			if (consumable.qtyPerMinute) multiply = (timeToFinish / Time.Minute) * itemMultiple;

			for (const [item, qty] of consumable.itemCost.items()) {
				floatCosts.add(item.id, qty);
			}
			if (multiply) floatCosts.multiply(multiply);
		}
	}

	const hasInfiniteWaterRunes = gearBank.hasEquipped(getSimilarItems(itemID('Staff of water')), false);

	if (hasInfiniteWaterRunes) {
		floatCosts.remove(EItem.WATER_RUNE, floatCosts.amount(EItem.WATER_RUNE));
	}

	const maxBasedOnTime = Math.floor(maxTripLength / timeToFinish);
	const maxCanKillWithItemCost = Math.floor(floatCosts.fits(gearBank.bank));
	const finalQuantity = Math.max(1, Math.min(quantity, maxCanKillWithItemCost, maxBasedOnTime));

	const itemCost = floatCosts.multiply(finalQuantity).toItemBankRoundedUp();

	return {
		itemCost,
		finalQuantity
	};
}
