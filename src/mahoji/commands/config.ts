import { Guild } from 'discord.js';
import { uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { BitField, PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
import { CombatOptionsArray, CombatOptionsEnum } from '../../lib/minions/data/combatConstants';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { removeFromArr, stringMatches } from '../../lib/util';
import { allAbstractCommands, hasBanMemberPerms, OSBMahojiCommand } from '../lib/util';
import {
	mahojiGuildSettingsFetch,
	mahojiGuildSettingsUpdate,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch
} from '../mahojiSettings';

async function handleChannelEnable(
	user: KlasaUser,
	guild: Guild | null,
	channelID: bigint,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	const cID = channelID.toString();
	const settings = await mahojiGuildSettingsFetch(guild);
	const isDisabled = settings.staffOnlyChannels.includes(cID);

	if (choice === 'disable') {
		if (isDisabled) return 'This channel is already disabled.';

		await mahojiGuildSettingsUpdate(guild.id, {
			staffOnlyChannels: [...settings.staffOnlyChannels, cID]
		});

		return 'Channel disabled. Staff of this server can still use commands in this channel.';
	}
	if (!isDisabled) return 'This channel is already enabled.';

	await mahojiGuildSettingsUpdate(guild.id, {
		staffOnlyChannels: settings.staffOnlyChannels.filter(i => i !== cID)
	});

	return 'Channel enabled. Anyone can use commands in this channel now.';
}

async function handleTweetsEnable(
	user: KlasaUser,
	guild: Guild | null,
	channelID: bigint,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	const cID = channelID.toString();
	const settings = await mahojiGuildSettingsFetch(guild);

	if (choice === 'enable') {
		if (guild.memberCount < 20 && user.perkTier < PerkTier.Four) {
			return TWEETS_RATELIMITING;
		}
		if (settings.tweetchannel === cID) {
			return 'Jmod Tweets are already enabled in this channel.';
		}
		await mahojiGuildSettingsUpdate(GuildSettings.JModTweets, {
			tweetchannel: cID
		});

		if (settings.tweetchannel) {
			return "Jmod Tweets are already enabled in another channel, but I've switched them to use this channel.";
		}
		return 'Enabled Jmod Tweets in this channel.';
	}
	if (!settings.tweetchannel) return "Jmod Tweets aren't enabled, so you can't disable them.";
	await mahojiGuildSettingsUpdate(GuildSettings.JModTweets, {
		tweetchannel: null
	});
	return 'Disabled Jmod Tweets in this channel.';
}

async function handlePetMessagesEnable(
	user: KlasaUser,
	guild: Guild | null,
	channelID: bigint,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	const settings = await mahojiGuildSettingsFetch(guild);

	const cID = channelID.toString();
	if (choice === 'enable') {
		if (settings.petchannel) {
			return 'Pet Messages are already enabled in this guild.';
		}
		await mahojiGuildSettingsUpdate(GuildSettings.PetChannel, {
			petchannel: cID
		});
		return 'Enabled Pet Messages in this guild.';
	}
	if (settings.petchannel === null) {
		return "Pet Messages aren't enabled, so you can't disable them.";
	}
	await mahojiGuildSettingsUpdate(GuildSettings.PetChannel, {
		petchannel: null
	});
	return 'Disabled Pet Messages in this guild.';
}

async function handleJModCommentsEnable(
	user: KlasaUser,
	guild: Guild | null,
	channelID: bigint,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	const cID = channelID.toString();
	const settings = await mahojiGuildSettingsFetch(guild);

	if (choice === 'enable') {
		if (guild!.memberCount < 20 && user.perkTier < PerkTier.Four) {
			return TWEETS_RATELIMITING;
		}
		if (settings.jmodComments === cID) {
			return 'JMod Comments are already enabled in this channel.';
		}
		await mahojiGuildSettingsUpdate(guild.id, {
			jmodComments: cID
		});
		if (settings.jmodComments !== null) {
			return "JMod Comments are already enabled in another channel, but I've switched them to use this channel.";
		}
		return 'Enabled JMod Comments in this channel.';
	}
	if (settings.jmodComments === null) {
		return "JMod Comments aren't enabled, so you can't disable them.";
	}
	await mahojiGuildSettingsUpdate(guild.id, {
		jmodComments: null
	});
	return 'Disabled JMod Comments in this channel.';
}

async function handleCommandEnable(
	user: KlasaUser,
	guild: Guild | null,
	commandName: string,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	const settings = await mahojiGuildSettingsFetch(guild);
	const command = allAbstractCommands(client).find(i => i.name.toLowerCase() === commandName.toLowerCase());
	if (!command) return "That's not a valid command.";

	if (choice === 'enable') {
		if (!settings.disabledCommands.includes(commandName)) {
			return "That command isn't disabled.";
		}
		await mahojiGuildSettingsUpdate(guild.id, {
			disabledCommands: settings.disabledCommands.filter(i => i !== command.name)
		});

		return `Successfully enabled the \`${commandName}\` command.`;
	}

	if (settings.disabledCommands.includes(command.name)) {
		return 'That command is already disabled.';
	}
	await mahojiGuildSettingsUpdate(guild.id, {
		disabledCommands: [...settings.disabledCommands, command.name]
	});

	return `Successfully disabled the \`${command.name}\` command.`;
}

async function handleRandomEventsEnable(user: KlasaUser, choice: 'enable' | 'disable') {
	const currentSettings = await mahojiUsersSettingsFetch(user);

	const nextBool = choice === 'enable' ? false : true;
	const currentStatus = currentSettings.bitfield.includes(BitField.DisabledRandomEvents);

	if (currentStatus === nextBool) {
		return `Random events are already ${!currentStatus ? 'enabled' : 'disabled'} for you.`;
	}

	await mahojiUserSettingsUpdate(user, {
		bitfield: uniqueArr(
			nextBool
				? [...currentSettings.bitfield, BitField.DisabledRandomEvents]
				: currentSettings.bitfield.filter(i => i !== BitField.DisabledRandomEvents)
		)
	});

	return `Random events are now ${!nextBool ? 'enabled' : 'disabled'} for you.`;
}

async function handlePrefixChange(user: KlasaUser, guild: Guild | null, newPrefix: string) {
	if (!newPrefix || newPrefix.length === 0 || newPrefix.length > 3) return 'Invalid prefix.';
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	await mahojiGuildSettingsUpdate(guild.id, {
		prefix: newPrefix
	});
	return `Changed Command Prefix for this server to \`${newPrefix}\``;
}
const priorityWarningMsg =
	"\n\n**Important: By default, 'Always barrage/burst' will take priority if 'Always cannon' is also enabled.**";
async function handleCombatOptions(user: KlasaUser, command: 'add' | 'remove' | 'list' | 'help', option?: string) {
	const settings = await mahojiUsersSettingsFetch(user.id);
	if (!command || (command && command === 'list')) {
		// List enabled combat options:
		const cbOpts = settings.combat_options.map(o => CombatOptionsArray.find(coa => coa!.id === o)!.name);
		return `Your current combat options are:\n${cbOpts.join('\n')}\n\nTry: \`/config user command_options help\``;
	}

	if (command === 'help' || !option || !['add', 'remove'].includes(command)) {
		return (
			'Changes your Combat Options. Usage: `/config user combat_options [add/remove/list] always cannon`' +
			`\n\nList of possible options:\n${CombatOptionsArray.map(coa => `**${coa!.name}**: ${coa!.desc}`).join(
				'\n'
			)}`
		);
	}

	const newcbopt = CombatOptionsArray.find(
		item =>
			stringMatches(option, item.name) ||
			(item.aliases && item.aliases.some(alias => stringMatches(alias, option)))
	);
	if (!newcbopt) return 'Cannot find matching option. Try: `/config user combat_options help`';

	const currentStatus = settings.combat_options.includes(newcbopt.id);

	const nextBool = command !== 'remove';

	if (currentStatus === nextBool) {
		return `"${newcbopt.name}" is already ${currentStatus ? 'enabled' : 'disabled'} for you.`;
	}

	let warningMsg = '';
	const hasCannon = settings.combat_options.includes(CombatOptionsEnum.AlwaysCannon);
	const hasBurstB =
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBurst) ||
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBarrage);
	// If enabling Ice Barrage, make sure burst isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBarrage &&
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBurst)
	) {
		if (hasCannon) warningMsg = priorityWarningMsg;
		await mahojiUserSettingsUpdate(user.id, {
			combat_options: removeFromArr(settings.combat_options, CombatOptionsEnum.AlwaysIceBurst)
		});
	}
	// If enabling Ice Burst, make sure barrage isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBurst &&
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBarrage)
	) {
		if (warningMsg === '' && hasCannon) warningMsg = priorityWarningMsg;
		await mahojiUserSettingsUpdate(user.id, {
			combat_options: removeFromArr(settings.combat_options, CombatOptionsEnum.AlwaysIceBarrage)
		});
	}
	// Warn if enabling cannon with ice burst/barrage:
	if (nextBool && newcbopt.id === CombatOptionsEnum.AlwaysCannon && warningMsg === '' && hasBurstB) {
		warningMsg = priorityWarningMsg;
	}
	await mahojiUserSettingsUpdate(user.id, {
		combat_options: [...settings.combat_options, newcbopt.id]
	});

	return `${newcbopt.name} is now ${nextBool ? 'enabled' : 'disabled'} for you.${warningMsg}`;
}

export const configCommand: OSBMahojiCommand = {
	name: 'config',
	description: 'Commands configuring settings and options.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'server',
			description: 'Change settings for your server.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'channel',
					description: 'Enable or disable commands in this channel.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable commands for this channel.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'jmod_tweets',
					description: 'Enable or disable JMod tweets in this channel.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable JMod tweets for this channel.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'pet_messages',
					description: 'Enable or disable Pet Messages in this server.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable Pet Messages for this server.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'jmod_comments',
					description: 'Enable or disable JMod Reddit comments in this server.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable JMod Reddit comments for this server.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'command',
					description: 'Enable or disable a command in your server.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'command',
							description: 'The command you want to enable/disable.',
							required: true,
							autocomplete: async value => {
								return allAbstractCommands(client)
									.map(i => ({ name: i.name, value: i.name }))
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable JMod Reddit comments for this server.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'prefix',
					description: 'Change the prefix for your server.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'new_prefix',
							description: 'The new prefix you want for your server.',
							required: true
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'user',
			description: 'Change settings for your account.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'random_events',
					description: 'Enable or disable receiving random events.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable random events for your account.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'combat_options',
					description: 'Change combat options.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'action',
							description: 'The action you want to perform.',
							required: true,
							choices: [
								{ name: 'Add', value: 'add' },
								{ name: 'Remove', value: 'remove' },
								{ name: 'List', value: 'list' },
								{ name: 'Help', value: 'help' }
							]
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'input',
							description: 'The option you want to add/remove.',
							required: false,
							autocomplete: async value => {
								console.log(value);
								return CombatOptionsArray.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({ name: i.name, value: i.name }));
							}
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		guildID,
		channelID
	}: CommandRunOptions<{
		server?: {
			channel?: { choice: 'enable' | 'disable' };
			jmod_tweets?: { choice: 'enable' | 'disable' };
			pet_messages?: { choice: 'enable' | 'disable' };
			jmod_comments?: { choice: 'enable' | 'disable' };
			command?: { command: string; choice: 'enable' | 'disable' };
			prefix?: { new_prefix: string };
		};
		user?: {
			random_events?: { choice: 'enable' | 'disable' };
			combat_options?: { action: 'add' | 'remove' | 'list' | 'help'; input: string };
		};
	}>) => {
		const user = await client.fetchUser(userID.toString());
		const guild = client.guilds.cache.get(guildID.toString()) ?? null;
		if (options.server) {
			if (options.server.channel) {
				return handleChannelEnable(user, guild, channelID, options.server.channel.choice);
			}
			if (options.server.jmod_tweets) {
				return handleTweetsEnable(user, guild, channelID, options.server.jmod_tweets.choice);
			}
			if (options.server.pet_messages) {
				return handlePetMessagesEnable(user, guild, channelID, options.server.pet_messages.choice);
			}
			if (options.server.jmod_comments) {
				return handleJModCommentsEnable(user, guild, channelID, options.server.jmod_comments.choice);
			}
			if (options.server.command) {
				return handleCommandEnable(user, guild, options.server.command.command, options.server.command.choice);
			}
			if (options.server.prefix) {
				return handlePrefixChange(user, guild, options.server.prefix.new_prefix);
			}
		}
		if (options.user) {
			if (options.user.random_events) {
				return handleRandomEventsEnable(user, options.user.random_events.choice);
			}
			if (options.user.combat_options) {
				return handleCombatOptions(user, options.user.combat_options.action, options.user.combat_options.input);
			}
		}
		return 'wut da';
	}
};
