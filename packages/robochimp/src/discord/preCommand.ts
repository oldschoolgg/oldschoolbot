import type { BaseSendableMessage } from '@oldschoolgg/discord';

import { runInhibitors } from '@/discord/inhibitors.js';

interface PreCommandOptions {
	command: AnyCommand;
	user: RUser;
	options: CommandOptions;
	interaction: MInteraction;
}

export type InhibitorResult = {
	reason: BaseSendableMessage;
	silent?: boolean;
};

type PrecommandReturn = Promise<undefined | InhibitorResult>;

export async function preCommand({ command, interaction, user }: PreCommandOptions): PrecommandReturn {
	const inhibitResult = runInhibitors({
		user,
		member: interaction.member ?? null,
		command,
		channelId: interaction.channelId,
		guildId: interaction.guildId
	});

	if (inhibitResult !== undefined) {
		return inhibitResult;
	}
}
