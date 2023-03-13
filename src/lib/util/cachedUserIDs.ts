import { Stopwatch } from '@sapphire/stopwatch';
import { ChannelType } from 'discord.js';
import { objectEntries } from 'e';

import { CLIENT_ID, OWNER_IDS, SupportServer } from '../../config';
import { prisma } from '../settings/prisma';
import { runTimedLoggedFn } from '../util';

export const CACHED_ACTIVE_USER_IDS = new Set();
CACHED_ACTIVE_USER_IDS.add(CLIENT_ID);
for (const id of OWNER_IDS) CACHED_ACTIVE_USER_IDS.add(id);

export async function syncActiveUserIDs() {
	const [users, otherUsers] = await Promise.all([
		prisma.$queryRaw<{ user_id: string }[]>`SELECT DISTINCT(user_id::text)
FROM command_usage
WHERE date > now() - INTERVAL '72 hours';`,
		prisma.$queryRaw<{ id: string }[]>`SELECT id
FROM users
WHERE main_account IS NOT NULL
      OR CARDINALITY(ironman_alts) > 0
	  OR bitfield && ARRAY[2,3,4,5,6,7,8,12,11,21,19];`
	]);

	for (const id of [...users.map(i => i.user_id), ...otherUsers.map(i => i.id)]) {
		CACHED_ACTIVE_USER_IDS.add(id);
	}
	debugLog(`${CACHED_ACTIVE_USER_IDS.size} cached active user IDs`);
}

export function memoryAnalysis() {
	let guilds = globalClient.guilds.cache.size;
	let emojis = 0;
	let channels = globalClient.channels.cache.size;
	let voiceChannels = 0;
	let guildTextChannels = 0;
	let roles = 0;
	let members = 0;
	let channelCounter: Record<string | number, number> = {} as any;
	let messages = 0;
	let voiceStates = 0;
	let commands = 0;
	let permissionOverwrites = 0;

	for (const guild of globalClient.guilds.cache.values()) {
		for (const channel of guild.channels.cache.values()) {
			channelCounter[channel.type] ? channelCounter[channel.type]++ : (channelCounter[channel.type] = 1);
			if ('messages' in channel) {
				messages += channel.messages.cache.size;
			}
			if ('permissionOverwrites' in channel) {
				permissionOverwrites += channel.permissionOverwrites.cache.size;
			}
		}
		roles += guild.roles.cache.size;
		members += guild.members.cache.size;
		emojis += guild.emojis.cache.size;
		voiceStates += guild.voiceStates.cache.size;
		commands += guild.commands.cache.size;
	}

	const channelTypeEntries = Object.entries(ChannelType);

	for (const [key, value] of objectEntries(channelCounter)) {
		const name = channelTypeEntries.find(i => i[1] === Number(key))?.[0] ?? 'Unknown';
		delete channelCounter[key];
		channelCounter[`${name} Channels`] = value;
	}

	return {
		guilds,
		emojis,
		channels,
		voiceChannels,
		guildTextChannels,
		roles,
		activeIDs: CACHED_ACTIVE_USER_IDS.size,
		members,
		...channelCounter,
		messages,
		voiceStates,
		commands,
		permissionOverwrites
	};
}

export const emojiServers = new Set([
	'342983479501389826',
	'940758552425955348',
	'869497440947015730',
	'324127314361319427',
	'363252822369894400',
	'395236850119213067',
	'325950337271857152',
	'395236894096621568'
]);

export function cacheCleanup() {
	if (!globalClient.isReady()) return;
	let stopwatch = new Stopwatch();
	stopwatch.start();
	debugLog('Cache Cleanup Start', {
		type: 'CACHE_CLEANUP'
	});
	return runTimedLoggedFn('Cache Cleanup', async () => {
		await runTimedLoggedFn('Clear Channels', async () => {
			for (const channel of globalClient.channels.cache.values()) {
				if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildCategory) {
					globalClient.channels.cache.delete(channel.id);
				}
				if (channel.type === ChannelType.GuildText) {
					channel.threads.cache.clear();
					// @ts-ignore ignore
					delete channel.topic;
					// @ts-ignore ignore
					delete channel.rateLimitPerUser;
					// @ts-ignore ignore
					delete channel.nsfw;
					// @ts-ignore ignore
					delete channel.parentId;
					// @ts-ignore ignore
					delete channel.name;
					// @ts-ignore ignore
					channel.lastMessageId = null;
					// @ts-ignore ignore
					channel.lastPinTimestamp = null;
				}
			}
		});

		await runTimedLoggedFn('Guild Emoji/Roles/Member cache clear', async () => {
			for (const guild of globalClient.guilds.cache.values()) {
				if (guild.id !== SupportServer) {
					for (const member of guild.members.cache.values()) {
						if (member.user.id === CLIENT_ID) continue;
						guild.members.cache.delete(member.user.id);
					}
				}

				if (emojiServers.has(guild.id)) continue;
				guild.emojis?.cache.clear();

				for (const channel of guild.channels.cache.values()) {
					if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildNewsThread) {
						guild.channels.cache.delete(channel.id);
					}
				}
				for (const role of guild.roles.cache.values()) {
					// @ts-ignore ignore
					delete role.managed;
					// @ts-ignore ignore
					delete role.name;
					// @ts-ignore ignore
					delete role.tags;
					// @ts-ignore ignore
					delete role.icon;
					// @ts-ignore ignore
					delete role.unicodeEmoji;
					// @ts-ignore ignore
					delete role.rawPosition;
					// @ts-ignore ignore
					delete role.color;
					// @ts-ignore ignore
					delete role.hoist;
				}
			}
		});

		stopwatch.stop();
		debugLog(`Cache Cleanup Finish After ${stopwatch.toString()}`, {
			type: 'CACHE_CLEANUP'
		});
	});
}
