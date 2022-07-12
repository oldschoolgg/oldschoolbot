import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Time } from 'e';
import he from 'he';
import { schedule } from 'node-cron';
import fetch from 'node-fetch';

import { untrustedGuildSettingsCache } from '../mahoji/mahojiSettings';
import { prisma } from './settings/prisma';
import { OldSchoolBotClient } from './structures/OldSchoolBotClient';
import { logError } from './util/logError';
import { sendToChannelID } from './util/webhook';

export function initCrons(client: OldSchoolBotClient) {
	/**
	 * Capture economy item data
	 */
	schedule('0 */6 * * *', async () => {
		await prisma.$queryRawUnsafe(`INSERT INTO economy_item
SELECT item_id::integer, SUM(qty)::bigint FROM 
(
    SELECT id, (jdata).key AS item_id, (jdata).value::text::bigint AS qty FROM (select id, json_each(bank) AS jdata FROM users) AS banks
)
AS DATA
GROUP BY item_id;`);
	});

	/**
	 * JMod reddit posts/comments
	 */
	const redditGranularity = 20;
	const alreadySentCache = new Set();
	schedule(`*/${redditGranularity} * * * *`, async () => {
		async function sendReddit({ post }: { post: any; type: 'comment' | 'submission' }) {
			const embed = new MessageEmbed().setAuthor(post.author).setColor('#ff9500');

			const url = post.full_link ?? `https://old.reddit.com${post.permalink}`;

			if (post.body) {
				embed.setDescription(he.decode(post.body));
			}

			if (post.title) {
				embed.setTitle(post.title);
				embed.setURL(url);
			}

			const guildsToSendToo = await prisma.guild.findMany({
				where: {
					jmodComments: {
						not: null
					}
				},
				select: {
					id: true
				}
			});

			for (const { id } of guildsToSendToo) {
				const guild = client.guilds.cache.get(id);
				if (!guild) continue;
				const settings = untrustedGuildSettingsCache.get(guild.id);
				if (!settings?.jmodComments) continue;

				const channel = guild.channels.cache.get(settings.jmodComments);

				if (
					channel &&
					channel instanceof TextChannel &&
					channel.postable &&
					channel.permissionsFor(client.user!)?.has(Permissions.FLAGS.EMBED_LINKS) &&
					channel.permissionsFor(client.user!)?.has(Permissions.FLAGS.SEND_MESSAGES)
				) {
					sendToChannelID(channel.id, { content: `<${url}>`, embed });
				}
			}
		}

		for (const type of ['comment', 'submission'] as const) {
			const utcTime = Math.floor((Date.now() - Time.Minute * redditGranularity) / 1000);

			const url = `https://api.pushshift.io/reddit/search/${type}/?subreddit=2007scape&size=10&author_flair_text=:jagexmod:&after=${utcTime}`;
			try {
				const _result = await fetch(url).then(res => res.json());
				if (!_result || !_result.data || !Array.isArray(_result.data)) continue;
				for (const entity of _result.data) {
					if (alreadySentCache.has(entity.id)) continue;
					sendReddit({ post: entity, type });
					alreadySentCache.add(entity.id);
				}
			} catch (err) {
				logError(err);
			}
		}
	});
}
