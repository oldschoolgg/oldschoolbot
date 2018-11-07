const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Returns a random reddit post on a given subreddit.',
			usage: '<subreddit:str>'
		});
	}

	error() {
		throw `There was an error. Reddit may be down, or the subreddit doesnt exist.`;
	}

	async run(msg, [subreddit]) {
		const { data, error } = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`)
			.then(res => res.json());

		if (!data || error) this.error();

		const randomPost = data.children[0].data;

		if (randomPost.over_18 && !msg.channel.nsfw) {
			throw 'I cant post a NSFW image in this channel unless you mark it as NSFW!';
		}

		return msg.send(randomPost.url);
	}

};
