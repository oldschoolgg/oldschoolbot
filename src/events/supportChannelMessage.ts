import { MessageEmbed, TextChannel } from 'discord.js';
import { noOp, Time } from 'e';
import { Event, EventStore } from 'klasa';

import { getSupportGuild } from '../lib/util';

declare module 'klasa' {
	interface KlasaClient {
		__supportInterval: NodeJS.Timeout;
	}
}
let lastMessageID: string | null = null;
const embed = new MessageEmbed()
	.setAuthor('⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️')
	.addField(
		'📖 Read the FAQ',
		'The FAQ answers commonly asked questions: https://www.oldschool.gg/oldschoolbot/faq - also make sure to read the other pages of the website, which might contain the information you need.'
	)
	.addField(
		'🔎 Search',
		'Search this channel first, you might find your question has already been asked and answered.'
	)
	.addField(
		'💬 Ask',
		"If your question isn't answered in the FAQ, and you can't find it from searching, simply ask your question and wait for someone to answer. If you don't get an answer, you can post your question again."
	)
	.addField(
		'⚠️ Dont ping anyone',
		'Do not ping mods, or any roles/people in here. You will be muted. Ask your question, and wait.'
	);

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: true,
			event: 'klasaReady'
		});
		this.enabled = this.client.production;
	}

	async run() {
		if (this.client.__supportInterval) {
			clearInterval(this.client.__supportInterval);
		}
		this.client.__supportInterval = setInterval(async () => {
			try {
				const guild = getSupportGuild(this.client);
				const channel = guild.channels.get('668073484731154462') as TextChannel;
				const messages = await channel.messages.fetch({ limit: 5 });
				if (messages.some(m => m.author.id === this.client.user!.id)) return;
				if (lastMessageID) {
					const message = await channel.messages.fetch(lastMessageID).catch(noOp);
					if (message) {
						await message.delete();
					}
				}
				const res = await channel.send(embed);
				lastMessageID = res.id;
			} catch (_) {}
		}, Number(Time.Minute * 15));
	}
}
