import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { notEmpty } from 'e';
import he from 'he';
import { Event, EventStore } from 'klasa';
import Twit from 'twit';

import { client } from '..';
import { twitterAppConfig } from '../config';
import { prisma } from '../lib/settings/prisma';
import { assert } from '../lib/util';
import { sendToChannelID } from '../lib/util/webhook';

const ALL_TWITTERS = [
	/* OSRS Jagex Mods */
	'2726160938', // JagexCurse
	'3362141061', // JagexKieren
	'3870174875', // JagexSween
	'2818884683', // JagexArchie
	'1858363524', // JagexWeath
	'2279036881', // JagexJohnC
	'1205666185', // OldSchoolRS
	'1712662364', // JagexAsh
	'1463868458', // JagexTyran
	'794223611297091584', // JagexLottie
	'734716002831900672', // JagexWest
	'824932930787094528', // JagexLenny
	'998580261137911808', // JagexBruno
	'732227342144307200', // JagexRoq
	'740546260533383168', // JagexEd
	'849322141002727425', // JagexRy
	'889399884788453376', // JagexAcorn
	'1088015657982152706', // JagexTide
	'1008655742428221440', // JagexMunro
	'1090608917560901632', // JagexNasty
	'1067444118765412352', // JagexGee
	'1102924576449880064', // JagexHusky
	'1158375416467509248', // JagexFlippy
	'1178684006352719873', // JagexOasis
	'1230792862981410816', // JagexDeagle
	'1247105690008793089', // JagexArcane
	'1265387982942601218', // JagexMack
	'1179378854848270336', // JagexHalo
	'1264954264528605184', // JagexElena
	'1275458567412150272' // JagexSquid
];

interface Tweet {
	text: string;
	url: string;
	name: string;
	avatar: string;
	image: string;
	id: string;
	authorURL: string;
}

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true, event: 'klasaReady' });
	}

	async init() {
		if (!twitterAppConfig) {
			this.disable();
		}
	}

	run() {
		if (!twitterAppConfig) {
			this.disable();
			return;
		}
		const twitter = new Twit(twitterAppConfig);

		const stream = twitter.stream('statuses/filter', { follow: ALL_TWITTERS });

		stream.on('tweet', this.handleTweet.bind(this));
		stream.on('error', console.error);
	}

	handleTweet(tweet: any) {
		// If its a retweet, return.
		if (
			tweet.retweeted ||
			tweet.retweeted_status ||
			tweet.delete ||
			tweet.in_reply_to_status_id_str ||
			tweet.in_reply_to_user_id_str
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
			id: tweet.user.id_str,
			authorURL: `https://twitter.com/${tweet.user.screen_name}/`
		};

		this.sendTweet(formattedTweet);
	}

	async sendTweet({ text, url, name, avatar, image, authorURL }: Tweet) {
		const embed = new MessageEmbed()
			.setDescription(`\n ${text}`)
			.setColor(1_942_002)
			.setThumbnail(avatar)
			.setAuthor(name, undefined, authorURL)
			.setImage(image);

		const tweetChannels = (
			await prisma.guild.findMany({
				where: {
					tweetchannel: {
						not: null
					}
				},
				select: {
					tweetchannel: true
				}
			})
		)
			.map(i => i.tweetchannel)
			.filter(notEmpty);
		assert(tweetChannels.length < 500, 'Should be less than 500 tweetchannels');

		for (const id of tweetChannels) {
			const channel = client.channels.cache.get(id);
			if (
				channel &&
				channel instanceof TextChannel &&
				channel.postable &&
				channel.permissionsFor(this.client.user!)?.has(Permissions.FLAGS.EMBED_LINKS) &&
				channel.permissionsFor(this.client.user!)?.has(Permissions.FLAGS.SEND_MESSAGES)
			) {
				sendToChannelID(this.client, channel.id, { content: `<${url}>`, embed });
			}
		}
	}
}
