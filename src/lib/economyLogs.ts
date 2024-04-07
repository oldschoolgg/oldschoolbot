import { Channel } from './constants';
import { sendToChannelID } from './util/webhook';

let economyLogBuffer: string[] = [];

export async function economyLog(message: string, flush: boolean = false) {
	economyLogBuffer.push(message);
	if (flush || economyLogBuffer.length === 10) {
		await sendToChannelID(Channel.EconomyLogs, {
			content: economyLogBuffer.join('\n---------------------------------\n'),
			allowedMentions: { parse: [], users: [], roles: [] }
		});
		economyLogBuffer = [];
	}
}
