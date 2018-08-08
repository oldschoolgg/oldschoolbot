const { Event } = require('klasa');
const he = require('he');
const { MessageEmbed } = require('discord.js');
const Twit = require('twit');
const DBL = require('dblapi.js');

const ALL_TWITTERS = [
	'1894180640',
	'184349515',
	'3105724056',
	'2307540361',
	'557647030',
	'525302599',
	'3187663593',
	'2169865003',
	'1569065179',
	'2411777869',
	'3256936132',
	'3318825773',
	'702224459491647488',
	'2462052530',
	'1307366604',
	'1205666185',
	'732227342144307200',
	'849322141002727425',
	'3362141061',
	'740546260533383168',
	'3870174875',
	'2818884683',
	'1858363524',
	'2279036881',
	'2800406980',
	'1712662364',
	'848909375448154113',
	'794223611297091584',
	'734716002831900672',
	'4276173437',
	'900846415630540800',
	'2726160938',
	'2785100110',
	'791939828774338560',
	'786858980400390144',
	'924968824381702144',
	'797859891373371392',
	'824932930787094528',
	'803844588100325376',
	'1634264438',
	'1008655742428221440',
	'1001866988803772416'
];

const JMOD_TWITTERS = [
	1307366604,
	1205666185,
	732227342144307200,
	849322141002727425,
	3362141061,
	740546260533383168,
	3870174875,
	2818884683,
	1858363524,
	2279036881,
	2800406980,
	1712662364,
	848909375448154113,
	794223611297091584,
	734716002831900672,
	4276173437,
	900846415630540800,
	2726160938,
	2785100110,
	791939828774338560,
	786858980400390144,
	924968824381702144,
	824932930787094528,
	1008655742428221440,
	1001866988803772416
];

const STREAMER_TWITTERS = [
	1894180640,
	184349515,
	3105724056,
	2307540361,
	557647030,
	525302599,
	3187663593,
	2169865003,
	1569065179,
	2411777869,
	3256936132,
	3318825773,
	702224459491647488,
	2462052530,
	803844588100325376,
	1634264438
];

const HCIM_DEATHS = [797859891373371392];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true });
	}
	run() {
		const dbl = new DBL(this.client.dblToken, {
			webhookPort: 8000,
			webhookAuth: this.client.dblAuth
		});
		dbl.webhook.on('vote', vote => this.client.tasks.get('vote').run(vote));

		const twitter = new Twit(this.client.twitterApp);

		const stream = twitter.stream('statuses/filter', { follow: ALL_TWITTERS });

		stream.on('tweet', tweet => {
			if (
				tweet.retweeted ||
        tweet.retweeted_status ||
        tweet.in_reply_to_status_id ||
        tweet.in_reply_to_user_id ||
        tweet.delete
			) { return; }
			if (tweet.extended_tweet) {
				this.sendToDiscordChannels({
					description: tweet.extended_tweet.full_text,
					thumbnail: tweet.user.profile_image_url_https,
					author: tweet.user.name,
					id: tweet.user.id,
					image:
            (tweet.extended_tweet.entities.media &&
              tweet.extended_tweet.entities.media[0].media_url_https) ||
            null
				});
			} else {
				this.sendToDiscordChannels({
					description: tweet.text,
					thumbnail: tweet.user.profile_image_url_https,
					author: tweet.user.name,
					id: tweet.user.id,
					image:
            (tweet.entities.media && tweet.entities.media[0].media_url_https) ||
            null
				});
			}
		});
	}

	sendToDiscordChannels(tweet) {
		const embed = new MessageEmbed()
			.setDescription(`\n ${he.decode(tweet.description)}`)
			.setColor(1942002)
			.setThumbnail(tweet.thumbnail)
			.setAuthor(he.decode(tweet.author))
			.setImage(tweet.image);

		let key;
		if (JMOD_TWITTERS.includes(tweet.id)) key = 'tweetchannel';
		else if (STREAMER_TWITTERS.includes(tweet.id)) key = 'streamertweets';
		else if (HCIM_DEATHS.includes(tweet.id)) key = 'hcimdeaths';
		this.client.guilds
			.filter(guild => guild.configs[key])
			.forEach(async guild => {
				/*
			const channel = await guild.channels.get(guild.configs[key]);
			if (!channel) return guild.configs.reset(key);
			if (!channel.permissionsFor(this.client.user).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
				return guild.configs.reset(key);
			}*/
				guild.channels.get(guild.configs[key]).send({ embed });
				return null;
			});
	}

};
