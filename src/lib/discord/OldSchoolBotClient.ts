import { type APIApplication, ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';

import { globalConfig } from '@/lib/constants.js';
import {
	type CollectorOptions,
	collectSingleInteraction,
	createInteractionCollector
} from '@/lib/discord/collector/collectSingle.js';
import { DiscordClient, type DiscordClientOptions } from '@/lib/discord/DiscordClient.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

export class OldSchoolBotClient extends DiscordClient {
	public isShuttingDown = false;
	public allCommands = allCommandsDONTIMPORT;

	constructor(options: DiscordClientOptions) {
		super(options);
		this.on('ready', async e => {
			await this.handleReadyEvent(e);
		});
	}

	async handleReadyEvent({ application }: { application: APIApplication }) {
		// Add owner to admin user IDs
		const ownerId = application.owner?.id;
		if (ownerId && !globalConfig.adminUserIDs.includes(ownerId)) {
			globalConfig.adminUserIDs.push(ownerId);
		}

		Logging.logDebug(`Logged in as ${application.bot?.username} after ${process.uptime()}s`);
	}

	createInteractionCollector(options: CollectorOptions) {
		return createInteractionCollector(this, options);
	}

	async pickStringWithButtons({
		options,
		content,
		interaction,
		allowedUsers
	}: {
		allowedUsers?: string[];
		interaction: MInteraction;
		options: { label?: string; id: string; emoji?: string }[];
		content: string;
	}): Promise<{ choice: { label?: string; id: string; emoji?: string }; userId: string } | null> {
		const CUSTOM_ID_PREFIX = `DYN_PICK_STRING_BUTTON_`;
		try {
			const buttons = options.map(opt => {
				const button = new ButtonBuilder()
					.setCustomId(`${CUSTOM_ID_PREFIX}${opt.id}`)
					.setStyle(ButtonStyle.Secondary);
				if (opt.emoji) {
					button.setEmoji({ id: opt.emoji });
				}
				if (opt.label) {
					button.setLabel(opt.label);
				}
				return button;
			});
			allowedUsers ??= [interaction.userId];
			const msg = await interaction.reply({
				content,
				components: buttons,
				withResponse: true
			});
			const res = await collectSingleInteraction(this, {
				messageId: msg!.id,
				channelId: msg!.channel_id,
				users: allowedUsers,
				timeoutMs: Time.Second * 30
			});
			if (!res) return null;
			res.silentButtonAck();
			const resId = res.customId!.replace(CUSTOM_ID_PREFIX, '');
			const choice = options.find(o => o.id === resId)!;
			return { choice, userId: res.userId };
		} catch (err) {
			Logging.logError(err as Error);
			return null;
		}
	}
}
