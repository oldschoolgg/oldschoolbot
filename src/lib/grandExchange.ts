import { GEListing, GEListingType } from '@prisma/client';
import { Bank } from 'oldschooljs';
import PQueue from 'p-queue';

import { globalConfig } from './constants';
import { prisma } from './settings/prisma';
import { ItemBank } from './types';
import { assert, generateGrandExchangeID, itemNameFromID, toKMB } from './util';
import { mahojiClientSettingsFetch } from './util/clientSettings';
import { getItem } from './util/getOSItem';
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

class GrandExchangeSingleton {
	public queue = new PQueue({ concurrency: 1 });

	async createListing({
		user,
		itemName,
		price,
		quantity,
		type
	}: CreateListingArgs): Promise<{ error: string } | { createdListing: GEListing; error: null }> {
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

	private async createTransaction(buyerListing: GEListing, sellerListing: GEListing) {
		const logID = `GE Transaction ${buyerListing.id} <-> ${sellerListing.id}`;
		debugLog(`${logID} Starting transaction.`);
		assert(buyerListing.type !== sellerListing.type, 'Buyer and seller listings are the same type.');
		assert(sellerListing.type === 'Sell' && buyerListing.type === 'Buy', 'Wrong listing types');
		assert(buyerListing.item_id === sellerListing.item_id, 'Buyer and seller listings are not for the same item.');
		assert(buyerListing.asking_price_per_item >= sellerListing.asking_price_per_item, 'Buy price < sell price');
		assert(buyerListing.quantity_remaining > 0, 'Buyer listing has 0 quantity remaining.');
		assert(sellerListing.quantity_remaining > 0, 'Seller listing has 0 quantity remaining.');
		assert(buyerListing.user_id !== sellerListing.user_id, 'Buyer and seller are the same user.');

		const quantityToBuy = Math.min(buyerListing.quantity_remaining, sellerListing.quantity_remaining);
		validateNumber(quantityToBuy);
		const pricePerItem = Number(sellerListing.asking_price_per_item);
		const totalPrice = quantityToBuy * pricePerItem;
		validateNumber(totalPrice);

		const newBuyerListingQuantityRemaining = buyerListing.quantity_remaining - quantityToBuy;
		const newSellerListingQuantityRemaining = sellerListing.quantity_remaining - quantityToBuy;
		validateNumber(newBuyerListingQuantityRemaining);
		validateNumber(newSellerListingQuantityRemaining);

		const buyerLoot = new Bank().add(buyerListing.item_id, quantityToBuy);
		const sellerLoot = new Bank().add('Coins', totalPrice);

		const totalItems = new Bank().add(buyerLoot).add(sellerLoot);
		const geBank = await fetchOwnedBank();
		if (!geBank.has(totalItems)) {
			logError(`The GE did not have enough items to cover this transaction!!! ${totalItems}`, {
				buyerListingID: buyerListing.id.toString(),
				sellerListingID: sellerListing.id.toString()
			});
			throw new Error('The GE did not have enough items to cover this transaction!');
		}

		await prisma.$transaction([
			prisma.gETransaction.create({
				data: {
					buy_listing_id: buyerListing.id,
					sell_listing_id: sellerListing.id,
					quantity_bought: quantityToBuy,
					price_per_item: pricePerItem
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

		debugLog(`${logID} Created transaction/updated listings.`);
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
		debugLog(`${logID} Finished transaction, gave out items.`);
		const itemName = itemNameFromID(buyerListing.item_id);

		// const djsBuyer = await globalClient.fetchUser(buyerUser.id);
		// const djsSeller = await globalClient.fetchUser(sellerUser.id);
		// await djsBuyer.send(
		// 	`You bought ${quantityToBuy}x ${itemName} for ${totalPrice} GP each, and received ${buyerLoot}.`
		// );
		// await djsSeller.send(
		// 	`You sold ${quantityToBuy}x ${itemName} for ${totalPrice} GP each, and receievd ${sellerLoot}.`
		// );
		await sendToChannelID('1103025439804502137', {
			content: `${buyerUser} bought ${quantityToBuy}x ${itemName} for ${toKMB(
				totalPrice
			)} GP (${pricePerItem} ea) from ${sellerUser}`
		});
	}

	async fetchActiveListings() {
		const buyListings = await prisma.gEListing.findMany({
			where: {
				type: GEListingType.Buy,
				fulfilled_at: null,
				cancelled_at: null
			},
			orderBy: {
				created_at: 'asc'
			}
		});
		const sellListings = await prisma.gEListing.findMany({
			where: {
				type: GEListingType.Sell,
				fulfilled_at: null,
				cancelled_at: null
			},
			orderBy: {
				created_at: 'asc'
			}
		});
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
			if (listing.fulfilled_at) {
				expectedGEBank.add('Coins', listing.quantity_remaining * Number(listing.asking_price_per_item));
			}
		}

		for (const listing of sellListings) {
			if (listing.fulfilled_at) {
				expectedGEBank.add(listing.item_id, listing.quantity_remaining);
			}
		}

		if (!currentGEBank.equals(expectedGEBank)) {
			console.error(
				`Current GE bank does not match expected GE bank! ${currentGEBank.difference(expectedGEBank)}`
			);
		}
	}

	async tick() {
		const { buyListings, sellListings } = await this.fetchActiveListings();

		const allListings = [...buyListings, ...sellListings];
		for (const listing of allListings) {
			sanityCheckListing(listing);
		}
		for (const listing of buyListings) {
			const matchingSellListing = sellListings.find(
				l =>
					l.item_id === listing.item_id &&
					l.asking_price_per_item <= listing.asking_price_per_item &&
					listing.user_id !== l.user_id
			);
			if (!matchingSellListing) continue;
			await this.createTransaction(listing, matchingSellListing);
			break;
		}
	}
}

export const GrandExchange = new GrandExchangeSingleton();
