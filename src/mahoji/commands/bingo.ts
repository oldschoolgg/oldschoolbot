import { time, userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { uniqueArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { prisma } from '../../lib/settings/prisma';
import { clamp, getUsername, makeComponents, toKMB } from '../../lib/util';
import { logError } from '../../lib/util/logError';
import {
	BINGO_TICKET_PRICE,
	bingoEnd,
	bingoIsActive,
	bingoStart,
	buyBingoTicketButton,
	calculateBingoTeamDetails,
	determineBingoProgress
} from '../lib/bingo';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../mahojiSettings';

type MakeTeamOptions = {
	first_user: MahojiUserOption;
	second_user: MahojiUserOption;
} & {};

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
	const teamWithUser = await prisma.bingoTeam.count({
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
	if (teamWithUser !== 0) return false;

	return true;
}

async function makeTeamCommand(interaction: SlashCommandInteraction, user: User, options: MakeTeamOptions) {
	if (bingoIsActive() && production) {
		return 'You cannot make a Bingo team, because the bingo has already started!';
	}
	const allUsers = uniqueArr([user.id, options.first_user.user.id, options.second_user.user.id]);
	if (allUsers.length !== 3) return 'Your team must have only 3 users, no more or less.';
	if (allUsers.some(id => BLACKLISTED_USERS.has(id))) return 'You cannot have blacklisted users on your team.';
	for (const member of allUsers) {
		const canJoin = await userCanJoinTeam(member);
		if (!canJoin) {
			return `${userMention(
				member
			)} is not able to join a team, because they haven't bought a ticket, or are already in a team.`;
		}
	}
	await handleMahojiConfirmation(
		interaction,
		`${allUsers.map(i => userMention(i)).join(', ')} - Do you want to join a bingo team with eachother?`
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
	interaction: SlashCommandInteraction | null,
	userID: string,
	quantity = 1
): Promise<string> {
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);
	if ((mahojiUser.bingo_tickets_bought > 0 || quantity > 1) && interaction) {
		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to buy ${quantity}x Bingo Tickets? Tickets cannot be refunded or transferred.${
				mahojiUser.bingo_tickets_bought > 0
					? ` **You have already bought ${mahojiUser.bingo_tickets_bought} tickets.**`
					: ''
			}`
		);
	}
	quantity = clamp(quantity, 1, 1000);
	const gpCost = quantity * BINGO_TICKET_PRICE;
	const cost = new Bank().add('Coins', gpCost);

	if (Number(mahojiUser.GP) < gpCost) return "You don't have enough GP.";
	await mahojiUserSettingsUpdate(userID, {
		bingo_tickets_bought: {
			increment: quantity
		}
	});
	await klasaUser.removeItemsFromBank(cost);
	return `You bought ${quantity}x Bingo Tickets for ${toKMB(gpCost)} GP!`;
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
					type: ApplicationCommandOptionType.User,
					name: 'quantity',
					description: 'The quantity you want to buy, only one is needed.',
					required: false
				}
			]
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{ make_team?: MakeTeamOptions; buy_ticket?: { quantity?: number } }>) => {
		const user = await mahojiUsersSettingsFetch(userID);
		const components = user.bingo_tickets_bought > 0 ? undefined : makeComponents([buyBingoTicketButton]);
		if (options.make_team) {
			return {
				content: await makeTeamCommand(interaction, user, options.make_team),
				components
			};
		}
		if (options.buy_ticket) {
			return buyBingoTicketCommand(interaction, userID.toString(), options.buy_ticket.quantity);
		}

		const { bingoTableStr, tilesCompletedCount } = determineBingoProgress(user.temp_cl);
		const teamResult = await calculateBingoTeamDetails(user.id);
		const isParticipating = user.bingo_tickets_bought > 0 && teamResult !== null;

		const str = `**#1 - OSB Bingo**
**Start:** ${time(bingoStart / 1000)}  (${time(bingoStart / 1000, 'R')})
**Finish:** ${time(bingoEnd / 1000)} (${time(bingoEnd / 1000, 'R')})
You have ${tilesCompletedCount} tiles completed.
${bingoTableStr}
**Your team:** ${teamResult ? teamResult.team.map(id => getUsername(id)).join(', ') : '*No team :(*'})
Your team has ${teamResult?.progress.tilesCompletedCount ?? 0} tiles completed.
${teamResult?.progress.bingoTableStr ?? ''}

You ${isParticipating ? '**ARE**' : 'are **NOT**'} participating in the Bingo.`;
		return {
			content: str,
			components
		};
	}
};
