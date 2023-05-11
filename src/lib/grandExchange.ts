import { GEListing, GEListingType, GETransaction } from '@prisma/client';
import { userMention } from 'discord.js';
import { calcPercentOfNum, clamp, noOp, sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import PQueue from 'p-queue';

import { ADMIN_IDS, OWNER_IDS, production } from '../config';
import { globalConfig } from './constants';
import { prisma } from './settings/prisma';
import { fetchTableBank, makeTransactFromTableBankQueries, transactFromTableBank } from './tableBank';
import { assert, generateGrandExchangeID, itemNameFromID, toKMB, validateBankAndThrow } from './util';
import { mahojiClientSettingsUpdate } from './util/clientSettings';
import getOSItem, { getItem } from './util/getOSItem';
import { logError } from './util/logError';
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

function sanityCheckTransaction({
	id,
	total_tax_paid,
	tax_rate_percent,
	price_per_item_after_tax,
	price_per_item_before_tax
}: GETransaction) {
	if (price_per_item_before_tax < price_per_item_after_tax) {
		throw new Error(`Transaction ${id} has price before tax less than price after tax.`);
	}

	assert(
		Number(total_tax_paid) === Number(price_per_item_before_tax) - Number(price_per_item_after_tax),
		`Transaction ${id} total_tax_paid should equal price_per_item_before_tax - price_per_item_after_tax. Transaction ${id} has ${total_tax_paid} total_tax_paid, ${price_per_item_before_tax} price_per_item_before_tax, and ${price_per_item_after_tax} price_per_item_after_tax.`
	);

	validateNumber(tax_rate_percent);
}

class GrandExchangeSingleton {
	public queue = new PQueue({ concurrency: 1 });
	public locked = false;
	public taxRatePercentage = 1;
	public isTicking = false;
	public config = {
		buyLimit: {
			interval: Time.Minute * 5, // Time.Hour * 4,
			fallbackBuyLimit: (item: Item) => (item.price > 1_000_000 ? 1 : 1000)
		},
		tax: {
			// Tax per item
			rate: () => {
				return 1;
			},
			// Max tax per item
			cap: () => {
				return 5_000_000;
			}
		}
	};

	getInterval() {
		const currentTime = new Date();
		const minutes = currentTime.getMinutes();
		const startInterval = new Date(currentTime);
		startInterval.setMinutes(minutes - (minutes % 5), 0, 0);
		const endInterval = new Date(startInterval);
		endInterval.setMinutes(startInterval.getMinutes() + 5);

		return {
			start: startInterval,
			end: endInterval
		};
	}

	async fetchOwnedBank() {
		const geBank = await fetchTableBank('ge_bank');
		return geBank;
	}

	calculateTaxForTransaction({ pricePerItem }: { pricePerItem: number }) {
		const rate = this.config.tax.rate();
		let amount = calcPercentOfNum(rate, pricePerItem);
		amount = Math.floor(amount);
		amount = clamp(amount, 0, this.config.tax.cap());
		validateNumber(amount);
		return {
			taxedAmount: amount,
			rate
		};
	}

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
		const interval = this.getInterval();

		const allActiveListingsInTimePeriod = await prisma.gETransaction.findMany({
			where: {
				buy_listing: {
					user_id: geListing.user_id,
					item_id: geListing.item_id
				},
				created_at: {
					gte: interval.start,
					lt: interval.end
				}
			}
		});

		for (const tx of allActiveListingsInTimePeriod) sanityCheckTransaction(tx);

		const item = getOSItem(geListing.item_id);
		const buyLimit = item.buy_limit ?? this.config.buyLimit.fallbackBuyLimit(item);
		const totalSold = sumArr(allActiveListingsInTimePeriod.map(listing => listing.quantity_bought));
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

		await transactFromTableBank({ table: prisma.gEBank, bankToAdd: cost });

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
		assert(remainingItemsInBuyLimit !== 0, 'Buyer has 0 remaining items in buy limit.');

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

		let pricePerItemBeforeTax: number = -1;
		if (buyerListing.created_at < sellerListing.created_at) {
			pricePerItemBeforeTax = Number(buyerListing.asking_price_per_item);
		} else {
			pricePerItemBeforeTax = Number(sellerListing.asking_price_per_item);
		}
		const totalPriceBeforeTax = quantityToBuy * pricePerItemBeforeTax;
		validateNumber(pricePerItemBeforeTax);
		validateNumber(totalPriceBeforeTax);

		const { taxedAmount, rate } = this.calculateTaxForTransaction({ pricePerItem: pricePerItemBeforeTax });
		const pricePerItemAfterTax = pricePerItemBeforeTax - taxedAmount;
		const totalPriceAfterTax = quantityToBuy * pricePerItemAfterTax;

		validateNumber(pricePerItemAfterTax);
		validateNumber(totalPriceAfterTax);
		assert(
			pricePerItemAfterTax <= pricePerItemBeforeTax,
			`Price per item after tax (${pricePerItemAfterTax}) is greater than price per item before tax (${pricePerItemBeforeTax})`
		);
		assert(
			totalPriceAfterTax <= totalPriceBeforeTax,
			`Total price after tax (${totalPriceAfterTax}) is greater than total price before tax (${totalPriceBeforeTax})`
		);

		const newBuyerListingQuantityRemaining = buyerListing.quantity_remaining - quantityToBuy;
		const newSellerListingQuantityRemaining = sellerListing.quantity_remaining - quantityToBuy;
		validateNumber(newBuyerListingQuantityRemaining);
		validateNumber(newSellerListingQuantityRemaining);

		const buyerLoot = new Bank().add(buyerListing.item_id, quantityToBuy);
		const sellerLoot = new Bank().add('Coins', totalPriceAfterTax);

		const totalItems = new Bank().add(buyerLoot).add(sellerLoot);

		try {
			validateBankAndThrow(totalItems);
		} catch (err: any) {
			const str = `Buyer/Seller Loot banks are invalid: ${err.message} `;
			await this.lockGE(str);
			logError(str, logContext);
			return;
		}

		const geBank = await this.fetchOwnedBank();
		if (!geBank.has(totalItems)) {
			const missingItems = totalItems.clone().remove(geBank);
			const str = `The GE did not have enough items to cover this transaction! We tried to remove ${totalItems} missing: ${missingItems}`;
			logError(str, logContext);
			throw new Error(str);
		}

		assert(
			totalPriceBeforeTax >= totalPriceAfterTax,
			`Price before tax (${totalPriceBeforeTax}) is not greater than price after tax (${totalPriceAfterTax})`
		);
		const totalTaxPaid = totalPriceBeforeTax - totalPriceAfterTax;
		validateNumber(totalTaxPaid);

		const taxedGP = new Bank().add('Coins', totalTaxPaid);
		const bankToRemoveFromGeBank = new Bank().add(totalItems).add(taxedGP);

		const [, newBuyerListing, newSellingListing] = await prisma.$transaction([
			prisma.gETransaction.create({
				data: {
					buy_listing_id: buyerListing.id,
					sell_listing_id: sellerListing.id,
					quantity_bought: quantityToBuy,
					price_per_item_before_tax: pricePerItemBeforeTax,
					price_per_item_after_tax: pricePerItemAfterTax,
					total_tax_paid: totalTaxPaid,
					tax_rate_percent: rate
				}
			}),
			prisma.gEListing.update({
				where: {
					id: buyerListing.id
				},
				data: {
					quantity_remaining: newBuyerListingQuantityRemaining,
					fulfilled_at: newBuyerListingQuantityRemaining === 0 ? new Date() : null
				}
			}),
			prisma.gEListing.update({
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
					grand_exchange_tax_bank: {
						increment: totalTaxPaid
					},
					grand_exchange_total_tax: {
						increment: totalTaxPaid
					}
				},
				select: {
					id: true
				}
			}),
			...makeTransactFromTableBankQueries({ table: prisma.gEBank, bankToRemove: bankToRemoveFromGeBank })
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

		await sendToChannelID('1103025439804502137', {
			content: `BuyListingID[${buyerListing.userfacing_id}] SellListingID[${
				sellerListing.userfacing_id
			}] ${buyerUser} bought ${quantityToBuy}x ${itemName} for ${toKMB(
				totalPriceBeforeTax
			)} GP from ${sellerUser}. The seller received ${toKMB(totalPriceAfterTax)}. There are ${
				newBuyerListing.quantity_remaining
			}x remaining in the buy border, ${newSellingListing.quantity_remaining}x remaining in the sell order. ${
				remainingItemsInBuyLimit - quantityToBuy
			}x remaining in buy limit.`
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

	private async checkGECanFullFilAllListings() {
		const shouldHave = new Bank();
		const { buyListings, sellListings } = await this.fetchActiveListings();
		for (const listing of buyListings) {
			shouldHave.add('Coins', listing.asking_price_per_item * listing.quantity_remaining);
		}

		for (const listing of sellListings) {
			shouldHave.add(listing.item_id, listing.quantity_remaining);
		}

		const ownedBank = await this.fetchOwnedBank();
		if (!ownedBank.equals(shouldHave)) {
			throw new Error(
				`GE doesn't have the items to cover the active listings. The GE has ${ownedBank} but should have ${shouldHave}. Difference: ${shouldHave.difference(
					ownedBank
				)}`
			);
		} else {
			console.log(
				`GE has the items to cover the ${
					[...buyListings, ...sellListings].length
				}x active listings! Difference: ${shouldHave.difference(ownedBank)}`
			);
		}
	}

	private async calculateExpectedGEBank() {
		const currentGEBank = await this.fetchOwnedBank();
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
			for (const tx of transactionsForThisListing) sanityCheckTransaction(tx);
			const totalGP = sumArr(transactionsForThisListing.map(t => t.quantity_bought * t.price_per_item_after_tax));
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

		validateBankAndThrow(currentGEBank);
		validateBankAndThrow(expectedGEBank);

		if (!currentGEBank.equals(expectedGEBank)) {
			const str = `Current GE bank does not match expected GE bank! ${currentGEBank.difference(expectedGEBank)}`;
			await this.lockGE(str);
			logError(str);
		}
	}

	async tick() {
		await this.queue.add(async () => {
			if (this.isTicking) throw new Error('Already ticking.');
			try {
				await this._tick();
			} finally {
				this.isTicking = false;
			}
		});
	}

	private async _tick() {
		const { buyListings, sellListings } = await this.fetchActiveListings();
		if (this.locked) return;
		// await this.calculateExpectedGEBank();
		await this.checkGECanFullFilAllListings();

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
				break;
			}

			// Process only one transaction per tick
			break;
		}
	}
}

export const GrandExchange = new GrandExchangeSingleton();
