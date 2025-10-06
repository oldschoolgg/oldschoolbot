import type { Message } from 'discord.js';

export async function tagHandler(msg: Message) {
	if (
		msg.content.startsWith('.') &&
		msg.content.length > 1 &&
		msg.content.length <= 33 &&
		!msg.content.includes(' ')
	) {
		const tag = await roboChimpClient.tag.findFirst({ where: { name: msg.content.replace('.', '') } });
		if (tag) {
			msg.reply({ content: tag.content, allowedMentions: { parse: [], users: [], roles: [] } });
		}
	}
}
