import { EmbedBuilder, PermissionsBitField, resolveColor, TextChannel } from 'discord.js';
import { Time } from 'e';
import he from 'he';
import { schedule } from 'node-cron';
import fetch from 'node-fetch';

import { production } from '../config';
import { analyticsTick } from './analytics';
import { prisma } from './settings/prisma';
import { cacheCleanup } from './util/cachedUserIDs';
import { sendToChannelID } from './util/webhook';

export function initCrons() {
	/**
	 * Capture economy item data
	 */
	schedule('0 */6 * * *', async () => {
		debugLog('Economy Item Insert', {
			type: 'INSERT_ECONOMY_ITEM'
		});
		await prisma.$queryRawUnsafe(`INSERT INTO economy_item
SELECT item_id::integer, SUM(qty)::bigint FROM 
(
    SELECT id, (jdata).key AS item_id, (jdata).value::text::bigint AS qty FROM (select id, json_each(bank) AS jdata FROM users) AS banks
)
AS DATA
GROUP BY item_id;`);
	});

	let REDDIT_POSTS_IS_DISABLED = true;
	/**
	 * JMod reddit posts/comments
	 */
	const redditGranularity = 20;
	const alreadySentCache = new Set();
	schedule(`*/${redditGranularity} * * * *`, async () => {
		if (!production) return;
		if (REDDIT_POSTS_IS_DISABLED) return;
		async function sendReddit({ post }: { post: any; type: 'comment' | 'submission' }) {
			const author = (post.author as string) ?? 'Unknown Author';
			const embed = new EmbedBuilder().setAuthor({ name: author }).setColor(resolveColor('#ff9500'));

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
					id: true,
					jmodComments: true
				}
			});

			for (const { id, jmodComments } of guildsToSendToo) {
				const guild = globalClient.guilds.cache.get(id);
				if (!guild) continue;

				const channel = guild.channels.cache.get(jmodComments!);

				if (
					channel &&
					channel instanceof TextChannel &&
					channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.EmbedLinks) &&
					channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.SendMessages)
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
					if (entity.author_flair_text === null) continue;
					if (entity.author_flair_text !== ':jagexmod:') continue;
					if (alreadySentCache.has(entity.id)) continue;
					sendReddit({ post: entity, type });
					alreadySentCache.add(entity.id);
				}
			} catch {}
		}
	});

	/**
	 * Analytics
	 */
	schedule('*/5 * * * *', analyticsTick);

	/**
	 * prescence
	 */
	schedule('0 * * * *', () => globalClient.user?.setActivity('/help'));

	/**
	 * Delete all voice channels
	 */
	schedule('0 0 */3 * *', async () => {
		cacheCleanup();
	});
}
