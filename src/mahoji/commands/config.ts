import { Embed, inlineCode } from '@discordjs/builders';
import { User } from '@prisma/client';
import { Guild, HexColorString, Util } from 'discord.js';
import { uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { client, mahojiClient } from '../..';
import { BitField, PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { CombatOptionsArray, CombatOptionsEnum } from '../../lib/minions/data/combatConstants';
import { prisma } from '../../lib/settings/prisma';
import { BankSortMethods } from '../../lib/sorts';
import { itemNameFromID, removeFromArr, stringMatches } from '../../lib/util';
import { getItem } from '../../lib/util/getOSItem';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { itemOption } from '../lib/mahojiCommandOptions';
import { allAbstractCommands, hasBanMemberPerms, OSBMahojiCommand } from '../lib/util';
import {
	mahojiGuildSettingsFetch,
	mahojiGuildSettingsUpdate,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch,
	patronMsg
} from '../mahojiSettings';

const toggles = [
	{
		name: 'Disable Random Events',
		bit: BitField.DisabledRandomEvents
	},
	{
		name: 'Small Bank Images',
		bit: BitField.AlwaysSmallBank
	}
];

async function handleToggle(user: User, name: string) {
	const toggle = toggles.find(i => stringMatches(i.name, name));
	if (!toggle) return 'Invalid toggle name.';
	const includedNow = user.bitfield.includes(toggle.bit);
	const nextArr = includedNow ? removeFromArr(user.bitfield, toggle.bit) : [...user.bitfield, toggle.bit];
	await mahojiUserSettingsUpdate(client, user.id, {
		bitfield: nextArr
	});
	return `Toggled '${toggle.name}' ${includedNow ? 'Off' : 'On'}.`;
}

async function favFoodConfig(user: User, itemToAdd: string | undefined, itemToRemove: string | undefined) {
	const currentFavorites = user.favorite_food;
	const item = getItem(itemToAdd ?? itemToRemove);
	if (!item || !Eatables.some(i => i.id === item.id)) return "That's not a valid item.";
	if (itemToAdd) {
		if (currentFavorites.includes(item.id)) return 'This item is already favorited.';
		await mahojiUserSettingsUpdate(client, user.id, { favorite_food: [...currentFavorites, item.id] });
		return `You favorited ${item.name}.`;
	}
	if (itemToRemove) {
		if (!currentFavorites.includes(item.id)) return 'This item is not favorited.';
		await mahojiUserSettingsUpdate(client, user.id, { favorite_food: removeFromArr(currentFavorites, item.id) });
		return `You unfavorited ${item.name}.`;
	}
	return `Your current favorite food is: ${
		currentFavorites.length === 0 ? 'None' : currentFavorites.map(itemNameFromID).join(', ')
	}.`;
}

async function favItemConfig(user: User, itemToAdd: string | undefined, itemToRemove: string | undefined) {
	const currentFavorites = user.favoriteItems;
	const item = getItem(itemToAdd ?? itemToRemove);
	if (!item) return "That's not a valid item.";
	if (itemToAdd) {
		let limit = (getUsersPerkTier(user.bitfield) + 1) * 100;
		if (currentFavorites.length >= limit) {
			return `You can't favorite anymore items, you can favorite a maximum of ${limit}.`;
		}
		if (currentFavorites.includes(item.id)) return 'This item is already favorited.';
		await mahojiUserSettingsUpdate(client, user.id, { favoriteItems: [...currentFavorites, item.id] });
		return `You favorited ${item.name}.`;
	}
	if (itemToRemove) {
		if (!currentFavorites.includes(item.id)) return 'This item is not favorited.';
		await mahojiUserSettingsUpdate(client, user.id, { favoriteItems: removeFromArr(currentFavorites, item.id) });
		return `You unfavorited ${item.name}.`;
	}
	return `Your current favorite items are: ${
		currentFavorites.length === 0 ? 'None' : currentFavorites.map(itemNameFromID).join(', ')
	}.`;
}

async function favAlchConfig(
	user: User,
	itemToAdd: string | undefined,
	itemToRemove: string | undefined,
	manyToAdd: string | undefined
) {
	const currentFavorites = user.favorite_alchables;
	if (manyToAdd) {
		const items = parseBank({ inputStr: manyToAdd })
			.filter(i => i.highalch > 1)
			.filter(i => !currentFavorites.includes(i.id));
		if (items.length === 0) return 'No valid items were given.';
		const newFavs = uniqueArr([...currentFavorites, ...items.items().map(i => i[0].id)]);
		await mahojiUserSettingsUpdate(client, user.id, {
			favorite_alchables: newFavs
		});
		return `Added ${items
			.items()
			.map(i => i[0].name)
			.join(', ')} to your favorites.`;
	}

	const removeItem = itemToRemove ? getItem(itemToRemove) : null;
	const addItem = itemToAdd ? getItem(itemToAdd) : null;
	const item = removeItem || addItem;

	if (!item) {
		if (currentFavorites.length === 0) {
			return 'You have no favorited alchable items.';
		}
		return `Your current favorite alchable items are: ${currentFavorites.map(itemNameFromID).join(', ')}.`;
	}

	if (!item.highalch) return "That item isn't alchable.";

	const action = Boolean(removeItem) ? 'remove' : 'add';
	const isAlreadyFav = currentFavorites.includes(item.id);

	if (action === 'remove') {
		if (!isAlreadyFav) return 'That item is not favorited.';
		await mahojiUserSettingsUpdate(client, user.id, {
			favorite_alchables: removeFromArr(currentFavorites, item.id)
		});
		return `Removed ${item.name} from your favorite alchable items.`;
	}
	if (isAlreadyFav) return 'That item is already favorited.';
	await mahojiUserSettingsUpdate(client, user.id, {
		favorite_alchables: uniqueArr([...currentFavorites, item.id])
	});
	return `Added ${item.name} to your favorite alchable items.`;
}

async function bankSortConfig(
	user: KlasaUser,
	mahojiUser: User,
	sortMethod: string | undefined,
	addWeightingBank: string | undefined,
	removeWeightingBank: string | undefined
): CommandResponse {
	const currentMethod = mahojiUser.bank_sort_method;
	const currentWeightingBank = new Bank(mahojiUser.bank_sort_weightings as ItemBank);

	const perkTier = getUsersPerkTier(user);
	if (perkTier < PerkTier.Two) {
		return patronMsg(PerkTier.Two);
	}

	if (!sortMethod && !addWeightingBank && !removeWeightingBank) {
		const sortStr = currentMethod
			? `Your current bank sort method is ${inlineCode(currentMethod)}.`
			: 'You have not set a bank sort method.';
		const weightingBankStr = currentWeightingBank.toString();
		const response: Awaited<CommandResponse> = {
			content: sortStr
		};
		if (weightingBankStr.length > 500) {
			response.content += `\n**Weightings:**${weightingBankStr}`;
		} else {
			response.attachments = [
				(
					await makeBankImage({
						bank: currentWeightingBank,
						title: 'Bank Sort Weightings',
						user: client.users.cache.get(mahojiUser.id)
					})
				).file
			];
		}
		return response;
	}

	if (sortMethod) {
		if (!(BankSortMethods as readonly string[]).includes(sortMethod)) {
			return `That's not a valid bank sort method. Valid methods are: ${BankSortMethods.join(', ')}.`;
		}
		await mahojiUserSettingsUpdate(client, mahojiUser.id, {
			bank_sort_method: sortMethod
		});

		return `Your bank sort method is now ${inlineCode(sortMethod)}.`;
	}

	const newBank = currentWeightingBank.clone();
	const inputStr = addWeightingBank ?? removeWeightingBank ?? '';
	const inputBank = parseBank({
		inputStr
	});

	if (addWeightingBank) newBank.add(inputBank);
	else if (removeWeightingBank) newBank.remove(inputBank);

	const { newUser } = await mahojiUserSettingsUpdate(client, mahojiUser.id, {
		bank_sort_weightings: newBank.bank
	});

	return bankSortConfig(user, newUser, undefined, undefined, undefined);
}

async function bgColorConfig(user: User, hex?: string) {
	const currentColor = user.bank_bg_hex;

	const embed = new Embed();

	if (hex === 'reset') {
		await mahojiUserSettingsUpdate(client, user.id, {
			bank_bg_hex: null
		});
		return 'Reset your bank background color.';
	}

	if (!hex) {
		if (!currentColor) {
			return 'You have no background color set.';
		}
		return {
			embeds: [
				embed
					.setColor(Util.resolveColor(currentColor as HexColorString))
					.setDescription(`Your current background color is \`${currentColor}\`.`)
			]
		};
	}

	hex = hex.toUpperCase();
	const isValid = hex.length === 7 && /^#([0-9A-F]{3}){1,2}$/i.test(hex);
	if (!isValid) {
		return "That's not a valid hex color. It needs to be 7 characters long, starting with '#', for example: #4e42f5 - use this to pick one: <https://www.google.com/search?q=hex+color+picker>";
	}

	await mahojiUserSettingsUpdate(client, user.id, {
		bank_bg_hex: hex
	});

	return {
		embeds: [
			embed
				.setColor(Util.resolveColor(hex as HexColorString))
				.setDescription(`Your background color is now \`${hex}\``)
		]
	};
}

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

		await mahojiGuildSettingsUpdate(client, guild.id, {
			staffOnlyChannels: [...settings.staffOnlyChannels, cID]
		});

		return 'Channel disabled. Staff of this server can still use commands in this channel.';
	}
	if (!isDisabled) return 'This channel is already enabled.';

	await mahojiGuildSettingsUpdate(client, guild.id, {
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
		await mahojiGuildSettingsUpdate(client, guild.id, {
			tweetchannel: cID
		});

		if (settings.tweetchannel) {
			return "Jmod Tweets are already enabled in another channel, but I've switched them to use this channel.";
		}
		return 'Enabled Jmod Tweets in this channel.';
	}
	if (!settings.tweetchannel) return "Jmod Tweets aren't enabled, so you can't disable them.";
	await mahojiGuildSettingsUpdate(client, guild.id, {
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
		await mahojiGuildSettingsUpdate(client, guild.id, {
			petchannel: cID
		});
		return 'Enabled Pet Messages in this guild.';
	}
	if (settings.petchannel === null) {
		return "Pet Messages aren't enabled, so you can't disable them.";
	}
	await mahojiGuildSettingsUpdate(client, guild.id, {
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
		await mahojiGuildSettingsUpdate(client, guild.id, {
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
	await mahojiGuildSettingsUpdate(client, guild.id, {
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
	const command = allAbstractCommands(client, mahojiClient).find(
		i => i.name.toLowerCase() === commandName.toLowerCase()
	);
	if (!command) return "That's not a valid command.";

	if (choice === 'enable') {
		if (!settings.disabledCommands.includes(commandName)) {
			return "That command isn't disabled.";
		}
		await mahojiGuildSettingsUpdate(client, guild.id, {
			disabledCommands: settings.disabledCommands.filter(i => i !== command.name)
		});

		return `Successfully enabled the \`${commandName}\` command.`;
	}

	if (settings.disabledCommands.includes(command.name)) {
		return 'That command is already disabled.';
	}
	await mahojiGuildSettingsUpdate(client, guild.id, {
		disabledCommands: [...settings.disabledCommands, command.name]
	});

	return `Successfully disabled the \`${command.name}\` command.`;
}

async function handlePrefixChange(user: KlasaUser, guild: Guild | null, newPrefix: string) {
	if (!newPrefix || newPrefix.length === 0 || newPrefix.length > 3) return 'Invalid prefix.';
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	await mahojiGuildSettingsUpdate(client, guild.id, {
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
		settings.combat_options = removeFromArr(settings.combat_options, CombatOptionsEnum.AlwaysIceBurst);
	}
	// If enabling Ice Burst, make sure barrage isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBurst &&
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBarrage)
	) {
		if (warningMsg === '' && hasCannon) warningMsg = priorityWarningMsg;
		settings.combat_options = removeFromArr(settings.combat_options, CombatOptionsEnum.AlwaysIceBarrage);
	}
	// Warn if enabling cannon with ice burst/barrage:
	if (nextBool && newcbopt.id === CombatOptionsEnum.AlwaysCannon && warningMsg === '' && hasBurstB) {
		warningMsg = priorityWarningMsg;
	}
	if (nextBool && !settings.combat_options.includes(newcbopt.id)) {
		await mahojiUserSettingsUpdate(client, user.id, {
			combat_options: [...settings.combat_options, newcbopt.id]
		});
	} else if (!nextBool && settings.combat_options.includes(newcbopt.id)) {
		await mahojiUserSettingsUpdate(client, user.id, {
			combat_options: removeFromArr(settings.combat_options, newcbopt.id)
		});
	} else {
		return 'Error processing command. This should never happen, please report bug.';
	}

	return `${newcbopt.name} is now ${nextBool ? 'enabled' : 'disabled'} for you.${warningMsg}`;
}

async function handleRSN(user: KlasaUser, newRSN: string) {
	const settings = await mahojiUsersSettingsFetch(user.id);
	const { RSN } = settings;
	if (!newRSN && RSN) {
		return `Your current RSN is: \`${RSN}\``;
	}

	if (!newRSN && !RSN) {
		return "You don't have an RSN set. You can set one like this: `/config user set_rsn <username>`";
	}

	newRSN = newRSN.toLowerCase();
	if (!newRSN.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$')) {
		return 'That username is not valid.';
	}

	if (RSN === newRSN) {
		return `Your RSN is already set to \`${RSN}\``;
	}

	await mahojiUserSettingsUpdate(client, user.id, {
		RSN: newRSN
	});
	if (RSN !== null) {
		return `Changed your RSN from \`${RSN}\` to \`${newRSN}\``;
	}
	return `Your RSN has been set to: \`${newRSN}\`.`;
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
								return allAbstractCommands(client, mahojiClient)
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
					name: 'toggle',
					description: 'Toggle different settings on and off.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'The thing you want to toggle on/off.',
							required: true,
							autocomplete: async (value, user) => {
								const mUser = await prisma.user.findFirst({
									where: {
										id: user.id
									},
									select: {
										bitfield: true
									}
								});
								const bitfield = mUser?.bitfield ?? [];
								return toggles
									.filter(i => {
										if (!value) return true;
										return i.name.toLowerCase().includes(value.toLowerCase());
									})
									.map(i => ({
										name: `${i.name} (Currently ${bitfield.includes(i.bit) ? 'On' : 'Off'})`,
										value: i.name
									}));
							}
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
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'set_rsn',
					description: 'Set your RuneScape username in the bot.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'username',
							description: 'Your RuneScape username.',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'bg_color',
					description: 'Set a custom color for transparent bank backgrounds.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'color',
							description: 'The color in hex format.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'bank_sort',
					description: 'Change the way your bank is sorted.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'sort_method',
							description: 'The way items in your bank should be sorted.',
							required: false,
							choices: BankSortMethods.map(i => ({ name: i, value: i }))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'add_weightings',
							description: "Add custom weightings for extra bank sorting (e.g. '1 trout, 5 coal')",
							required: false
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'remove_weightings',
							description: "Remove weightings for extra bank sorting (e.g. '1 trout, 5 coal')",
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'favorite_alchs',
					description: 'Manage your favorite alchables.',
					options: [
						{
							...itemOption(item => item.highalch > 10),
							name: 'add',
							description: 'Add an item to your favorite alchables.',
							required: false
						},
						{
							...itemOption(item => item.highalch > 10),
							name: 'remove',
							description: 'Remove an item from your favorite alchables.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'add_many',
							description: 'Add many to your favorite alchables at once.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'favorite_food',
					description: 'Manage your favorite food.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'add',
							description: 'Add an item to your favorite food.',
							required: false,
							autocomplete: async (value: string) => {
								return Eatables.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({
									name: `${i.name}`,
									value: i.id.toString()
								}));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'remove',
							description: 'Remove an item from your favorite food.',
							required: false,
							autocomplete: async (value: string, user: APIUser) => {
								const mUser = await mahojiUsersSettingsFetch(user.id, { favorite_food: true });
								return Eatables.filter(i => {
									if (!mUser.favorite_food.includes(i.id)) return false;
									return !value ? true : i.name.toLowerCase().includes(value.toLowerCase());
								}).map(i => ({
									name: `${i.name}`,
									value: i.id.toString()
								}));
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'favorite_items',
					description: 'Manage your favorite items.',
					options: [
						{
							...itemOption(),
							name: 'add',
							description: 'Add an item to your favorite items.',
							required: false
						},
						{
							...itemOption(),
							name: 'remove',
							description: 'Remove an item from your favorite items.',
							required: false
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
			toggle?: { name: string };
			combat_options?: { action: 'add' | 'remove' | 'list' | 'help'; input: string };
			set_rsn?: { username: string };
			bg_color?: { color?: string };
			bank_sort?: { sort_method?: string; add_weightings?: string; remove_weightings?: string };
			favorite_alchs?: { add?: string; remove?: string; add_many?: string };
			favorite_food?: { add?: string; remove?: string };
			favorite_items?: { add?: string; remove?: string };
		};
	}>) => {
		const [user, mahojiUser] = await Promise.all([client.fetchUser(userID), mahojiUsersSettingsFetch(userID)]);
		const guild = guildID ? client.guilds.cache.get(guildID.toString()) ?? null : null;
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
			const {
				toggle,
				combat_options,
				set_rsn,
				bg_color,
				bank_sort,
				favorite_alchs,
				favorite_food,
				favorite_items
			} = options.user;
			if (toggle) {
				return handleToggle(mahojiUser, toggle.name);
			}
			if (combat_options) {
				return handleCombatOptions(user, combat_options.action, combat_options.input);
			}
			if (set_rsn) {
				return handleRSN(user, set_rsn.username);
			}
			if (bg_color) {
				return bgColorConfig(mahojiUser, bg_color.color);
			}
			if (bank_sort) {
				return bankSortConfig(
					user,
					mahojiUser,
					bank_sort.sort_method,
					bank_sort.add_weightings,
					bank_sort.remove_weightings
				);
			}
			if (favorite_alchs) {
				return favAlchConfig(mahojiUser, favorite_alchs.add, favorite_alchs.remove, favorite_alchs.add_many);
			}
			if (favorite_food) {
				return favFoodConfig(mahojiUser, favorite_food.add, favorite_food.remove);
			}
			if (favorite_items) {
				return favItemConfig(mahojiUser, favorite_items.add, favorite_items.remove);
			}
		}
		return 'Invalid command.';
	}
};
