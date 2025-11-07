import {
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOption,
	type APIApplicationCommandSubcommandOption,
	type APIChatInputApplicationCommandGuildInteraction,
	ApplicationCommandOptionType,
	convertApiChannelToZChannel,
	convertApiMemberToZMember,
	convertApiRoleToZRole,
	convertApiUserToZUser
} from '@oldschoolgg/discord';

import type { CommandOptions } from '@/lib/discord/commandOptions.js';

const BASIC_TYPES = new Set<CommandOption['type']>([
	'Integer',
	'Number',
	'String',
	'Boolean',
	'Channel',
	'Role',
	'User',
	'Mentionable',
	'Attachment'
]);

export function convertCommandOptionToAPIOption(option: CommandOption): APIApplicationCommandOption {
	switch (option.type) {
		case 'Integer': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Integer,
				...(option.choices
					? { choices: option.choices as { name: string; value: number }[] }
					: { autocomplete: 'autocomplete' in option })
			};
		}
		case 'Number': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Number,
				...(option.choices
					? { choices: option.choices as { name: string; value: number }[] }
					: { autocomplete: 'autocomplete' in option })
			};
		}
		case 'String': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.String,
				...(option.choices
					? { choices: option.choices as { name: string; value: string }[] }
					: { autocomplete: 'autocomplete' in option })
			};
		}
		case 'Boolean': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Boolean
			};
		}
		case 'Channel': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Channel
			};
		}
		case 'Role': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Role
			};
		}
		case 'User': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.User
			};
		}
		case 'Mentionable': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Mentionable
			};
		}
		case 'Attachment': {
			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Attachment
			};
		}
		case 'Subcommand': {
			const basicChildren =
				option.options?.filter((c): c is Exclude<CommandOption, { type: 'Subcommand' | 'SubcommandGroup' }> =>
					BASIC_TYPES.has(c.type)
				) ?? [];

			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.Subcommand,
				options: basicChildren
					.map(convertCommandOptionToAPIOption)
					.filter(
						(o): o is APIApplicationCommandBasicOption =>
							o.type !== ApplicationCommandOptionType.Subcommand &&
							o.type !== ApplicationCommandOptionType.SubcommandGroup
					)
			};
		}
		case 'SubcommandGroup': {
			const subChildren =
				option.options?.filter(
					(c): c is Extract<CommandOption, { type: 'Subcommand' }> => c.type === 'Subcommand'
				) ?? [];

			return {
				name: option.name,
				description: option.description,
				required: option.required ?? false,
				type: ApplicationCommandOptionType.SubcommandGroup,
				options: subChildren
					.map(convertCommandOptionToAPIOption)
					.filter(
						(o): o is APIApplicationCommandSubcommandOption =>
							o.type === ApplicationCommandOptionType.Subcommand
					)
			};
		}
	}
}

type ConversionParams = {
	guildId?: string;
	options: APIChatInputApplicationCommandGuildInteraction['data']['options'] | undefined;
	resolvedObjects: APIChatInputApplicationCommandGuildInteraction['data']['resolved'] | undefined;
};

export function convertAPIOptionsToCommandOptions({
	options,
	resolvedObjects = {},
	guildId
}: ConversionParams): CommandOptions {
	if (!options) return {};

	const parsedOptions: CommandOptions = {};

	for (const opt of options) {
		if (
			opt.type === ApplicationCommandOptionType.SubcommandGroup ||
			opt.type === ApplicationCommandOptionType.Subcommand
		) {
			const opts: CommandOptions = {};
			for (const [key, value] of Object.entries(
				convertAPIOptionsToCommandOptions({ options: opt.options ?? [], resolvedObjects, guildId })
			)) {
				opts[key] = value;
			}
			parsedOptions[opt.name] = opts;
		} else if (opt.type === ApplicationCommandOptionType.Channel) {
			parsedOptions[opt.name] = convertApiChannelToZChannel({
				apiChannel: resolvedObjects.channels![opt.value]!,
				guildId: guildId!
			});
		} else if (opt.type === ApplicationCommandOptionType.Role) {
			parsedOptions[opt.name] = convertApiRoleToZRole({
				apiRole: resolvedObjects.roles![opt.value]!,
				guildId: guildId!
			});
		} else if (opt.type === ApplicationCommandOptionType.User) {
			parsedOptions[opt.name] = {
				user: convertApiUserToZUser(resolvedObjects.users![opt.value]!),
				member: guildId
					? convertApiMemberToZMember({
							userId: opt.value,
							guildId: guildId,
							apiMember: resolvedObjects.members![opt.value]!
						})
					: undefined
			};
		} else {
			parsedOptions[opt.name as string] = opt.value;
		}
	}

	return parsedOptions;
}
