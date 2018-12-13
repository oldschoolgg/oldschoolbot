const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const he = require('he');
const Twit = require('twit');

const ALL_TWITTERS = [
	'1894180640',
	'184349515',
	'3105724056',
	'1067444118765412352',
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
	'1001866988803772416',
	'709141790503211008'
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
	1067444118765412352,
	2800406980,
	1712662364,
	848909375448154113,
	794223611297091584,
	734716002831900672,
	4276173437,
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
	1634264438,
	709141790503211008
];

const HCIM_DEATHS = [797859891373371392];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady' });
	}

	run() {
		const twitter = new Twit(this.client.twitterApp);

		const stream = twitter.stream('statuses/filter', { follow: ALL_TWITTERS });

		stream.on('tweet', this.handleTweet.bind(this));
	}

	handleTweet(tweet) {
		if (
			tweet.retweeted ||
			tweet.retweeted_status ||
			tweet.in_reply_to_status_id ||
			tweet.in_reply_to_user_id ||
			tweet.delete
		) {
			return;
		}

		const _tweet = tweet.extended_tweet ? tweet.extended_tweet : tweet;

		const formattedTweet = {
			text: he.decode(tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text),
			url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
			name: he.decode(tweet.user.name),
			avatar: tweet.user.profile_image_url_https,
			image: (_tweet.entities.media && _tweet.entities.media[0].media_url_https) || null,
			id: tweet.user.id
		};

		this.sendTweet(formattedTweet);
	}

	sendTweet({ text, url, name, avatar, image, id }) {
		const embed = new MessageEmbed()
			.setDescription(`\n ${text}`)
			.setColor(1942002)
			.setThumbnail(avatar)
			.setAuthor(name)
			.setImage(image);

		let key;
		if (JMOD_TWITTERS.includes(id)) key = 'tweetchannel';
		if (STREAMER_TWITTERS.includes(id)) key = 'streamertweets';
		if (HCIM_DEATHS.includes(id)) key = 'hcimdeaths';

		this.client.guilds.filter(guild => guild.configs[key]).map(guild => {
			const channel = guild.channels.get(guild.configs[key]);
			if (channel) channel.send(`<${url}>`, { embed }).catch(() => null);
		});
	}

};
