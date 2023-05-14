import { time, userMention } from '@discordjs/builders';
import { BingoTeam } from '@prisma/client';
import { ChatInputCommandInteraction } from 'discord.js';
import { chunk, clamp } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { prisma } from '../../lib/settings/prisma';
import { makeComponents, toKMB } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import {
	BINGO_CONFIG,
	bingoIsActive,
	buyBingoTicketButton,
	countTotalGPInPrizePool,
	determineBingoProgress
} from '../lib/bingo';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';
import { doMenu, getPos } from './leaderboard';

async function findBingoTeamWithUser(userID: string) {
	const teamWithUser = await prisma.bingoTeam.findFirst({
		where: {
			users: {
				has: userID
			}
		}
	});
	return teamWithUser;
}
function calculatePercentile(arr: number[], value: number) {
	const sortedArr = arr.slice().sort((a, b) => a - b);
	const rank = sortedArr.findIndex(el => el >= value);
	return 100 - (rank / (sortedArr.length - 1)) * 100;
}

async function bingoLeaderboard(userID: string, channelID: string): CommandResponse {
	const allBingoTeams = await prisma.bingoTeam.findMany({});
	const allBingoUsers = await prisma.user.findMany({
		where: {
			id: {
				in: allBingoTeams.map(i => i.users).flat()
			}
		},
		select: {
			temp_cl: true,
			id: true
		}
	});
	const parsedTeams: { team: BingoTeam; tilesCompleted: number; users: string[]; percentile: number }[] = [];

	for (const team of allBingoTeams) {
		let totalCL = new Bank();
		for (const id of team.users) {
			const user = allBingoUsers.find(i => i.id === id)!;
			totalCL.add(user.temp_cl as ItemBank);
		}
		const progress = determineBingoProgress(totalCL);
		parsedTeams.push({
			tilesCompleted: progress.tilesCompletedCount,
			team,
			users: team.users,
			percentile: -1
		});
	}

	const countArray = parsedTeams.map(item => item.tilesCompleted);
	for (const team of parsedTeams) {
		team.percentile = Math.ceil(calculatePercentile(countArray, team.tilesCompleted));
	}

	parsedTeams.sort((a, b) => b.tilesCompleted - a.tilesCompleted);
	doMenu(
		await mUserFetch(userID),
		channelID,
		chunk(parsedTeams, 10).map((subList, i) =>
			subList
				.map(
					(user, j) =>
						`${getPos(i, j)}**${user.users
							.map(userMention)
							.join(', ')}:** ${user.tilesCompleted.toLocaleString()} (Top ${user.percentile.toFixed()}%)`
				)
				.join('\n')
		),
		'Bingo Leaderboard'
	);
	return {
		ephemeral: true,
		content: 'Loading Bingo Leaderboard...'
	};
}

/**
 * Check if a user is elligible to join a team.
 */
// async function userCanJoinTeam(userID: string) {
// 	// Check if hasn't bought a ticket
// 	const count = await prisma.user.count({
// 		where: {
// 			id: userID,
// 			bingo_tickets_bought: {
// 				gt: 0
// 			}
// 		}
// 	});
// 	if (count !== 1) return false;

// 	// Check if already in a team
// 	const teamWithUser = await findBingoTeamWithUser(userID);
// 	if (teamWithUser !== null) return false;

// 	return true;
// }

// async function makeTeamCommand(
// 	interaction: ChatInputCommandInteraction,
// 	user: { id: string },
// 	options: MakeTeamOptions
// ) {
// 	if (bingoIsActive() && production) {
// 		return 'You cannot make a Bingo team, because the bingo has already started!';
// 	}
// 	const allUsers = uniqueArr([user.id, options.first_user.user.id, options.second_user.user.id]);
// 	if (allUsers.length !== 3) return 'Your team must have only 3 users, no more or less.';
// 	if (allUsers.some(id => BLACKLISTED_USERS.has(id))) return 'You cannot have blacklisted users on your team.';
// 	for (const member of allUsers) {
// 		const canJoin = await userCanJoinTeam(member);
// 		if (!canJoin) {
// 			return {
// 				content: `${userMention(
// 					member
// 				)} is not able to join a team, because they haven't bought a ticket, or are already in a team.`,
// 				components: makeComponents([buyBingoTicketButton])
// 			};
// 		}
// 	}
// 	await handleMahojiConfirmation(
// 		interaction,
// 		`${allUsers
// 			.map(i => userMention(i))
// 			.join(', ')} - Do you want to join a bingo team with eachother? All 3 users need to confirm.`,
// 		allUsers
// 	);

// 	try {
// 		await prisma.bingoTeam.create({
// 			data: {
// 				users: allUsers
// 			}
// 		});
// 	} catch (err) {
// 		logError(err);
// 		return 'There was an error creating your bingo team.';
// 	}

// 	return "Successfully created a bingo team! Have fun. You can leave the team before the bingo starts if you'd like, but doing so will delete the team, causing all 3 to have to join or make a new team.";
// }

export async function buyBingoTicketCommand(
	interaction: ChatInputCommandInteraction | null,
	userID: string,
	quantity = 1
): Promise<string> {
	const user = await mUserFetch(userID);

	quantity = clamp(quantity, 1, 1000);
	const gpCost = quantity * BINGO_CONFIG.ticketPrice;
	const cost = new Bank().add('Coins', gpCost);

	if (bingoIsActive()) {
		return 'You cannot buy a Bingo ticket, because the bingo has already started!';
	}

	if ((user.user.bingo_tickets_bought > 0 || quantity > 1) && interaction) {
		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to buy ${quantity}x Bingo Tickets for ${cost}? Tickets cannot be refunded or transferred.${
				user.user.bingo_tickets_bought > 0
					? ` **You have already bought ${user.user.bingo_tickets_bought} tickets.**`
					: ''
			}`
		);
	}

	if (Number(user.GP) < gpCost) return "You don't have enough GP.";
	await user.removeItemsFromBank(cost);
	await user.update({
		bingo_tickets_bought: {
			increment: quantity
		},
		bingo_gp_contributed: {
			increment: quantity * BINGO_CONFIG.ticketPrice
		}
	});

	const existingTeam = await findBingoTeamWithUser(userID);
	if (!existingTeam) {
		await prisma.bingoTeam.create({
			data: {
				users: [userID]
			}
		});
	}

	return `You bought ${quantity}x Bingo Tickets for ${toKMB(gpCost)} GP!`;
}

// async function leaveTeamCommand(interaction: ChatInputCommandInteraction) {
// 	const bingoTeam = await findBingoTeamWithUser(interaction.user.id);
// 	if (!bingoTeam) return "You're not in a bingo team.";
// 	if (bingoIsActive() && production) return "You can't leave a bingo team after bingo has started.";
// 	await handleMahojiConfirmation(
// 		interaction,
// 		'Are you sure you want to leave your team? Doing so will delete/disband the team, and all 3 of you will need to join a new team.'
// 	);
// 	await prisma.bingoTeam.delete({
// 		where: {
// 			id: bingoTeam.id
// 		}
// 	});
// 	return `${bingoTeam.users.map(userMention).join(', ')} Your Bingo team was deleted, you no longer are in a team.`;
// }

export const bingoCommand: OSBMahojiCommand = {
	name: 'bingo',
	description: 'Bingo!',
	options: [
		// {
		// 	type: ApplicationCommandOptionType.Subcommand,
		// 	name: 'make_team',
		// 	description: 'Make your own bingo team, with 2 other players.',
		// 	options: [
		// 		{
		// 			type: ApplicationCommandOptionType.User,
		// 			name: 'first_user',
		// 			description: 'The first user.',
		// 			required: true
		// 		},
		// 		{
		// 			type: ApplicationCommandOptionType.User,
		// 			name: 'second_user',
		// 			description: 'The second user.',
		// 			required: true
		// 		}
		// 	]
		// },
		// {
		// 	type: ApplicationCommandOptionType.Subcommand,
		// 	name: 'leave_team',
		// 	description: 'Leave your bingo team.'
		// },
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy_ticket',
			description: 'Buy a bingo ticket.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to buy, only one is needed.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'info',
			description: 'View bingo info.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'leaderboard',
			description: 'View the bingo leaderboard.'
		}
	],
	run: async ({
		userID,
		options,
		interaction,
		channelID
	}: CommandRunOptions<{
		leaderboard?: {};
		leave_team?: {};
		buy_ticket?: { quantity?: number };
	}>) => {
		const user = await mahojiUsersSettingsFetch(userID, {
			bingo_gp_contributed: true,
			bingo_tickets_bought: true,
			temp_cl: true,
			id: true
		});
		const components = user.bingo_tickets_bought > 0 ? undefined : makeComponents([buyBingoTicketButton]);

		if (options.buy_ticket) {
			return buyBingoTicketCommand(interaction, userID, options.buy_ticket.quantity);
		}
		if (options.leaderboard) {
			if (!bingoIsActive()) return 'The bingo has not started yet.';
			return bingoLeaderboard(userID, channelID);
		}

		const { bingoTableStr, tilesCompletedCount } = determineBingoProgress(user.temp_cl);
		const prizePool = await countTotalGPInPrizePool();

		const startUnix = Math.floor(BINGO_CONFIG.startUnixDate);
		const endUnix = Math.floor(BINGO_CONFIG.endUnixDate);
		const teamCount = await prisma.bingoTeam.count();

		let str = `**${BINGO_CONFIG.title}** ${teamCount} participants, ${toKMB(prizePool)} Prize Pool
**Start:** ${time(startUnix)}  (${time(startUnix, 'R')})
**Finish:** ${time(endUnix)} (${time(endUnix, 'R')})
You have ${tilesCompletedCount} tiles completed.
${bingoTableStr}`;

		if (bingoIsActive()) {
		} else {
			str += '\n\n**The Bingo has not started.**';
		}
		return {
			content: str,
			components,
			allowed_mentions: {
				parse: [],
				users: []
			}
		};
	}
};
