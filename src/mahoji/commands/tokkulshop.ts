import { activity_type_enum } from '@prisma/client';
import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Monsters } from 'oldschooljs';

import TokkulShopItems from '../../lib/data/buyables/tokkulBuyables';
import { KaramjaDiary, userhasDiaryTier } from '../../lib/diaries';
import { TokkulShopOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { OSBMahojiCommand } from '../lib/util';

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
		const user = await mUserFetch(userID.toString());
		if (user.minionIsBusy) return `${user.minionName} is currently busy and cannot go to the Tzhaar shops.`;
		const [hasKaramjaDiary] = await userhasDiaryTier(user, KaramjaDiary.easy);
		const item = TokkulShopItems.find(i => stringMatches(i.name, options.buy?.name ?? options.sell?.name ?? ''));
		const hasKilledJad: boolean = (await user.getKC(TzTokJad.id)) >= 1 ? true : false;
		const isIronman = user.user.minion_ironman ? true : false;
		if (!item) return "That's not a valid item.";

		if (item.requireFireCape && !hasKilledJad) {
			return `You are not worthy JalYt. Before you can buy/sell ${item.name}, you need to have defeated the mighty TzTok-Jad!`;
		}
		const { bank } = user;
		const maxTripLength = calcMaxTripLength(user, activity_type_enum.TokkulShop);
		let quantity = options.buy?.quantity ?? options.sell?.quantity ?? 1;
		const cost = new Bank();
		const loot = new Bank();

		let amountOfRestocksNeededToBuy = null;
		if (hasKilledJad) {
			if (isIronman) {
				amountOfRestocksNeededToBuy = item.rinIMShopStock
					? Math.ceil((quantity / item.rinIMShopStock) * 1.25)
					: item.stock
					? Math.ceil(quantity / item.stock)
					: null;
			} else {
				amountOfRestocksNeededToBuy = item.rinShopStock
					? Math.ceil((quantity / item.rinShopStock) * 1.25)
					: item.stock
					? Math.ceil(quantity / item.stock)
					: null;
			}
		} else {
			amountOfRestocksNeededToBuy = item.stock ? Math.ceil(quantity / item.stock) : null;
		}

		const duration =
			options.buy && amountOfRestocksNeededToBuy
				? amountOfRestocksNeededToBuy * Time.Minute
				: quantity * TIME_PER_1;

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

		if (!bank.has(cost)) return `You don't own ${cost}.`;
		const action = Boolean(options.buy) ? 'buy' : 'sell';

		if (duration > maxTripLength) {
			return `This trip is too long. You need to ${action} less at a time, to fit your max trip length of ${formatDuration(
				maxTripLength
			)}.`;
		}

		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to spend ${cost} to get ${loot}? The trip to ${action} them will take ${formatDuration(
				duration
			)}.`
		);

		await transactItems({ userID: user.id, itemsToRemove: cost });
		await updateBankSetting('tks_cost', cost);

		await addSubTaskToActivityTask<TokkulShopOptions>({
			userID: user.id,
			channelID: channelID.toString(),
			quantity: loot.items()[0][1],
			type: 'TokkulShop',
			duration,
			itemID: loot.items()[0][0].id
		});

		return `${user.minionName} is now ${action}ing ${
			action === 'buy' ? loot : cost
		} from the Tzhaar Shops, in return for ${action === 'buy' ? cost : loot}. The trip will take ${formatDuration(
			duration
		)}.`;
	}
};
