import { getItem } from '@oldschoolgg/toolkit';
import { evalMathExpression } from '@oldschoolgg/toolkit/dist/util/expressionParser';
import { GEListing, GETransaction } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { sumArr, uniqueArr } from 'e';
import { CommandRunOptions } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';

import { PerkTier } from '../../lib/constants';
import { createGECancelButton, GrandExchange } from '../../lib/grandExchange';
import { marketPricemap } from '../../lib/marketPrices';
import { prisma } from '../../lib/settings/prisma';
import { formatDuration, itemNameFromID, makeComponents, toKMB } from '../../lib/util';
import { lineChart } from '../../lib/util/chart';
import getOSItem from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { cancelGEListingCommand } from '../lib/abstracted_commands/cancelGEListingCommand';
import { itemOption, ownedItemOption, tradeableItemArr } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { patronMsg } from '../mahojiSettings';

type GEListingWithTransactions = GEListing & {
	buyTransactions: GETransaction[];
	sellTransactions: GETransaction[];
};

function parseNumber(str: string) {
	if (typeof str === 'number') str = `${str}`;
	const number = evalMathExpression(str);
	if (!number) return -1;
	return number;
}

function geListingToString(
	listing: GEListingWithTransactions,
	buyLimit?: Awaited<ReturnType<(typeof GrandExchange)['checkBuyLimitForListing']>>
) {
	const item = getOSItem(listing.item_id);
	const allTransactions = [...listing.buyTransactions, ...listing.sellTransactions];
	const verb = listing.type === 'Buy' ? 'Buying' : 'Selling';
	const pastVerb = listing.type === 'Buy' ? 'bought' : 'sold';
	const action = listing.type.toLowerCase();
	const itemQty = `${toKMB(listing.total_quantity)} ${item.name}`;

	const totalSold = listing.total_quantity - listing.quantity_remaining;
	const totalPricePaidSoFar = toKMB(
		sumArr(allTransactions.map(i => i.quantity_bought * Number(i.price_per_item_after_tax)))
	);
	const totalTaxPaidSoFar = toKMB(sumArr(allTransactions.map(i => Number(i.total_tax_paid))));

	if (listing.cancelled_at) {
		return `Cancelled offer to ${action} ${itemQty}. ${totalSold} ${pastVerb}.`;
	}

	if (listing.fulfilled_at) {
		return `Completed offer to ${action} ${itemQty}. ${totalSold} ${pastVerb} for a total amount of ${totalPricePaidSoFar} (${totalTaxPaidSoFar} tax paid).`;
	}

	const buyLimitStr =
		buyLimit !== undefined && buyLimit.remainingItemsCanBuy !== buyLimit.buyLimit
			? ` (${buyLimit.remainingItemsCanBuy.toLocaleString()}/${buyLimit.buyLimit.toLocaleString()} remaining in buy limit currently)`
			: '';

	return `${verb} ${itemQty}, ${toKMB(
		listing.quantity_remaining
	)} are remaining to ${listing.type.toLowerCase()}, asking for ${toKMB(
		Number(listing.asking_price_per_item)
	)} GP each. ${allTransactions.length}x transactions made.${buyLimitStr}`;
}

const quantityOption: CommandOption = {
	name: 'quantity',
	description: 'The quantity of the item to exchange (e.g. 7, 5k, 10m).',
	type: ApplicationCommandOptionType.String,
	required: true
};

const priceOption: CommandOption = {
	name: 'price',
	description: 'The price to exchange each item at. (e.g. 7, 5k, 10m).',
	type: ApplicationCommandOptionType.String,
	required: true
};

export const geCommand: OSBMahojiCommand = {
	name: 'ge',
	description: 'Exchange grandly with other players on the bot!',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Purchase something from the grand exchange.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to pick.',
					required: true,
					autocomplete: async (value, user) => {
						if (!value) {
							const tradesOfUser = (
								await prisma.gEListing.findMany({
									where: {
										user_id: user.id,
										type: 'Buy'
									},
									select: {
										item_id: true
									},
									take: 10
								})
							).map(i => i.item_id);
							return uniqueArr(tradesOfUser).map(itemID => ({
								name: itemNameFromID(itemID)!,
								value: itemID.toString()
							}));
						}
						let res = tradeableItemArr.filter(i => i.key.includes(value.toLowerCase()));
						return res.map(i => ({ name: `${i.name}`, value: i.id.toString() }));
					}
				},
				quantityOption,
				priceOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sell',
			description: 'Sell something on the grand exchange.',
			options: [
				{
					...ownedItemOption(item => Boolean(item.tradeable_on_ge)),
					name: 'item',
					description: 'The item you want to sell.',
					required: true
				},
				quantityOption,
				priceOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'my_listings',
			description: 'View your listings',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cancel',
			description: 'Cancel one of your listings.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'listing',
					description: 'The listing to cancel.',
					required: true,
					autocomplete: async (_, user) => {
						const listings = await prisma.gEListing.findMany({ where: { user_id: user.id } });
						return listings
							.filter(i => !i.cancelled_at && !i.fulfilled_at && i.quantity_remaining > 0)
							.map(l => ({
								name: `${l.type} ${l.total_quantity}x ${itemNameFromID(l.item_id)!}`,
								value: l.userfacing_id
							}));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'View your g.e stats',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'price',
			description: 'Lookup the market price of an item on the g.e',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item to lookup.',
					required: true,
					autocomplete: async input => {
						const listings = Array.from(marketPricemap.values());
						return listings
							.filter(i =>
								!input ? true : itemNameFromID(i.itemID)!.toLowerCase().includes(input.toLowerCase())
							)
							.map(l => ({
								name: `${itemNameFromID(l.itemID)!}`,
								value: l.itemID
							}));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'Lookup the market price of an item on the g.e',
			options: [
				{
					...itemOption(item => Boolean(item.tradeable_on_ge)),
					name: 'price_history',
					description: 'View the price history of an item.'
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		buy?: {
			item: string;
			quantity: string;
			price: string;
		};
		sell?: {
			item: string;
			quantity: string;
			price: string;
		};
		cancel?: {
			listing: string;
		};
		my_listings?: {};
		stats?: {};
		price?: { item: string };
		view?: { price_history?: string };
	}>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID);

		if (options.price) {
			const data = marketPricemap.get(Number(options.price.item));
			if (!data) {
				return "We don't have price data for that item.";
			}
			return `The current market price of ${itemNameFromID(data.itemID)!} is ${toKMB(
				data.guidePrice
			)} (${data.guidePrice.toLocaleString()}) GP.

**Recent price:** ${toKMB(data.averagePriceLast100)} (${data.averagePriceLast100.toLocaleString()}) GP.

This price is a guide only, calculated from average sale prices, it may not be accurate, it may change, or not reflect the true market price.`;
		}

		if (options.stats) {
			const totalGPYourSales = await prisma.gETransaction.aggregate({
				where: {
					sell_listing: {
						user_id: userID
					}
				},
				_sum: {
					total_tax_paid: true
				}
			});
			const totalGPYourTransactions = await prisma.gETransaction.aggregate({
				where: {
					OR: [
						{
							sell_listing: {
								user_id: userID
							}
						},
						{
							buy_listing: {
								user_id: userID
							}
						}
					]
				},
				_sum: {
					total_tax_paid: true
				}
			});

			const { slots } = await GrandExchange.calculateSlotsOfUser(user);

			return `
The next buy limit reset is at: ${GrandExchange.getInterval().nextResetStr}, it resets every ${formatDuration(
				GrandExchange.config.buyLimit.interval
			)}.


**G.E Slots You Can Use:** ${slots}
**Taxes you have paid:** ${(totalGPYourSales._sum.total_tax_paid ?? 0).toLocaleString()} GP
**Total Tax Paid on your sales AND purchases:** ${(
				totalGPYourTransactions._sum.total_tax_paid ?? 0
			).toLocaleString()} GP`;
		}

		if (options.my_listings) {
			const activeListings = await prisma.gEListing.findMany({
				where: {
					user_id: userID,
					quantity_remaining: {
						gt: 0
					},
					fulfilled_at: null,
					cancelled_at: null
				},
				include: {
					buyTransactions: true,
					sellTransactions: true
				},
				orderBy: {
					created_at: 'desc'
				}
			});
			const recentInactiveListings = await prisma.gEListing.findMany({
				where: {
					user_id: userID,
					OR: [
						{
							fulfilled_at: {
								not: null
							}
						},
						{
							cancelled_at: {
								not: null
							}
						},
						{
							quantity_remaining: 0
						}
					]
				},
				include: {
					buyTransactions: true,
					sellTransactions: true
				},
				orderBy: {
					created_at: 'desc'
				},
				take: 5
			});

			return `**Active Listings**
${(
	await Promise.all(
		activeListings.map(async listing => {
			const buyLimit = await GrandExchange.checkBuyLimitForListing(listing);
			return geListingToString(listing, buyLimit);
		})
	)
).join('\n')}

**Recent Fulfilled/Cancelled Listings**
${recentInactiveListings.map(i => geListingToString(i)).join('\n')}`;
		}

		if (options.view) {
			if (options.view.price_history) {
				const item = getItem(options.view.price_history);
				if (!item) return 'Invalid item.';
				if (!itemIsTradeable(item.id)) return 'That item is not tradeable on the Grand Exchange.';
				if (user.perkTier() < PerkTier.Four) {
					return patronMsg(PerkTier.Four);
				}
				let result = await prisma.$queryRawUnsafe<
					{ quantity_bought: number; price_per_item_before_tax: number; created_at: Date }[]
				>(`SELECT 
  sellTransactions.created_at, 
  sellTransactions.price_per_item_before_tax,
  sellTransactions.quantity_bought
FROM 
  ge_listing
INNER JOIN 
  ge_transaction AS sellTransactions ON ge_listing.id = sellTransactions.sell_listing_id
WHERE 
  ge_listing.item_id = ${item.id}
AND 
  ge_listing.cancelled_at IS NULL
AND 
  ge_listing.fulfilled_at IS NOT NULL
ORDER BY 
  sellTransactions.created_at DESC;`);
				if (result.length < 2) return 'No price history found for that item.';
				if (result[0].price_per_item_before_tax <= 1_000_000) {
					result = result.filter(i => i.quantity_bought > 1);
				}
				const buffer = await lineChart(
					`Price History for ${item.name}`,
					result.map(i => [new Date(i.created_at).toDateString(), i.price_per_item_before_tax]),
					val => val.toString(),
					val => val,
					false
				);
				return {
					files: [buffer]
				};
			}
		}

		if (GrandExchange.locked) {
			return 'The Grand Exchange is currently locked, please try again later.';
		}

		if (options.buy || options.sell) {
			const result = await GrandExchange.preCreateListing({
				user,
				itemName: (options.buy?.item ?? options.sell?.item)!,
				price: parseNumber((options.buy?.price ?? options.sell?.price)!),
				quantity: parseNumber((options.buy?.quantity ?? options.sell?.quantity)!),
				type: Boolean(options.buy) ? 'Buy' : 'Sell'
			});

			if ('error' in result) return result.error;

			await handleMahojiConfirmation(interaction, result.confirmationStr);
		}

		if (options.cancel) {
			return cancelGEListingCommand(user, options.cancel.listing);
		}

		if (options.buy) {
			const result = await GrandExchange.createListing({
				user,
				itemName: options.buy!.item,
				price: parseNumber(options.buy!.price),
				quantity: parseNumber(options.buy!.quantity),
				type: 'Buy'
			});

			if (typeof result.error === 'string') return result.error;
			const { createdListing } = result;

			return {
				content: `Successfully created a listing to buy ${toKMB(
					createdListing.total_quantity
				)} ${itemNameFromID(createdListing.item_id)} for ${toKMB(
					Number(createdListing.asking_price_per_item)
				)} GP each.`,
				components: makeComponents([createGECancelButton(createdListing)])
			};
		}

		if (options.sell) {
			const result = await GrandExchange.createListing({
				user,
				itemName: options.sell.item,
				price: parseNumber(options.sell.price),
				quantity: parseNumber(options.sell.quantity),
				type: 'Sell'
			});

			if (typeof result.error === 'string') return result.error;
			const { createdListing } = result;

			return {
				content: `Successfully created a listing to sell ${toKMB(
					createdListing.total_quantity
				)} ${itemNameFromID(createdListing.item_id)} for ${toKMB(
					Number(createdListing.asking_price_per_item)
				)} GP each.`,
				components: makeComponents([createGECancelButton(createdListing)])
			};
		}

		return 'Invalid command.';
	}
};
