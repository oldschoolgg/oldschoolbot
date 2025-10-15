import { chunk, stringMatches } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { leagueBuyables } from '@/lib/data/leaguesBuyables.js';
import { roboChimpUserFetch } from '@/lib/roboChimp.js';
import { getUsername } from '@/lib/util.js';
import { doMenu } from '@/mahoji/commands/leaderboard.js';

const leaguesTrophiesBuyables = [
	{
		item: Items.getOrThrow('BSO dragon trophy'),
		leaguesPointsRequired: 60_000
	},
	{
		item: Items.getOrThrow('BSO rune trophy'),
		leaguesPointsRequired: 50_000
	},
	{
		item: Items.getOrThrow('BSO adamant trophy'),
		leaguesPointsRequired: 40_000
	},
	{
		item: Items.getOrThrow('BSO mithril trophy'),
		leaguesPointsRequired: 30_000
	},
	{
		item: Items.getOrThrow('BSO steel trophy'),
		leaguesPointsRequired: 20_000
	},
	{
		item: Items.getOrThrow('BSO iron trophy'),
		leaguesPointsRequired: 10_000
	},
	{
		item: Items.getOrThrow('BSO bronze trophy'),
		leaguesPointsRequired: 5000
	}
];

export const botLeaguesCommand: OSBMahojiCommand = {
	name: 'botleagues',
	description: 'Compete in the OSB/BSO Leagues.',
	options: [
		{
			type: 'Subcommand',
			name: 'help',
			description: 'Shows help and information about leagues.'
		},
		{
			type: 'Subcommand',
			name: 'claim_trophy',
			description: 'Claim your leagues trophys.'
		},
		{
			type: 'Subcommand',
			name: 'leaderboard',
			description: 'The leagues leaderboard.'
		},
		{
			type: 'Subcommand',
			name: 'buy_reward',
			description: 'Buy a reward with your leagues points.',
			options: [
				{
					type: 'String',
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
		user,
		interaction
	}: CommandRunOptions<{
		help?: {};
		claim_trophy?: {};
		leaderboard?: {};
		buy_reward?: { item: string };
	}>) => {
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
			await user.transactItems({
				itemsToAdd: loot,
				collectionLog: true
			});

			return `You spent ${cost} Leagues Points and received ${loot}. You have ${newUser.leagues_points_balance_osb} points remaining.`;
		}

		if (options.leaderboard) {
			await interaction.defer();
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
			return doMenu(
				interaction,
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
		}

		return 'https://wiki.oldschool.gg/bso/leagues/';
	}
};
