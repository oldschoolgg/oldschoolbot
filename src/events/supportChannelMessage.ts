import { Embed } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, TextChannel } from 'discord.js';
import { noOp, Time } from 'e';
import { Event, EventStore } from 'klasa';

import { Channel, informationalButtons } from '../lib/constants';
import { getSupportGuild } from '../lib/util';

let lastMessageID: string | null = null;
const embed = new Embed()
	.setAuthor({ name: '⚠️ ⚠️ ⚠️ ⚠️ READ THIS ⚠️ ⚠️ ⚠️ ⚠️' })
	.addField({
		name: '📖 Read the FAQ',
		value: 'The FAQ answers commonly asked questions: https://wiki.oldschool.gg/faq - also make sure to read the other pages of the website, which might contain the information you need.'
	})
	.addField({
		name: '🔎 Search',
		value: 'Search this channel first, you might find your question has already been asked and answered.'
	})
	.addField({
		name: '💬 Ask',
		value: "If your question isn't answered in the FAQ, and you can't find it from searching, simply ask your question and wait for someone to answer. If you don't get an answer, you can post your question again."
	})
	.addField({
		name: '⚠️ Dont ping anyone',
		value: 'Do not ping mods, or any roles/people in here. You will be muted. Ask your question, and wait.'
	});

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: true,
			event: 'klasaReady'
		});
		this.enabled = globalClient.production;
	}

	async run() {
		if (globalClient.__supportInterval) {
			clearInterval(globalClient.__supportInterval);
		}
		globalClient.__supportInterval = setInterval(async () => {
			try {
				const guild = getSupportGuild();
				const channel = guild?.channels.cache.get(Channel.HelpAndSupport) as TextChannel;
				const messages = await channel.messages.fetch({ limit: 5 });
				if (messages.some(m => m.author.id === globalClient.user!.id)) return;
				if (lastMessageID) {
					const message = await channel.messages.fetch(lastMessageID).catch(noOp);
					if (message) {
						await message.delete();
					}
				}
				const res = await channel.send({
					embeds: [embed],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(informationalButtons)]
				});
				lastMessageID = res.id;
			} catch (_) {}
		}, Number(Time.Minute * 15));
	}
}
