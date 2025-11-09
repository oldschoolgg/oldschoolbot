import { InteractionType } from '@oldschoolgg/discord';

import { command_name_enum } from '@/prisma/main.js';
import { convertAPIOptionsToCommandOptions } from '@/lib/discord/commandOptionConversions.js';
import type { MInteraction } from '@/lib/discord/interaction/MInteraction.js';
import type { PrismaCompatibleJsonObject } from '@/lib/types/index.js';
import { compressMahojiArgs } from '@/lib/util/commandUsage.js';

export function getInteractionOptionsForLog({
	command,
	interaction
}: {
	command: command_name_enum;
	interaction: MInteraction;
}): PrismaCompatibleJsonObject | undefined {
	if (([command_name_enum.bank, command_name_enum.bs] as command_name_enum[]).includes(command)) {
		return undefined;
	}
	if (interaction.rawInteraction.type !== InteractionType.ApplicationCommand) {
		return undefined;
	}
	const options = convertAPIOptionsToCommandOptions({
		guildId: interaction.rawInteraction.guild_id,
		options: interaction.rawInteraction.data.options ?? [],
		resolvedObjects: interaction.rawInteraction.data.resolved
	});
	const compressed = compressMahojiArgs(options);
	return compressed;
}
