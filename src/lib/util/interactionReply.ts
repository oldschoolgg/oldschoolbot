import { UserError } from '@oldschoolgg/toolkit';
import { DiscordAPIError } from 'discord.js';

import { SILENT_ERROR } from '@/lib/constants.js';
import { logError } from '@/lib/util/logError.js';

export async function handleInteractionError(err: unknown, interaction: MInteraction) {
	// For silent errors, just return and do nothing. Users could see an error.
	if (err instanceof Error && err.message === SILENT_ERROR) return;

	// If DiscordAPIError #10008, that means someone deleted the message, we don't need to log this.
	if (err instanceof DiscordAPIError && err.code === 10_008) {
		return;
	}

	// If this isn't a UserError, its something we need to just log and know about to fix it.
	// Or if its not repliable, we should never be erroring here.
	if (!(err instanceof UserError) || !interaction.isRepliable()) {
		const context: Record<string, any> = {
			...interaction.getDebugInfo()
		};

		return logError(err, context);
	}

	return interaction.reply({ content: err.message });
}
