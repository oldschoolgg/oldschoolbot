const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Returns a random reddit post on a given subreddit.',
			usage: '<subreddit:str>'
		});
		this.errorMessage = `There was an error. Reddit may be down, or the subreddit doesnt exist.`;
	}

	async run(msg, [subreddit]) {
		const { data } = await snekfetch
			.get(`https://www.reddit.com/r/${subreddit}/random.json`)
			.then(res => {
				if (res.body.error) throw this.errorMessage;
				return res.body[0].data.children[0];
			})
			.catch(() => { throw this.errorMessage; });

		if (data.over_18 && !msg.channel.nsfw) {
			throw 'I cant post a NSFW image in this channel unless you mark it as NSFW!';
		}

		return msg.send(data.url);
	}

};
