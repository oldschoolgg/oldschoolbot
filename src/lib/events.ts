import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';

import { CLIENT_ID } from '../config';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { channelIsSendable } from './util';
import { makeBankImage } from './util/makeBankImage';

const mentionText = `<@${CLIENT_ID}>`;

export async function onMessage(msg: Message) {
	if (!msg.content || msg.author.bot || !channelIsSendable(msg.channel)) return;

	const content = msg.content.trim();
	if (!content.includes(mentionText)) return;
	const user = await mUserFetch(msg.author.id);
	const result = await minionStatusCommand(user, msg.channelId);
	const components = result.components?.map(i => {
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
	});

	if (content === `${mentionText} b`) {
		msg.reply({
			files: [
				(
					await makeBankImage({
						bank: user.bankWithGP,
						title: 'Your Bank',
						user,
						flags: {
							page: 1
						}
					})
				).file.buffer
			],
			components
		});
		return;
	}
	if (content.includes(`${mentionText} bs `)) {
		const searchText = content.split(' ')[2];
		msg.reply({
			files: [
				(
					await makeBankImage({
						bank: user.bankWithGP.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase())),
						title: 'Your Bank',
						user
					})
				).file.buffer
			],
			components
		});
		return;
	}

	msg.reply({
		content: result.content,
		components
	});
}
