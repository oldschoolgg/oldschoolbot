import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import type { CommandResponse } from '@oldschoolgg/toolkit';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { inlineCode } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { removeFromArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { mahojiUserSettingsUpdate } from '../../lib/MUser';
import { BitField } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { Inventions } from '../../lib/invention/inventions';
import { CombatOptionsArray, CombatOptionsEnum } from '../../lib/minions/data/combatConstants';

import { birdhouseSeeds } from '../../lib/skilling/skills/hunter/birdHouseTrapping';
import { autoslayChoices, slayerMasterChoices } from '../../lib/slayer/constants';
import { setDefaultAutoslay, setDefaultSlayerMaster } from '../../lib/slayer/slayerUtil';
import { BankSortMethods } from '../../lib/sorts';
import { itemNameFromID, stringMatches } from '../../lib/util';
import { getItem } from '../../lib/util/getOSItem';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
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
		name: 'Disable Scroll of Longevity',
		bit: BitField.ScrollOfLongevityDisabled
	},
	{
		name: 'Clean herbs during farm runs',
		bit: BitField.CleanHerbsFarming
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
	const item = getItem(itemToAdd ?? itemToRemove);
	const currentItems = `Your current favorite items are: ${
		currentFavorites.length === 0 ? 'None' : currentFavorites.map(itemNameFromID).join(', ').slice(0, 1500)
	}.`;
	if (!item || item.customItemData?.isSecret) return currentItems;
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
	if (perkTier === 1) {
		return patronMsg(1);
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
	else if (resetWeightingBank && resetWeightingBank === 'reset') newBank.bank = {};

	await user.update({
		bank_sort_weightings: newBank.bank
	});

	return bankSortConfig(await mUserFetch(user.id), undefined, undefined, undefined, undefined);
}

const priorityWarningMsg =
	"\n\n**Important: By default, 'Always barrage/burst' will take priority if 'Always cannon' is also enabled.**";
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
								const rawFood = Eatables.filter(i => i.raw).map(i => getItem(i.raw!)!);
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
							type: ApplicationCommandOptionType.String,
							name: 'remove',
							description: 'Remove an item from your favorite food.',
							required: false,
							autocomplete: async (value: string, user: User) => {
								const rawFood = Eatables.filter(i => i.raw).map(i => getItem(i.raw!)!);
								const allFood = Eatables.map(i => {
									return { name: i.name, id: i.id };
								});
								allFood.push(...rawFood);
								const mUser = await mahojiUsersSettingsFetch(user.id, { favorite_food: true });
								return allFood
									.filter(i => {
										if (!mUser.favorite_food.includes(i.id)) return false;
										return !value ? true : i.name.toLowerCase().includes(value.toLowerCase());
									})
									.map(i => ({
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
					name: 'toggle_invention',
					description: 'Toggle an invention on/off.',
					options: [
						{
							name: 'invention',
							type: ApplicationCommandOptionType.String,
							description: 'The invention you want to toggle on/off.',
							required: true,
							autocomplete: async (value, user) => {
								const settings = await mahojiUsersSettingsFetch(user.id, { disabled_inventions: true });

								return Inventions.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({
									name: `${i.name} (Currently ${
										settings.disabled_inventions.includes(i.id) ? 'DISABLED' : 'Enabled'
									})`,
									value: i.name
								}));
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
		interaction
	}: CommandRunOptions<{
		user?: {
			toggle?: { name: string };
			combat_options?: { action: 'add' | 'remove' | 'list' | 'help'; input: string };
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
			toggle_invention?: { invention: string };
		};
	}>) => {
		const user = await mUserFetch(userID);

		if (options.user) {
			const {
				toggle,
				combat_options,
				bank_sort,
				favorite_alchs,
				favorite_food,
				favorite_items,
				favorite_bh_seeds,
				slayer
			} = options.user;

			if (toggle) {
				return handleToggle(user, toggle.name, interaction);
			}
			if (combat_options) {
				return handleCombatOptions(user, combat_options.action, combat_options.input);
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
					await mahojiUserSettingsUpdate(user.id, {
						disabled_inventions: removeFromArr(user.user.disabled_inventions, invention.id)
					});
					return `${invention.name} is now **Enabled**.`;
				}
				await mahojiUserSettingsUpdate(user.id, {
					disabled_inventions: {
						push: invention.id
					}
				});
				return `${invention.name} is now **Disabled**.`;
			}
		}
		return 'Invalid command.';
	}
};
