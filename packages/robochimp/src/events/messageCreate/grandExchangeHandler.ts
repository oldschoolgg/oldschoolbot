import type { IMessage } from '@oldschoolgg/schemas';

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

export async function grandExchangeHandler(msg: IMessage) {
	if (!['738780181946171493', '682996313209831435'].includes(msg.channel_id)) return;
	const conditions = [
		[
			`doesn't include one of these words: ${words.join(', ')}.`,
			words.every(str => !msg.content.toLowerCase().includes(str))
		],
		['has over 10 lines', msg.content.split(/\r\n|\r|\n/).length > 10],
		['has over 450 characters', msg.content.length > 450]
	] as const;
	for (const [reason, bool] of conditions) {
		if (bool) {
			await globalClient.deleteMessage(msg.channel_id, msg.id);
			await globalClient.sendDm(
				msg.author_id,
				`Your message was deleted from the grand-exchange channel, because it: ${reason}.`
			);
			break;
		}
	}
}
