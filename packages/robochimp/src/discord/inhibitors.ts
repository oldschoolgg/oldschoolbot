import type { BaseSendableMessage } from '@oldschoolgg/discord';
import type { IMember } from '@oldschoolgg/schemas';
import { BlacklistedEntityType } from '@prisma/robochimp';

import type { InhibitorResult } from '@/discord/preCommand.js';
import { globalConfig } from '@/constants.js';

type InhibitorRunOptions = {
	user: RUser;
	command: AnyCommand;
	guildId: string | null;
	channelId: string;
	member: IMember | null;
};
interface Inhibitor {
	name: string;
	run: (options: InhibitorRunOptions) => false | BaseSendableMessage | Promise<BaseSendableMessage | false>;
	silent?: true;
}

const inhibitors: Inhibitor[] = [
	{
		name: 'Only Usable in Support Server',
		run: async ({ guildId }) => {
			if (!guildId || guildId !== globalConfig.supportServerID) {
				return {
					content: "You can't use this bot outside the support server.",
					ephemeral: true
				};
			}
			return false;
		}
	},

	{
		name: 'Restarting',
		run: () => {
			if (globalClient.isShuttingDown || !globalClient.isReady) {
				return { content: 'The bot is currently restarting, please try again later.' };
			}
			return false;
		}
	},
	{
		name: 'Blacklist Check',
		run: async ({ guildId, user }) => {
			const blacklistCount = await roboChimpClient.blacklistedEntity.count({
				where: {
					OR: [
						{
							type: BlacklistedEntityType.user,
							id: BigInt(user.id)
						},
						guildId
							? {
									type: BlacklistedEntityType.guild,
									id: BigInt(guildId)
								}
							: null
					].filter(i => i !== null)
				}
			});
			if (blacklistCount > 0) {
				return {
					content: 'You are blacklisted.',
					ephemeral: true
				};
			}
			return false;
		}
	}
];

export async function runInhibitors(opts: InhibitorRunOptions): Promise<undefined | InhibitorResult> {
	for (const { run, silent } of inhibitors) {
		const result = await run(opts);
		if (result !== false) {
			return { reason: result, silent: Boolean(silent) };
		}
	}
}
