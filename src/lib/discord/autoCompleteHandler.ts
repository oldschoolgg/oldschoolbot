import {
	type APIApplicationCommandOptionChoice,
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type CacheType,
	type CommandInteractionOption,
	type GuildMember
} from 'discord.js';

import type { AnyCommand, AutocompleteContext, CommandOption } from '@/lib/discord/index.js';

type InteractionOption = CommandInteractionOption<CacheType>;
type ReadonlyInteractionOptions = readonly InteractionOption[];

type CommandOptionWithChildren = CommandOption & { options?: readonly CommandOption[] | CommandOption[] };
type SubcommandOption = CommandOptionWithChildren & { type: 'Subcommand' };
type SubcommandGroupOption = CommandOptionWithChildren & { type: 'SubcommandGroup' };

function isSubcommandOption(option: CommandOption): option is SubcommandOption {
	return option.type === 'Subcommand';
}

function isSubcommandGroupOption(option: CommandOption): option is SubcommandGroupOption {
	return option.type === 'SubcommandGroup';
}

async function handleAutocomplete(
	user: MUser,
	command: AnyCommand | undefined,
	autocompleteData: ReadonlyInteractionOptions,
	member: GuildMember | undefined,
	option?: CommandOption,
	contextOptions?: ReadonlyInteractionOptions
): Promise<APIApplicationCommandOptionChoice<string>[]> {
	if (!command || !autocompleteData) return [];
	const data =
		autocompleteData.find(
			i =>
				('focused' in i && i.focused === true) ||
				(i.options?.some(opt => ('focused' in opt ? Boolean(opt.focused) : false)) ?? false)
		) ?? autocompleteData[0];
	if (!data) {
		return [];
	}
	if (data.type === ApplicationCommandOptionType.SubcommandGroup) {
		const group = command.options.find(
			(option): option is SubcommandGroupOption => isSubcommandGroupOption(option) && option.name === data.name
		);
		if (!group) return [];
		const nestedOptions = (data.options?.[0]?.options ?? []) as ReadonlyInteractionOptions;
		const subCommand = group.options?.find(
			(option): option is SubcommandOption => isSubcommandOption(option) && option.name === data.options?.[0].name
		);
		if (!subCommand || !data.options || !data.options[0] || subCommand.type !== 'Subcommand') {
			return [];
		}
		const optionBeingFocused = data.options[0].options?.find((opt: InteractionOption) =>
			'focused' in opt ? Boolean(opt.focused) : false
		);
		if (!optionBeingFocused) return [];
		const subSubCommand = subCommand.options?.find(
			(o): o is CommandOptionWithChildren => o.name === optionBeingFocused.name
		);
		return handleAutocomplete(user, command, nestedOptions, member, subSubCommand, nestedOptions);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		if (!data.options || !data.options[0]) return [];
		const subCommand = command.options.find(
			(option): option is SubcommandOption => isSubcommandOption(option) && option.name === data.name
		);
		if (!subCommand) return [];
		const focusedOption =
			data.options.find((o: InteractionOption) => ('focused' in o ? Boolean(o.focused) : false)) ??
			data.options[0];
		const subOption = subCommand.options?.find(
			(c): c is CommandOptionWithChildren => c.name === focusedOption.name
		);
		if (!subOption) return [];

		return handleAutocomplete(user, command, data.options, member, subOption, data.options);
	}

	const optionBeingAutocompleted = option ?? command.options.find(o => o.name === data.name);

	if (
		optionBeingAutocompleted &&
		'autocomplete' in optionBeingAutocompleted &&
		optionBeingAutocompleted.autocomplete !== undefined
	) {
		const context: AutocompleteContext = {
			options: contextOptions ?? autocompleteData,
			focusedOption: data,
			option: optionBeingAutocompleted
		};
		const autocompleteResult = await optionBeingAutocompleted.autocomplete(
			data.value as never,
			user,
			member,
			context
		);
		return autocompleteResult.slice(0, 25).map(i => ({
			name: i.name,
			value: i.value.toString()
		}));
	}
	return [];
}

export async function autoCompleteHandler(interaction: AutocompleteInteraction) {
	const member: GuildMember | undefined = interaction.inCachedGuild() ? interaction.member : undefined;
	const command = globalClient.allCommands.find(c => c.name === interaction.commandName)!;
	const user = await mUserFetch(interaction.user.id);
	const start = performance.now();
	const choices = await handleAutocomplete(
		user,
		command,
		(interaction.options as any).data as ReadonlyInteractionOptions,
		member
	);
	const end = performance.now();
	Logging.logPerf({
		duration: end - start,
		text: `AutoComplete[${command.name}`,
		interaction
	});
	await interaction.respond(choices);
}
