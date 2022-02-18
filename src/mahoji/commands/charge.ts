import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../../';
import { userhasDiaryTier, WildernessDiary } from '../../lib/diaries';
import { GloryChargingActivityTaskOptions, WealthChargingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

export const InventorySize = 26;
export const InventoryTime = Time.Minute * 2.2;

export const chargeCommand: OSBMahojiCommand = {
	name: 'charge',
	description: 'Send your minion to charge jewellery at fountain of ruin',
	attributes: {
		categoryFlags: ['minion'],
		description: 'Send your minion to charge jewellery at fountain of ruin',
		examples: ['/charge glory', '/charge wealth']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'glory',
			description: 'Allows a player to create amulet of glory (6).',
			options: [
				{
					name: 'quantity',
					description: 'The number of trips you want to max (each trip is 26 glories).',
					type: ApplicationCommandOptionType.Integer,
					required: false,
					min_value: 1,
					max_value: 1000
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'wealth',
			description: 'Allows a player to create ring of wealth (5).',
			options: [
				{
					name: 'quantity',
					description: 'The number of trips you want to max (each trip is 26 wealths).',
					type: ApplicationCommandOptionType.Integer,
					required: false,
					min_value: 1,
					max_value: 1000
				}
			]
		}
	],
	run: async ({
		channelID,
		options,
		userID
	}: CommandRunOptions<{
		glory?: { quantity?: number };
		wealth?: { quantity?: number };
	}>) => {
		const user = await client.fetchUser(userID.toString());
		const [hasDiary] = await userhasDiaryTier(user, WildernessDiary.elite);
		await user.settings.sync(true);
		const userBank = user.bank();
		let invDuration = InventoryTime;
		if (hasDiary) {
			invDuration /= 3;
		}
		if (options.wealth) {
			const amountHas = userBank.amount('Amulet of glory');
			let quantity = options.glory?.quantity;
			if (amountHas < InventorySize) {
				return `You don't have enough Ring of wealths to recharge. Your minion does trips of ${InventorySize}x rings.`;
			}
			const maxTripLength = user.maxTripLength('WealthCharging');

			const max = Math.min(amountHas / InventorySize, Math.floor(maxTripLength / invDuration));
			if (quantity === undefined) quantity = max;
			else quantity = quantity > max ? max : quantity;

			const duration = quantity * invDuration;
			const quantityWealths = InventorySize * quantity;

			if (userBank.amount('Ring of wealth') < quantityWealths) {
				return `You don't have enough Rings of wealth, ${quantityWealths} required.`;
			}

			await addSubTaskToActivityTask<WealthChargingActivityTaskOptions>({
				userID: user.id,
				channelID: channelID.toString(),
				quantity,
				duration,
				type: 'WealthCharging'
			});

			await user.removeItemsFromBank(new Bank().add('Ring of wealth', quantityWealths));

			return `${
				user.minionName
			} is now charging ${quantityWealths} Rings of wealth, doing ${InventorySize} Rings of wealth in ${quantity} trips, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${quantityWealths}x Ring of wealth from your bank.${
				hasDiary ? ' 3x Boost for Wilderness Elite diary.' : ''
			}`;
		}
		const amountHas = userBank.amount('Amulet of glory');
		let quantity = options.glory?.quantity;
		if (amountHas < InventorySize) {
			return `You don't have enough Amulets of glories to recharge. Your minion does trips of ${InventorySize}x glories.`;
		}

		const maxTripLength = user.maxTripLength('GloryCharging');

		const max = Math.min(amountHas / InventorySize, Math.floor(maxTripLength / invDuration));
		if (quantity === undefined) quantity = max;
		else quantity = quantity > max ? max : quantity;

		const duration = quantity * invDuration;

		const quantityGlories = InventorySize * quantity;

		if (userBank.amount('Amulet of glory') < quantityGlories) {
			return `You don't have enough ${quantityGlories}x Amulet of glory.`;
		}

		await addSubTaskToActivityTask<GloryChargingActivityTaskOptions>({
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'GloryCharging'
		});
		await user.removeItemsFromBank(new Bank().add('Amulet of glory', quantityGlories));

		return `${
			user.minionName
		} is now charging ${quantityGlories} Amulets of glory, doing ${InventorySize} glories in ${quantity} trips, it'll take around ${formatDuration(
			duration
		)} to finish. Removed ${quantityGlories}x Amulet of glory from your bank.${
			hasDiary ? ' 3x Boost for Wilderness Elite diary.' : ''
		}`;
	}
};
