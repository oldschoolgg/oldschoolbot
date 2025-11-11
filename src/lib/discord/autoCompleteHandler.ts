import {
	type APIApplicationCommandOptionChoice,
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type CommandInteractionOption,
	type GuildMember
} from 'discord.js';

import type { AutocompleteOptionContext } from '@/lib/discord/commandOptions.js';
import type { AnyCommand } from '@/lib/discord/index.js';

async function handleAutocomplete(
	user: MUser,
	command: AnyCommand | undefined,
	autocompleteData: readonly CommandInteractionOption[],
	member: GuildMember | undefined,
	option?: CommandOption
): Promise<APIApplicationCommandOptionChoice[]> {
	if (!command || !autocompleteData) return [];
	const data = autocompleteData.find(i => 'focused' in i && i.focused === true) ?? autocompleteData[0];
	if (!data) {
		return [];
	}
	if (data.type === ApplicationCommandOptionType.SubcommandGroup) {
		const group = command.options.find(c => c.name === data.name);
		if (group?.type !== 'SubcommandGroup') return [];
		const subCommandData =
			(data.options ?? []).find(o => 'focused' in o && o.focused === true) ??
			(data.options ?? []).find(o => o.type === ApplicationCommandOptionType.Subcommand);
		if (!subCommandData || subCommandData.type !== ApplicationCommandOptionType.Subcommand) {
			return [];
		}
		const subCommand = group.options?.find(c => c.name === subCommandData.name);
		if (!subCommand || subCommand.type !== 'Subcommand') {
			return [];
		}
		return handleAutocomplete(user, command, subCommandData.options ?? [], member, subCommand);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		const subCommand = command.options.find(c => c.name === data.name);
		if (subCommand?.type !== 'Subcommand') return [];
		return handleAutocomplete(user, command, data.options ?? [], member, subCommand);
	}

	let optionBeingAutocompleted: CommandOption | undefined;
	if (option?.type === 'Subcommand' || option?.type === 'SubcommandGroup') {
		optionBeingAutocompleted = option.options?.find(o => o.name === data.name);
	}
	if (!optionBeingAutocompleted) {
		optionBeingAutocompleted = command.options.find(o => o.name === data.name);
	}

	if (
		optionBeingAutocompleted &&
		'autocomplete' in optionBeingAutocompleted &&
		optionBeingAutocompleted.autocomplete !== undefined
	) {
		const context: AutocompleteOptionContext = {
			options: autocompleteData,
			focusedOption: data
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
		(interaction.options as any).data as readonly CommandInteractionOption[],
		member
	);
	const end = performance.now();
	Logging.logPerf({
		duration: end - start,
		text: `AutoComplete[${command.name}`,
		interaction
	});
	await interaction.respond(choices);
	return;
}
