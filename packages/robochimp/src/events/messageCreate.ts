import type { Message } from 'discord.js';

import { handleCommands } from '../lib/messageCommands.js';
import { botReactHandler } from './messageCreate/botReactHandler.js';
import { grandExchangeHandler } from './messageCreate/grandExchangeHandler.js';
import { pointsHandler } from './messageCreate/pointsHandler.js';
import { userReactsHandler } from './messageCreate/userReactsHandler.js';
import { voteReactionHandler } from './messageCreate/voteReactionHandler.js';

const messageHandlers: ((msg: Message) => Promise<unknown>)[] = [
	pointsHandler,
	handleCommands,
	botReactHandler,
	grandExchangeHandler,
	voteReactionHandler,
	userReactsHandler
];

export async function handleMessageCreate(msg: Message) {
	if (!msg.guild) return;

	for (const handler of messageHandlers) {
		try {
			await handler(msg);
		} catch (e) {
			console.error('Error in message handler:', e);
		}
	}
}
