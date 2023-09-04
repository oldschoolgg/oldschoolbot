import { time, userMention } from '@discordjs/builders';
import { BingoTeam } from '@prisma/client';
import { ChatInputCommandInteraction } from 'discord.js';
import { chunk, clamp, uniqueArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { production } from '../../config';
import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { prisma } from '../../lib/settings/prisma';
import { makeComponents, toKMB } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { logError } from '../../lib/util/logError';
import {
	BINGO_TICKET_PRICE,
	bingoEnd,
	bingoIsActive,
	bingoStart,
	buyBingoTicketButton,
	calculateBingoTeamDetails,
	countTotalGPInPrizePool,
	determineBingoProgress
} from '../lib/bingo/bingoUtil';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';
import { doMenu, getPos } from './leaderboard';

type MakeTeamOptions = {
	first_user: MahojiUserOption;
	second_user: MahojiUserOption;
} & {};

async function findBingoTeamWithUser(userID: string) {
	const teamWithUser = await prisma.bingoTeam.findFirst({
		where: {
			OR: [
				{
					first_user: userID
				},
				{
					second_user: userID
				},
				{
					third_user: userID
				}
			]
		}
	});
	return teamWithUser;
}

async function bingoLeaderboard(userID: string, channelID: string): CommandResponse {
	const allBingoTeams = await prisma.bingoTeam.findMany({});
	const allBingoUsers = await prisma.user.findMany({
		where: {
			id: {
				in: allBingoTeams.map(i => [i.first_user, i.second_user, i.third_user]).flat()
			}
		},
		select: {
			temp_cl: true,
			id: true
		}
	});
	const parsedTeams: { team: BingoTeam; tilesCompleted: number; users: string[] }[] = [];

	for (const team of allBingoTeams) {
		let totalCL = new Bank();
		for (const id of [team.first_user, team.second_user, team.third_user]) {
			const user = allBingoUsers.find(i => i.id === id)!;
			totalCL.add(user.temp_cl as ItemBank);
		}
		const progress = determineBingoProgress(totalCL);
		parsedTeams.push({
			tilesCompleted: progress.tilesCompletedCount,
			team,
			users: [team.first_user, team.second_user, team.third_user]
		});
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
							.join(', ')}:** ${user.tilesCompleted.toLocaleString()}`
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
async function userCanJoinTeam(userID: string) {
	// Check if hasn't bought a ticket
	const count = await prisma.user.count({
		where: {
			id: userID,
			bingo_tickets_bought: {
				gt: 0
			}
		}
	});
	if (count !== 1) return false;

	// Check if already in a team
	const teamWithUser = await findBingoTeamWithUser(userID);
	if (teamWithUser !== null) return false;

	return true;
}

async function makeTeamCommand(
	interaction: ChatInputCommandInteraction,
	user: { id: string },
	options: MakeTeamOptions
) {
	if (bingoIsActive() && production) {
		return 'You cannot make a Bingo team, because the bingo has already started!';
	}
	const allUsers = uniqueArr([user.id, options.first_user.user.id, options.second_user.user.id]);
	if (allUsers.length !== 3) return 'Your team must have only 3 users, no more or less.';
	if (allUsers.some(id => BLACKLISTED_USERS.has(id))) return 'You cannot have blacklisted users on your team.';
	for (const member of allUsers) {
		const canJoin = await userCanJoinTeam(member);
		if (!canJoin) {
			return {
				content: `${userMention(
					member
				)} is not able to join a team, because they haven't bought a ticket, or are already in a team.`,
				components: makeComponents([buyBingoTicketButton])
			};
		}
	}
	await handleMahojiConfirmation(
		interaction,
		`${allUsers
			.map(i => userMention(i))
			.join(', ')} - Do you want to join a bingo team with eachother? All 3 users need to confirm.`,
		allUsers
	);

	try {
		await prisma.bingoTeam.create({
			data: {
				first_user: allUsers[0],
				second_user: allUsers[1],
				third_user: allUsers[2]
			}
		});
	} catch (err) {
		logError(err);
		return 'There was an error creating your bingo team.';
	}

	return "Successfully created a bingo team! Have fun. You can leave the team before the bingo starts if you'd like, but doing so will delete the team, causing all 3 to have to join or make a new team.";
}

export async function buyBingoTicketCommand(
	interaction: ChatInputCommandInteraction | null,
	userID: string,
	quantity = 1
): Promise<string> {
	const user = await mUserFetch(userID);

	if (user.isIronman && user.user.bingo_tickets_bought === 0) {
		await user.update({
			bingo_tickets_bought: 1
		});
		return 'You got a free Bingo ticket.';
	}

	quantity = clamp(quantity, 1, 1000);
	const gpCost = quantity * BINGO_TICKET_PRICE;
	const cost = new Bank().add('Coins', gpCost);

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
	await user.update({
		bingo_tickets_bought: {
			increment: quantity
		},
		bingo_gp_contributed: {
			increment: quantity * BINGO_TICKET_PRICE
		}
	});
	await user.removeItemsFromBank(cost);
	return `You bought ${quantity}x Bingo Tickets for ${toKMB(gpCost)} GP!`;
}

async function leaveTeamCommand(interaction: ChatInputCommandInteraction) {
	const bingoTeam = await findBingoTeamWithUser(interaction.user.id);
	if (!bingoTeam) return "You're not in a bingo team.";
	if (bingoIsActive() && production) return "You can't leave a bingo team after bingo has started.";
	await handleMahojiConfirmation(
		interaction,
		'Are you sure you want to leave your team? Doing so will delete/disband the team, and all 3 of you will need to join a new team.'
	);
	await prisma.bingoTeam.delete({
		where: {
			id: bingoTeam.id
		}
	});
	const users = [bingoTeam.first_user, bingoTeam.second_user, bingoTeam.third_user];
	return `${users.map(userMention).join(', ')} Your Bingo team was deleted, you no longer are in a team.`;
}

export const bingoCommand: OSBMahojiCommand = {
	name: 'bingo',
	description: 'Bingo!',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'make_team',
			description: 'Make your own bingo team, with 2 other players.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'first_user',
					description: 'The first user.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.User,
					name: 'second_user',
					description: 'The second user.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'leave_team',
			description: 'Leave your bingo team.'
		},
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
		make_team?: MakeTeamOptions;
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
		if (options.make_team) return makeTeamCommand(interaction, user, options.make_team);
		if (options.buy_ticket) {
			return buyBingoTicketCommand(interaction, userID.toString(), options.buy_ticket.quantity);
		}
		if (options.leave_team) return leaveTeamCommand(interaction);
		if (options.leaderboard) {
			return bingoLeaderboard(userID.toString(), channelID);
		}

		const { bingoTableStr, tilesCompletedCount } = determineBingoProgress(user.temp_cl);
		const teamResult = await calculateBingoTeamDetails(user.id);
		const prizePool = await countTotalGPInPrizePool();

		const startUnix = Math.floor(bingoStart / 1000);
		const endUnix = Math.floor(bingoEnd / 1000);
		const teamCount = await prisma.bingoTeam.count();

		const str = `**#1 - OSB Bingo** ${teamCount} teams, ${toKMB(prizePool)} Prize Pool
**Start:** ${time(startUnix)}  (${time(startUnix, 'R')})
**Finish:** ${time(endUnix)} (${time(endUnix, 'R')})
You have ${tilesCompletedCount} tiles completed.
${bingoTableStr}
**Your team:** ${teamResult ? teamResult.team.map(userMention).join(', ') : '*No team :(*'}
Your team has ${teamResult?.progress.tilesCompletedCount ?? 0} tiles completed.
${teamResult?.progress.bingoTableStr ?? ''}
`;
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
