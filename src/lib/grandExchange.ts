import { GEListing, GEListingType } from '@prisma/client';
import { userMention } from 'discord.js';
import { noOp, sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import PQueue from 'p-queue';

import { ADMIN_IDS, OWNER_IDS, production } from '../config';
import { globalConfig } from './constants';
import { prisma } from './settings/prisma';
import { ItemBank } from './types';
import { assert, generateGrandExchangeID, itemNameFromID, toKMB, validateBankAndThrow } from './util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from './util/clientSettings';
import getOSItem, { getItem } from './util/getOSItem';
import { logError } from './util/logError';
import { updateBankSetting } from './util/updateBankSetting';
import { sendToChannelID } from './util/webhook';

interface CreateListingArgs {
	user: MUser;
	itemName: string;
	quantity: number;
	price: number;
	type: GEListingType;
}

function validateNumber(num: number) {
	if (num < 0 || isNaN(num) || !Number.isInteger(num)) {
		throw new Error(`Invalid number: ${num}.`);
	}
}

export async function fetchOwnedBank() {
	const geBank = new Bank(
		(await mahojiClientSettingsFetch({ grand_exchange_owned_bank: true })).grand_exchange_owned_bank as ItemBank
	);
	return geBank;
}

function sanityCheckListing(listing: GEListing) {
	if (listing.fulfilled_at && listing.quantity_remaining !== 0) {
		throw new Error(`Listing ${listing.id} is fulfilled but quantity remaining is not 0.`);
	}
	if (listing.quantity_remaining < 0) {
		throw new Error(`Listing ${listing.id} has negative quantity remaining.`);
	}
	if (listing.quantity_remaining > listing.total_quantity) {
		throw new Error(`Listing ${listing.id} has quantity remaining greater than total quantity.`);
	}
	if (listing.quantity_remaining === 0 && !listing.fulfilled_at) {
		throw new Error(`Listing ${listing.id} has quantity remaining of 0 but is not fulfilled.`);
	}
	if (listing.quantity_remaining !== 0 && listing.fulfilled_at) {
		throw new Error(`Listing ${listing.id} has quantity remaining but is fulfilled.`);
	}
	const item = getItem(listing.item_id);
	if (!item) {
		throw new Error(`Listing ${listing.id} has invalid item ID ${listing.item_id}.`);
	}
	if (Number.isNaN(listing.asking_price_per_item) || Number.isNaN(listing.total_quantity)) {
		throw new Error(`Listing ${listing.id} has NaN price or quantity.`);
	}
	if (listing.asking_price_per_item < 0 || listing.total_quantity < 0) {
		throw new Error(`Listing ${listing.id} has negative price or quantity.`);
	}
	if (listing.cancelled_at && listing.fulfilled_at) {
		throw new Error(`Listing ${listing.id} has both fulfilled and cancelled.`);
	}
}

/**
 * taxing
 * buy limits
 * public listings
 * seeing your own listings
 */

class GrandExchangeSingleton {
	public queue = new PQueue({ concurrency: 1 });
	public locked = false;
	public taxRatePercentage = 1;
	public config = {
		buyLimit: {
			interval: Time.Minute * 5, // Time.Hour * 4,
			fallbackBuyLimit: (item: Item) => (item.price > 1_000_000 ? 1 : 1000)
		}
	};

	async lockGE(reason: string) {
		if (this.locked) return;
		const idsToNotify = [...ADMIN_IDS, ...OWNER_IDS];
		await sendToChannelID(globalConfig.geAdminChannelID, {
			content: `The Grand Exchange has encountered an error and has been locked. Reason: ${reason}. ${idsToNotify
				.map(i => userMention(i))
				.join(', ')}`,
			allowedMentions: production ? { users: idsToNotify } : undefined
		}).catch(noOp);
		await mahojiClientSettingsUpdate({
			grand_exchange_is_locked: true
		});
		this.locked = true;
	}

	countItemsSoldInListing(listing: GEListing) {
		return listing.total_quantity - listing.quantity_remaining;
	}

	async checkBuyLimitForListing(geListing: GEListing) {
		const allActiveListingsInTimePeriod = await prisma.gEListing.findMany({
			where: {
				item_id: geListing.item_id,
				type: 'Buy',
				user_id: geListing.user_id,
				created_at: {
					gte: new Date(Date.now() - this.config.buyLimit.interval)
				}
			}
		});

		const item = getOSItem(geListing.item_id);
		const buyLimit = item.buy_limit ?? this.config.buyLimit.fallbackBuyLimit(item);
		const totalSold = sumArr(allActiveListingsInTimePeriod.map(listing => this.countItemsSoldInListing(listing)));
		const remainingItemsCanBuy = Math.max(0, buyLimit - totalSold);
		validateNumber(buyLimit);
		validateNumber(totalSold);
		validateNumber(remainingItemsCanBuy);

		return {
			buyLimit,
			totalSold,
			item,
			remainingItemsCanBuy
		};
	}

	async createListing({
		user,
		itemName,
		price,
		quantity,
		type
	}: CreateListingArgs): Promise<{ error: string } | { createdListing: GEListing; error: null }> {
		if (this.locked) {
			return { error: 'The Grand Exchange is temporarily closed! Sorry, please try again later.' };
		}
		if (user.isIronman) return { error: "You're an ironman." };
		const item = getItem(itemName);
		if (!item || !item.tradeable_on_ge || ['Coins'].includes(item.name)) {
			return { error: 'Invalid item.' };
		}

		if (!price || price < 0 || isNaN(price) || !Number.isInteger(price) || price > 2_000_000_000) {
			return { error: 'Invalid price, the price must be a number between 1 and 2b.' };
		}
		if (!quantity || quantity < 0 || isNaN(quantity) || !Number.isInteger(quantity) || quantity > 5_000_000) {
			return { error: 'Invalid quantity, the quantity must be a number between 1 and 5m.' };
		}

		await user.sync();

		const cost = new Bank();

		if (type === 'Buy') {
			cost.add('Coins', price * quantity);
		} else {
			cost.add(item.id, quantity);
		}

		if (!user.owns(cost)) {
			return { error: `You don't own ${cost}.` };
		}

		await user.removeItemsFromBank(cost);
		await updateBankSetting('grand_exchange_owned_bank', cost);

		const listing = await prisma.gEListing.create({
			data: {
				user_id: user.id,
				item_id: item.id,
				asking_price_per_item: price,
				total_quantity: quantity,
				type,
				quantity_remaining: quantity,
				userfacing_id: generateGrandExchangeID()
			}
		});

		return {
			createdListing: listing,
			error: null
		};
	}

	private async createTransaction(
		buyerListing: GEListing,
		sellerListing: GEListing,
		remainingItemsInBuyLimit: number
	) {
		let logContext: Record<string, string> = {
			buyerListingID: buyerListing.id.toString(),
			sellerListingID: sellerListing.id.toString(),
			type: 'GE_TRANSACTION'
		};
		const logID = `GE Transaction ${buyerListing.id} <-> ${sellerListing.id}`;
		debugLog('Starting transaction.', logContext);
		assert(buyerListing.type !== sellerListing.type, 'Buyer and seller listings are the same type.');
		assert(sellerListing.type === 'Sell' && buyerListing.type === 'Buy', 'Wrong listing types');
		assert(buyerListing.item_id === sellerListing.item_id, 'Buyer and seller listings are not for the same item.');
		assert(buyerListing.quantity_remaining > 0, 'Buyer listing has 0 quantity remaining.');
		assert(sellerListing.quantity_remaining > 0, 'Seller listing has 0 quantity remaining.');
		assert(buyerListing.user_id !== sellerListing.user_id, 'Buyer and seller are the same user.');

		const quantityToBuy = Math.min(
			remainingItemsInBuyLimit,
			buyerListing.quantity_remaining,
			sellerListing.quantity_remaining
		);
		validateNumber(quantityToBuy);

		if (
			quantityToBuy <= 0 ||
			quantityToBuy > buyerListing.quantity_remaining ||
			quantityToBuy > sellerListing.quantity_remaining
		) {
			throw new Error(
				`Tried to buy ${quantityToBuy} but buyer has ${buyerListing.quantity_remaining} remaining and seller has ${sellerListing.quantity_remaining} remaining`
			);
		}

		let pricePerItem: number = -1;
		if (buyerListing.created_at < sellerListing.created_at) {
			pricePerItem = Number(buyerListing.asking_price_per_item);
		} else {
			pricePerItem = Number(sellerListing.asking_price_per_item);
		}
		validateNumber(pricePerItem);

		const totalPrice = quantityToBuy * pricePerItem;
		validateNumber(totalPrice);

		const newBuyerListingQuantityRemaining = buyerListing.quantity_remaining - quantityToBuy;
		const newSellerListingQuantityRemaining = sellerListing.quantity_remaining - quantityToBuy;
		validateNumber(newBuyerListingQuantityRemaining);
		validateNumber(newSellerListingQuantityRemaining);

		const buyerLoot = new Bank().add(buyerListing.item_id, quantityToBuy);
		const sellerLoot = new Bank().add('Coins', totalPrice);

		let sellerGPRefundAmount: number | undefined = undefined;
		let buyerGPRefundAmount: number | undefined = undefined;

		if (buyerListing.asking_price_per_item > sellerListing.asking_price_per_item) {
			const priceDifference = buyerListing.asking_price_per_item - sellerListing.asking_price_per_item;
			const extraAmount = quantityToBuy * priceDifference;
			validateNumber(extraAmount);
			const extraLoot = new Bank().add('Coins', extraAmount);
			sellerLoot.add(extraLoot);

			logContext = {
				...logContext,
				priceDifference: priceDifference.toString(),
				extraAmount: extraAmount.toString(),
				extraLoot: extraLoot.toString()
			};
		}

		logContext = {
			...logContext,
			newBuyerListingQuantityRemaining: newBuyerListingQuantityRemaining.toString(),
			newSellerListingQuantityRemaining: newSellerListingQuantityRemaining.toString(),
			quantityToBuy: quantityToBuy.toString(),
			pricePerItem: pricePerItem.toString(),
			totalPrice: totalPrice.toString(),
			buyerLoot: buyerLoot.toString(),
			sellerLoot: sellerLoot.toString()
		};

		const totalItems = new Bank().add(buyerLoot).add(sellerLoot);

		try {
			validateBankAndThrow(totalItems);
		} catch (err: any) {
			const str = `Buyer/Seller Loot banks are invalid: ${err.message} `;
			await this.lockGE(str);
			logError(str, logContext);
			return;
		}

		const geBank = await fetchOwnedBank();
		if (!geBank.has(totalItems)) {
			const missingItems = totalItems.clone().remove(geBank);
			const str = `The GE did not have enough items to cover this transaction! We tried to remove ${totalItems} missing: ${missingItems}`;
			logError(str, logContext);
			throw new Error(str);
		}

		await prisma.$transaction([
			prisma.gETransaction.create({
				data: {
					buy_listing_id: buyerListing.id,
					sell_listing_id: sellerListing.id,
					quantity_bought: quantityToBuy,
					price_per_item: pricePerItem,
					buyer_refund_amount: buyerGPRefundAmount,
					seller_refund_amount: sellerGPRefundAmount
				}
			}),

			prisma.gEListing.updateMany({
				where: {
					id: buyerListing.id
				},
				data: {
					quantity_remaining: newBuyerListingQuantityRemaining,
					fulfilled_at: newBuyerListingQuantityRemaining === 0 ? new Date() : null
				}
			}),
			prisma.gEListing.updateMany({
				where: {
					id: sellerListing.id
				},
				data: {
					quantity_remaining: newSellerListingQuantityRemaining,
					fulfilled_at: newSellerListingQuantityRemaining === 0 ? new Date() : null
				}
			}),
			prisma.clientStorage.update({
				where: {
					id: globalConfig.clientID
				},
				data: {
					grand_exchange_owned_bank: geBank.remove(totalItems).bank
				},
				select: {
					id: true
				}
			})
		]);

		debugLog(`${logID} Created transaction/updated listings.`, logContext);
		const buyerUser = await mUserFetch(buyerListing.user_id);
		const sellerUser = await mUserFetch(sellerListing.user_id);

		await buyerUser.addItemsToBank({
			items: buyerLoot,
			collectionLog: false,
			dontAddToTempCL: true,
			filterLoot: false
		});
		await sellerUser.addItemsToBank({
			items: sellerLoot,
			collectionLog: false,
			dontAddToTempCL: true,
			filterLoot: false
		});
		debugLog(`${logID} Finished transaction, gave out items.`, logContext);
		const itemName = itemNameFromID(buyerListing.item_id);

		// TODO: dm people about their transaction
		// const djsBuyer = await globalClient.fetchUser(buyerUser.id);
		// const djsSeller = await globalClient.fetchUser(sellerUser.id);
		// await djsBuyer.send(
		// 	`You bought ${quantityToBuy}x ${itemName} for ${totalPrice} GP each, and received ${buyerLoot}.`
		// );
		// await djsSeller.send(
		// 	`You sold ${quantityToBuy}x ${itemName} for ${totalPrice} GP each, and receievd ${sellerLoot}.`
		// );
		await sendToChannelID('1103025439804502137', {
			content: `BuyListingID[${buyerListing.userfacing_id}] SellListingID[${
				sellerListing.userfacing_id
			}] ${buyerUser} bought ${quantityToBuy}x ${itemName} for ${toKMB(
				totalPrice
			)} GP (${pricePerItem} ea) from ${sellerUser}`
		});
	}

	async fetchActiveListings() {
		const [buyListings, sellListings, clientStorage] = await prisma.$transaction([
			prisma.gEListing.findMany({
				where: {
					type: GEListingType.Buy,
					fulfilled_at: null,
					cancelled_at: null
				},
				orderBy: {
					created_at: 'asc'
				}
			}),
			prisma.gEListing.findMany({
				where: {
					type: GEListingType.Sell,
					fulfilled_at: null,
					cancelled_at: null
				},
				orderBy: {
					created_at: 'asc'
				}
			}),
			prisma.clientStorage.findFirst({
				where: { id: globalConfig.clientID },
				select: {
					grand_exchange_is_locked: true
				}
			})
		]);

		if (clientStorage?.grand_exchange_is_locked) {
			this.locked = true;
		} else if (clientStorage?.grand_exchange_is_locked === false) {
			this.locked = false;
		}
		return { buyListings, sellListings };
	}

	async calculateExpectedGEBank() {
		const currentGEBank = await fetchOwnedBank();
		const expectedGEBank = new Bank();

		const buyListings = await prisma.gEListing.findMany({
			where: {
				type: GEListingType.Buy
			}
		});
		const sellListings = await prisma.gEListing.findMany({
			where: {
				type: GEListingType.Sell
			}
		});

		for (const listing of buyListings) {
			const transactionsForThisListing = await prisma.gETransaction.findMany({
				where: {
					buy_listing_id: listing.id
				}
			});
			const totalGP = sumArr(transactionsForThisListing.map(t => t.quantity_bought * t.price_per_item));
			validateNumber(totalGP);
			expectedGEBank.add('Coins', totalGP);
		}

		for (const listing of sellListings) {
			if (listing.cancelled_at) continue;
			const transactionsForThisListing = await prisma.gETransaction.findMany({
				where: {
					sell_listing_id: listing.id
				}
			});

			const totalQuantitySold = sumArr(transactionsForThisListing.map(t => t.quantity_bought));
			const expectedAmount = listing.total_quantity - totalQuantitySold;
			validateNumber(expectedAmount);
			expectedGEBank.add(listing.item_id, expectedAmount);
		}

		const totalRefunds = await prisma.gETransaction.aggregate({
			_sum: {
				seller_refund_amount: true,
				buyer_refund_amount: true
			}
		});

		const totalBuyerRefundAmount = Number(totalRefunds._sum.buyer_refund_amount);
		const totalSellerRefundAmount = Number(totalRefunds._sum.seller_refund_amount);
		validateNumber(totalBuyerRefundAmount);
		validateNumber(totalSellerRefundAmount);
		currentGEBank.remove('Coins', totalBuyerRefundAmount + totalSellerRefundAmount);
		validateBankAndThrow(currentGEBank);
		validateBankAndThrow(expectedGEBank);

		if (!currentGEBank.equals(expectedGEBank)) {
			const str = `Current GE bank does not match expected GE bank! ${currentGEBank.difference(expectedGEBank)}`;
			await this.lockGE(str);
			logError(str);
		}
	}

	async tick() {
		const { buyListings, sellListings } = await this.fetchActiveListings();
		if (this.locked) return;
		// await this.calculateExpectedGEBank();

		const allListings = [...buyListings, ...sellListings];
		for (const listing of allListings) {
			try {
				sanityCheckListing(listing);
			} catch (err: any) {
				await this.lockGE(err.reason);
				logError(err);
			}
		}
		for (const buyListing of buyListings) {
			const matchingSellListing = sellListings.find(
				sellListing =>
					sellListing.item_id === buyListing.item_id &&
					// "Trades succeed when one player's buy offer is greater than or equal to another player's sell offer."
					buyListing.asking_price_per_item >= sellListing.asking_price_per_item &&
					buyListing.user_id !== sellListing.user_id
			);
			if (!matchingSellListing) continue;
			try {
				const { remainingItemsCanBuy } = await this.checkBuyLimitForListing(buyListing);
				if (remainingItemsCanBuy === 0) continue;
				await this.createTransaction(buyListing, matchingSellListing, remainingItemsCanBuy);
			} catch (err: any) {
				await this.lockGE(err.message);
				logError(err);
			}

			// Process only one transaction per tick
			break;
		}
	}
}

export const GrandExchange = new GrandExchangeSingleton();
