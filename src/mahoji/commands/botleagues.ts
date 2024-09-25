import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { chunk } from 'e';
import { Bank } from 'oldschooljs';

import { leagueBuyables } from '../../lib/data/leaguesBuyables';
import { roboChimpUserFetch } from '../../lib/roboChimp';
import { getUsername } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { deferInteraction } from '../../lib/util/interactionReply';
import type { OSBMahojiCommand } from '../lib/util';
import { doMenu } from './leaderboard';

const leaguesTrophiesBuyables = [
	{
		item: getOSItem('BSO dragon trophy'),
		leaguesPointsRequired: 60_000
	},
	{
		item: getOSItem('BSO rune trophy'),
		leaguesPointsRequired: 50_000
	},
	{
		item: getOSItem('BSO adamant trophy'),
		leaguesPointsRequired: 40_000
	},
	{
		item: getOSItem('BSO mithril trophy'),
		leaguesPointsRequired: 30_000
	},
	{
		item: getOSItem('BSO steel trophy'),
		leaguesPointsRequired: 20_000
	},
	{
		item: getOSItem('BSO iron trophy'),
		leaguesPointsRequired: 10_000
	},
	{
		item: getOSItem('BSO bronze trophy'),
		leaguesPointsRequired: 5000
	}
];

export const botLeaguesCommand: OSBMahojiCommand = {
	name: 'botleagues',
	description: 'Compete in the OSB/BSO Leagues.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'help',
			description: 'Shows help and information about leagues.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'claim_trophy',
			description: 'Claim your leagues trophys.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'leaderboard',
			description: 'The leagues leaderboard.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy_reward',
			description: 'Buy a reward with your leagues points.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item to buy.',
					required: true,
					autocomplete: async (value: string) => {
						return leagueBuyables
							.filter(i => (!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.item.name, value: i.item.name }));
					}
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{
		help?: {};
		claim_trophy?: {};
		leaderboard?: {};
		buy_reward?: { item: string };
	}>) => {
		const user = await mUserFetch(userID.toString());
		const roboChimpUser = await roboChimpUserFetch(user.id);

		if (options.claim_trophy) {
			const loot = new Bank();
			for (const trophy of leaguesTrophiesBuyables) {
				if (
					roboChimpUser.leagues_points_total >= trophy.leaguesPointsRequired &&
					!user.allItemsOwned.has(trophy.item.id)
				) {
					loot.add(trophy.item.id);
				}
			}

			if (loot.length === 0) {
				return `You don't have any trophies you can claim. You have ${roboChimpUser.leagues_points_total.toLocaleString()} points.

${leaguesTrophiesBuyables
	.map(i => `${i.item.name}: Requires ${i.leaguesPointsRequired.toLocaleString()} points`)
	.join('\n')}`;
			}

			await user.addItemsToBank({ items: loot, collectionLog: false });
			return `You received ${loot}.`;
		}

		if (options.buy_reward) {
			const quantity = 1;
			const pointsCostMultiplier = 150;

			const item = leagueBuyables.find(i => stringMatches(i.item.name, options.buy_reward?.item));

			if (!item) return "That's not a valid item.";

			const baseCost = item.price * pointsCostMultiplier;
			const cost = quantity * baseCost;
			if (roboChimpUser.leagues_points_balance_osb < cost) {
				return `You don't have enough League Points to purchase this. You need ${cost}, but you have ${roboChimpUser.leagues_points_balance_osb}.`;
			}
			const newUser = await roboChimpClient.user.update({
				where: {
					id: BigInt(user.id)
				},
				data: {
					leagues_points_balance_osb: {
						decrement: cost
					}
				}
			});

			const loot = new Bank().add(item.item.id, quantity);
			await transactItems({
				userID: user.id,
				itemsToAdd: loot,
				collectionLog: true
			});

			return `You spent ${cost} Leagues Points and received ${loot}. You have ${newUser.leagues_points_balance_osb} points remaining.`;
		}

		if (options.leaderboard) {
			const result = await roboChimpClient.user.findMany({
				where: {
					leagues_points_total: {
						gt: 0
					}
				},
				orderBy: {
					leagues_points_total: 'desc'
				},
				take: 100
			});
			await deferInteraction(interaction);
			doMenu(
				interaction,
				user,
				channelID,
				await Promise.all(
					chunk(result, 10).map(async subList =>
						(
							await Promise.all(
								subList.map(
									async ({ id, leagues_points_total }) =>
										`**${await getUsername(id)}:** ${leagues_points_total.toLocaleString()} Pts`
								)
							)
						).join('\n')
					)
				),
				'Leagues Points Leaderboard'
			);
			return null;
		}

		return 'https://bso-wiki.oldschool.gg/leagues';
	}
};
