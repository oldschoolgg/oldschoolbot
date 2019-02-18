const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const SnooStorm = require('snoostorm');
const Snoowrap = require('snoowrap');
const he = require('he');

const { redditApp } = require('../../config/private');
const jagexMods = require('../../data/jagexMods');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady', enabled: true });
	}

	run() {
		const jmodAccounts = jagexMods.filter(jmod => jmod.redditUsername).map(jmod => jmod.redditUsername);

		const redditClient = new SnooStorm(new Snoowrap(redditApp));

		/* eslint-disable new-cap */
		const commentStream = redditClient.CommentStream({
			subreddit: '2007scape',
			results: 100,
			pollTime: 10000
		});

		commentStream.on('comment', (comment) => {
			if (!jmodAccounts.includes(comment.author.name)) return;
			this.sendEmbed({
				text: comment.body.slice(0, 1950),
				url: `https://www.reddit.com${comment.permalink}?context=8&depth=9`,
				jmod: jagexMods.find(mod => mod.redditUsername === comment.author.name)
			});
		});

		const submissionStream = redditClient.SubmissionStream({
			subreddit: '2007scape',
			results: 50,
			pollTime: 10000
		});

		submissionStream.on('submission', (post) => {
			if (!jmodAccounts.includes(post.author.name)) return;
			this.sendEmbed({
				text: post.selftext,
				url: `https://www.reddit.com${post.permalink}`,
				title: post.title,
				jmod: jagexMods.find(mod => mod.redditUsername === post.author.name)
			});
		});
	}

	sendEmbed({ text, url, title, jmod }) {
		const embed = new MessageEmbed()
			.setDescription(`${url}\n\n ${he.decode(text)}`)
			.setColor(1942002)
			.setAuthor(jmod.formattedName, undefined, `https://www.reddit.com/user/${jmod.redditUsername}`);

		if (title) {
			embed.setTitle(title);
			embed.setURL(url);
		}

		this.client.guilds.filter(guild => guild.settings.get('jmodComments'))
			.map(guild => {
				const channel = guild.channels.get(guild.settings.get('jmodComments'));
				if (channel) channel.send(embed);
			});
	}

};
