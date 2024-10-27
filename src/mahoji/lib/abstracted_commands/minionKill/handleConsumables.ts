import { Time, reduceNumByPercent } from 'e';
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
	timeToFinish,
	maxTripLength,
	inputQuantity,
	slayerKillsRemaining
}: {
	timeToFinish: number;
	consumableCosts: Consumable[];
	gearBank: GearBank;
	maxTripLength: number;
	inputQuantity: number | undefined;
	slayerKillsRemaining: number | null;
}) {
	const quantity = inputQuantity ?? Math.floor(maxTripLength / timeToFinish);
	const duration = timeToFinish * quantity;
	const floatCostsPerKill = new FloatBank();
	const boosts: { message: string; boostPercent: number }[] = [];

	for (const cc of consumableCosts) {
		const flatConsumables = [cc, ...(cc.alternativeConsumables ?? [])];
		const consumable =
			flatConsumables.find(c => gearBank.bank.has(calculateTripConsumableCost(c, quantity, duration))) ?? cc;
		if (consumable.optional && !gearBank.bank.has(calculateTripConsumableCost(cc, quantity, duration))) {
			continue;
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

			const multiply = consumable.qtyPerMinute ? (timeToFinish / Time.Minute) * itemMultiple : itemMultiple;

			for (const [item, qty] of consumable.itemCost.items()) {
				floatCostsPerKill.add(item.id, qty * multiply);
			}
			if (consumable.boostPercent) {
				timeToFinish = reduceNumByPercent(timeToFinish, consumable.boostPercent);
				boosts.push({
					message: `${consumable.boostPercent}% for ${consumable.itemCost
						.items()
						.map(i => i[0].name)
						.join(', ')}`,
					boostPercent: consumable.boostPercent
				});
			}
		}
	}

	const hasInfiniteWaterRunes = gearBank.hasEquipped(getSimilarItems(itemID('Staff of water')), false);

	if (hasInfiniteWaterRunes) {
		floatCostsPerKill.remove(EItem.WATER_RUNE, floatCostsPerKill.amount(EItem.WATER_RUNE));
	}

	const maxBasedOnTime = Math.floor(maxTripLength / timeToFinish);
	const maxCanKillWithItemCost =
		consumableCosts.length === 0
			? Number.POSITIVE_INFINITY
			: floatCostsPerKill.length() === 0
				? Number.POSITIVE_INFINITY
				: Math.floor(floatCostsPerKill.fits(gearBank.bank));
	const maxAllowed = Math.min(maxBasedOnTime, maxCanKillWithItemCost);
	let finalQuantity = Math.max(1, inputQuantity ? Math.min(inputQuantity, maxAllowed) : maxAllowed) ?? maxAllowed;
	if (slayerKillsRemaining && finalQuantity > slayerKillsRemaining) {
		finalQuantity = slayerKillsRemaining;
	}
	const itemCost = floatCostsPerKill.multiply(finalQuantity).toItemBankRoundedUp();

	if (consumableCosts.length === 0) {
		return {
			finalQuantity,
			timeToFinish
		};
	}

	return {
		itemCost,
		finalQuantity,
		boosts,
		timeToFinish
	};
}
