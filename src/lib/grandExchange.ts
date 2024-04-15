import { GEListing, GEListingType, GETransaction } from '@prisma/client';
import { Stopwatch } from '@sapphire/stopwatch';
import { bold, ButtonBuilder, ButtonStyle, userMention } from 'discord.js';
import { calcPercentOfNum, clamp, noOp, sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import PQueue from 'p-queue';

import { ADMIN_IDS, OWNER_IDS, production } from '../config';
import { BLACKLISTED_USERS } from './blacklists';
import { BitField, globalConfig, ONE_TRILLION, PerkTier } from './constants';
import { marketPricemap } from './marketPrices';
import { RobochimpUser, roboChimpUserFetch } from './roboChimp';
import { prisma } from './settings/prisma';
import { fetchTableBank, makeTransactFromTableBankQueries } from './tableBank';
import { assert, generateGrandExchangeID, getInterval, itemNameFromID, makeComponents, toKMB } from './util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from './util/clientSettings';
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
	if (num < 0 || isNaN(num) || !Number.isInteger(num) || num >= Number.MAX_SAFE_INTEGER) {
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
	validateNumber(Number(listing.asking_price_per_item));
	validateNumber(Number(listing.total_quantity));
	validateNumber(Number(listing.gp_refunded));
}

function sanityCheckTransaction({
	id,
	total_tax_paid,
	tax_rate_percent,
	price_per_item_after_tax,
	price_per_item_before_tax,
	quantity_bought
}: GETransaction) {
	if (price_per_item_before_tax < price_per_item_after_tax) {
		throw new Error(`Transaction ${id} has price before tax less than price after tax.`);
	}

	validateNumber(Number(price_per_item_before_tax));
	validateNumber(Number(price_per_item_before_tax));
	validateNumber(Number(total_tax_paid));

	assert(
		Number(total_tax_paid) ===
			(Number(price_per_item_before_tax) - Number(price_per_item_after_tax)) * quantity_bought,
		`Transaction ${id} total_tax_paid should equal price_per_item_before_tax - price_per_item_after_tax. Transaction ${id} has ${total_tax_paid} total_tax_paid, ${price_per_item_before_tax} price_per_item_before_tax, and ${price_per_item_after_tax} price_per_item_after_tax.`
	);

	validateNumber(tax_rate_percent);
}

export function createGECancelButton(listing: GEListing) {
	const button = new ButtonBuilder()
		.setCustomId(`ge_cancel_${listing.userfacing_id}`)
		.setLabel(
			`Cancel ${listing.type} ${toKMB(listing.total_quantity)} ${itemNameFromID(listing.item_id)}`.slice(0, 79)
		)
		.setStyle(ButtonStyle.Secondary);

	return button;
}

class GrandExchangeSingleton {
	public queue = new PQueue({ concurrency: 1 });
	public locked = false;
	public isTicking = false;
	public ready = false;

	public config = {
		maxPricePerItem: ONE_TRILLION,
		maxTotalPrice: ONE_TRILLION,
		buyLimit: {
			interval: Time.Hour * 4,
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
		},
		slots: {
			slotBoosts: [
				{
					has: () => true,
					name: 'Base',
					amount: 3
				},
				...[100, 250, 1000, 2000].map(num => ({
					has: (user: MUser) => user.totalLevel >= num,
					name: `${num} Total Level`,
					amount: 1
				})),
				...[30, 60, 90, 95].map(num => ({
					has: (_: MUser, robochimpUser: RobochimpUser) =>
						robochimpUser.osb_cl_percent && robochimpUser.osb_cl_percent >= num,
					name: `${num}% CL Completion`,
					amount: 1
				})),
				...[10_000, 20_000, 30_000].map(num => ({
					has: (_: MUser, robochimpUser: RobochimpUser) => robochimpUser.leagues_points_total >= num,
					name: `${num.toLocaleString()} Leagues Points`,
					amount: 1
				})),
				{
					has: (user: MUser) => user.perkTier() >= PerkTier.Four,
					name: 'Tier 3 Patron',
					amount: 10
				}
			]
		}
	};

	async init() {
		try {
			await this.fetchOwnedBank();
			await this.extensiveVerification();
			await this.checkGECanFullFilAllListings();
		} catch (err: any) {
			await this.lockGE(err.message);
		} finally {
			this.ready = true;
		}
	}

	async calculateSlotsOfUser(user: MUser) {
		const robochimpUser = await roboChimpUserFetch(user.id);
		let slots = 0;
		const doesntHaveNames = [];
		let possibleExtra = 0;
		let maxPossible = 0;
		for (const boost of this.config.slots.slotBoosts) {
			maxPossible += boost.amount;
			if (boost.has(user, robochimpUser)) {
				slots += boost.amount;
			} else {
				doesntHaveNames.push(boost.name);
				possibleExtra += boost.amount;
			}
		}
		return { slots, doesntHaveNames, possibleExtra, maxPossible };
	}

	getInterval() {
		return getInterval(4);
	}

	async fetchOwnedBank() {
		const geBank = await fetchTableBank();
		return geBank;
	}

	calculateTaxForTransaction({ pricePerItem }: { pricePerItem: number }) {
		const rate = this.config.tax.rate();
		let amount = calcPercentOfNum(rate, pricePerItem);
		amount = Math.floor(amount);
		amount = clamp(amount, 0, this.config.tax.cap());
		validateNumber(amount);

		const newPrice = pricePerItem - amount;
		validateNumber(newPrice);

		return {
			taxedAmount: amount,
			rate,
			newPrice
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

	async preCreateListing({
		user,
		itemName,
		price,
		quantity,
		type
	}: CreateListingArgs): Promise<
		{ error: string } | { confirmationStr: string; cost: Bank; price: number; quantity: number; item: Item }
	> {
		if (this.locked || !this.ready) {
			return { error: 'The Grand Exchange is temporarily closed! Sorry, please try again later.' };
		}
		if (user.isIronman) return { error: "You're an ironman." };
		const item = getItem(itemName);
		if (!item || !item.tradeable_on_ge || ['Coins'].includes(item.name)) {
			return { error: 'Invalid item.' };
		}

		if (!price || price <= 0 || isNaN(price) || !Number.isInteger(price) || price > this.config.maxPricePerItem) {
			return {
				error: `Invalid price, the price must be a number between 1 and ${toKMB(this.config.maxPricePerItem)}.`
			};
		}
		if (!quantity || quantity <= 0 || isNaN(quantity) || !Number.isInteger(quantity) || quantity > 5_000_000) {
			return { error: 'Invalid quantity, the quantity must be a number between 1 and 5m.' };
		}

		if (price * quantity > this.config.maxTotalPrice) {
			return {
				error: `You cannot make a listing with a total price of more than ${toKMB(this.config.maxTotalPrice)}.`
			};
		}

		const theirCurrentListings = await prisma.gEListing.findMany({
			where: {
				user_id: user.id,
				cancelled_at: null,
				fulfilled_at: null
			}
		});
		const { slots, doesntHaveNames, possibleExtra } = await this.calculateSlotsOfUser(user);
		if (theirCurrentListings.length >= slots) {
			let str = `You can't make this listing, because all your slots are full. You have ${theirCurrentListings.length} active listings, and ${slots} slots. One of your slots needs to be cancelled or fulfilled before you can make another.`;
			if (possibleExtra > 0) {
				str += `\n\nYou can get ${possibleExtra} extra slots through: ${doesntHaveNames.join(', ')}.`;
			}

			return { error: str };
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

		const applicableTax = this.calculateTaxForTransaction({ pricePerItem: price });

		const total = price * quantity;
		const totalAfterTax = applicableTax.newPrice * quantity;

		let confirmationStr = `Are you sure you want to create this listing?

${type} ${toKMB(quantity)} ${item.name} for ${toKMB(price)} each, for a total of ${toKMB(total)}.${
			type === 'Buy'
				? ''
				: applicableTax.taxedAmount > 0
				? ` At this price, you will receive ${toKMB(totalAfterTax)} after taxes.`
				: ' No tax will be charged on these items.'
		}`;

		const guidePrice = marketPricemap.get(item.id);
		if (guidePrice) {
			confirmationStr += bold(
				`\n\n💰 The current estimated market value for this item is ${toKMB(guidePrice.guidePrice)} GP.`
			);
		}

		return {
			confirmationStr,
			cost,
			item,
			price,
			quantity
		};
	}

	async createListing({
		user,
		itemName,
		price,
		quantity,
		type
	}: CreateListingArgs): Promise<{ error: string } | { createdListing: GEListing; error: null }> {
		return this.queue.add(async () => {
			const result = await this.preCreateListing({ user, itemName, price, quantity, type });
			if ('error' in result) return result;

			await user.removeItemsFromBank(result.cost);

			const [listing] = await prisma.$transaction([
				prisma.gEListing.create({
					data: {
						user_id: user.id,
						item_id: result.item.id,
						asking_price_per_item: price,
						total_quantity: quantity,
						type,
						quantity_remaining: quantity,
						userfacing_id: generateGrandExchangeID()
					}
				}),
				...makeTransactFromTableBankQueries({ bankToAdd: result.cost })
			]);

			debugLog(`${user.id} created ${type} listing, removing ${result.cost}, adding it to the g.e bank.`);

			return {
				createdListing: listing,
				error: null
			};
		});
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
		assert(buyerListing.type !== sellerListing.type, 'Buyer and seller listings are the same type.');
		assert(sellerListing.type === 'Sell' && buyerListing.type === 'Buy', 'Wrong listing types');
		assert(buyerListing.item_id === sellerListing.item_id, 'Buyer and seller listings are not for the same item.');
		assert(buyerListing.quantity_remaining > 0, 'Buyer listing has 0 quantity remaining.');
		assert(sellerListing.quantity_remaining > 0, 'Seller listing has 0 quantity remaining.');
		assert(buyerListing.user_id !== sellerListing.user_id, 'Buyer and seller are the same user.');
		assert(remainingItemsInBuyLimit !== 0, 'Buyer has 0 remaining items in buy limit.');
		assert(sellerListing.user_id !== null, 'null seller listing user id');
		assert(buyerListing.user_id !== null, 'null buyer listing user id');
		if (buyerListing.user_id === null || sellerListing.user_id === null) {
			throw new Error('null user id');
		}

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

		let priceWinner: 'buyer' | 'seller' = 'buyer';
		let pricePerItemBeforeTax: number = -1;
		if (buyerListing.created_at < sellerListing.created_at) {
			pricePerItemBeforeTax = Number(buyerListing.asking_price_per_item);
			priceWinner = 'buyer';
		} else {
			pricePerItemBeforeTax = Number(sellerListing.asking_price_per_item);
			priceWinner = 'seller';
		}
		const totalPriceBeforeTax = quantityToBuy * pricePerItemBeforeTax;
		validateNumber(pricePerItemBeforeTax);
		validateNumber(totalPriceBeforeTax);

		const { taxedAmount, rate } = this.calculateTaxForTransaction({ pricePerItem: pricePerItemBeforeTax });
		assert(taxedAmount >= 0, 'Taxed amount is less than 0.');
		assert(taxedAmount <= pricePerItemBeforeTax, 'Taxed amount is greater than price per item.');
		validateNumber(taxedAmount);
		validateNumber(rate);

		const pricePerItemAfterTax = pricePerItemBeforeTax - taxedAmount;
		validateNumber(pricePerItemAfterTax);

		const totalPriceAfterTax = pricePerItemAfterTax * quantityToBuy;
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

		assert(
			totalPriceBeforeTax >= totalPriceAfterTax,
			`Price before tax (${totalPriceBeforeTax}) is not greater than price after tax (${totalPriceAfterTax})`
		);
		const totalTaxPaid = totalPriceBeforeTax - totalPriceAfterTax;
		validateNumber(totalTaxPaid);

		const buyerLoot = new Bank().add(buyerListing.item_id, quantityToBuy);
		const sellerLoot = new Bank().add('Coins', totalPriceAfterTax);
		const bankToRemoveFromGeBank = new Bank().add(buyerLoot).add(sellerLoot);
		bankToRemoveFromGeBank.add('Coins', totalTaxPaid);

		let buyerRefund = 0;
		if (buyerListing.asking_price_per_item > sellerListing.asking_price_per_item) {
			const buyerPricePerItemBeforeTax = buyerListing.asking_price_per_item;
			const totalAmountToRemove = Number(buyerPricePerItemBeforeTax) * quantityToBuy;
			buyerRefund = totalAmountToRemove - totalPriceBeforeTax;

			validateNumber(buyerRefund);
			buyerLoot.add('Coins', buyerRefund);
			bankToRemoveFromGeBank.add('Coins', buyerRefund);

			debugLog(
				`Buyer got refunded ${buyerRefund} GP due to price difference. Buyer was asking ${buyerListing.asking_price_per_item}GP for each of the ${quantityToBuy}x items, seller was asking ${sellerListing.asking_price_per_item}GP, and the post-tax price per item was ${pricePerItemAfterTax}`,
				logContext
			);
		}

		const geBank = await this.fetchOwnedBank();
		const bankGEShouldHave = bankToRemoveFromGeBank.clone();

		const debug = `PriceWinner[${priceWinner}] PricePerItemBeforeTax[${pricePerItemBeforeTax}] PricePerItemAfterTax[${pricePerItemAfterTax}] BuyerPrice[${
			buyerListing.asking_price_per_item
		}] SellerPrice[${
			sellerListing.asking_price_per_item
		}] TotalPriceBeforeTax[${totalPriceBeforeTax}] QuantityToBuy[${quantityToBuy}] TotalTaxPaid[${totalTaxPaid}] BuyerRefund[${buyerRefund}] BuyerLoot[${buyerLoot}] SellerLoot[${sellerLoot}] CurrentGEBank[${geBank}] BankToRemoveFromGeBank[${bankToRemoveFromGeBank}] ExpectedAfterBank[${geBank
			.clone()
			.remove(bankToRemoveFromGeBank)}]`;

		assert(
			bankToRemoveFromGeBank.amount('Coins') === Number(buyerListing.asking_price_per_item) * quantityToBuy,
			`The G.E Must be removing the full amount the buyer put in, otherwise there's extra/notenough GP leftover in their buyerListing. Expected to be removing ${
				Number(buyerListing.asking_price_per_item) * quantityToBuy
			}, but we're removing ${bankToRemoveFromGeBank.amount('Coins')} ${debug}`
		);

		if (!geBank.has(bankGEShouldHave)) {
			const missingItems = bankGEShouldHave.clone().remove(geBank);
			const str = `The GE did not have enough items to cover this transaction! We tried to remove ${bankGEShouldHave} missing: ${missingItems}. ${debug}`;
			logError(str, logContext);
			debugLog(str, logContext);
			throw new Error(str);
		}

		debugLog(
			`Completing a transaction, removing ${bankToRemoveFromGeBank} from the GE bank, ${totalTaxPaid} in taxed gp. The current GE bank is ${geBank.toString()}. ${debug}`,
			{
				totalPriceAfterTax,
				totalTaxPaid,
				totalPriceBeforeTax,
				bankToRemoveFromGeBank: bankToRemoveFromGeBank.toString(),
				currentGEBank: geBank.toString()
			}
		);

		await prisma.$transaction([
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
					fulfilled_at: newBuyerListingQuantityRemaining === 0 ? new Date() : null,
					gp_refunded: buyerRefund
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
			...makeTransactFromTableBankQueries({ bankToRemove: bankToRemoveFromGeBank })
		]);

		debugLog(`Transaction completed, the new G.E bank is ${await this.fetchOwnedBank()}.`);

		const buyerUser = await mUserFetch(buyerListing.user_id);
		const sellerUser = await mUserFetch(sellerListing.user_id);

		await buyerUser.addItemsToBank({
			items: buyerLoot,
			collectionLog: false,
			dontAddToTempCL: true,
			filterLoot: false,
			neverUpdateHistory: true
		});
		await sellerUser.addItemsToBank({
			items: sellerLoot,
			collectionLog: false,
			dontAddToTempCL: true,
			filterLoot: false,
			neverUpdateHistory: true
		});

		const itemName = itemNameFromID(buyerListing.item_id)!;

		const disableDMsButton = new ButtonBuilder()
			.setCustomId('ge_cancel_dms')
			.setLabel('Disable These DMs')
			.setStyle(ButtonStyle.Secondary);

		const buyerDJSUser = await globalClient.fetchUser(buyerListing.user_id).catch(noOp);
		if (buyerDJSUser && !buyerUser.bitfield.includes(BitField.DisableGrandExchangeDMs)) {
			let str = `You bought ${quantityToBuy.toLocaleString()}x ${itemName} for ${toKMB(
				pricePerItemAfterTax
			)} GP each, for a total of ${toKMB(totalPriceAfterTax)} GP${totalTaxPaid > 0 ? ', after tax' : ''}.`;
			if (totalTaxPaid > 0) {
				str += ` ${toKMB(totalTaxPaid)} GP in tax was paid.`;
			} else {
				str += ' No tax was paid.';
			}
			if (buyerRefund) {
				str += ` ${toKMB(buyerRefund)} GP was refunded to you, because you offered more than the seller.`;
			}

			str += ` You received ${buyerLoot}.`;

			if (newBuyerListingQuantityRemaining === 0) {
				str += ` ${bold('This listing has now been fully fulfilled.')}`;
			} else {
				str += ` There are ${newBuyerListingQuantityRemaining}x remaining to buy in your listing.`;
			}

			const remainingBuyLimit = remainingItemsInBuyLimit - quantityToBuy;
			if (remainingBuyLimit <= 0) {
				str += ` You have reached your buy limit for this item, your buy limit will reset at ${
					this.getInterval().nextResetStr
				}.`;
			}

			const components = [disableDMsButton];
			if (newBuyerListingQuantityRemaining > 0) {
				components.push(createGECancelButton(buyerListing));
			}

			await buyerDJSUser.send({ content: str, components: makeComponents(components) }).catch(noOp);
		}

		const sellerDJSUser = await globalClient.fetchUser(sellerListing.user_id).catch(noOp);
		if (sellerDJSUser && !sellerUser.bitfield.includes(BitField.DisableGrandExchangeDMs)) {
			let str = `You sold ${quantityToBuy.toLocaleString()}x ${itemName} for ${toKMB(
				pricePerItemAfterTax
			)} GP each and received ${sellerLoot}.`;
			if (totalTaxPaid > 0) {
				str += ` ${toKMB(totalTaxPaid)} GP in tax was paid.`;
			} else {
				str += ' No tax was paid.';
			}

			const components = [disableDMsButton];
			if (newSellerListingQuantityRemaining > 0) {
				components.push(createGECancelButton(sellerListing));
				str += `\n\nYou have ${newSellerListingQuantityRemaining}x remaining to sell in your listing.`;
			} else {
				str += '\n\nThis listing has now been fully fulfilled.';
			}

			await sellerDJSUser.send({ content: str, components: makeComponents(components) }).catch(noOp);
		}
	}

	async fetchActiveListings() {
		const [buyListings, sellListings, clientStorage, currentBankRaw] = await prisma.$transaction([
			prisma.gEListing.findMany({
				where: {
					type: GEListingType.Buy,
					fulfilled_at: null,
					cancelled_at: null,
					user_id: { not: null }
				},
				orderBy: [
					{
						asking_price_per_item: 'desc'
					},
					{
						created_at: 'asc'
					}
				]
			}),
			prisma.gEListing.findMany({
				where: {
					type: GEListingType.Sell,
					fulfilled_at: null,
					cancelled_at: null,
					user_id: { not: null }
				},
				orderBy: [
					{
						asking_price_per_item: 'asc'
					},
					{
						created_at: 'asc'
					}
				],
				// Take the last purchase transaction for each sell listing
				include: {
					sellTransactions: {
						orderBy: {
							created_at: 'desc'
						},
						take: 1
					}
				}
			}),
			prisma.clientStorage.findFirst({
				where: { id: globalConfig.clientID },
				select: {
					grand_exchange_is_locked: true
				}
			}),
			prisma.$queryRawUnsafe<{ bank: ItemBank }[]>(
				'SELECT json_object_agg(item_id, quantity) as bank FROM ge_bank WHERE quantity != 0;'
			)
		]);

		if (clientStorage?.grand_exchange_is_locked) {
			this.locked = true;
		} else if (clientStorage?.grand_exchange_is_locked === false) {
			this.locked = false;
		}
		return { buyListings, sellListings, currentBank: new Bank(currentBankRaw[0].bank) };
	}

	async extensiveVerification() {
		const allListings = await prisma.gEListing.findMany();
		for (const listing of allListings) sanityCheckListing(listing);

		const allTransactions = await prisma.gETransaction.findMany();
		for (const transaction of allTransactions) sanityCheckTransaction(transaction);

		await this.checkGECanFullFilAllListings();

		debugLog('Validated GE and found no issues.');

		return true;
	}

	async checkGECanFullFilAllListings() {
		const shouldHave = new Bank();
		const { buyListings, sellListings, currentBank } = await this.fetchActiveListings();

		// How much GP the g.e still has from this listing
		for (const listing of buyListings) {
			shouldHave.add('Coins', Number(listing.asking_price_per_item) * listing.quantity_remaining);
		}

		for (const listing of sellListings) {
			shouldHave.add(listing.item_id, listing.quantity_remaining);
		}

		debugLog(`Expected G.E Bank: ${shouldHave}`);
		if (!currentBank.equals(shouldHave)) {
			if (!currentBank.has(shouldHave)) {
				throw new Error(
					`GE is MISSING items to cover the ${[...buyListings, ...sellListings].length}x active listings.
G.E Bank Has: ${currentBank}
G.E Bank Should Have: ${shouldHave}
Difference: ${shouldHave.difference(currentBank)}`
				);
			}
			throw new Error(`GE has EXTRA items.
G.E Bank Has: ${currentBank}
G.E Bank Should Have: ${shouldHave}
Difference: ${shouldHave.difference(currentBank)}`);
		} else {
			debugLog(
				`GE has ${currentBank}, which is enough to cover the ${
					[...buyListings, ...sellListings].length
				}x active listings! Difference: ${shouldHave.difference(currentBank)}`
			);
			return true;
		}
	}

	async tick() {
		await this.queue.add(async () => {
			if (this.isTicking) throw new Error('Already ticking.');
			try {
				await this._tick();
			} catch (err: any) {
				logError(err.message);
				debugLog(err.message);
				throw err;
			} finally {
				this.isTicking = false;
			}
		});
	}

	async fetchData() {
		const settings = await mahojiClientSettingsFetch({
			grand_exchange_is_locked: true,
			grand_exchange_tax_bank: true,
			grand_exchange_total_tax: true
		});

		const taxBank = Number(settings.grand_exchange_tax_bank);
		validateNumber(taxBank);

		const totalTax = Number(settings.grand_exchange_total_tax);
		validateNumber(totalTax);

		return {
			isLocked: settings.grand_exchange_is_locked,
			taxBank,
			totalTax
		};
	}

	private async _tick() {
		if (!this.ready) return;
		if (this.locked) return;
		const stopwatch = new Stopwatch();
		stopwatch.start();
		const { buyListings: _buyListings, sellListings: _sellListings } = await this.fetchActiveListings();

		// Filter out listings from Blacklisted users:
		const buyListings = _buyListings.filter(l => !BLACKLISTED_USERS.has(l.user_id!));
		const sellListings = _sellListings.filter(l => !BLACKLISTED_USERS.has(l.user_id!));

		for (const buyListing of buyListings) {
			// These are all valid, matching sell listings we can match with this buy listing.
			const matchingSellListings = sellListings.filter(
				sellListing =>
					sellListing.item_id === buyListing.item_id &&
					// "Trades succeed when one player's buy offer is greater than or equal to another player's sell offer."
					buyListing.asking_price_per_item >= sellListing.asking_price_per_item &&
					buyListing.user_id !== sellListing.user_id
			);

			/**
			 * If we have multiple matching sell listings, sort them so we buy from the *least*
			 * active one. To prevent buying over and over from the same person.
			 */
			matchingSellListings.sort((a, b) => {
				const aPrice = a.asking_price_per_item;
				const bPrice = b.asking_price_per_item;
				if (aPrice === bPrice) {
					const aLastSale = a.sellTransactions[0]?.created_at ?? a.created_at;
					const bLastSale = b.sellTransactions[0]?.created_at ?? b.created_at;
					return aLastSale.getTime() - bLastSale.getTime();
				}
				return Number(aPrice - bPrice);
			});

			const matchingSellListing = matchingSellListings[0];
			if (!matchingSellListing) continue;
			try {
				const { remainingItemsCanBuy } = await this.checkBuyLimitForListing(buyListing);
				if (remainingItemsCanBuy === 0) continue;
				await this.createTransaction(buyListing, matchingSellListing, remainingItemsCanBuy);
			} catch (err: any) {
				await this.lockGE(err.message);
				logError(err);
				debugLog(err);
				break;
			}

			// Process only one transaction per tick
			break;
		}

		stopwatch.stop();
	}

	async totalReset() {
		if (production) throw new Error("You can't reset the GE in production.");
		await mahojiClientSettingsUpdate({
			grand_exchange_is_locked: false,
			grand_exchange_tax_bank: 0,
			grand_exchange_total_tax: 0
		});
		await prisma.gEBank.deleteMany();
		await prisma.gETransaction.deleteMany();
		await prisma.gEListing.deleteMany();
	}
}

export const GrandExchange = new GrandExchangeSingleton();
