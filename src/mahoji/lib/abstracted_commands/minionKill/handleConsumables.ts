import { Time } from "e";
import type { Consumable } from "../../../../lib/minions/types";
import type { GearBank } from "../../../../lib/structures/GearBank";
import { calculateTripConsumableCost } from "../../../../lib/util/calculateTripConsumableCost";
import { Bank } from "oldschooljs";
import { getSimilarItems } from "../../../../lib/data/similarItems";
import itemID from "../../../../lib/util/itemID";

export function handleConsumables({consumableCosts,gearBank,quantity,duration,timeToFinish}: {timeToFinish:number;quantity:number;duration:number;consumableCosts: Consumable[];gearBank: GearBank;}) {
    	if (consumableCosts.length === 0) return;
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
				for (const [itemID, qty] of Object.entries(oneKcCost.bank)) {
					if (perKillCost.bank[itemID]) perKillCost.bank[itemID] += qty;
					else perKillCost.bank[itemID] = qty;
				}
			}
		}

	const hasInfiniteWaterRunes = gearBank.hasEquipped(getSimilarItems(itemID('Staff of water')), false);

        if (hasInfiniteWaterRunes) perKillCost.remove('Water rune', perKillCost.amount('Water rune'));

        const fits = gearBank.bank.fits(perKillCost);
		if (fits < Number(quantity)) {
			duration = Math.floor(duration * (fits / Number(quantity)));
			quantity = fits;
		}
		const { bank } = perKillCost.clone().multiply(Number(quantity));

        for (const [item, qty] of Object.entries(bank)) {
			bank[item] = Math.ceil(qty);
		}

        return new Bank(bank)
}