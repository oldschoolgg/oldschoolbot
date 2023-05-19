import { channelIsSendable } from '@oldschoolgg/toolkit';
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

// If API request fails, we'll retry the previous range next time. (Max of +1 hour)
let redditApiFailures = 0;
const MAX_REDDIT_RETRIES = 12;

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

	let REDDIT_POSTS_IS_DISABLED = false;
	/**
	 * JMod reddit posts/comments
	 */
	const redditGranularity = 5;
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

			const guildsToSendTo = await prisma.guild.findMany({
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

			for (const { id, jmodComments } of guildsToSendTo) {
				const guild = globalClient.guilds.cache.get(id);
				if (!guild) continue;

				if (!jmodComments) continue;
				const channel = guild.channels.cache.get(jmodComments);
				if (!channel) continue;

				const perms = channel.permissionsFor(globalClient.user!);
				if (!perms) continue;
				if (!channelIsSendable(channel)) continue;

				if (
					channel instanceof TextChannel &&
					perms.has(PermissionsBitField.Flags.EmbedLinks) &&
					perms.has(PermissionsBitField.Flags.SendMessages)
				) {
					await sendToChannelID(channel.id, { content: `<${url}>`, embed });
				}
			}
		}

		const retries = Math.min(MAX_REDDIT_RETRIES, redditApiFailures);
		const utcTime = Math.floor((Date.now() - Time.Minute * redditGranularity * (retries + 1)) / 1000) - 30;
		let retry = false;
		for (const type of ['comment', 'submission'] as const) {
			const url = `https://api.pushshift.io/reddit/search/${type}/?subreddit=2007scape&size=1000&since=${utcTime}`;
			try {
				const _result = await fetch(url).then(res => {
					if (res.status >= 400) retry = true;
					return res.json();
				});
				if (!_result || !_result.data || !Array.isArray(_result.data)) {
					if (_result && _result.error !== null) retry = true;
					continue;
				}
				for (const entity of _result.data) {
					if (!entity.author_flair_text || !entity.author_flair_text.includes(':jagexmod:')) continue;
					if (alreadySentCache.has(entity.id)) continue;
					await sendReddit({ post: entity, type });
					alreadySentCache.add(entity.id);
				}
				redditApiFailures = 0;
			} catch {}
		}
		if (retry) redditApiFailures++;
	});

	/**
	 * Analytics
	 */
	schedule('*/5 * * * *', () => {
		debugLog('Analytics cronjob starting');
		return analyticsTick();
	});

	/**
	 * prescence
	 */
	schedule('0 * * * *', () => {
		debugLog('Set Activity cronjob starting');
		globalClient.user?.setActivity('/help');
	});

	/**
	 * Delete all voice channels
	 */
	schedule('0 0 */1 * *', async () => {
		debugLog('Cache cleanup cronjob starting');
		cacheCleanup();
	});
}
