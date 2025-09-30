import type { CommandOption, ICommand } from '@oldschoolgg/toolkit';
import {
	type APIApplicationCommandOptionChoice,
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type CommandInteractionOption,
	type GuildMember,
	type User
} from 'discord.js';

import { allCommands } from '@/mahoji/commands/allCommands.js';

async function handleAutocomplete(
	command: ICommand | undefined,
	autocompleteData: CommandInteractionOption[],
	member: GuildMember | undefined,
	user: User,
	option?: CommandOption
): Promise<APIApplicationCommandOptionChoice[]> {
	if (!command || !autocompleteData) return [];
	const data = autocompleteData.find(i => 'focused' in i && i.focused === true) ?? autocompleteData[0];
	if (data.type === ApplicationCommandOptionType.SubcommandGroup) {
		const group = command.options.find(c => c.name === data.name);
		if (group?.type !== ApplicationCommandOptionType.SubcommandGroup) return [];
		const subCommand = group.options?.find(
			c => c.name === data.options?.[0].name && c.type === ApplicationCommandOptionType.Subcommand
		);
		if (
			!subCommand ||
			!data.options ||
			!data.options[0] ||
			subCommand.type !== ApplicationCommandOptionType.Subcommand
		) {
			return [];
		}
		const option = data.options[0].options?.find(t => (t as any).focused);
		if (!option) return [];
		const subSubCommand = subCommand.options?.find(o => o.name === option.name);
		return handleAutocomplete(command, [option], member, user, subSubCommand);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		if (!data.options || !data.options[0]) return [];
		const subCommand = command.options.find(c => c.name === data.name);
		if (subCommand?.type !== ApplicationCommandOptionType.Subcommand) return [];
		const option = data.options.find(o => ('focused' in o ? Boolean(o.focused) : false)) ?? data.options[0];
		const subOption = subCommand.options?.find(c => c.name === option.name);
		if (!subOption) return [];

		return handleAutocomplete(command, [option], member, user, subOption);
	}

	const optionBeingAutocompleted = option ?? command.options.find(o => o.name === data.name);

	if (
		optionBeingAutocompleted &&
		'autocomplete' in optionBeingAutocompleted &&
		optionBeingAutocompleted.autocomplete !== undefined
	) {
		const autocompleteResult = await optionBeingAutocompleted.autocomplete(data.value as never, user, member);
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
	const choices = await handleAutocomplete(
		command,
		(interaction.options as any).data as CommandInteractionOption[],
		member,
		interaction.user
	);
	await interaction.respond(choices);
	return;
}
