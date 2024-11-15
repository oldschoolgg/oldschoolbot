import { channelIsSendable, hasBanMemberPerms, miniID } from '@oldschoolgg/toolkit/util';
import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { activity_type_enum } from '@prisma/client';
import type { ChatInputCommandInteraction, Guild, HexColorString, User } from 'discord.js';
import { EmbedBuilder, bold, inlineCode, resolveColor } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, clamp, removeFromArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { production } from '../../config';
import { BitField, ItemIconPacks, ParsedCustomEmojiWithGroups, PerkTier } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { CombatOptionsArray, CombatOptionsEnum } from '../../lib/minions/data/combatConstants';

import { DynamicButtons } from '../../lib/DynamicButtons';
import { birdhouseSeeds } from '../../lib/skilling/skills/hunter/birdHouseTrapping';
import { autoslayChoices, slayerMasterChoices } from '../../lib/slayer/constants';
import { setDefaultAutoslay, setDefaultSlayerMaster } from '../../lib/slayer/slayerUtil';
import { BankSortMethods } from '../../lib/sorts';
import { formatDuration, isValidNickname, itemNameFromID, stringMatches } from '../../lib/util';
import { emojiServers } from '../../lib/util/cachedUserIDs';
import { getItem } from '../../lib/util/getOSItem';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { mahojiGuildSettingsFetch, mahojiGuildSettingsUpdate } from '../guildSettings';
import { itemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { allAbstractCommands } from '../lib/util';
import { mahojiUsersSettingsFetch, patronMsg } from '../mahojiSettings';

interface UserConfigToggle {
	name: string;
	bit: BitField;
	canToggle?: (
		user: MUser,
		interaction?: ChatInputCommandInteraction
	) => Promise<{ result: false; message: string } | { result: true; message?: string }>;
}
const toggles: UserConfigToggle[] = [
	{
		name: 'Disable Random Events',
		bit: BitField.DisabledRandomEvents
	},
	{
		name: 'Small Bank Images',
		bit: BitField.AlwaysSmallBank
	},
	{
		name: 'Disable Birdhouse Run Button',
		bit: BitField.DisableBirdhouseRunButton
	},
	{
		name: 'Disable Auto Slay Button',
		bit: BitField.DisableAutoSlayButton
	},
	{
		name: 'Disable Ash Sanctifier',
		bit: BitField.DisableAshSanctifier
	},
	{
		name: 'Disable Auto Farm Contract Button',
		bit: BitField.DisableAutoFarmContractButton
	},
	{
		name: "Disable Grand Exchange DM's",
		bit: BitField.DisableGrandExchangeDMs
	},
	{
		name: 'Clean herbs during farm runs',
		bit: BitField.CleanHerbsFarming
	},
	{
		name: 'Lock Self From Gambling',
		bit: BitField.SelfGamblingLocked,
		canToggle: async (user, interaction) => {
			if (user.bitfield.includes(BitField.SelfGamblingLocked)) {
				if (user.user.gambling_lockout_expiry && user.user.gambling_lockout_expiry.getTime() > Date.now()) {
					const timeRemaining = user.user.gambling_lockout_expiry.getTime() - Date.now();
					return {
						result: false,
						message: `You cannot toggle this off for another ${formatDuration(
							timeRemaining
						)}, you locked yourself from gambling!`
					};
				}
				return { result: true, message: 'Your Gambling lockout time has expired.' };
			} else if (interaction) {
				const durations = [
					{ display: '1 day', duration: Time.Day },
					{ display: '7 days', duration: Time.Day * 7 },
					{ display: '1 month', duration: Time.Month },
					{ display: '6 months', duration: Time.Month * 6 },
					{ display: '1 year', duration: Time.Year }
				];
				const channel = globalClient.channels.cache.get(interaction.channelId);
				if (!channelIsSendable(channel)) return { result: false, message: 'Could not find channel.' };
				await deferInteraction(interaction);
				const buttons = new DynamicButtons({
					channel: channel,
					usersWhoCanInteract: [user.id],
					deleteAfterConfirm: true
				});
				for (const dur of durations) {
					buttons.add({
						name: dur.display
					});
				}
				const pickedButton = await buttons.render({
					messageOptions: {
						content: `${user}, This will lockout your ability to gamble for the specified time. Choose carefully!`
					},
					isBusy: false
				});

				const pickedDuration = durations.find(d => stringMatches(d.display, pickedButton?.name ?? ''));

				if (pickedDuration) {
					await user.update({ gambling_lockout_expiry: new Date(Date.now() + pickedDuration.duration) });
					return {
						result: true,
						message: `Locking out gambling for ${formatDuration(pickedDuration.duration)}`
					};
				}
				return { result: false, message: 'Cancelled.' };
			}
			// If handleToggle called without an interaction, perhaps by non-interactive code, allow toggle.
			return { result: true };
		}
	},
	{
		name: 'Disable farming reminders',
		bit: BitField.DisabledFarmingReminders
	},
	{
		name: 'Disable Clue Buttons',
		bit: BitField.DisableClueButtons
	},
	{
		name: 'Disable wilderness high peak time warning',
		bit: BitField.DisableHighPeakTimeWarning
	},
	{
		name: 'Disable Names on Opens',
		bit: BitField.DisableOpenableNames
	}
];

async function handleToggle(user: MUser, name: string, interaction?: ChatInputCommandInteraction) {
	const toggle = toggles.find(i => stringMatches(i.name, name));
	if (!toggle) return 'Invalid toggle name.';
	let messageExtra = '';
	if (toggle.canToggle) {
		const toggleResult = await toggle.canToggle(user, interaction);
		if (!toggleResult.result) {
			return toggleResult.message;
		} else if (toggleResult.message) {
			messageExtra = toggleResult.message;
		}
	}
	const includedNow = user.bitfield.includes(toggle.bit);
	const nextArr = includedNow ? removeFromArr(user.bitfield, toggle.bit) : [...user.bitfield, toggle.bit];
	await user.update({
		bitfield: nextArr
	});
	return `Toggled '${toggle.name}' ${includedNow ? 'Off' : 'On'}.${messageExtra ? `\n\n${messageExtra}` : ''}`;
}

async function favFoodConfig(
	user: MUser,
	itemToAdd: string | undefined,
	itemToRemove: string | undefined,
	reset: boolean
) {
	if (reset) {
		await user.update({ favorite_food: [] });
		return 'Cleared all favorite food.';
	}
	const currentFavorites = user.user.favorite_food;
	const item = getItem(itemToAdd ?? itemToRemove);
	const currentItems = `Your current favorite food is: ${
		currentFavorites.length === 0 ? 'None' : currentFavorites.map(itemNameFromID).join(', ')
	}.`;
	if (!item) return currentItems;
	if (!Eatables.some(i => i.id === item.id)) return "That's not a valid item.";

	if (itemToAdd) {
		if (currentFavorites.includes(item.id)) return 'This item is already favorited.';
		await user.update({ favorite_food: [...currentFavorites, item.id] });
		return `You favorited ${item.name}.`;
	}
	if (itemToRemove) {
		if (!currentFavorites.includes(item.id)) return 'This item is not favorited.';
		await user.update({ favorite_food: removeFromArr(currentFavorites, item.id) });
		return `You unfavorited ${item.name}.`;
	}
	return currentItems;
}

async function favItemConfig(
	user: MUser,
	itemToAdd: string | undefined,
	itemToRemove: string | undefined,
	reset: boolean
) {
	if (reset) {
		await user.update({ favoriteItems: [] });
		return 'Cleared all favorite items.';
	}
	const currentFavorites = user.user.favoriteItems;
	const item = getItem(itemToAdd ?? itemToRemove);
	const currentItems = `Your current favorite items are: ${
		currentFavorites.length === 0 ? 'None' : currentFavorites.map(itemNameFromID).join(', ').slice(0, 1500)
	}.`;

	if (!item) return currentItems;
	if (itemToAdd) {
		const limit = (user.perkTier() + 1) * 100;
		if (currentFavorites.length >= limit) {
			return `You can't favorite anymore items, you can favorite a maximum of ${limit}.`;
		}
		if (currentFavorites.includes(item.id)) return 'This item is already favorited.';
		await user.update({ favoriteItems: [...currentFavorites, item.id] });
		return `You favorited ${item.name}.`;
	}
	if (itemToRemove) {
		if (!currentFavorites.includes(item.id)) return 'This item is not favorited.';
		await user.update({ favoriteItems: removeFromArr(currentFavorites, item.id) });
		return `You unfavorited ${item.name}.`;
	}
	return currentItems;
}

async function favAlchConfig(
	user: MUser,
	itemToAdd: string | undefined,
	itemToRemove: string | undefined,
	manyToAdd: string | undefined,
	reset: boolean
) {
	if (reset) {
		await user.update({ favorite_alchables: [] });
		return 'Cleared all favorite alchables.';
	}
	const currentFavorites = user.user.favorite_alchables;
	if (manyToAdd) {
		const items = parseBank({ inputStr: manyToAdd, noDuplicateItems: true })
			.filter(i => i.highalch !== undefined && i.highalch > 1)
			.filter(i => !currentFavorites.includes(i.id));
		if (items.length === 0) return 'No valid items were given.';
		const newFavs = uniqueArr([...currentFavorites, ...items.items().map(i => i[0].id)]);
		await user.update({
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

	const action = removeItem ? 'remove' : 'add';
	const isAlreadyFav = currentFavorites.includes(item.id);

	if (action === 'remove') {
		if (!isAlreadyFav) return 'That item is not favorited.';
		await user.update({
			favorite_alchables: removeFromArr(currentFavorites, item.id)
		});
		return `Removed ${item.name} from your favorite alchable items.`;
	}
	if (isAlreadyFav) return 'That item is already favorited.';
	await user.update({
		favorite_alchables: uniqueArr([...currentFavorites, item.id])
	});
	return `Added ${item.name} to your favorite alchable items.`;
}

async function favBhSeedsConfig(
	user: MUser,
	itemToAdd: string | undefined,
	itemToRemove: string | undefined,
	reset: boolean
) {
	if (reset) {
		await user.update({ favorite_bh_seeds: [] });
		return 'Cleared all favorite birdhouse seeds.';
	}

	const currentFavorites = user.user.favorite_bh_seeds;
	if (itemToAdd || itemToRemove) {
		const item = getItem(itemToAdd ?? itemToRemove);
		if (!item) return "That item doesn't exist.";
		if (!birdhouseSeeds.some(seed => seed.item.id === item.id)) return "That item can't be used in birdhouses.";
		if (itemToAdd) {
			if (currentFavorites.includes(item.id)) return 'This item is already favorited.';
			await user.update({ favorite_bh_seeds: [...currentFavorites, item.id] });
			return `You favorited ${item.name}.`;
		}
		if (itemToRemove) {
			if (!currentFavorites.includes(item.id)) return 'This item is not favorited.';
			await user.update({ favorite_bh_seeds: removeFromArr(currentFavorites, item.id) });
			return `You unfavorited ${item.name}.`;
		}
	}

	const currentItems = `Your current favorite items are: ${
		currentFavorites.length === 0 ? 'None' : currentFavorites.map(itemNameFromID).join(', ')
	}.`;
	return currentItems;
}

async function bankSortConfig(
	user: MUser,
	sortMethod: string | undefined,
	addWeightingBank: string | undefined,
	removeWeightingBank: string | undefined,
	resetWeightingBank: string | undefined
): CommandResponse {
	const currentMethod = user.user.bank_sort_method;
	const currentWeightingBank = new Bank(user.user.bank_sort_weightings as ItemBank);

	const perkTier = user.perkTier();
	if (perkTier < PerkTier.Two) {
		return patronMsg(PerkTier.Two);
	}

	if (!sortMethod && !addWeightingBank && !removeWeightingBank && !resetWeightingBank) {
		const sortStr = currentMethod
			? `Your current bank sort method is ${inlineCode(currentMethod)}.`
			: 'You have not set a bank sort method.';
		const weightingBankStr = currentWeightingBank.toString();
		const response: Awaited<CommandResponse> = {
			content: sortStr
		};
		if (weightingBankStr.length < 500) {
			response.content += `\n**Weightings:**${weightingBankStr}`;
		} else {
			response.files = [
				(
					await makeBankImage({
						bank: currentWeightingBank,
						title: 'Bank Sort Weightings',
						user
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
		await user.update({
			bank_sort_method: sortMethod
		});

		return `Your bank sort method is now ${inlineCode(sortMethod)}.`;
	}

	const newBank = currentWeightingBank.clone();
	const inputStr = addWeightingBank ?? removeWeightingBank ?? '';
	const inputBank = parseBank({
		inputStr,
		noDuplicateItems: true
	});

	if (addWeightingBank) newBank.add(inputBank);
	else if (removeWeightingBank) newBank.remove(inputBank);
	else if (resetWeightingBank && resetWeightingBank === 'reset') newBank.clear();

	await user.update({
		bank_sort_weightings: newBank.toJSON()
	});

	return bankSortConfig(await mUserFetch(user.id), undefined, undefined, undefined, undefined);
}

async function bgColorConfig(user: MUser, hex?: string) {
	const currentColor = user.user.bank_bg_hex;

	const embed = new EmbedBuilder();

	if (hex === 'reset') {
		await user.update({
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
					.setColor(resolveColor(currentColor as HexColorString))
					.setDescription(`Your current background color is \`${currentColor}\`.`)
			]
		};
	}

	hex = hex.toUpperCase();
	const isValid = hex.length === 7 && /^#([0-9A-F]{3}){1,2}$/i.test(hex);
	if (!isValid) {
		return "That's not a valid hex color. It needs to be 7 characters long, starting with '#', for example: #4e42f5 - use this to pick one: <https://www.google.com/search?q=hex+color+picker>";
	}

	await user.update({
		bank_bg_hex: hex
	});

	return {
		embeds: [
			embed
				.setColor(resolveColor(hex as HexColorString))
				.setDescription(`Your background color is now \`${hex}\``)
		]
	};
}

async function handleChannelEnable(user: MUser, guild: Guild | null, channelID: string, choice: 'enable' | 'disable') {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user.id, guild)))
		return "You need to be 'Ban Member' permissions to use this command.";
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

async function handlePetMessagesEnable(
	user: MUser,
	guild: Guild | null,
	channelID: string,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user.id, guild)))
		return "You need to be 'Ban Member' permissions to use this command.";
	const settings = await mahojiGuildSettingsFetch(guild);

	const cID = channelID.toString();
	if (choice === 'enable') {
		if (settings.petchannel) {
			return 'Pet Messages are already enabled in this guild.';
		}
		await mahojiGuildSettingsUpdate(guild.id, {
			petchannel: cID
		});
		return 'Enabled Pet Messages in this guild.';
	}
	if (settings.petchannel === null) {
		return "Pet Messages aren't enabled, so you can't disable them.";
	}
	await mahojiGuildSettingsUpdate(guild.id, {
		petchannel: null
	});
	return 'Disabled Pet Messages in this guild.';
}

async function handleCommandEnable(
	user: MUser,
	guild: Guild | null,
	commandName: string,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user.id, guild)))
		return "You need to be 'Ban Member' permissions to use this command.";
	const settings = await mahojiGuildSettingsFetch(guild);
	const command = allAbstractCommands(globalClient.mahojiClient).find(
		i => i.name.toLowerCase() === commandName.toLowerCase()
	);
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

async function handleCombatOptions(user: MUser, command: 'add' | 'remove' | 'list' | 'help', option?: string) {
	const settings = await mahojiUsersSettingsFetch(user.id, { combat_options: true });
	if (!command || (command && command === 'list')) {
		// List enabled combat options:
		const cbOpts = settings.combat_options.map(o => CombatOptionsArray.find(coa => coa?.id === o)?.name);
		return `Your current combat options are:\n${cbOpts.join('\n')}\n\nTry: \`/config user combat_options help\``;
	}

	if (command === 'help' || !option || !['add', 'remove'].includes(command)) {
		return `Changes your Combat Options. Usage: \`/config user combat_options [add/remove/list] always cannon\`\n\nList of possible options:\n${CombatOptionsArray.map(
			coa => `**${coa?.name}**: ${coa?.desc}`
		).join('\n')}`;
	}

	const newcbopt = CombatOptionsArray.find(
		item => stringMatches(option, item.name) || item.aliases?.some(alias => stringMatches(alias, option))
	);
	if (!newcbopt) return 'Cannot find matching option. Try: `/config user combat_options help`';

	const currentStatus = settings.combat_options.includes(newcbopt.id);

	const nextBool = command !== 'remove';

	if (currentStatus === nextBool) {
		return `"${newcbopt.name}" is already ${currentStatus ? 'enabled' : 'disabled'} for you.`;
	}

	// If enabling Ice Barrage, make sure burst isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBarrage &&
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBurst)
	) {
		settings.combat_options = removeFromArr(settings.combat_options, CombatOptionsEnum.AlwaysIceBurst);
	}
	// If enabling Ice Burst, make sure barrage isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBurst &&
		settings.combat_options.includes(CombatOptionsEnum.AlwaysIceBarrage)
	) {
		settings.combat_options = removeFromArr(settings.combat_options, CombatOptionsEnum.AlwaysIceBarrage);
	}
	if (nextBool && !settings.combat_options.includes(newcbopt.id)) {
		await user.update({
			combat_options: [...settings.combat_options, newcbopt.id]
		});
	} else if (!nextBool && settings.combat_options.includes(newcbopt.id)) {
		await user.update({
			combat_options: removeFromArr(settings.combat_options, newcbopt.id)
		});
	} else {
		return 'Error processing command. This should never happen, please report bug.';
	}

	return `${newcbopt.name} is now ${nextBool ? 'enabled' : 'disabled'} for you.`;
}

async function handleRSN(user: MUser, newRSN: string) {
	const { RSN } = user.user;
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

	await user.update({
		RSN: newRSN
	});
	if (RSN !== null) {
		return `Changed your RSN from \`${RSN}\` to \`${newRSN}\``;
	}
	return `Your RSN has been set to: \`${newRSN}\`.`;
}

function pinnedTripLimit(perkTier: number) {
	return clamp(perkTier + 1, 1, 4);
}
export async function pinTripCommand(
	user: MUser,
	tripId: string | undefined,
	emoji: string | undefined,
	customName: string | undefined
) {
	if (!tripId) return 'Invalid trip.';
	const id = Number(tripId);
	if (!id || Number.isNaN(id)) return 'Invalid trip.';
	const trip = await prisma.activity.findFirst({ where: { id, user_id: BigInt(user.id) } });
	if (!trip) return 'Invalid trip.';

	if (emoji) {
		const res = ParsedCustomEmojiWithGroups.exec(emoji);
		if (!res || !res[3]) return "That's not a valid emoji.";
		emoji = res[3];

		const cachedEmoji = globalClient.emojis.cache.get(emoji);
		if ((!cachedEmoji || !emojiServers.has(cachedEmoji.guild.id)) && production) {
			return "Sorry, that emoji can't be used. Only emojis in the main support server, or our emoji servers can be used.";
		}
	}

	if (customName) {
		if (!isValidNickname(customName) || customName.length >= 32) return 'Invalid custom name.';
	}

	const limit = pinnedTripLimit(user.perkTier());
	const currentPinnedTripsCount = await prisma.pinnedTrip.count({ where: { user_id: user.id } });
	if (currentPinnedTripsCount >= limit) {
		return `You cannot have more than ${limit}x pinned trips, unpin one first. Your limit is ${limit}, you can get up to 4 by being a patron.`;
	}

	await prisma.pinnedTrip.create({
		data: {
			id: miniID(7),
			emoji_id: emoji,
			custom_name: customName,
			activity: {
				connect: {
					id: trip.id
				}
			},
			user: {
				connect: {
					id: user.id
				}
			},
			activity_type: trip.type,
			data: trip.data as object
		}
	});

	return `You pinned a ${trip.type} trip. You can now see it in your buttons.`;
}

async function unpinTripCommand(user: MUser, tripId: string | undefined) {
	const trip = await prisma.pinnedTrip.findFirst({ where: { id: tripId, user_id: user.id } });
	if (!trip) return 'Invalid trip.';
	await prisma.pinnedTrip.delete({ where: { id: trip.id } });
	return `You unpinned a ${trip.activity_type} trip.`;
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
					name: 'command',
					description: 'Enable or disable a command in your server.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'command',
							description: 'The command you want to enable/disable.',
							required: true,
							autocomplete: async value => {
								return allAbstractCommands(globalClient.mahojiClient)
									.map(i => ({ name: i.name, value: i.name }))
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Whether you want to enable or disable this command.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
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
							description: 'The setting you want to toggle on/off.',
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
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'reset_weightings',
							description: "Type 'reset' to confirm you want to delete ALL of your bank weightings.",
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
							...itemOption(item => item.highalch !== undefined && item.highalch > 10),
							name: 'add',
							description: 'Add an item to your favorite alchables.',
							required: false
						},
						{
							...itemOption(item => item.highalch !== undefined && item.highalch > 10),
							name: 'remove',
							description: 'Remove an item from your favorite alchables.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'add_many',
							description: 'Add many to your favorite alchables at once.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'reset',
							description: 'Reset all of your favorite alchs',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'favorite_bh_seeds',
					description: 'Manage your favorite birdhouse seeds.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'add',
							description: 'Add an item to your favorite birdhouse seeds.',
							required: false,
							autocomplete: async (value: string) => {
								return birdhouseSeeds
									.filter(i => (!value ? true : stringMatches(i.item.name, value)))
									.map(i => ({
										name: `${i.item.name}`,
										value: i.item.id.toString()
									}));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'remove',
							description: 'Remove an item from your favorite birdhouse seeds.',
							required: false,
							autocomplete: async (value: string, user: User) => {
								const mUser = await mahojiUsersSettingsFetch(user.id, { favorite_bh_seeds: true });
								return birdhouseSeeds
									.filter(i => {
										if (!mUser.favorite_bh_seeds.includes(i.item.id)) return false;
										return !value ? true : stringMatches(i.item.name, value);
									})
									.map(i => ({
										name: `${i.item.name}`,
										value: i.item.id.toString()
									}));
							}
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'reset',
							description: 'Reset all of your favorite birdhouse seeds.',
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
							autocomplete: async (value: string, user: User) => {
								const mUser = await mahojiUsersSettingsFetch(user.id, { favorite_food: true });
								return Eatables.filter(i => {
									if (!mUser.favorite_food.includes(i.id)) return false;
									return !value ? true : i.name.toLowerCase().includes(value.toLowerCase());
								}).map(i => ({
									name: `${i.name}`,
									value: i.id.toString()
								}));
							}
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'reset',
							description: 'Reset all of your favorite foods',
							required: false
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
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'reset',
							description: 'Reset all of your favorite items',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'slayer',
					description: 'Manage your Slayer options',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'master',
							description: 'Choose default slayer master',
							required: false,
							choices: slayerMasterChoices
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'autoslay',
							description: 'Set default autoslay mode',
							required: false,
							choices: autoslayChoices
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'pin_trip',
					description: 'Pin a trip so you can easily repeat it whenever you want.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'trip',
							description: 'The trip you want to pin.',
							required: false,
							autocomplete: async (_, user) => {
								const res = await prisma.$queryRawUnsafe<
									{ type: activity_type_enum; data: object; id: number; finish_date: string }[]
								>(`
SELECT DISTINCT ON (activity.type) activity.type, activity.data, activity.id, activity.finish_date
FROM activity
WHERE finish_date > now() - INTERVAL '14 days'
AND user_id = '${user.id}'::bigint
ORDER BY activity.type, finish_date DESC
LIMIT 20;
;`);
								return res.map(i => ({
									name: `${i.type} (Finished ${formatDuration(
										Date.now() - new Date(i.finish_date).getTime()
									)} ago)`,
									value: i.id.toString()
								}));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							required: false,
							name: 'emoji',
							description: 'Pick an emoji for the button (optional).'
						},
						{
							type: ApplicationCommandOptionType.String,
							required: false,
							name: 'custom_name',
							description: 'Custom name for the button (optional).'
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'unpin_trip',
							description: 'The trip you want to unpin.',
							required: false,
							autocomplete: async (_, user) => {
								const res = await prisma.pinnedTrip.findMany({ where: { user_id: user.id } });
								return res.map(i => ({
									name: `${i.activity_type}${i.custom_name ? `- ${i.custom_name}` : ''}`,
									value: i.id.toString()
								}));
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'icon_pack',
					description: 'Change your icon pack',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'The icon pack you want to use.',
							required: true,
							choices: ['Default', ...ItemIconPacks.map(i => i.name)].map(i => ({
								name: i,
								value: i
							}))
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
		channelID,
		interaction
	}: CommandRunOptions<{
		server?: {
			channel?: { choice: 'enable' | 'disable' };
			pet_messages?: { choice: 'enable' | 'disable' };
			command?: { command: string; choice: 'enable' | 'disable' };
		};
		user?: {
			toggle?: { name: string };
			combat_options?: { action: 'add' | 'remove' | 'list' | 'help'; input: string };
			set_rsn?: { username: string };
			bg_color?: { color?: string };
			bank_sort?: {
				sort_method?: string;
				add_weightings?: string;
				remove_weightings?: string;
				reset_weightings?: string;
			};
			favorite_alchs?: { add?: string; remove?: string; add_many?: string; reset?: boolean };
			favorite_food?: { add?: string; remove?: string; reset?: boolean };
			favorite_items?: { add?: string; remove?: string; reset?: boolean };
			favorite_bh_seeds?: { add?: string; remove?: string; reset?: boolean };
			slayer?: { master?: string; autoslay?: string };
			pin_trip?: { trip?: string; unpin_trip?: string; emoji?: string; custom_name?: string };
			icon_pack?: { name?: string };
		};
	}>) => {
		const user = await mUserFetch(userID);
		const guild = guildID ? (globalClient.guilds.cache.get(guildID.toString()) ?? null) : null;
		if (options.server) {
			if (options.server.channel) {
				return handleChannelEnable(user, guild, channelID, options.server.channel.choice);
			}
			if (options.server.pet_messages) {
				return handlePetMessagesEnable(user, guild, channelID, options.server.pet_messages.choice);
			}
			if (options.server.command) {
				return handleCommandEnable(user, guild, options.server.command.command, options.server.command.choice);
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
				favorite_items,
				favorite_bh_seeds,
				slayer,
				pin_trip,
				icon_pack
			} = options.user;
			if (icon_pack) {
				if (icon_pack.name) {
					if (icon_pack.name === 'Default') {
						if (user.user.icon_pack_id) {
							await user.update({
								icon_pack_id: null
							});
							return 'Your icon pack is now set to default.';
						}
						return 'Your icon pack is already set to default.';
					}

					const pack = ItemIconPacks.find(i => i.name === icon_pack.name);
					if (!pack) return 'Invalid icon pack.';

					if (!user.user.store_bitfield.includes(pack.storeBitfield)) {
						return 'You do not own this icon pack.';
					}
					await user.update({
						icon_pack_id: pack.id
					});
					return `Your icon pack is now set to ${bold(pack.name)}.`;
				}
			}

			if (toggle) {
				return handleToggle(user, toggle.name, interaction);
			}
			if (combat_options) {
				return handleCombatOptions(user, combat_options.action, combat_options.input);
			}
			if (set_rsn) {
				return handleRSN(user, set_rsn.username);
			}
			if (bg_color) {
				return bgColorConfig(user, bg_color.color);
			}
			if (bank_sort) {
				return bankSortConfig(
					user,
					bank_sort.sort_method,
					bank_sort.add_weightings,
					bank_sort.remove_weightings,
					bank_sort.reset_weightings
				);
			}
			if (favorite_alchs) {
				return favAlchConfig(
					user,
					favorite_alchs.add,
					favorite_alchs.remove,
					favorite_alchs.add_many,
					Boolean(favorite_alchs.reset)
				);
			}
			if (favorite_food) {
				return favFoodConfig(user, favorite_food.add, favorite_food.remove, Boolean(favorite_food.reset));
			}
			if (favorite_items) {
				return favItemConfig(user, favorite_items.add, favorite_items.remove, Boolean(favorite_items.reset));
			}
			if (favorite_bh_seeds) {
				return favBhSeedsConfig(
					user,
					favorite_bh_seeds.add,
					favorite_bh_seeds.remove,
					Boolean(favorite_bh_seeds.reset)
				);
			}
			if (slayer) {
				if (slayer.autoslay) {
					const { message } = await setDefaultAutoslay(user, slayer.autoslay);
					return message;
				}
				if (slayer.master) {
					const { message } = await setDefaultSlayerMaster(user, slayer.master);
					return message;
				}
			}
			if (pin_trip) {
				if (pin_trip.trip) {
					return pinTripCommand(user, pin_trip.trip, pin_trip.emoji, pin_trip.custom_name);
				}
				if (pin_trip.unpin_trip) {
					return unpinTripCommand(user, pin_trip.unpin_trip);
				}
				return 'You need to provide a trip to pin or unpin.';
			}
		}
		return 'Invalid command.';
	}
};
