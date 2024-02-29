import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { premiumPatronTime } from '../../lib/premiumPatronTime';
import { roboChimpUserFetch } from '../../lib/roboChimp';
import { OSBMahojiCommand } from '../lib/util';

const shop = [
	{
		name: 'Tester gift box',
		cost: 30
	},
	{
		name: '1 Month T3',
		cost: 300
	},
	{
		name: 'Double loot token',
		cost: 80
	}
] as const;

export const testerShopCommand: OSBMahojiCommand = {
	name: 'testershop',
	description: 'Buy things using your testing points.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The item to buy.',
			required: true,
			choices: shop.map(i => ({
				name: `${i.name} (${i.cost} points)`,
				value: i.name
			}))
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity (defaults to 1).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);
		const robochimpUser = await roboChimpUserFetch(userID);
		const item = shop.find(i => i.name === options.name);
		if (!item) return 'Invalid item.';
		const quantity = options.quantity ?? 1;
		const cost = item.cost * quantity;
		if (robochimpUser.testing_points_balance < cost) {
			return `You don't have enough points to buy ${quantity}x ${item.name}.`;
		}
		await roboChimpClient.user.update({
			data: {
				testing_points_balance: {
					decrement: cost
				}
			},
			where: {
				id: BigInt(userID)
			}
		});

		debugLog(`Tester shop: ${user.id} bought ${quantity}x ${item.name} for ${cost} points.`);
		switch (item.name) {
			case 'Tester gift box': {
				const loot = new Bank().add('Tester gift box', quantity);
				await user.addItemsToBank({ items: loot, collectionLog: true });
				return `You bought ${loot}!`;
			}
			case '1 Month T3': {
				const res = await premiumPatronTime(Time.Day * 31, 3, user, null);
				return res;
			}
			case 'Double loot token': {
				const loot = new Bank().add('Double loot token', quantity);
				await user.addItemsToBank({ items: loot, collectionLog: true });
				return `You bought ${loot}!`;
			}
		}
	}
};
