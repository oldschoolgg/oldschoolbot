import { Embed } from '@discordjs/builders';
import { TextChannel } from 'discord.js';
import { noOp, Time } from 'e';
import { Event, EventStore } from 'klasa';

import { production } from '../config';
import { Channel } from '../lib/constants';
import { getSupportGuild } from '../lib/util';

let lastMessageID: string | null = null;
const embed = new Embed()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addField({
		name: "⚠️ Don't get scammed",
		value: 'Beware of people "buying out banks" or buying lots of skilling supplies, which can be worth a lot more in the bot than they pay you. Skilling supplies are often worth a lot more than they are ingame. Don\'t just trust that they\'re giving you a fair price.'
	})
	.addField({
		name: '🔎 Search',
		value: 'Search this channel first, someone might already be selling/buying what you want.'
	})
	.addField({
		name: '💬 Read the rules/Pins',
		value: 'Read the pinned rules/instructions before using the channel.'
	})
	.addField({
		name: 'Keep Ads Short',
		value: 'Keep your ad less than 10 lines long, as short as possible.'
	});

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
		if (globalClient.__geInterval) {
			clearInterval(globalClient.__geInterval);
		}
		globalClient.__geInterval = setInterval(async () => {
			try {
				const guild = getSupportGuild();
				const channel = guild?.channels.cache.get(Channel.GrandExchange) as TextChannel;
				const messages = await channel.messages.fetch({ limit: 5 });
				if (messages.some(m => m.author.id === globalClient.user!.id)) return;
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
