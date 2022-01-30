import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

export function buyLimit({
	buyLimitBank,
	increaseFactor,
	itemBeingBought,
	quantityBeingBought,
	baseCost,
	absoluteLimit
}: {
	buyLimitBank: Bank;
	/**
	 * The price multiplier increases by 1 for each multiple of this amount they have bought. (1x, 2x, 3x, etc)
	 */
	increaseFactor: number;
	/**
	 * You cannot buy any more than this.
	 */
	absoluteLimit: number;
	itemBeingBought: number | Item;
	quantityBeingBought: number;
	baseCost: number;
}) {
	const itemID = typeof itemBeingBought === 'number' ? itemBeingBought : itemBeingBought.id;
	const amountBought = buyLimitBank.amount(itemID);

	let amountToBuy = 0;
	let finalCost = 0;

	if (quantityBeingBought <= 0) {
		return { amountToBuy, finalCost };
	}

	const maxCanBuy = absoluteLimit - amountBought;
	const allowedBuyAmount = quantityBeingBought > maxCanBuy ? maxCanBuy : quantityBeingBought;
	// CHANGE THIS TO MATCH currentMultiplier
	// let currentMultiplier = Math.floor(amountBought / increaseFactor) + 1;
	let currentMultiplier = Math.pow(2, Math.floor(amountBought / increaseFactor));
	const leftOvers = amountBought % increaseFactor;

	if (allowedBuyAmount + leftOvers <= increaseFactor) {
		// If we won't cross a multiplier threshold, just sell and quit
		finalCost = allowedBuyAmount * currentMultiplier * baseCost;
		amountToBuy = allowedBuyAmount;
	} else {
		// Sell just enough to meet the threshold, so we can iterate 'increaseFactor' at a time
		const remainingTilLevel = increaseFactor - leftOvers;
		amountToBuy += remainingTilLevel;
		finalCost += remainingTilLevel * currentMultiplier * baseCost;
		// Sell 'increaseFactor' at a time until they only need a few left.
		for (let remaining = allowedBuyAmount - remainingTilLevel; remaining > 0; remaining -= increaseFactor) {
			currentMultiplier *= 2;
			if (remaining > increaseFactor) {
				finalCost += increaseFactor * currentMultiplier * baseCost;
				amountToBuy += increaseFactor;
			} else {
				finalCost += remaining * currentMultiplier * baseCost;
				amountToBuy += remaining;
			}
		}
	}

	return {
		amountToBuy,
		finalCost
	};
}
