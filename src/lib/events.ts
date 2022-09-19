import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';

import { CLIENT_ID } from '../config';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { channelIsSendable } from './util';

export async function onMessage(msg: Message) {
	if (!msg.content || msg.author.bot || !channelIsSendable(msg.channel)) return;

	if (msg.content.trim() !== `<@${CLIENT_ID}>`) return;

	const result = await minionStatusCommand(msg.author.id, msg.channel.id);
	msg.reply({
		content: result.content,
		components: result.components?.map(i => {
			const row = new ActionRowBuilder<ButtonBuilder>();
			for (const a of i.components as any[]) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(a.custom_id)
						.setLabel(a.label!)
						.setEmoji(a.emoji!.id ?? a.emoji!.name!)
						.setStyle(ButtonStyle.Secondary)
				);
			}
			return row;
		})
	});
}
