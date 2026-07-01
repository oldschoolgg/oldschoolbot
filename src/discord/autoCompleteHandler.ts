import { type APIApplicationCommandOptionChoice, ApplicationCommandOptionType } from '@oldschoolgg/discord';
import type { IAutoCompleteInteraction, IAutoCompleteInteractionOption } from '@oldschoolgg/schemas';

import type { AnyCommand } from '@/discord/index.js';

async function handleAutocomplete(
	user: MUser,
	guildId: string | null,
	command: AnyCommand | undefined,
	autocompleteData: IAutoCompleteInteractionOption[],
	option?: CommandOption,
	rawOptions = autocompleteData
): Promise<APIApplicationCommandOptionChoice[]> {
	if (!command || !autocompleteData) return [];
	const data = autocompleteData.find(i => 'focused' in i && i.focused === true) ?? autocompleteData[0];
	if (data.type === ApplicationCommandOptionType.SubcommandGroup) {
		const group = command.options.find(c => c.name === data.name);
		if (group?.type !== 'SubcommandGroup') return [];
		const subCommandOption =
			data.options?.find(opt => 'focused' in opt && opt.focused === true) ?? data.options?.[0];
		if (!subCommandOption) return [];
		const subCommand = group.options?.find(c => c.name === subCommandOption.name && c.type === 'Subcommand');
		if (!subCommand || !subCommandOption.options || subCommand.type !== 'Subcommand') {
			return [];
		}
		const focusedOption =
			subCommandOption.options.find(opt => 'focused' in opt && opt.focused === true) ??
			subCommandOption.options[0];
		if (!focusedOption) return [];
		const subSubCommand = subCommand.options?.find(o => o.name === focusedOption.name);
		return handleAutocomplete(user, guildId, command, [focusedOption], subSubCommand, rawOptions);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		if (!data.options || !data.options[0]) return [];
		const subCommand = command.options.find(c => c.name === data.name);
		if (subCommand?.type !== 'Subcommand') return [];
		const focusedOption = data.options.find(o => ('focused' in o ? Boolean(o.focused) : false)) ?? data.options[0];
		const subOption = subCommand.options?.find(c => c.name === focusedOption.name);
		if (!subOption) return [];

		return handleAutocomplete(user, guildId, command, [focusedOption], subOption, rawOptions);
	}

	const optionBeingAutocompleted = option ?? command.options.find(o => o.name === data.name);

	if (
		optionBeingAutocompleted &&
		'autocomplete' in optionBeingAutocompleted &&
		optionBeingAutocompleted.autocomplete !== undefined
	) {
		const autocompleteResult = await optionBeingAutocompleted.autocomplete({
			value: data.value as never,
			user,
			userId: user.id,
			guildId,
			rawOptions
		});
		return autocompleteResult.slice(0, 25).map(i => ({
			name: i.name,
			value: i.value.toString()
		}));
	}
	return [];
}

export async function autoCompleteHandler(interaction: IAutoCompleteInteraction) {
	const command = globalClient.allCommands.find(c => c.name === interaction.command_name)!;
	const user = await mUserFetch(interaction.user_id);
	const choices = await handleAutocomplete(user, interaction.guild_id, command, interaction.options);
	await globalClient.respondToAutocompleteInteraction(interaction, choices);
}
