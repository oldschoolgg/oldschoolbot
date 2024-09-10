import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { getSimilarItems } from '../../../../lib/data/similarItems';
import type { Consumable } from '../../../../lib/minions/types';
import type { GearBank } from '../../../../lib/structures/GearBank';
import { calculateTripConsumableCost } from '../../../../lib/util/calculateTripConsumableCost';
import itemID from '../../../../lib/util/itemID';

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
	const perKillCost = new Bank();

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

			// Calculate supply for 1 kill
			const oneKcCost = consumable.itemCost.clone().multiply(multiply);

			// Can't use Bank.add() because it discards < 1 qty.
			for (const [item, qty] of (oneKcCost.items())) {
				perKillCost.add(item.id, qty);
			}
		}
	}

	const hasInfiniteWaterRunes = gearBank.hasEquipped(getSimilarItems(itemID('Staff of water')), false);

	if (hasInfiniteWaterRunes) perKillCost.remove('Water rune', perKillCost.amount('Water rune'));

	const maxBasedOnTime = Math.floor(maxTripLength / timeToFinish);
	const maxCanKillWithItemCost = Math.floor(gearBank.bank.fits(perKillCost));
	const finalQuantity = Math.max(1, Math.min(quantity, maxCanKillWithItemCost, maxBasedOnTime));

	const { bank } = perKillCost.clone().multiply(finalQuantity);

	for (const [item, qty] of Object.entries(bank)) {
		bank[item] = Math.ceil(qty);
	}

	return {
		itemCost: new Bank(bank),
		finalQuantity
	};
}
