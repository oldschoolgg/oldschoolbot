import { Time } from 'e';
import type { Consumable } from '../minions/types';

export const calculateTripConsumableCost = (c: Consumable, quantity: number, duration: number) => {
	const consumableCost = c.itemCost.clone();
	if (c.qtyPerKill) {
		consumableCost.multiply(quantity);
	} else if (c.qtyPerMinute) {
		consumableCost.multiply(duration / Time.Minute);
	}
	for (const [item, qty] of Object.entries(consumableCost.bank)) {
		consumableCost.bank[item] = Math.ceil(qty);
	}
	return consumableCost;
};
