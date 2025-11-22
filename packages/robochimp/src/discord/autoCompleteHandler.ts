import { type APIApplicationCommandOptionChoice, ApplicationCommandOptionType } from '@oldschoolgg/discord';
import type { IAutoCompleteInteraction, IAutoCompleteInteractionOption } from '@oldschoolgg/schemas';

import type { AnyCommand } from '@/discord/index.js';

async function handleAutocomplete(
	user: RUser,
	guildId: string | null,
	command: AnyCommand | undefined,
	autocompleteData: IAutoCompleteInteractionOption[],
	option?: CommandOption
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
		const option = data.options[0].options?.find(t => t.focused);
		if (!option) return [];
		const subSubCommand = subCommand.options?.find(o => o.name === option.name);
		return handleAutocomplete(user, guildId, command, [option], subSubCommand);
	}
	if (data.type === ApplicationCommandOptionType.Subcommand) {
		if (!data.options || !data.options[0]) return [];
		const subCommand = command.options.find(c => c.name === data.name);
		if (subCommand?.type !== 'Subcommand') return [];
		const option = data.options.find(o => ('focused' in o ? Boolean(o.focused) : false)) ?? data.options[0];
		const subOption = subCommand.options?.find(c => c.name === option.name);
		if (!subOption) return [];

		return handleAutocomplete(user, guildId, command, [option], subOption);
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
			guildId
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
	const user = await globalClient.fetchRUser(interaction.user_id);
	const choices = await handleAutocomplete(user, interaction.guild_id, command, interaction.options);
	await globalClient.respondToAutocompleteInteraction(interaction, choices);
}
