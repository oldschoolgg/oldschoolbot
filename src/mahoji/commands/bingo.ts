import { time, userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { uniqueArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { MahojiUserOption } from 'mahoji/dist/lib/types';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { prisma } from '../../lib/settings/prisma';
import { getUsername } from '../../lib/util';
import { logError } from '../../lib/util/logError';
import { bingoEnd, bingoIsActive, bingoStart, calculateBingoTeamDetails, determineBingoProgress } from '../lib/bingo';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUsersSettingsFetch } from '../mahojiSettings';

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
			is_playing_bingo: true
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
	if (bingoIsActive()) {
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
		}
	],
	run: async ({ userID, options, interaction }: CommandRunOptions<{ make_team?: MakeTeamOptions }>) => {
		const user = await mahojiUsersSettingsFetch(userID);
		if (options.make_team) return makeTeamCommand(interaction, user, options.make_team);

		const { bingoTableStr, tilesCompletedCount } = determineBingoProgress(user.temp_cl);
		const teamResult = await calculateBingoTeamDetails(user.id);
		const isParticipating = user.is_playing_bingo && teamResult !== null;

		const str = `**#1 - OSB Bingo**
**Start:** ${time(bingoStart / 1000)}  (${time(bingoStart / 1000, 'R')})
**Finish:** ${time(bingoEnd / 1000)} (${time(bingoEnd / 1000, 'R')})
You have ${tilesCompletedCount} tiles completed.
${bingoTableStr}
**Your team:** ${teamResult ? teamResult.team.map(id => getUsername(id)).join(', ') : '*No team :(*'})
Your team has ${teamResult?.progress.tilesCompletedCount ?? 0} tiles completed.
${teamResult?.progress.bingoTableStr ?? ''}

You ${isParticipating ? '**ARE**' : 'are **NOT**'} participating in the Bingo.`;
		return str;
	}
};
