import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { activity_type_enum } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import TokkulShopItems from '../../lib/data/buyables/tokkulBuyables';
import { KaramjaDiary, userhasDiaryTier } from '../../lib/diaries';
import type { TokkulShopOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';

const { TzTokJad } = Monsters;

const TIME_PER_50 = Time.Second;
const TIME_PER_1 = TIME_PER_50 / 50;

export const tksCommand: OSBMahojiCommand = {
	name: 'tokkulshop',
	description: 'Buy or sell items from the Tzhaar shops.',
	attributes: {
		requiresMinion: true,
		categoryFlags: ['minion'],
		examples: ['/tokkulshop buy Obsidian platebody', '/tokkulshop sell Chaos rune 5000']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Buy an item in exchange for tokkul',
			options: [
				{
					name: 'name',
					description: 'The item you want to purchase.',
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: async (value: string) => {
						return TokkulShopItems.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						)
							.filter(i => i.tokkulCost! > 0)
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					name: 'quantity',
					description: 'The quantity you want to purchase.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sell',
			description: 'Sell an item in exchange for tokkul',
			options: [
				{
					name: 'name',
					description: 'The item you want to sell.',
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: async (value: string) => {
						return TokkulShopItems.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						)
							.filter(i => i.tokkulReturn! > 0)
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					name: 'quantity',
					description: 'The quantity you want to sell.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1
				}
			]
		}
	],
	run: async ({
		channelID,
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		buy?: { name?: string; quantity?: number };
		sell?: { name?: string; quantity?: number };
	}>) => {
		// Get user ID
		const user = await mUserFetch(userID.toString());

		// If user is busy don't let them go on a trip
		if (user.minionIsBusy) return `${user.minionName} is currently busy and cannot go to the Tzhaar shops.`;

		// Get user Karamja Diary completion status, item being bought, jad kc, and ironman status
		const [hasKaramjaDiary] = await userhasDiaryTier(user, KaramjaDiary.easy);
		const item = TokkulShopItems.find(i => stringMatches(i.name, options.buy?.name ?? options.sell?.name ?? ''));
		const hasKilledJad: boolean = (await user.getKC(TzTokJad.id)) >= 1;
		const isIronman = !!user.user.minion_ironman;

		// If the user is buying an invalid item
		if (!item) return "That's not a valid item.";

		// If the user is trying to buy an item that is only in Mor Ul Rek and hasn't killed Jad
		if (item.requireFireCape && !hasKilledJad) {
			return `You are not worthy JalYt. Before you can buy/sell ${item.name}, you need to have defeated the mighty TzTok-Jad!`;
		}

		// User bank, maxTripLength, quantity given
		const { bank } = user;
		const maxTripLength = calcMaxTripLength(user, activity_type_enum.TokkulShop);
		const quantity = options.buy?.quantity ?? options.sell?.quantity ?? 1;
		const cost = new Bank();
		const loot = new Bank();

		// Calculate the shop stock for the item the user wants to buy
		let shopStock = null;
		if (options.buy) {
			if (hasKilledJad) {
				if (isIronman) {
					shopStock = item.rinIMShopStock ?? item.rinShopStock ?? item.stock ?? null;
				} else {
					shopStock = item.rinShopStock ?? item.stock ?? null;
				}
			} else {
				shopStock = item.stock ?? null;
			}
		}

		// Calculate the amount of trips needed to buy the quantity given
		const amountOfRestocksNeededToBuy = shopStock ? Math.ceil(quantity / shopStock) : null;

		// Calculate trip duration
		const duration = amountOfRestocksNeededToBuy
			? amountOfRestocksNeededToBuy * Time.Minute
			: quantity * TIME_PER_1;

		// Calculate tokkul cost for buying or selling
		if (options.buy) {
			if (!item.diaryTokkulCost || !item.tokkulCost) return "You can't buy this item.";
			const tokkulCost = (hasKaramjaDiary ? item.diaryTokkulCost : item.tokkulCost) * quantity;
			if (!item.stock) return "This item isn't stocked.";
			cost.add('Tokkul', tokkulCost);
			loot.add(item.itemID, quantity);
		} else {
			if (!item.diaryTokkulReturn || !item.tokkulReturn) return "You can't sell this item.";
			const tokkulReturn = (hasKaramjaDiary ? item.diaryTokkulReturn : item.tokkulReturn) * quantity;
			loot.add('Tokkul', tokkulReturn);
			cost.add(item.itemID, quantity);
		}

		// If the user doesn't have the items or tokkul
		if (!bank.has(cost)) return `You don't own ${cost}.`;
		const action = options.buy ? 'buy' : 'sell';

		// Calculate the max amount of items the user can buy or sell
		const maxCanTransact = shopStock ? (maxTripLength / Time.Minute) * shopStock : (maxTripLength / 1000) * 50;

		// If the duration of the trip is longer than the users max allowed trip, give the reason why and the max they can buy or sell
		if (duration > maxTripLength) {
			return `This trip is too long. You need to ${action} less at a time, to fit your max trip length of ${formatDuration(
				maxTripLength
			)}. ${
				maxCanTransact
					? `The max ${item.name.toLowerCase()}s you can ${
							action === 'buy' ? 'buy' : 'sell'
						} is ${maxCanTransact}`
					: ''
			}`;
		}

		// Confirmation the user has to accept before trip is sent
		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to spend ${cost} to get ${loot}? The trip to ${action} them will take ${formatDuration(
				duration
			)}.`
		);

		// Remove the cost, and update bank settings
		await transactItems({ userID: user.id, itemsToRemove: cost });
		await updateBankSetting('tks_cost', cost);

		// Tokkul shop activity
		await addSubTaskToActivityTask<TokkulShopOptions>({
			userID: user.id,
			channelID: channelID.toString(),
			quantity: loot.items()[0][1],
			type: 'TokkulShop',
			duration,
			itemID: loot.items()[0][0].id
		});

		// Trip start message
		return `${user.minionName} is now ${action}ing ${action === 'buy' ? loot : cost} ${
			action === 'buy' ? 'from' : 'to'
		} the Tzhaar Shops, in return for ${action === 'buy' ? cost : loot}. The trip will take ${formatDuration(
			duration
		)}.`;
	}
};
