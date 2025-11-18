import { Inventions } from '@/lib/bso/skills/invention/inventions.js';

import { bold, EmbedBuilder, inlineCode } from '@oldschoolgg/discord';
import type { IGuild } from '@oldschoolgg/schemas';
import {
	formatDuration,
	hexToDecimal,
	isValidHexColor,
	miniID,
	removeFromArr,
	stringMatches,
	Time,
	uniqueArr
} from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, Items } from 'oldschooljs';
import { clamp } from 'remeda';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import { choicesOf, itemOption } from '@/discord/index.js';
import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { ItemIconPacks } from '@/lib/canvas/iconPacks.js';
import { BitField, PerkTier } from '@/lib/constants.js';
import { Eatables } from '@/lib/data/eatables.js';
import { CombatOptionsArray, CombatOptionsEnum } from '@/lib/minions/data/combatConstants.js';
import { birdhouseSeeds } from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import { autoslayChoices, slayerMasterChoices } from '@/lib/slayer/constants.js';
import { setDefaultAutoslay, setDefaultSlayerMaster } from '@/lib/slayer/slayerUtil.js';
import { BankSortMethods, isValidBankSortMethod } from '@/lib/sorts.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { isValidNickname, patronMsg } from '@/lib/util/smallUtils.js';
import { gearImages } from '@/lib/canvas/gearImageData.js';

interface UserConfigToggle {
	name: string;
	bit: BitField;
	canToggle?: (
		user: MUser,
		interaction?: MInteraction
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
		name: 'Disable Scroll of Longevity',
		bit: BitField.ScrollOfLongevityDisabled
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
				await interaction.defer();

				const choice = await globalClient.pickStringWithButtons({
					interaction,
					options: durations.map(d => ({ label: d.display, id: d.display })),
					content: `${user}, This will lockout your ability to gamble for the specified time. Choose carefully!`
				});

				const pickedDuration = durations.find(d => stringMatches(d.display, choice?.choice.label ?? ''));

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
		name: 'Disable Gorajan Bonecrusher',
		bit: BitField.DisabledGorajanBoneCrusher
	},
	{
		name: 'Disable Item Contract Donations',
		bit: BitField.NoItemContractDonations
	},
	{
		name: 'Disable Eagle Tame Opening Clues',
		bit: BitField.DisabledTameClueOpening
	},
	{
		name: 'Disable Igne Tame Opening Impling Jars',
		bit: BitField.DisabledTameImplingOpening
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
	},
	{
		name: 'Use super restores for Dwarven blessing',
		bit: BitField.UseSuperRestoresForDwarvenBlessing
	},
	{
		name: 'Disable Tears of Guthix Trip Button',
		bit: BitField.DisableTearsOfGuthixButton
	},
	{
		name: 'Show Detailed Info',
		bit: BitField.ShowDetailedInfo
	},
	{
		name: 'Disable Minion Daily Button',
		bit: BitField.DisableDailyButton
	},
	{
		name: 'Allow Public API Data Retrieval',
		bit: BitField.AllowPublicAPIDataRetrieval
	}
];

async function handleToggle(user: MUser, name: string, interaction?: MInteraction): Promise<string> {
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
): Promise<string> {
	if (reset) {
		await user.update({ favorite_food: [] });
		return 'Cleared all favorite food.';
	}
	const currentFavorites = user.user.favorite_food;
	const item = Items.getItem(itemToAdd ?? itemToRemove);
	const currentItems = `Your current favorite food is: ${currentFavorites.length === 0 ? 'None' : currentFavorites.map(i => Items.itemNameFromId(i)).join(', ')
		}.`;
	if (!item || item.customItemData?.isSecret) return currentItems;
	if (!Eatables.some(i => i.id === item.id || i.raw === item.id)) return "That's not a valid item.";

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
	const item = Items.getItem(itemToAdd ?? itemToRemove);
	const currentItems = `Your current favorite items are: ${currentFavorites.length === 0
			? 'None'
			: currentFavorites
				.map(i => Items.itemNameFromId(i))
				.join(', ')
				.slice(0, 1500)
		}.`;
	if (!item || item.customItemData?.isSecret) return currentItems;
	if (itemToAdd) {
		const limit = ((await user.fetchPerkTier()) + 1) * 100;
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

	const removeItem = itemToRemove ? Items.getItem(itemToRemove) : null;
	const addItem = itemToAdd ? Items.getItem(itemToAdd) : null;
	const item = removeItem || addItem;

	if (!item) {
		if (currentFavorites.length === 0) {
			return 'You have no favorited alchable items.';
		}
		return `Your current favorite alchable items are: ${currentFavorites.map(i => Items.itemNameFromId(i)).join(', ')}.`;
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
		const item = Items.getItem(itemToAdd ?? itemToRemove);
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

	const currentItems = `Your current favorite items are: ${currentFavorites.length === 0 ? 'None' : currentFavorites.map(i => Items.itemNameFromId(i)).join(', ')
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

	const perkTier = await user.fetchPerkTier();
	if (perkTier < PerkTier.Two) {
		return patronMsg(PerkTier.Two);
	}

	if (!sortMethod && !addWeightingBank && !removeWeightingBank && !resetWeightingBank) {
		const sortStr = currentMethod
			? `Your current bank sort method is ${inlineCode(currentMethod)}.`
			: 'You have not set a bank sort method.';
		const weightingBankStr = currentWeightingBank.toString();
		const response = new MessageBuilder().setContent(sortStr);
		if (weightingBankStr.length < 500) {
			response.addContent(`\n**Weightings:**${weightingBankStr}`);
		} else {
			response.addBankImage({
				bank: currentWeightingBank.filter(_it => CanvasModule.allItemIdsWithSprite.has(_it.id)),
				title: 'Bank Sort Weightings',
				user
			});
		}
		return response;
	}

	if (sortMethod) {
		if (!isValidBankSortMethod(sortMethod)) {
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

	return bankSortConfig(user, undefined, undefined, undefined, undefined);
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
					.setColor(hexToDecimal(currentColor))
					.setDescription(`Your current background color is \`${currentColor}\`.`)
			]
		};
	}

	hex = hex.toUpperCase();
	if (!isValidHexColor(hex)) {
		return "That's not a valid hex color. It needs to be 7 characters long, starting with '#', for example: #4e42f5 - use this to pick one: <https://www.google.com/search?q=hex+color+picker>";
	}

	await user.update({
		bank_bg_hex: hex
	});

	return {
		embeds: [embed.setColor(hexToDecimal(hex)).setDescription(`Your background color is now \`${hex}\``)]
	};
}

async function handleChannelEnable(
	guildSettings: IGuild,
	guildId: string,
	channelId: string,
	choice: 'enable' | 'disable'
) {
	const isDisabled = guildSettings.staff_only_channels.includes(channelId);

	if (choice === 'disable') {
		if (isDisabled) return 'This channel is already disabled.';

		await Cache.updateGuild(guildId, {
			staff_only_channels: [...guildSettings.staff_only_channels, channelId]
		});

		return 'Channel disabled. Staff of this server can still use commands in this channel.';
	}
	if (!isDisabled) return 'This channel is already enabled.';

	await Cache.updateGuild(guildId, {
		staff_only_channels: guildSettings.staff_only_channels.filter(i => i !== channelId)
	});

	return 'Channel enabled. Anyone can use commands in this channel now.';
}

async function handlePetMessagesEnable(
	guildSettings: IGuild,
	guildId: string,
	channelId: string,
	choice: 'enable' | 'disable'
) {
	if (choice === 'enable') {
		if (guildSettings.petchannel) {
			return 'Pet Messages are already enabled in this guild.';
		}
		await Cache.updateGuild(guildId, {
			petchannel: channelId
		});
		return 'Enabled Pet Messages in this guild.';
	}
	if (guildSettings.petchannel === null) {
		return "Pet Messages aren't enabled, so you can't disable them.";
	}
	await Cache.updateGuild(guildId, {
		petchannel: null
	});
	return 'Disabled Pet Messages in this guild.';
}

async function handleCommandEnable(
	guildSettings: IGuild,
	guildId: string,
	commandName: string,
	choice: 'enable' | 'disable'
) {
	const command = globalClient.allCommands.find(i => i.name.toLowerCase() === commandName.toLowerCase());
	if (!command) return "That's not a valid command.";

	if (choice === 'enable') {
		if (!guildSettings.disabled_commands.includes(commandName)) {
			return "That command isn't disabled.";
		}
		await Cache.updateGuild(guildId, {
			disabled_commands: guildSettings.disabled_commands.filter(i => i !== command.name)
		});

		return `Successfully enabled the \`${commandName}\` command.`;
	}

	if (guildSettings.disabled_commands.includes(command.name)) {
		return 'That command is already disabled.';
	}
	await Cache.updateGuild(guildId, {
		disabled_commands: [...guildSettings.disabled_commands, command.name]
	});

	return `Successfully disabled the \`${command.name}\` command.`;
}

async function handleCombatOptions(user: MUser, command: 'add' | 'remove' | 'list' | 'help', option?: string) {
	if (!command || (command && command === 'list')) {
		// List enabled combat options:
		const cbOpts = user.user.combat_options.map(o => CombatOptionsArray.find(coa => coa?.id === o)?.name);
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

	const currentStatus = user.user.combat_options.includes(newcbopt.id);

	const nextBool = command !== 'remove';

	if (currentStatus === nextBool) {
		return `"${newcbopt.name}" is already ${currentStatus ? 'enabled' : 'disabled'} for you.`;
	}

	let combatOptions = [...user.user.combat_options];
	// If enabling Ice Barrage, make sure burst isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBarrage &&
		combatOptions.includes(CombatOptionsEnum.AlwaysIceBurst)
	) {
		combatOptions = removeFromArr(combatOptions, CombatOptionsEnum.AlwaysIceBurst);
	}
	// If enabling Ice Burst, make sure barrage isn't also enabled:
	if (
		nextBool &&
		newcbopt.id === CombatOptionsEnum.AlwaysIceBurst &&
		combatOptions.includes(CombatOptionsEnum.AlwaysIceBarrage)
	) {
		combatOptions = removeFromArr(combatOptions, CombatOptionsEnum.AlwaysIceBarrage);
	}
	if (nextBool && !combatOptions.includes(newcbopt.id)) {
		await user.update({
			combat_options: [...combatOptions, newcbopt.id]
		});
	} else if (!nextBool && combatOptions.includes(newcbopt.id)) {
		await user.update({
			combat_options: removeFromArr(combatOptions, newcbopt.id)
		});
	} else {
		return 'Error processing command. This should never happen, please report bug.';
	}

	return `${newcbopt.name} is now ${nextBool ? 'enabled' : 'disabled'} for you.`;
}

function pinnedTripLimit(perkTier: number) {
	return clamp(perkTier + 1, { min: 1, max: 4 });
}
export async function pinTripCommand(user: MUser, tripId: string | undefined, customName: string | undefined) {
	if (!tripId) return 'Invalid trip.';
	const id = Number(tripId);
	if (!id || Number.isNaN(id)) return 'Invalid trip.';
	const trip = await prisma.activity.findFirst({ where: { id, user_id: BigInt(user.id) } });
	if (!trip) return 'Invalid trip.';

	if (customName && (!isValidNickname(customName) || customName.length >= 32)) {
		return 'Invalid custom name.';
	}

	const limit = pinnedTripLimit(await user.fetchPerkTier());
	const currentPinnedTripsCount = await prisma.pinnedTrip.count({ where: { user_id: user.id } });
	if (currentPinnedTripsCount >= limit) {
		return `You cannot have more than ${limit}x pinned trips, unpin one first. Your limit is ${limit}, you can get up to 4 by being a patron.`;
	}

	await prisma.pinnedTrip.create({
		data: {
			id: miniID(7),
			emoji_id: null,
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

export const configCommand = defineCommand({
	name: 'config',
	description: 'Commands configuring settings and options.',
	options: [
		{
			type: 'SubcommandGroup',
			name: 'server',
			description: 'Change settings for your server.',
			options: [
				{
					type: 'Subcommand',
					name: 'channel',
					description: 'Enable or disable commands in this channel.',
					options: [
						{
							type: 'String',
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
					type: 'Subcommand',
					name: 'pet_messages',
					description: 'Enable or disable Pet Messages in this server.',
					options: [
						{
							type: 'String',
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
					type: 'Subcommand',
					name: 'command',
					description: 'Enable or disable a command in your server.',
					options: [
						{
							type: 'String',
							name: 'command',
							description: 'The command you want to enable/disable.',
							required: true,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return globalClient.allCommands
									.map(i => ({ name: i.name, value: i.name }))
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())));
							}
						},
						{
							type: 'String',
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
			type: 'SubcommandGroup',
			name: 'user',
			description: 'Change settings for your account.',
			options: [
				{
					type: 'Subcommand',
					name: 'toggle',
					description: 'Toggle different settings on and off.',
					options: [
						{
							type: 'String',
							name: 'name',
							description: 'The setting you want to toggle on/off.',
							required: true,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								const bitfield = user.bitfield;
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
					type: 'Subcommand',
					name: 'combat_options',
					description: 'Change combat options.',
					options: [
						{
							type: 'String',
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
							type: 'String',
							name: 'input',
							description: 'The option you want to add/remove.',
							required: false,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return CombatOptionsArray.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({ name: i.name, value: i.name }));
							}
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'bg_color',
					description: 'Set a custom color for transparent bank backgrounds.',
					options: [
						{
							type: 'String',
							name: 'color',
							description: 'The color in hex format.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'bank_sort',
					description: 'Change the way your bank is sorted.',
					options: [
						{
							type: 'String',
							name: 'sort_method',
							description: 'The way items in your bank should be sorted.',
							required: false,
							choices: choicesOf(BankSortMethods)
						},
						{
							type: 'String',
							name: 'add_weightings',
							description: "Add custom weightings for extra bank sorting (e.g. '1 trout, 5 coal')",
							required: false
						},
						{
							type: 'String',
							name: 'remove_weightings',
							description: "Remove weightings for extra bank sorting (e.g. '1 trout, 5 coal')",
							required: false
						},
						{
							type: 'String',
							name: 'reset_weightings',
							description: "Type 'reset' to confirm you want to delete ALL of your bank weightings.",
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
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
							type: 'String',
							name: 'add_many',
							description: 'Add many to your favorite alchables at once.',
							required: false
						},
						{
							type: 'Boolean',
							name: 'reset',
							description: 'Reset all of your favorite alchs',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'favorite_bh_seeds',
					description: 'Manage your favorite birdhouse seeds.',
					options: [
						{
							type: 'String',
							name: 'add',
							description: 'Add an item to your favorite birdhouse seeds.',
							required: false,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return birdhouseSeeds
									.filter(i => (!value ? true : stringMatches(i.item.name, value)))
									.map(i => ({
										name: `${i.item.name}`,
										value: i.item.id.toString()
									}));
							}
						},
						{
							type: 'String',
							name: 'remove',
							description: 'Remove an item from your favorite birdhouse seeds.',
							required: false,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								return birdhouseSeeds
									.filter(i => {
										if (!user.user.favorite_bh_seeds.includes(i.item.id)) return false;
										return !value ? true : stringMatches(i.item.name, value);
									})
									.map(i => ({
										name: `${i.item.name}`,
										value: i.item.id.toString()
									}));
							}
						},
						{
							type: 'Boolean',
							name: 'reset',
							description: 'Reset all of your favorite birdhouse seeds.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'favorite_food',
					description: 'Manage your favorite food.',
					options: [
						{
							type: 'String',
							name: 'add',
							description: 'Add an item to your favorite food.',
							required: false,
							autocomplete: async ({ value }: StringAutoComplete) => {
								const rawFood = Eatables.filter(i => i.raw).map(i => Items.getItem(i.raw!)!);
								const autocompleteList = Eatables.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({
									name: `${i.name}`,
									value: i.id.toString()
								}));
								autocompleteList.push(
									...rawFood
										.filter(i =>
											!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
										)
										.map(i => ({
											name: `${i.name}`,
											value: i.id.toString()
										}))
								);
								return autocompleteList;
							}
						},
						{
							type: 'String',
							name: 'remove',
							description: 'Remove an item from your favorite food.',
							required: false,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								const rawFood = Eatables.filter(i => i.raw).map(i => Items.getItem(i.raw!)!);
								const allFood = Eatables.map(i => {
									return { name: i.name, id: i.id };
								});
								allFood.push(...rawFood);
								return allFood
									.filter(i => {
										if (!user.user.favorite_food.includes(i.id)) return false;
										return !value ? true : i.name.toLowerCase().includes(value.toLowerCase());
									})
									.map(i => ({
										name: `${i.name}`,
										value: i.id.toString()
									}));
							}
						},
						{
							type: 'Boolean',
							name: 'reset',
							description: 'Reset all of your favorite foods',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
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
							type: 'Boolean',
							name: 'reset',
							description: 'Reset all of your favorite items',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'slayer',
					description: 'Manage your Slayer options',
					options: [
						{
							type: 'String',
							name: 'master',
							description: 'Choose default slayer master',
							required: false,
							choices: slayerMasterChoices
						},
						{
							type: 'String',
							name: 'autoslay',
							description: 'Set default autoslay mode',
							required: false,
							choices: autoslayChoices
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'toggle_invention',
					description: 'Toggle an invention on/off.',
					options: [
						{
							name: 'invention',
							type: 'String',
							description: 'The invention you want to toggle on/off.',
							required: true,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								return Inventions.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({
									name: `${i.name} (Currently ${user.user.disabled_inventions.includes(i.id) ? 'DISABLED' : 'Enabled'
										})`,
									value: i.name
								}));
							}
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'pin_trip',
					description: 'Pin a trip so you can easily repeat it whenever you want.',
					options: [
						{
							type: 'String',
							name: 'trip',
							description: 'The trip you want to pin.',
							required: false,
							autocomplete: async ({ user }: StringAutoComplete) => {
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
							type: 'String',
							required: false,
							name: 'custom_name',
							description: 'Custom name for the button (optional).'
						},
						{
							type: 'String',
							name: 'unpin_trip',
							description: 'The trip you want to unpin.',
							required: false,
							autocomplete: async ({ user }: StringAutoComplete) => {
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
					type: 'Subcommand',
					name: 'gearframe',
					description: 'Change your gear frame.',
					options: [
						{
							name: 'name',
							type: 'String',
							description: 'The gear frame you want to use.',
							required: true,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return gearImages
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({
										name: i.name,
										value: i.name
									}));
							}
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'icon_pack',
					description: 'Change your icon pack',
					options: [
						{
							type: 'String',
							name: 'name',
							description: 'The icon pack you want to use.',
							required: true,
							choices: ['Default', ...Object.values(ItemIconPacks).map(i => i.name)].map(i => ({
								name: i,
								value: i
							}))
						}
					]
				}
			]
		}
	],
	run: async ({ options, user, userId, guildId, channelId, interaction }) => {
		if (options.server) {
			if (!guildId) return 'This command can only be run in servers.';
			const member = await globalClient.fetchMember({ guildId, userId });
			const hasPerms = await globalClient.memberHasPermissions(member, ['BAN_MEMBERS']);
			if (!hasPerms) {
				return "You need to have 'Ban Member' permissions to change settings for this server.";
			}
			const guildSettings = await Cache.getGuild(guildId);

			if (options.server.channel) {
				return handleChannelEnable(guildSettings, guildId, channelId, options.server.channel.choice);
			}
			if (options.server.pet_messages) {
				return handlePetMessagesEnable(guildSettings, guildId, channelId, options.server.pet_messages.choice);
			}
			if (options.server.command) {
				return handleCommandEnable(
					guildSettings,
					guildId,
					options.server.command.command,
					options.server.command.choice
				);
			}
		}
		if (options.user) {
			const {
				toggle,
				combat_options,
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

					const pack = Object.values(ItemIconPacks).find(i => i.name === icon_pack.name);
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
			if (options.user.toggle_invention) {
				const invention = Inventions.find(i =>
					stringMatches(i.name, options.user?.toggle_invention?.invention ?? '')
				);
				if (!invention) return 'Invalid invention.';
				if (user.user.disabled_inventions.includes(invention.id)) {
					await user.update({
						disabled_inventions: removeFromArr(user.user.disabled_inventions, invention.id)
					});
					return `${invention.name} is now **Enabled**.`;
				}
				await user.update({
					disabled_inventions: {
						push: invention.id
					}
				});
				return `${invention.name} is now **Disabled**.`;
			}
			if (options.user.gearframe) {
				const matchingFrame = gearImages.find(i => stringMatches(i.name, options.user?.gearframe?.name ?? ''));
				if (!matchingFrame) return 'Invalid name.';
				if (!user.user.unlocked_gear_templates.includes(matchingFrame.id) && matchingFrame.id !== 0) {
					return "You don't have this gear frame unlocked.";
				}
				await user.update({
					gear_template: matchingFrame.id
				});
				return `Your gear frame is now set to **${matchingFrame.name}**!`;
			}
			if (pin_trip) {
				if (pin_trip.trip) {
					return pinTripCommand(user, pin_trip.trip, pin_trip.custom_name);
				}
				if (pin_trip.unpin_trip) {
					return unpinTripCommand(user, pin_trip.unpin_trip);
				}
				return 'You need to provide a trip to pin or unpin.';
			}
		}
		return 'Invalid command.';
	}
});
