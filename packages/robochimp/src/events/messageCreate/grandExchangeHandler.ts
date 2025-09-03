import { noOp } from '@oldschoolgg/toolkit/util';
import type { Message } from 'discord.js';

const words = [
	'seling',
	'sale',
	'sell',
	'buy',
	'wts',
	'wtb',
	'buying',
	'selling',
	'trading',
	'trade',
	'swap',
	'swapping',
	'seling'
];

export async function grandExchangeHandler(msg: Message) {
	if (!['738780181946171493', '682996313209831435'].includes(msg.channel.id)) return;
	if (msg.author.bot) return;
	const conditions = [
		[
			`doesn't include one of these words: ${words.join(', ')}.`,
			words.every(str => !msg.content.toLowerCase().includes(str))
		],
		['has over 10 lines', msg.content.split(/\r\n|\r|\n/).length > 10],
		['has over 450 characters', msg.cleanContent.length > 450]
	] as const;
	for (const [reason, bool] of conditions) {
		if (bool) {
			await msg.delete().catch(noOp);
			await msg.author.send(`Your message was deleted from the grand-exchange channel, because it: ${reason}.`);
			break;
		}
	}
}
