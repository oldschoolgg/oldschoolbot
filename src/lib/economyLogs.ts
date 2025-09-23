import { sendToChannelID } from '@/lib/util/webhook.js';
import { Channel } from './constants.js';

let economyLogBuffer: string[] = [];

export async function economyLog(message: string, flush = false) {
	economyLogBuffer.push(message);
	if ((flush && economyLogBuffer.length !== 1) || economyLogBuffer.length === 10) {
		await sendToChannelID(Channel.EconomyLogs, {
			content: economyLogBuffer.join('\n---------------------------------\n'),
			allowedMentions: { parse: [], users: [], roles: [] }
		});
		economyLogBuffer = [];
	}
}
