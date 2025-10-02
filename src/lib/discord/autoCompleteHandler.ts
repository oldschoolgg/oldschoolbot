import {
	type APIApplicationCommandOptionChoice,
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type CommandInteractionOption,
	type GuildMember
} from 'discord.js';

import type { AutocompleteContext, CommandOption, ICommand } from '@/lib/discord/index.js';
import { allCommands } from '@/mahoji/commands/allCommands.js';

async function handleAutocomplete(
	user: MUser,
	command: ICommand | undefined,
	autocompleteData: readonly CommandInteractionOption[],
	member: GuildMember | undefined,
	option?: CommandOption,
	contextOptions?: readonly CommandInteractionOption[]
): Promise<APIApplicationCommandOptionChoice[]> {
	if (!command || !autocompleteData) return [];
	const data = autocompleteData.find(i => 'focused' in i && i.focused === true) ?? autocompleteData[0];
	if (data.type === ApplicationCommandOptionType.SubcommandGroup) {
		const group = command.options.find(c => c.name === data.name);
		if (group?.type !== 'SubcommandGroup') return [];
		const subCommand = group.options?.find(c => c.name === data.options?.[0].name && c.type === 'Subcommand');
		if (!subCommand || !data.options || !data.options[0] || subCommand.type !== 'Subcommand') {
			return [];
		}
		const optionBeingFocused = data.options[0].options?.find(t => (t as any).focused);
		if (!optionBeingFocused) return [];
		const subSubCommand = subCommand.options?.find(o => o.name === optionBeingFocused.name);
		return handleAutocomplete(
			user,
			command,
			data.options[0].options ?? [],
			member,
			subSubCommand,
			data.options[0].options ?? []
		);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		if (!data.options || !data.options[0]) return [];
		const subCommand = command.options.find(c => c.name === data.name);
		if (subCommand?.type !== 'Subcommand') return [];
		const focusedOption = data.options.find(o => ('focused' in o ? Boolean(o.focused) : false)) ?? data.options[0];
		const subOption = subCommand.options?.find(c => c.name === focusedOption.name);
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
	const command = allCommands.find(c => c.name === interaction.commandName);
	const user = await mUserFetch(interaction.user.id);
	const choices = await handleAutocomplete(
		user,
		command,
		(interaction.options as any).data as readonly CommandInteractionOption[],
		member
	);
	await interaction.respond(choices);
	return;
}
