import { MessageEmbed, TextChannel } from 'discord.js';
import he from 'he';
import { Event, EventStore } from 'klasa';
import { CommentStream, SubmissionStream } from 'snoostorm';
import Snoowrap from 'snoowrap';

import JagexMods from '../../data/jagexMods';
import { redditAppConfig } from '../config';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { JMod } from '../lib/types';

const jmodAccounts = JagexMods.filter(jmod => jmod.redditUsername).map(jmod => jmod.redditUsername);

interface RedditPost {
	jmod?: JMod;
	text: string;
	url: string;
	title?: string;
}

export default class extends Event {
	public _redditIdCache: Set<any> = new Set();

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true, event: 'klasaReady' });
		this.enabled = this.client.production;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async run() {}

	async init() {
		if (!redditAppConfig) {
			this.disable();
			this.client.emit(
				'log',
				`Disabling Reddit Posts because there is no reddit credentials.`
			);
			return;
		}

		const redditClient = new Snoowrap(redditAppConfig);

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		this.client.commentStream = new CommentStream(redditClient, {
			subreddit: '2007scape',
			limit: 30,
			pollTime: 15_000
		});

		this.client.commentStream?.on('item', comment => {
			if (!jmodAccounts.includes(comment.author.name.toLowerCase())) return;
			if (this._redditIdCache.has(comment.id)) return;
			this._redditIdCache.add(comment.id);
			this.sendEmbed({
				text: comment.body.slice(0, 1950),
				url: `https://www.reddit.com${comment.permalink}?context=1`,
				jmod: JagexMods.find(
					mod => mod.redditUsername.toLowerCase() === comment.author.name.toLowerCase()
				)
			});
		});

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		this.client.submissionStream = new SubmissionStream(redditClient, {
			subreddit: '2007scape',
			limit: 20,
			pollTime: 60_000
		});

		this.client.submissionStream?.on('item', post => {
			if (!jmodAccounts.includes(post.author.name.toLowerCase())) return;
			if (this._redditIdCache.has(post.id)) return;
			this._redditIdCache.add(post.id);
			this.sendEmbed({
				text: post.selftext,
				url: `https://www.reddit.com${post.permalink}`,
				title: post.title,
				jmod: JagexMods.find(
					mod => mod.redditUsername.toLowerCase() === post.author.name.toLowerCase()
				)
			});
		});
	}

	sendEmbed({ text, url, title, jmod }: RedditPost) {
		const embed = new MessageEmbed().setDescription(he.decode(text)).setColor(1942002);

		if (jmod) {
			embed.setAuthor(
				jmod.formattedName,
				undefined,
				`https://www.reddit.com/user/${jmod.redditUsername}`
			);
		}

		if (title) {
			embed.setTitle(title);
			embed.setURL(url);
		}

		this.client.guilds
			.filter(guild => Boolean(guild.settings.get(GuildSettings.JMODComments)))
			.map(guild => {
				const channel = guild.channels.get(guild.settings.get(GuildSettings.JMODComments));
				if (channel && channel instanceof TextChannel && channel.postable) {
					channel.send(`<${url}>`, { embed }).catch(() => null);
				}
			});
	}
}
