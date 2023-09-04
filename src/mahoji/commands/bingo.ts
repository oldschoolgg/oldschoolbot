import { userMention } from '@discordjs/builders';
import { ChatInputCommandInteraction, User } from 'discord.js';
import { chunk, clamp, noOp, Time, uniqueArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { prisma } from '../../lib/settings/prisma';
import {
	channelIsSendable,
	dateFm,
	isValidDiscordSnowflake,
	isValidNickname,
	makeComponents,
	toKMB
} from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { logError } from '../../lib/util/logError';
import { BingoManager } from '../lib/bingo/BingoManager';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';
import { doMenu, getPos } from './leaderboard';

const bingoAutocomplete = async (value: string, user: User) => {
	const bingos = await fetchBingosThatUserIsIn(user.id);
	return bingos
		.map(i => new BingoManager(i))
		.filter(bingo => (!value ? true : bingo.id.toString() === value))
		.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
};

type MakeTeamOptions = {
	first_user: MahojiUserOption;
	second_user: MahojiUserOption;
} & {};

async function fetchBingosThatUserIsIn(userID: string) {
	const bingos = await prisma.bingo.findMany({
		where: {
			bingo_participant: {
				some: {
					user_id: userID
				}
			}
		}
	});

	return bingos;
}

async function findBingoTeamWithUser(userID: string) {
	const teamWithUser = await prisma.bingoTeam.findFirst({
		where: {
			users: {
				some: {
					user_id: userID
				}
			}
		},
		include: {
			bingo: true
		}
	});
	return teamWithUser;
}

async function bingoTeamLeaderboard(userID: string, channelID: string, bingo: BingoManager): CommandResponse {
	const { teams } = await bingo.fetchAllParticipants();

	doMenu(
		await mUserFetch(userID),
		channelID,
		chunk(teams, 10).map((subList, i) =>
			subList
				.map(
					(team, j) =>
						`${getPos(i, j)}**${team.participants
							.map(pt => userMention(pt.user_id))
							.join(', ')}:** ${team.tilesCompletedCount.toLocaleString()}`
				)
				.join('\n')
		),
		'Bingo Team Leaderboard'
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
			description: 'View the bingo leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'bingo',
					description: 'The bingo to check the leaderboard of.',
					required: true,
					autocomplete: bingoAutocomplete
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'create_bingo',
			description: 'Create a bingo.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'title',
					description: 'The title of the bingo.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'duration_days',
					description: 'The duration of the bingo in days.',
					required: true,
					min_value: 1,
					max_value: 31
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'start_date_unix_seconds',
					description: 'The start date in unix seconds.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'ticket_price',
					description: 'The ticket price.',
					required: true,
					min_value: 1
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'team_size',
					description: 'The team size.',
					required: true,
					min_value: 1,
					max_value: 5
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'notifications_channel_id',
					description: 'The channel to send notifications to.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'organizers',
					description: 'The organizers (user IDs separated by comma).',
					required: true
				}
			]
		}
	],
	run: async ({
		userID,
		options,
		interaction,
		channelID
	}: CommandRunOptions<{
		leaderboard?: {
			bingo: string;
		};
		make_team?: MakeTeamOptions;
		leave_team?: {};
		buy_ticket?: { quantity?: number };
		create_bingo?: {
			title: string;
			duration_days: number;
			start_date_unix_seconds: number;
			ticket_price: number;
			team_size: number;
			notifications_channel_id: string;
			organizers: string;
		};
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
			return bingoTeamLeaderboard(userID.toString(), channelID);
		}

		if (options.create_bingo) {
			// todo: restrict
			const channel = globalClient.channels.cache.get(options.create_bingo.notifications_channel_id);
			if (!channel || !channelIsSendable(channel)) {
				return 'Invalid notifications channel.';
			}
			if (!isValidNickname(options.create_bingo.title)) {
				return 'Invalid title.';
			}
			const member = await channel.guild.members.fetch(userID).catch(noOp);
			if (!member || !member.permissions.has('Administrator')) {
				return 'You can only use a notifications channel if you are an Administrator of that server.';
			}

			const createOptions = {
				title: options.create_bingo.title,
				duration_days: options.create_bingo.duration_days,
				start_date: new Date(options.create_bingo.start_date_unix_seconds * 1000),
				ticket_price: options.create_bingo.ticket_price,
				team_size: options.create_bingo.team_size,
				notifications_channel_id: options.create_bingo.notifications_channel_id,
				organizers: options.create_bingo.organizers
					.split(',')
					.map(i => i.trim())
					.filter(id => isValidDiscordSnowflake(id)),
				bingo_tiles: [],
				creator_id: user.id
			} as const;

			const disclaimer = `You are creating a bingo, please adhere to these rules. If you are found to be breaking these rules, you will be banned.

- The title must not be inappropriate or offensive.
- The notifications channel ID must be of a server you own, or have consent to use. The bot will only let you use the channel if you are an Administrator of that server.
- The organizers must consent to being added as organizers of your Bingo. They are people who have access to moderate/manage the Bingo.
- Once your Bingo starts, you cannot stop it, or change any settings. Ensure everything is accurate before then.
- You can only have 1 Bingo active at a time.
- Ironmen will be able to enter, for free. However, they cannot win rewards.
- Note: You need to add tiles yourself, using our predefined tiles AND/OR your own custom tiles. You can add tiles using --TODO-- command.

**Your Bingo settings(Can be edited):**
**Title:** ${createOptions.title}
**Duration:** ${createOptions.duration_days} days
**Start Date:** ${dateFm(createOptions.start_date)}
**Finish Date:** ${dateFm(new Date(createOptions.start_date.getTime() + createOptions.duration_days * Time.Day))}
**Ticket Price:** ${toKMB(createOptions.ticket_price)}
**Team Size:** ${createOptions.team_size}
**Notifications Channel:** ${createOptions.notifications_channel_id}
**Organizers:** ${createOptions.organizers.map(userMention).join(', ')}
`;

			await handleMahojiConfirmation(interaction, disclaimer);

			await prisma.bingo.create({
				data: createOptions
			});
			debugLog('Created bingo', createOptions);

			return 'Created your Bingo succesfully!';
		}

		// 		const str = `**#1 - OSB Bingo** ${teamCount} teams, ${toKMB(prizePool)} Prize Pool
		// **Start:** ${time(startUnix)}  (${time(startUnix, 'R')})
		// **Finish:** ${time(endUnix)} (${time(endUnix, 'R')})
		// You have ${tilesCompletedCount} tiles completed.
		// ${bingoTableStr}
		// **Your team:** ${teamResult ? teamResult.team.map(userMention).join(', ') : '*No team :(*'}
		// Your team has ${teamResult?.progress.tilesCompletedCount ?? 0} tiles completed.
		// ${teamResult?.progress.bingoTableStr ?? ''}
		// `;
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
