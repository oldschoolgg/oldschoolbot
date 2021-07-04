import { MessageEmbed, TextChannel } from 'discord.js';
import { noOp, Time } from 'e';
import { Event, EventStore } from 'klasa';

import { production } from '../config';
import { getSupportGuild } from '../lib/util';

declare module 'klasa' {
	interface KlasaClient {
		__geInterval: NodeJS.Timeout;
	}
}
let lastMessageID: string | null = null;
const embed = new MessageEmbed()
	.setAuthor('⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️')
	.addField(
		"⚠️ Don't get scammed",
		'Beware of people "buying out banks" or buying lots of skilling supplies, which can be worth a lot more in the bot than they pay you. Skilling supplies are often worth a lot more than they are ingame. Don\'t just trust that they\'re giving you a fair price.'
	)
	.addField('🔎 Search', 'Search this channel first, someone might already be selling/buying what you want.')
	.addField('💬 Read the rules/Pins', 'Read the pinned rules/instructions before using the channel.')
	.addField('Keep Ads Short', 'Keep your ad less than 10 lines long, as short as possible.');

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: true,
			event: 'klasaReady'
		});
		this.enabled = production;
	}

	async init() {
		this.run();
	}

	async run() {
		if (this.client.__geInterval) {
			clearInterval(this.client.__geInterval);
		}
		this.client.__geInterval = setInterval(async () => {
			try {
				const guild = getSupportGuild(this.client);
				const channel = guild.channels.cache.get('682996313209831435') as TextChannel;
				const messages = await channel.messages.fetch({ limit: 5 });
				if (messages.some(m => m.author.id === this.client.user!.id)) return;
				if (lastMessageID) {
					const message = await channel.messages.fetch(lastMessageID).catch(noOp);
					if (message) {
						await message.delete();
					}
				}
				const res = await channel.send({ embeds: [embed] });
				lastMessageID = res.id;
			} catch (_) {}
		}, Number(Time.Minute * 15));
	}
}
