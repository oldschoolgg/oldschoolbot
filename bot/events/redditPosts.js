const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { CommentStream, SubmissionStream } = require('snoostorm');
const Snoowrap = require('snoowrap');
const he = require('he');

const { redditApp } = require('../../config/private');
const jagexMods = require('../../data/jagexMods');

const jmodAccounts = jagexMods.filter(jmod => jmod.redditUsername).map(jmod => jmod.redditUsername);
const redditClient = new Snoowrap(redditApp);

module.exports = class extends Event {
	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady' });
		this.enabled = this.client.production;
	}

	async init() {
		if (!this.client._redditIdCache) {
			this.client._redditIdCache = new Set();
		}
		if (!redditApp || !redditApp.password || !redditApp.password.length === 0) {
			this.disable();
			this.client.emit(
				'log',
				`Disabling Reddit Posts because there is no reddit credentials.`
			);
			return;
		}
		/* eslint-disable new-cap */
		this.client.commentStream = new CommentStream(redditClient, {
			subreddit: '2007scape',
			limit: 30,
			pollTime: 15000
		});

		this.client.commentStream.on('item', comment => {
			if (!jmodAccounts.includes(comment.author.name.toLowerCase())) return;
			if (this.client._redditIdCache.has(comment.id)) return;
			this.client._redditIdCache.add(comment.id);
			this.sendEmbed({
				text: comment.body.slice(0, 1950),
				url: `https://www.reddit.com${comment.permalink}?context=8&depth=9`,
				jmod: jagexMods.find(
					mod => mod.redditUsername.toLowerCase() === comment.author.name.toLowerCase()
				)
			});
		});

		this.client.commentStream.on('error', console.error);

		this.client.submissionStream = new SubmissionStream(redditClient, {
			subreddit: '2007scape',
			limit: 50,
			pollTime: 60000
		});

		this.client.submissionStream.on('item', post => {
			if (!jmodAccounts.includes(post.author.name.toLowerCase())) return;
			if (this.client._redditIdCache.has(post.id)) return;
			this.client._redditIdCache.add(post.id);
			this.sendEmbed({
				text: post.selftext,
				url: `https://www.reddit.com${post.permalink}`,
				title: post.title,
				jmod: jagexMods.find(
					mod => mod.redditUsername.toLowerCase() === post.author.name.toLowerCase()
				)
			});
		});

		this.client.submissionStream.on('error', console.error);
	}

	run() {}

	sendEmbed({ text, url, title, jmod }) {
		const embed = new MessageEmbed()
			.setDescription(he.decode(text))
			.setColor(1942002)
			.setAuthor(
				jmod.formattedName,
				undefined,
				`https://www.reddit.com/user/${jmod.redditUsername}`
			);

		if (title) {
			embed.setTitle(title);
			embed.setURL(url);
		}

		this.client.guilds
			.filter(guild => guild.settings.get('jmodComments'))
			.map(guild => {
				const channel = guild.channels.get(guild.settings.get('jmodComments'));
				if (channel) channel.send(`<${url}>`, { embed }).catch(() => null);
			});
	}
};
