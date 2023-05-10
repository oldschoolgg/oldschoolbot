import type { GEListing, GETransaction } from '@prisma/client';
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';
import { sumArr } from 'e';
import { CommandRunOptions } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../../lib/constants';
import { GrandExchange } from '../../lib/grandExchange';
import { prisma } from '../../lib/settings/prisma';
import { getUsername, itemNameFromID, toKMB } from '../../lib/util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../../lib/util/clientSettings';
import getOSItem from '../../lib/util/getOSItem';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { itemOption, ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

type GEListingWithTransactions = GEListing & {
	buyTransactions: GETransaction[];
	sellTransactions: GETransaction[];
};

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
	description: 'The quantity of the item to exchange.',
	type: ApplicationCommandOptionType.Integer,
	min_value: 1,
	max_value: MAX_INT_JAVA,
	required: true
};

const priceOption: CommandOption = {
	name: 'price',
	description: 'The price to exchange each item at.',
	type: ApplicationCommandOptionType.Integer,
	min_value: 1,
	max_value: MAX_INT_JAVA * 10,
	required: true
};

export const geCommand: OSBMahojiCommand = {
	name: 'ge',
	description: 'Exchange grandly!',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Purchase something from the grand exchange.',
			options: [
				{
					...itemOption(item => Boolean(item.tradeable_on_ge)),
					name: 'item',
					description: 'The item you want to buy.',
					required: true
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
								name: `${l.type} ${l.total_quantity}x ${itemNameFromID(l.item_id)!.slice(0, 10)}`,
								value: l.userfacing_id
							}));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'global_reset',
			description: 'Nuke the g.e',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'data',
			description: 'Data',
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
			quantity: number;
			price: number;
		};
		sell?: {
			item: string;
			quantity: number;
			price: number;
		};
		list?: {};
		cancel?: {
			listing: string;
		};
		my_listings?: {};
		global_reset?: {};
		data?: {};
	}>) => {
		await interaction.deferReply();

		if (options.global_reset) {
			await mahojiClientSettingsUpdate({
				grand_exchange_is_locked: false,
				grand_exchange_owned_bank: {},
				grand_exchange_tax_bank: 0,
				grand_exchange_total_tax: 0
			});
			await prisma.gETransaction.deleteMany();
			await prisma.gEListing.deleteMany();
			await prisma.user.updateMany({
				data: {
					bank: new Bank().add('Egg', 1000).add('Coal', 1000).add('Trout', 1000).add('Flax', 1000).bank,
					GP: 1_000_000_000
				}
			});
			return "Grand Exchange has been reset. It's now open for business! Also made everyone have identical banks.";
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
		if (options.list) {
			const allListings = await prisma.gEListing.findMany({
				orderBy: {
					created_at: 'desc'
				},
				where: {}
			});
			const allTransactions = await prisma.gETransaction.findMany({
				orderBy: {
					created_at: 'desc'
				},
				select: {
					quantity_bought: true,
					buy_listing: {
						select: {
							id: true,
							user: {
								select: {
									id: true
								}
							}
						}
					},
					sell_listing: {
						select: {
							id: true,
							user: {
								select: {
									id: true
								}
							}
						}
					}
				},
				where: {
					OR: [
						{
							buy_listing_id: {
								in: allListings.map(i => i.id)
							}
						},
						{
							sell_listing_id: {
								in: allListings.map(i => i.id)
							}
						}
					]
				}
			});

			const geOwnedBank = await makeBankImage({
				bank: await GrandExchange.fetchOwnedBank(),
				title: 'Items in G.E'
			});

			return {
				content: `Listings:\n${allListings
					.map(
						l =>
							`[${l.userfacing_id}] ${getUsername(l.user_id)} has a listing to ${l.type} ${
								l.total_quantity
							}x ${itemNameFromID(l.item_id)} for ${l.asking_price_per_item} GP each, there are ${
								l.quantity_remaining
							}x left. `
					)
					.join('\n')}

Transactions:\n${allTransactions
					.map(t => {
						const listing = allListings.find(l => l.id === t.buy_listing.id || l.id === t.sell_listing.id)!;
						const buyer = getUsername(t.buy_listing.user.id);
						const seller = getUsername(t.sell_listing.user.id);
						const items = new Bank().add(listing.item_id, t.quantity_bought);
						return `${buyer} bought ${items} from ${seller}'s listing, the listing now has ${listing.quantity_remaining}x left.`;
					})
					.join('\n')}`,
				files: [geOwnedBank.file]
			};
		}

		if (options.data) {
			const settings = await mahojiClientSettingsFetch({
				grand_exchange_is_locked: true,
				grand_exchange_owned_bank: true,
				grand_exchange_tax_bank: true,
				grand_exchange_total_tax: true
			});

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

			const allTx: string[][] = [];
			const allTransactions = await prisma.gETransaction.findMany({
				orderBy: {
					created_at: 'desc'
				}
			});
			if (allTransactions.length > 0) {
				allTx.push(Object.keys(allTransactions[0]));
				for (const tx of allTransactions) {
					allTx.push(Object.values(tx).map(i => i.toString()));
				}
			}

			const allLi: string[][] = [];
			const allListings = await prisma.gEListing.findMany({
				orderBy: {
					created_at: 'desc'
				}
			});
			if (allListings.length > 0) {
				allLi.push(Object.keys(allListings[0]));
				for (const tx of allListings) {
					allLi.push(Object.values(tx).map(i => (i === null ? '' : i.toString())));
				}
			}

			return {
				content: `**Grand Exchange Data**
**Tax Rate:** ${GrandExchange.config.tax.rate()}%
**Tax Cap (per item):** ${toKMB(GrandExchange.config.tax.cap())}
**Total GP Removed From Taxation:** ${settings.grand_exchange_total_tax.toLocaleString()} GP
**Total Tax GP G.E Has To Spend on Item Sinks:** ${settings.grand_exchange_tax_bank.toLocaleString()} GP
**Total Tax Paid on your sales:** ${totalGPYourSales._sum.total_tax_paid?.toLocaleString()} GP
**Total Tax Paid on your sales AND purchases:** ${totalGPYourTransactions._sum.total_tax_paid?.toLocaleString()} GP
`,
				files: [
					(
						await makeBankImage({
							bank: new Bank(settings.grand_exchange_owned_bank as ItemBank),
							title: 'Items in the G.E'
						})
					).file,
					new AttachmentBuilder(Buffer.from(allTx.map(i => i.join('\t')).join('\n')), {
						name: 'transactions.txt'
					}),
					new AttachmentBuilder(Buffer.from(allLi.map(i => i.join('\t')).join('\n')), {
						name: 'listings.txt'
					})
				]
			};
		}

		return GrandExchange.queue.add(async () => {
			const user = await mUserFetch(userID);

			if (options.buy) {
				const result = await GrandExchange.createListing({
					user,
					itemName: options.buy.item,
					price: options.buy.price,
					quantity: options.buy.quantity,
					type: 'Buy'
				});

				if (typeof result.error === 'string') return result.error;

				return `Successfully created a listing to buy ${result.createdListing.total_quantity}x ${itemNameFromID(
					result.createdListing.item_id
				)} for ${toKMB(result.createdListing.asking_price_per_item)} GP each.`;
			}

			if (options.sell) {
				const result = await GrandExchange.createListing({
					user,
					itemName: options.sell.item,
					price: options.sell.price,
					quantity: options.sell.quantity,
					type: 'Sell'
				});

				if (typeof result.error === 'string') return result.error;

				return `Successfully created a listing to sell ${
					result.createdListing.total_quantity
				}x ${itemNameFromID(result.createdListing.item_id)} for ${toKMB(
					result.createdListing.asking_price_per_item
				)} GP each.`;
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
					refundBank.add('Coins', Number(newListing.asking_price_per_item) * newListing.quantity_remaining);
				} else {
					refundBank.add(newListing.item_id, newListing.quantity_remaining);
				}

				await user.addItemsToBank({
					items: refundBank,
					collectionLog: false,
					dontAddToTempCL: true
				});
				await mahojiClientSettingsUpdate({
					grand_exchange_owned_bank: (await GrandExchange.fetchOwnedBank()).remove(refundBank).bank
				});

				return `Successfully cancelled your listing, you have been refunded ${refundBank}.`;
			}

			return 'Invalid command.';
		});
	}
};
