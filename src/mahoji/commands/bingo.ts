import { bold, dateFm, userMention } from '@oldschoolgg/discord';
import { Emoji, formatOrdinal, notEmpty, stringMatches, Time, truncateString, uniqueArr } from '@oldschoolgg/toolkit';
import { md5sum } from '@oldschoolgg/toolkit/node';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Bank, type ItemBank, Items, toKMB } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import { clImageGenerator } from '@/lib/collectionLogTask.js';
import { BOT_TYPE, globalConfig } from '@/lib/constants.js';
import { doMenuWrapper } from '@/lib/menuWrapper.js';
import type { PrismaCompatibleJsonObject } from '@/lib/types/index.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { isValidNickname } from '@/lib/util/smallUtils.js';
import { BingoManager, BingoTrophies } from '@/mahoji/lib/bingo/BingoManager.js';
import type { StoredBingoTile } from '@/mahoji/lib/bingo/bingoUtil.js';
import { generateTileName, getAllTileItems, isGlobalTile } from '@/mahoji/lib/bingo/bingoUtil.js';
import { globalBingoTiles } from '@/mahoji/lib/bingo/globalTiles.js';

const bingoAutocomplete = async ({ value, user }: StringAutoComplete) => {
	const bingos = await fetchBingosThatUserIsInvolvedIn(user.id);
	return bingos
		.map(i => new BingoManager(i))
		.filter(bingo => (!value ? true : bingo.id.toString() === value))
		.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
};

type MakeTeamOptions = {
	second_user?: MahojiUserOption;
	third_user?: MahojiUserOption;
	fourth_user?: MahojiUserOption;
	fifth_user?: MahojiUserOption;
} & {
	bingo: string;
};

export async function fetchBingosThatUserIsInvolvedIn(userId: string) {
	const bingos = await prisma.bingo.findMany({
		where: {
			OR: [
				{
					bingo_participant: {
						some: {
							user_id: userId
						}
					}
				},
				{
					creator_id: userId
				},
				{
					organizers: {
						has: userId
					}
				}
			]
		}
	});

	return bingos;
}

async function bingoTeamLeaderboard(interaction: MInteraction, bingo: BingoManager): CommandResponse {
	const { teams } = await bingo.fetchAllParticipants();

	const users = await Promise.all(
		[...teams]
			.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount)
			.map(async team => {
				const names = await Promise.all(team.participants.map(pt => Cache.getBadgedUsername(pt.user_id)));
				const label = `${team.trophy?.emoji ? `${team.trophy.emoji} ` : ''}${names.join(', ')}`;
				return {
					id: team.team_id.toString(),
					score: team.tilesCompletedCount,
					customName: label
				};
			})
	);

	return doMenuWrapper({
		ironmanOnly: false,
		interaction,
		users,
		title: 'Bingo Team Leaderboard',
		formatter: v => v.toLocaleString()
	});
}

async function makeTeamCommand(
	interaction: MInteraction,
	bingo: BingoManager,
	creatorUser: MUser,
	options: MakeTeamOptions
) {
	if (bingo.isActive()) {
		return 'You cannot make a Bingo team, because the bingo has already started!';
	}
	const allUsers = await Promise.all(
		uniqueArr(
			[
				creatorUser.id,
				options.second_user?.user.id,
				options.third_user?.user.id,
				options.fourth_user?.user.id,
				options.fifth_user?.user.id
			].filter(notEmpty)
		).map(id => mUserFetch(id))
	);
	if (allUsers.length !== bingo.teamSize) return `Your team must have only ${bingo.teamSize} users, no more or less.`;

	await interaction.confirmation({
		content: `${allUsers.map(i => userMention(i.id)).join(', ')} - Do you want to join a bingo team with eachother? All ${
			bingo.teamSize
		} users need to confirm. ${bold(`You will be charged ${toKMB(bingo.ticketPrice)}`)}`,
		users: allUsers.map(i => i.id)
	});

	for (const user of allUsers) {
		const teamWithUser = await bingo.findTeamWithUser(user.id);
		if (teamWithUser) {
			return `${user} is already in a team.`;
		}
		if (!user.isIronman && user.GP < bingo.ticketPrice) {
			return `${user} doesn't have enough GP to buy a ticket! They need ${toKMB(
				bingo.ticketPrice
			)} GP, but only have ${toKMB(user.GP)} GP.`;
		}
		const isBlacklisted = await Cache.isUserBlacklisted(user.id);
		if (isBlacklisted) {
			return `${user} is blacklisted and cannot join bingo teams.`;
		}
	}
	await prisma.$transaction([
		prisma.user.updateMany({
			where: {
				id: {
					in: allUsers.filter(i => !i.isIronman).map(i => i.id)
				}
			},
			data: {
				GP: {
					decrement: bingo.ticketPrice
				}
			}
		}),
		prisma.bingoTeam.create({
			data: {
				bingo_id: bingo.id,
				users: {
					createMany: {
						data: allUsers.map(u => ({
							user_id: u.id,
							tickets_bought: 1,
							bingo_id: bingo.id
						}))
					}
				}
			}
		})
	]);

	return "Successfully created a bingo team! Have fun. You can leave the team before the bingo starts if you'd like, but doing so will delete the team, causing all users to have to join or make a new team.";
}

async function leaveTeamCommand(interaction: MInteraction, bingo: BingoManager) {
	if (bingo.isActive()) return "You can't leave a bingo team after bingo has started.";
	if (bingo.wasFinalized) {
		return "You can't leave a bingo team after bingo has ended.";
	}

	const team = await bingo.findTeamWithUser(interaction.userId);
	if (!team) return "You're not in a team for this bingo.";

	await interaction.confirmation(
		'Are you sure you want to leave your team? Doing so will delete/disband the team, and all of you will need to join a new team.'
	);

	const allUsers = await Promise.all(team.participants.map(i => i.user).map(id => mUserFetch(id.id)));
	await prisma.$transaction([
		prisma.user.updateMany({
			where: {
				id: {
					in: allUsers.filter(i => !i.isIronman).map(i => i.id)
				}
			},
			data: {
				GP: {
					increment: bingo.ticketPrice
				}
			}
		}),
		prisma.bingoTeam.delete({
			where: {
				id: team.team_id
			}
		})
	]);
	return `${team.participants
		.map(pt => userMention(pt.user_id))
		.join(
			', '
		)} Your Bingo team was deleted, you no longer are in a team. All non-ironmen were refunded their ticket price of ${bingo.ticketPrice.toLocaleString()} GP.`;
}

function parseTileAddInput(input: string): StoredBingoTile | null {
	const plus = input.includes('+');
	const pipe = input.includes('|');

	if (plus && pipe) {
		return null;
	}

	if (!plus && !pipe) {
		const bank = parseBank({ inputStr: input, noDuplicateItems: true });
		return { bank: bank.toJSON() };
	}

	const delimiter = plus ? '+' : '|';
	const arr = input.split(delimiter);
	const items = [];

	for (const name of arr) {
		const item = Items.getItem(name);
		if (item) {
			items.push(item);
		}
	}
	if (items.length === 0) {
		return null;
	}

	return delimiter === '+' ? { allOf: items.map(i => i.id) } : { oneOf: items.map(i => i.id) };
}

async function getBingoFromUserInput(input: string) {
	const where = Number.isNaN(Number(input))
		? {
				title: input
			}
		: {
				id: Number(input)
			};
	const bingo = await prisma.bingo.findFirst({
		where
	});
	return bingo;
}

export const bingoCommand = defineCommand({
	name: 'bingo',
	description: 'Bingo!',
	options: [
		{
			type: 'Subcommand',
			name: 'make_team',
			description: 'Make your own bingo team, with other players.',
			options: [
				{
					type: 'String',
					name: 'bingo',
					description: 'The bingo.',
					required: true,
					autocomplete: async ({ value, guildId, userId }: StringAutoComplete) => {
						if (!guildId) return [];
						const member = await globalClient.fetchMember({ guildId, userId });
						if (!member || !member.guild_id) return [];
						const bingos = await prisma.bingo.findMany({
							where: {
								OR: [
									{
										guild_id: member.guild_id,
										was_finalized: false
									},
									{
										is_global: true,
										was_finalized: false
									}
								]
							}
						});
						return bingos
							.map(i => new BingoManager(i))
							.filter(bingo => !bingo.isActive())
							.filter(bingo => (!value ? true : bingo.id.toString() === value))
							.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
					}
				},
				{
					type: 'User',
					name: 'second_user',
					description: 'The second user.',
					required: false
				},
				{
					type: 'User',
					name: 'third_user',
					description: 'The third user.',
					required: false
				},
				{
					type: 'User',
					name: 'fourth_user',
					description: 'The fourth user.',
					required: false
				},
				{
					type: 'User',
					name: 'fifth_user',
					description: 'The fifth user.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'leave_team',
			description: 'Leave your bingo team.',
			options: [
				{
					type: 'String',
					name: 'bingo',
					description: 'The bingo.',
					required: true,
					autocomplete: async ({ value, userId }: StringAutoComplete) => {
						const bingos = await prisma.bingo.findMany({
							where: {
								OR: [
									{
										bingo_participant: {
											some: {
												user_id: userId
											}
										}
									}
								]
							}
						});
						return bingos
							.map(i => new BingoManager(i))
							.filter(bingo => (!value ? true : bingo.id.toString() === value))
							.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
					}
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View bingo info.',
			options: [
				{
					type: 'String',
					name: 'bingo',
					description: 'The bingo.',
					required: true,
					autocomplete: bingoAutocomplete
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'leaderboard',
			description: 'View the bingo leaderboard.',
			options: [
				{
					type: 'String',
					name: 'bingo',
					description: 'The bingo to check the leaderboard of.',
					required: true,
					autocomplete: bingoAutocomplete
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'create_bingo',
			description: 'Create a bingo.',
			options: [
				{
					type: 'String',
					name: 'title',
					description: 'The title of the bingo.',
					required: true
				},
				{
					type: 'Integer',
					name: 'duration_days',
					description: 'The duration of the bingo in days.',
					required: true,
					min_value: 1,
					max_value: 31
				},
				{
					type: 'Integer',
					name: 'start_date_unix_seconds',
					description: 'The start date in unix seconds.',
					required: true
				},
				{
					type: 'Integer',
					name: 'ticket_price',
					description: 'The ticket price.',
					required: true,
					min_value: 1
				},
				{
					type: 'Integer',
					name: 'team_size',
					description: 'The team size.',
					required: true,
					min_value: 1,
					max_value: 5
				},
				{
					type: 'String',
					name: 'notifications_channel_id',
					description: 'The channel to send notifications to.',
					required: true
				},
				{
					type: 'String',
					name: 'organizers',
					description: 'The organizers (user IDs separated by comma).',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'manage_bingo',
			description: 'Manage your bingo.',
			options: [
				{
					type: 'String',
					name: 'bingo',
					description: 'The bingo.',
					required: true,
					autocomplete: async ({ value, userId }: StringAutoComplete) => {
						const bingos = await fetchBingosThatUserIsInvolvedIn(userId);
						return bingos
							.map(i => new BingoManager(i))
							.filter(b => b.creatorID === userId || b.organizers.includes(userId))
							.filter(bingo => (!value ? true : bingo.id.toString() === value))
							.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
					}
				},
				{
					type: 'String',
					name: 'add_tile',
					description: 'Add a tile to your bingo.',
					required: false,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return globalBingoTiles
							.filter(t => (!value ? true : t.name.toLowerCase().includes(value.toLowerCase())))
							.map(t => ({
								name: t.name,
								value: t.id.toString()
							}));
					}
				},
				{
					type: 'Boolean',
					name: 'csv_dump',
					description: 'Dump a csv file with all the bingo results.',
					required: false
				},
				{
					type: 'String',
					name: 'remove_tile',
					description: 'Remove a tile from your bingo.',
					required: false,
					autocomplete: async ({ value, userId }: StringAutoComplete) => {
						const bingos = await prisma.bingo.findMany({
							where: {
								OR: [
									{
										creator_id: userId
									},
									{
										organizers: {
											has: userId
										}
									}
								],
								was_finalized: false,
								start_date: {
									gt: new Date()
								}
							}
						});
						return bingos
							.flatMap(b => new BingoManager(b).bingoTiles)
							.filter(b => b.name.toLowerCase().includes(value.toLowerCase()))
							.map(b => ({
								name: truncateString(b.name, 100),
								value: b.id ? b.id.toString() : md5sum(b.name)
							}));
					}
				},
				{
					type: 'Boolean',
					name: 'finalize',
					description: 'Finalize/end the bingo.',
					required: false
				},
				{
					type: 'Integer',
					name: 'add_extra_gp',
					description: 'Add extra gp to the prize.',
					required: false,
					min_value: 1_000_000
				},
				{
					type: 'Boolean',
					name: 'trophy_handout',
					description: 'Hand out trophies.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'items',
			description: 'View your progress/items.',
			options: [
				{
					type: 'String',
					name: 'bingo',
					description: 'The bingo to check your items of.',
					required: true,
					autocomplete: async ({ value, userId }: StringAutoComplete) => {
						const bingos = await fetchBingosThatUserIsInvolvedIn(userId);
						return bingos
							.map(i => new BingoManager(i))
							.filter(b => b.isActive())
							.filter(bingo => (!value ? true : bingo.id.toString() === value))
							.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
					}
				}
			]
		}
	],
	run: async ({ user, userId, options, interaction }) => {
		if (options.items) {
			const bingoID = Number(options.items.bingo);
			if (Number.isNaN(bingoID)) {
				return 'Invalid bingo.';
			}
			const bingoParticipant = await prisma.bingoParticipant.findFirst({
				where: {
					bingo_id: Number(options.items.bingo),
					user_id: user.id
				},
				include: {
					bingo: true
				}
			});

			if (!bingoParticipant) return 'Invalid bingo.';
			const bingo = new BingoManager(bingoParticipant.bingo);
			const teamProgress = (await bingo.determineProgressOfTeam(bingoParticipant.bingo_team_id))!;

			const clItems: number[] = [];

			for (const tile of teamProgress.tilesNotCompleted) {
				const tileItems = getAllTileItems(tile);
				clItems.push(...tileItems);
			}

			for (const tile of teamProgress.tilesCompleted) {
				if ('oneOf' in tile) {
					const completed = tile.oneOf.find(i => teamProgress.cl.has(i));
					if (completed) {
						clItems.push(completed);
					} else {
						clItems.push(...tile.oneOf);
					}
				}

				if ('allOf' in tile) {
					clItems.push(...tile.allOf);
				}

				if ('customReq' in tile) {
					clItems.push(...tile.allItems.filter(i => teamProgress.cl.has(i)));
				}
			}

			const image = await clImageGenerator.makeArbitraryCLImage({
				user,
				clItems: new Set(clItems),
				userBank: teamProgress.cl,
				title: 'Bingo'
			});

			return image;
		}
		if (options.make_team) {
			const bingo = await getBingoFromUserInput(options.make_team.bingo);
			if (!bingo) return 'Invalid bingo.';
			return makeTeamCommand(interaction, new BingoManager(bingo), user, options.make_team);
		}
		if (options.leave_team) {
			const bingo = await getBingoFromUserInput(options.leave_team.bingo);
			if (!bingo) return 'Invalid bingo.';
			return leaveTeamCommand(interaction, new BingoManager(bingo));
		}
		if (options.leaderboard) {
			const bingo = await getBingoFromUserInput(options.leaderboard.bingo);
			if (!bingo) return 'Invalid bingo.';
			return bingoTeamLeaderboard(interaction, new BingoManager(bingo));
		}

		if (options.create_bingo) {
			if (user.isIronman) {
				return 'Ironmen cannot create bingos.';
			}
			const fee = BOT_TYPE === 'OSB' ? 20_000_000 : 50_000_000;
			const creationCost = new Bank().add('Coins', fee);
			if (user.GP < creationCost.amount('Coins')) {
				return `You need at least ${creationCost} to create a bingo.`;
			}

			const channelId = options.create_bingo.notifications_channel_id;
			if (!isValidDiscordSnowflake(channelId)) {
				return "That's not a valid channel ID, if you need help on how to get a channel id, you can ask us for help.";
			}
			const channel = await Cache.getChannel(options.create_bingo.notifications_channel_id);
			const sendable = await globalClient.channelIsSendable(channel);
			if (!sendable) {
				return 'I cannot send messages to the notifications channel.';
			}
			if (!channel || !channel.guild_id) {
				return 'Invalid notifications channel.';
			}
			if (!isValidNickname(options.create_bingo.title)) {
				return 'Invalid title.';
			}
			const member = await globalClient.fetchMember({ guildId: channel.guild_id, userId });
			if (globalConfig.isProduction && (!member || !member.permissions.includes('ADMINISTRATOR'))) {
				return 'You can only use a notifications channel if you are an Administrator of that server.';
			}
			if (channel.guild_id !== interaction.guildId) {
				return 'The notifications channel must be in the same server as the command.';
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
				creator_id: user.id,
				guild_id: channel.guild_id
			};

			if (createOptions.team_size < 1 || createOptions.team_size > 5) {
				return 'Team size must be between 1 and 5.';
			}

			// Start date must be at least 3 hours into the future
			if (createOptions.start_date.getTime() < Date.now() + Time.Minute * 3) {
				return 'Start date must be at least 3 minutes into the future.';
			}

			// Start date cannot be more than 31 days into the future
			if (createOptions.start_date.getTime() > Date.now() + Time.Day * 31) {
				return 'Start date cannot be more than 31 days into the future.';
			}

			const disclaimer = `You are creating a bingo, please adhere to these rules. If you are found to be breaking these rules, you will be banned.

- The title must not be inappropriate or offensive.
- The notifications channel ID must be of a server you own, or have consent to use. The bot will only let you use the channel if you are an Administrator of that server.
- The organizers must consent to being added as organizers of your Bingo. They are people who have access to moderate/manage the Bingo. Organizers can add tiles to the Bingo, and end the Bingo.
- Once your Bingo starts, you cannot stop it, or change any settings. Ensure everything is accurate before then.
- You can only have 1 Bingo active at a time.
- Ironmen will be able to enter, for free. However, they cannot win rewards.
- Note: You need to add tiles yourself, using our predefined tiles AND/OR your own custom tiles. You can add tiles using ${globalClient.mentionCommand(
				'bingo',
				'manage_bingo',
				'add_tile'
			)} command.

**Your Bingo settings(Can be edited):**
**Title:** ${createOptions.title} (*Cannot be changed after the bingo starts*)
**Duration:** ${createOptions.duration_days} days  (*Cannot be changed after the bingo starts*)
**Start Date:** ${dateFm(createOptions.start_date)} (*Cannot be changed after the bingo starts*)
**Finish Date:** ${dateFm(new Date(createOptions.start_date.getTime() + createOptions.duration_days * Time.Day))}
**Ticket Price:** ${toKMB(createOptions.ticket_price)} (*Cannot be changed later*)
**Team Size:** ${createOptions.team_size} (*Cannot be changed later*)
**Notifications Channel:** ${createOptions.notifications_channel_id}
**Organizers:** ${createOptions.organizers.map(userMention).join(', ')}

${Emoji.Warning} **You will pay a ${toKMB(fee)} GP fee to create this bingo, you will be charged after confirming.** ${
				Emoji.Warning
			}
`;

			await interaction.confirmation(disclaimer);

			await user.removeItemsFromBank(new Bank().add('Coins', fee));
			await prisma.bingo.create({
				data: createOptions
			});

			Logging.logDebug('Created bingo', createOptions);

			return 'Created your Bingo succesfully!';
		}

		if (options.manage_bingo) {
			if (!options.manage_bingo.bingo) {
				return 'You need to pick which bingo to manage.';
			}
			const _bingo = await getBingoFromUserInput(options.manage_bingo.bingo);
			if (!_bingo) return 'Invalid bingo.';
			if (_bingo.creator_id !== user.id && !_bingo.organizers.includes(user.id)) {
				return 'You are not an organizer of this bingo.';
			}
			const bingo = new BingoManager(_bingo);
			if (options.manage_bingo.finalize) {
				if (user.id !== bingo.creatorID) {
					return 'Only the creator of the bingo can finalize it.';
				}
				const creator = await mUserFetch(bingo.creatorID);
				if (bingo.wasFinalized) {
					return 'This bingo was already finalized.';
				}
				const loot = new Bank().add('Coins', await bingo.countTotalGPInPrizePool());
				await interaction.confirmation(
					`Are you sure you want to end the Bingo? ${bold('This cannot be undone.')}

The creator of the bingo (${userMention(
						bingo.creatorID
					)}) will receive the ${loot} prize pool, so they can distribute it.`
				);

				await creator.addItemsToBank({ items: loot, collectionLog: false });
				await prisma.bingo.update({
					where: {
						id: bingo.id
					},
					data: {
						was_finalized: true
					}
				});
				return `${creator} received ${loot}. The Bingo has now ended.`;
			}
			if (options.manage_bingo.csv_dump) {
				const { users, teams } = await bingo.fetchAllParticipants();
				return {
					files: [
						{
							buffer: Buffer.from(
								(
									await Promise.all(
										teams.map(team =>
											[
												team.participants
													.map(u => Cache.getBadgedUsername(u.user_id))
													.join(','),
												team.tilesCompletedCount,
												team.trophy?.item.name ?? 'No Trophy'
											].join('\t')
										)
									)
								).join('\n')
							),
							name: 'teams.txt'
						},
						{
							buffer: Buffer.from(users.map(u => [u.id, u.tilesCompletedCount].join('\t')).join('\n')),
							name: 'users.txt'
						}
					]
				};
			}

			if (options.manage_bingo.add_tile) {
				if (bingo.isActive()) {
					return "You can't add tiles to a bingo after it has started.";
				}
				const globalTile = globalBingoTiles.find(t => stringMatches(t.id, options.manage_bingo?.add_tile));
				let tileToAdd: StoredBingoTile | null = null;
				if (globalTile) {
					tileToAdd = { global: globalTile.id };
				} else {
					tileToAdd = parseTileAddInput(options.manage_bingo.add_tile);
				}
				if (!tileToAdd) {
					return `Invalid tile to add. You can either select a global/predefined tile, or input a custom tile.

Example: \`add_tile:Coal+Trout+Egg\` is a tile where you have to receive a coal AND trout AND egg.
Example: \`add_tile:Coal|Trout|Egg\` is a tile where you have to receive a coal OR trout OR egg.`;
				}
				await prisma.bingo.update({
					where: {
						id: bingo.id
					},
					data: {
						bingo_tiles: {
							push: tileToAdd as any as PrismaCompatibleJsonObject
						}
					}
				});
				return `Added tile "${generateTileName(tileToAdd)}" to your bingo.`;
			}

			if (options.manage_bingo.remove_tile) {
				if (bingo.isActive()) {
					return "You can't remove tiles to a bingo after it has started.";
				}
				let newTiles = [...bingo.rawBingoTiles];
				const globalTile = globalBingoTiles.find(t => stringMatches(t.id, options.manage_bingo?.remove_tile));
				let tileName = '';
				if (globalTile) {
					newTiles = newTiles.filter(
						t => (isGlobalTile(t) && t.global !== globalTile.id) || !isGlobalTile(t)
					);
					tileName = generateTileName(globalTile);
				} else {
					const tileToRemove = newTiles.find(
						t => md5sum(generateTileName(t)) === options.manage_bingo!.remove_tile
					);
					if (tileToRemove) {
						newTiles = newTiles.filter(
							t => md5sum(generateTileName(t)) !== options.manage_bingo!.remove_tile!
						);
						tileName = generateTileName(tileToRemove);
					}
				}

				if (newTiles.length === bingo.rawBingoTiles.length) {
					return 'Invalid tile to remove.';
				}

				await interaction.confirmation(`Are you sure you want to remove this tile?\n\n${tileName}`);
				await prisma.bingo.update({
					where: {
						id: bingo.id
					},
					data: {
						bingo_tiles: newTiles as any as PrismaCompatibleJsonObject[]
					}
				});

				return `Removed "${tileName}" from your bingo.`;
			}

			if (options.manage_bingo.add_extra_gp) {
				const amount = Number(options.manage_bingo.add_extra_gp);
				if (Number.isNaN(amount) || amount < 1) {
					return 'Invalid amount.';
				}

				const cost = new Bank().add('Coins', amount);
				if (user.GP < cost.amount('Coins')) {
					return `You need at least ${cost} to add that much GP to the prize pool.`;
				}

				await interaction.confirmation(
					`Are you sure you want to add ${cost} to the prize pool? You cannot undo this.`
				);

				await user.removeItemsFromBank(cost);
				await prisma.bingo.update({
					where: {
						id: bingo.id
					},
					data: {
						extra_gp: {
							increment: amount
						}
					}
				});
				Logging.logDebug('Added extra gp to bingo', { bingoID: bingo.id, amount });

				return `Added ${cost} to the prize pool.`;
			}

			if (options.manage_bingo.trophy_handout) {
				if (!bingo.isGlobal || !bingo.wasFinalized || !bingo.trophiesApply) {
					return 'This bingo is not eligible for trophies.';
				}
				const result = await bingo.fetchAllParticipants();

				const toInsert: Prisma.ReclaimableItemCreateManyInput[] = [];

				for (const team of result.teams) {
					if (!team.trophy) continue;
					const trophiesToReceive = BingoTrophies.filter(
						trophy => trophy.percentile >= team.trophy!.percentile
					);

					for (const userId of team.participants.map(t => t.user_id)) {
						const reclaimableItems: Prisma.ReclaimableItemCreateManyInput[] = await Promise.all(
							trophiesToReceive.map(async trophy => ({
								name: `Bingo Trophy (${trophy.item.name})`,
								quantity: 1,
								key: `bso-bingo-2-${trophy.item.id}`,
								item_id: trophy.item.id,
								description: `Awarded for placing in the top ${trophy.percentile}% of ${
									bingo.title
								}. Your team (${(await Promise.all(team.participants.map(async t => await Cache.getBadgedUsername(t.user_id)))).join(', ')}) placed ${formatOrdinal(team.rank)} with ${
									team.tilesCompletedCount
								} tiles completed.`,
								date: bingo.endDate.toISOString(),
								user_id: userId
							}))
						);
						toInsert.push(...reclaimableItems);
					}
				}

				await prisma.reclaimableItem.createMany({
					data: toInsert
				});

				return 'Handed out trophies.';
			}
		}

		if (options.view) {
			const _bingo = await getBingoFromUserInput(options.view.bingo);
			if (!_bingo) return 'Invalid bingo.';
			const bingo = new BingoManager(_bingo);

			const { teams } = await bingo.fetchAllParticipants();
			const yourTeam = teams.find(t => t.participants.some(p => p.user_id === user.id));
			const yourParticipant = yourTeam?.participants.find(p => p.user_id === user.id);

			let progressString = '';
			if (yourTeam && yourParticipant) {
				const yourProgress = bingo.determineProgressOfBank(yourParticipant.cl as ItemBank);

				progressString = bingo.isActive()
					? `You have ${yourProgress.tilesCompletedCount} tiles completed.
${yourProgress.bingoTableStr}
**Your team:** ${yourTeam.participants.map(p => userMention(p.user_id)).join(', ')}
Your team has ${yourTeam.tilesCompletedCount} tiles completed.
${yourTeam.bingoTableStr}`
					: '';

				if (bingo.isGlobal) {
					progressString += `\n${
						yourTeam.trophy
							? `**Trophy:** ${yourTeam.trophy.emoji} ${yourTeam.trophy.item.name}\n`
							: 'Your team has not qualified for a trophy.'
					}`;
				}
			}

			const str = `**${bingo.title}** ${teams.length} teams, ${toKMB(await bingo.countTotalGPInPrizePool())} GP Prize Pool
**Start:** ${dateFm(bingo.startDate)}
**Finish:** ${dateFm(bingo.endDate)}
${progressString}
`;

			return {
				content: str,
				allowedMentions: {
					parse: [],
					users: [],
					roles: []
				},
				files: [
					{
						buffer: Buffer.from(bingo.bingoTiles.map((t, i) => `${++i}. ${t.name}`).join('\n')),
						name: 'tiles_board.txt'
					}
				]
			};
		}

		return 'Invalid command.';
	}
});
