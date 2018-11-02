const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Snooper = require('reddit-snooper');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady' });
	}

	run() {
		const { jmodRedditAccounts } = this.client;
		const snooper = new Snooper({
			/* eslint-disable camelcase */
			automatic_retries: true,
			api_requests_per_minute: 10
			/* eslint-enable camelcase */
		});
		const jmodAccounts = Object.keys(jmodRedditAccounts);
		snooper.watcher
			.getCommentWatcher('2007scape')
			.on('comment', comment => {
				if (!jmodAccounts.includes(comment.data.author)) return;
				const embed = new MessageEmbed()
					.setDescription(
						`<https://www.reddit.com${comment.data.permalink}>
\`\`\`${comment.data.body.slice(0, 1950)}\`\`\``
					)
					.setColor(14981973)
					.setAuthor(
						jmodRedditAccounts[comment.data.author],
						null,
						`https://www.reddit.com/user/${comment.data.author}`
					);
				this.sendEmbed(embed);
			})
			.on('error', console.error);

		snooper.watcher
			.getPostWatcher('2007scape')
			.on('post', post => {
				if (!jmodAccounts.includes(post.data.author)) return;
				const embed = new MessageEmbed()
					.setDescription(
						`**${post.data.title}**
<https://www.reddit.com${post.data.permalink}>

${post.data.selftext ? `\`\`\`${post.data.selftext}\`\`\`` : ''}
`
					)
					.setColor(14981973)
					.setAuthor(jmodRedditAccounts[post.data.author], null, `https://www.reddit.com/user/${post.data.author}`);
				this.sendEmbed(embed);
			})
			.on('error', console.error);
	}

	sendEmbed(embed) {
		this.client.guilds.filter(guild => guild.configs.jmodComments).map(guild => {
			const channel = guild.channels.get(guild.configs.jmodComments);
			if (channel) channel.send(embed).catch(() => null);
		});
	}

};
