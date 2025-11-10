import {
	type APIApplication,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	collectSingleInteraction,
	DiscordClient,
	type DiscordClientOptions,
	Routes
} from '@oldschoolgg/discord';
import type { IChannel } from '@oldschoolgg/schemas';
import { Time } from '@oldschoolgg/toolkit';

import { makeParty } from '@/discord/interaction/makeParty.js';
import { mentionCommand } from '@/discord/utils.js';
import { globalConfig } from '@/lib/constants.js';
import { ReactEmoji } from '@/lib/data/emojis.js';
import type { MakePartyOptions } from '@/lib/types/index.js';
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

	mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
		return mentionCommand(name, subCommand, subSubCommand);
	}

	async handleReadyEvent({ application }: { application: APIApplication }) {
		// Add owner to admin user IDs
		const ownerId = application.owner?.id;
		if (ownerId && !globalConfig.adminUserIDs.includes(ownerId)) {
			globalConfig.adminUserIDs.push(ownerId);
		}

		Logging.logDebug(`Logged in as ${application.bot?.username} after ${process.uptime()}s`);
	}

	async channelIsSendable(channelId: IChannel | string): Promise<boolean> {
		const channel = typeof channelId === 'string' ? await Cache.getChannel(channelId) : channelId;
		if (!channel) return false;
		if (
			![ChannelType.DM, ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
				channel.type
			)
		) {
			return false;
		}
		return true;
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
			await interaction.defer();
			const msg = await interaction.reply({
				content,
				components: buttons,
				withResponse: true
			});
			const res = await collectSingleInteraction({
				interaction,
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

	async makeParty(options: MakePartyOptions): Promise<MUser[]> {
		return makeParty(options);
	}

	async reactToMsg({
		channelId,
		messageId,
		emojiId
	}: {
		channelId: string;
		messageId: string;
		emojiId: keyof typeof ReactEmoji;
	}) {
		const route = Routes.channelMessageOwnReaction(channelId, messageId, encodeURIComponent(ReactEmoji[emojiId]));
		await this.rest.put(route);
	}
}
