import { evalMathExpression } from '@oldschoolgg/toolkit/dist/util/expressionParser';
import { GEListing, GETransaction } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { sumArr, uniqueArr } from 'e';
import { CommandRunOptions } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { GrandExchange } from '../../lib/grandExchange';
import { prisma } from '../../lib/settings/prisma';
import { makeTransactFromTableBankQueries } from '../../lib/tableBank';
import { formatDuration, itemNameFromID, toKMB } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { logError } from '../../lib/util/logError';
import { ownedItemOption, tradeableItemArr } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

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
	const pastVerb = listing.type === 'Buy' ? 'Bought' : 'Sold';
	const action = listing.type.toLowerCase();
	const itemQty = `${toKMB(listing.total_quantity)} ${item.name}`;

	const totalSold = listing.total_quantity - listing.quantity_remaining;
	const totalPricePaidSoFar = toKMB(sumArr(allTransactions.map(i => i.quantity_bought * i.price_per_item_after_tax)));
	const totalTaxPaidSoFar = toKMB(sumArr(allTransactions.map(i => i.quantity_bought * Number(i.total_tax_paid))));

	if (listing.cancelled_at) {
		return `Cancelled offer to ${action} ${itemQty}. ${totalSold} were ${pastVerb}.`;
	}

	if (listing.fulfilled_at) {
		return `Completed offer to ${action} ${itemQty}. ${totalSold} were ${pastVerb} for a total amount of ${totalPricePaidSoFar} (${totalTaxPaidSoFar} tax paid).`;
	}

	const buyLimitStr =
		buyLimit !== undefined && buyLimit.remainingItemsCanBuy !== buyLimit.buyLimit
			? ` (${buyLimit.remainingItemsCanBuy.toLocaleString()}/${buyLimit.buyLimit.toLocaleString()} remaining in buy limit currently)`
			: '';

	return `${verb} ${itemQty}, ${toKMB(
		listing.quantity_remaining
	)} are remaining to ${listing.type.toLowerCase()}, asking for ${toKMB(listing.asking_price_per_item)} GP each. ${
		allTransactions.length
	}x transactions made.${buyLimitStr}`;
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
	}>) => {
		await interaction.deferReply();
		const user = await mUserFetch(userID);

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
**Taxes you have paid:** ${totalGPYourSales._sum.total_tax_paid?.toLocaleString()} GP
**Total Tax Paid on your sales AND purchases:** ${totalGPYourTransactions._sum.total_tax_paid?.toLocaleString()} GP}`;
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

		return GrandExchange.queue.add(async () => {
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

				return `Successfully created a listing to buy ${createdListing.total_quantity}x ${itemNameFromID(
					createdListing.item_id
				)} for ${toKMB(createdListing.asking_price_per_item)} GP each.`;
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

				return `Successfully created a listing to sell ${createdListing.total_quantity}x ${itemNameFromID(
					createdListing.item_id
				)} for ${toKMB(createdListing.asking_price_per_item)} GP each.`;
			}

			if (options.cancel) {
				const listing = await prisma.gEListing.findFirst({
					where: {
						user_id: user.id,
						userfacing_id: options.cancel.listing
					}
				});
				if (!listing) {
					return 'You do not have a listing with that ID.';
				}
				if (listing.fulfilled_at || listing.quantity_remaining === 0) {
					return 'You cannot cancel a listing that has already been fulfilled.';
				}
				if (listing.cancelled_at) {
					return 'You cannot cancel a listing that has already been cancelled.';
				}
				const newListing = await prisma.gEListing.update({
					where: {
						id: listing.id
					},
					data: {
						cancelled_at: new Date()
					}
				});

				const refundBank = new Bank();
				if (newListing.type === 'Buy') {
					refundBank.add('Coins', newListing.asking_price_per_item * newListing.quantity_remaining);
				} else {
					refundBank.add(newListing.item_id, newListing.quantity_remaining);
				}

				const geBank = await GrandExchange.fetchOwnedBank();
				if (!geBank.has(refundBank)) {
					const error = new Error(
						`GE doesn't have ${refundBank} to refund ${user.id}, listing ${listing.id}`
					);
					logError(error);
					await GrandExchange.lockGE(error.message);
					return 'Something went wrong, please try again later.';
				}

				await user.addItemsToBank({
					items: refundBank,
					collectionLog: false,
					dontAddToTempCL: true
				});

				await prisma.$transaction(makeTransactFromTableBankQueries({ bankToRemove: refundBank }));

				return `Successfully cancelled your listing, you have been refunded ${refundBank}.`;
			}
			return 'Invalid command.';
		});
	}
};
