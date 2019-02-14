const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const SnooStorm = require('snoostorm');
const Snoowrap = require('snoowrap');

const { redditApp } = require('../../config/private');
const jmodRedditAccounts = require('../../data/jmod-reddit-accounts');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady', enabled: true });
	}

	run() {
		const jmodAccounts = Object.keys(jmodRedditAccounts);

		const redditClient = new SnooStorm(new Snoowrap(redditApp));

		/* eslint-disable new-cap */
		const commentStream = redditClient.CommentStream({
			subreddit: '2007scape',
			results: 30,
			pollTime: 10000
		});

		commentStream.on('comment', (comment) => {
			if (!jmodAccounts.includes(comment.author.name)) return;
			const embed = new MessageEmbed()
				.setDescription(
					`<https://www.reddit.com${comment.permalink}?context=8&depth=9>
\`\`\`${comment.body.slice(0, 1950)}\`\`\``
				)
				.setColor(14981973)
				.setAuthor(
					jmodRedditAccounts[comment.author.name],
					null,
					`https://www.reddit.com/user/${comment.author.name}`
				);
			this.sendEmbed(embed);
		});

		const submissionStream = redditClient.SubmissionStream({
			subreddit: '2007scape',
			results: 10,
			pollTime: 10000
		});

		submissionStream.on('submission', (post) => {
			if (!jmodAccounts.includes(post.author.name)) return;
			const embed = new MessageEmbed()
				.setDescription(
					`**${post.title}**
<https://www.reddit.com${post.permalink}>

${post.selftext ? `\`\`\`${post.selftext}\`\`\`` : ''}
`
				)
				.setColor(14981973)
				.setAuthor(
					jmodRedditAccounts[post.author.name],
					null,
					`https://www.reddit.com/user/${post.author.name}`
				);
			this.sendEmbed(embed);
		});
	}

	sendEmbed(embed) {
		this.client.guilds.filter(guild => guild.settings.get('jmodComments'))
			.map(guild => {
				const channel = guild.channels.get(guild.settings.get('jmodComments'));
				if (channel) channel.send(embed);
			});
	}

};
