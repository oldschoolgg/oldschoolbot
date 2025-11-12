import {
	type APIApplication,
	ButtonBuilder,
	ButtonStyle,
	collectSingleInteraction,
	DiscordClient,
	type DiscordClientOptions
} from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';

import { mentionCommand } from '@/discord/utils.js';
import { allCommands } from '@/commands/allCommands.js';
import { RUser } from '@/structures/RUser.js';

export class RoboChimpBotClient extends DiscordClient {
	public isShuttingDown = false;
	public allCommands = allCommands;

	constructor(options: DiscordClientOptions) {
		super(options);
		this.on('ready', async e => {
			await this.handleReadyEvent(e);
		});
	}

	async fetchRUser(_id: bigint | string): Promise<RUser> {
		const id: bigint = typeof _id === 'string' ? BigInt(_id) : _id;
		const user = await roboChimpClient.user.upsert({
			where: {
				id: id
			},
			create: {
				id
			},
			update: {}
		});
		return new RUser(user);
	}

	mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
		return mentionCommand(name, subCommand, subSubCommand);
	}

	async handleReadyEvent({ application }: { application: APIApplication }) {
		console.log(`Logged in as ${application.bot?.username} after ${process.uptime()}s`);
	}

	// async channelIsSendable(channelId: IChannel | string): Promise<boolean> {
	// 	const channel = typeof channelId === 'string' ? await Cache.getChannel(channelId) : channelId;
	// 	if (!channel) return false;
	// 	if (
	// 		![ChannelType.DM, ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread].includes(
	// 			channel.type
	// 		)
	// 	) {
	// 		return false;
	// 	}
	// 	return true;
	// }

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
			console.error(err as Error);
			return null;
		}
	}

	// async reactToMsg({
	// 	channelId,
	// 	messageId,
	// 	emojiId
	// }: {
	// 	channelId: string;
	// 	messageId: string;
	// 	emojiId: keyof typeof ReactEmoji;
	// }) {
	// 	const route = Routes.channelMessageOwnReaction(channelId, messageId, encodeURIComponent(ReactEmoji[emojiId]));
	// 	await this.rest.put(route);
	// }
}
