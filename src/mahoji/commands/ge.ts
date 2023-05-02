import { ApplicationCommandOptionType } from 'discord.js';
import { CommandRunOptions } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { MAX_INT_JAVA } from '../../lib/constants';
import { fetchOwnedBank, GrandExchange } from '../../lib/grandExchange';
import { prisma } from '../../lib/settings/prisma';
import { getUsername, itemNameFromID } from '../../lib/util';
import { mahojiClientSettingsUpdate } from '../../lib/util/clientSettings';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { itemOption, ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

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
			name: 'list',
			description: 'List ALLLL g.e listings and transactions',
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
	}>) => {
		return GrandExchange.queue.add(async () => {
			const user = await mUserFetch(userID);
			await interaction.deferReply();
			if (options.list) {
				const allListings = await prisma.gEListing.findMany({
					orderBy: {
						created_at: 'desc'
					},
					where: {
						quantity_remaining: {
							gt: 0
						},
						fulfilled_at: null,
						cancelled_at: null
					}
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
					bank: await fetchOwnedBank(),
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
							const listing = allListings.find(
								l => l.id === t.buy_listing.id || l.id === t.sell_listing.id
							)!;
							const buyer = getUsername(t.buy_listing.user.id);
							const seller = getUsername(t.sell_listing.user.id);
							const items = new Bank().add(listing.item_id, t.quantity_bought);
							return `${buyer} bought ${items} from ${seller}'s listing, the listing now has ${listing.quantity_remaining}x left.`;
						})
						.join('\n')}`,
					files: [geOwnedBank.file]
				};
			}

			if (options.buy) {
				const result = await GrandExchange.createListing({
					user,
					itemName: options.buy.item,
					price: options.buy.price,
					quantity: options.buy.quantity,
					type: 'Buy'
				});

				if (typeof result.error === 'string') return result.error;

				return `Successfully created a listing[${result.createdListing.userfacing_id}] to buy ${
					result.createdListing.total_quantity
				}x ${itemNameFromID(result.createdListing.item_id)} for ${
					result.createdListing.asking_price_per_item
				} GP each.`;
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

				return `Successfully created a listing[${result.createdListing.userfacing_id}] to sell ${
					result.createdListing.total_quantity
				}x ${itemNameFromID(result.createdListing.item_id)} for ${
					result.createdListing.asking_price_per_item
				} GP each.`;
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
					grand_exchange_owned_bank: (await fetchOwnedBank()).remove(refundBank).bank
				});

				return `Successfully cancelled your listing[${newListing.userfacing_id}], you have been refunded ${refundBank}.`;
			}

			return 'Invalid command.';
		});
	}
};
