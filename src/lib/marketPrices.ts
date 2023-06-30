import _ from 'lodash';
import ss from 'simple-statistics';

import { prisma } from './settings/prisma';

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
}

export const marketPricemap = new Map<number, MarketPriceData>();

export const cacheGEPrices = async () => {
	// Fetch all sell transactions from the past two weeks.
	const twoWeeksAgo = new Date();
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

	const rawTransactions = await prisma.gETransaction.findMany({
		where: {
			created_at: {
				gte: twoWeeksAgo
			}
		},
		include: {
			sell_listing: {
				select: {
					item_id: true
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
	const groupedByItem = _.groupBy(rawTransactions, transaction => transaction.sell_listing.item_id);

	// Pick items that have at least 5 transactions from 4 different buyers
	const filtered = _.pickBy(groupedByItem, group => {
		const uniqueBuyers = _.uniqBy(group, transaction => transaction.buy_listing.user_id);
		return uniqueBuyers.length >= 4 && group.length >= 5;
	});

	// For each group, calculate necessary metrics.
	_.mapValues(filtered, transactions => {
		const prices = transactions.map(t => Number(t.price_per_item_before_tax));

		// Calculate percentiles and IQR
		const sortedPrices = _.sortBy(prices);

		const q1 = ss.quantileSorted(sortedPrices, 0.25);
		const q3 = ss.quantileSorted(sortedPrices, 0.75);
		const iqr = q3 - q1;

		// Filter outliers
		const filteredPrices = sortedPrices.filter(price => price >= q1 - 1.5 * iqr && price <= q3 + 1.5 * iqr);

		const medianSalePrice = ss.medianSorted(sortedPrices);
		const avgSalePriceWithoutOutliers = ss.mean(filteredPrices);
		const guidePrice = Math.round((medianSalePrice + avgSalePriceWithoutOutliers) / 2);

		const data = {
			totalSold: _.sumBy(transactions, 'quantity_bought'),
			transactionCount: transactions.length,
			avgSalePrice: ss.mean(sortedPrices),
			minSalePrice: _.min(sortedPrices),
			maxSalePrice: _.max(sortedPrices),
			medianSalePrice,
			avgSalePriceWithoutOutliers,
			itemID: transactions[0].sell_listing.item_id,
			guidePrice
		};
		marketPricemap.set(data.itemID, data);
	});
};
