import { Client, type MessageCreateOptions } from 'discord.js';

import { allCommands } from '@/commands/allCommands.js';
import { globalConfig } from '@/constants.js';
import { interactionHandler } from '@/discord/interactionHandler.js';
import { bulkUpdateCommands } from '@/discord/util.js';
import { handleMessageCreate } from '@/events/messageCreate.js';
import { RUser } from '@/structures/RUser.js';

export class RoboChimpClientClass extends Client<boolean> {
	public applicationId: string = globalConfig.appID;
	public allCommands: RoboChimpCommand[] = allCommands;
	async fetchUser(_id: bigint | string): Promise<RUser> {
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


	async sendToChannelID(channelID: string, content: string | MessageCreateOptions) {
		if (!globalConfig.isProduction) return;
		const channel = globalClient.channels.cache.get(channelID);
		if (!channel || !channel.isTextBased() || channel.partial || !('send' in channel)) {
			console.error('Invalid channel');
			return;
		}
		await channel.send(content);
	}

	async fetchSupportServer() {
		const guild = await globalClient.guilds.fetch(globalConfig.supportServerID);
		return guild;
	}

}

global.globalClient = new RoboChimpClientClass({
	intents: ['GuildMessages', 'Guilds', 'GuildMembers', 'MessageContent'],
	allowedMentions: {}
});

globalClient.on('error', console.error);

globalClient.on('messageCreate', handleMessageCreate);

globalClient.on('interactionCreate', interactionHandler);

globalClient.on('ready', async () => {
	await bulkUpdateCommands();
});
