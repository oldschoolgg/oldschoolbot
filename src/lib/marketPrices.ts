import { notEmpty } from 'e';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import max from 'lodash/max';
import min from 'lodash/min';
import orderBy from 'lodash/orderBy';
import pickBy from 'lodash/pickBy';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import uniqBy from 'lodash/uniqBy';
import type { Bank } from 'oldschooljs';

import { mean, medianSorted, quantileSorted } from 'simple-statistics';

import { getItem } from './util/getOSItem';

interface MarketPriceData {
	totalSold: number;
	transactionCount: number;
	avgSalePrice: number;
	minSalePrice: number | undefined;
	maxSalePrice: number | undefined;
	medianSalePrice: number;
	avgSalePriceWithoutOutliers: number;
	itemID: number;
	guidePrice: number;
	averagePriceLast100: number;
}

export const marketPricemap = new Map<number, MarketPriceData>();

export const cacheGEPrices = async () => {
	const transactionAge = new Date();
	transactionAge.setDate(transactionAge.getDate() - 60);

	const rawTransactions = await prisma.gETransaction.findMany({
		where: {
			created_at: {
				gte: transactionAge
			}
		},
		include: {
			sell_listing: {
				select: {
					item_id: true,
					user_id: true
				}
			},
			buy_listing: {
				select: {
					user_id: true
				}
			}
		}
	});

	// Group transactions by item_id
	const groupedByItem = groupBy(rawTransactions, transaction => transaction.sell_listing.item_id);

	// Pick items that have at least 5 transactions from 4 different buyers
	const filtered = pickBy(groupedByItem, group => {
		const uniqueBuyers = uniqBy(group, transaction => transaction.buy_listing.user_id);
		return uniqueBuyers.length >= 4 && group.length >= 5;
	});

	// For each group, calculate necessary metrics.
	mapValues(filtered, transactions => {
		const prices = transactions.map(t => Number(t.price_per_item_before_tax));

		// Calculate percentiles and IQR
		const sortedPrices = sortBy(prices);

		const q1 = quantileSorted(sortedPrices, 0.25);
		const q3 = quantileSorted(sortedPrices, 0.75);
		const iqr = q3 - q1;

		// Filter outliers
		const filteredPrices = sortedPrices.filter(price => price >= q1 - 1.5 * iqr && price <= q3 + 1.5 * iqr);

		const medianSalePrice = medianSorted(sortedPrices);
		const avgSalePriceWithoutOutliers = mean(filteredPrices);
		const guidePrice = Math.round((medianSalePrice + avgSalePriceWithoutOutliers) / 2);

		// Sort transactions by date (newest to oldest)
		const sortedTransactions = orderBy(transactions, 'created_at', 'desc');
		const latest100Transactions = sortedTransactions.slice(0, 100);
		const averagePriceLast100 = mean(latest100Transactions.map(t => Number(t.price_per_item_before_tax)));

		const totalUniqueTraders = new Set(
			...transactions.map(t => [t.buy_listing.user_id, t.sell_listing.user_id].filter(notEmpty))
		);

		const data = {
			totalSold: sumBy(transactions, 'quantity_bought'),
			transactionCount: transactions.length,
			avgSalePrice: mean(sortedPrices),
			minSalePrice: min(sortedPrices),
			maxSalePrice: max(sortedPrices),
			medianSalePrice,
			avgSalePriceWithoutOutliers,
			itemID: transactions[0].sell_listing.item_id,
			guidePrice,
			averagePriceLast100,
			totalUniqueTraders
		};
		marketPricemap.set(data.itemID, data);
	});
};

export function marketPriceOfBank(bank: Bank) {
	let value = 0;
	for (const [item, qty] of bank.items()) {
		if (!item) continue;
		value += marketPriceOrBotPrice(item.id) * qty;
	}
	return Math.ceil(value);
}

export function marketPriceOrBotPrice(itemID: number) {
	const item = getItem(itemID);
	if (!item) return 0;
	const data = marketPricemap.get(item.id);
	if (data) {
		return data.guidePrice;
	}
	return item.price;
}
