'use strict';

const { lazy } = require('@discordjs/util');
const { ChannelType } = require('discord-api-types/v10');

const getCategoryChannel = lazy(() => require('../structures/CategoryChannel.js').CategoryChannel);
const getDMChannel = lazy(() => require('../structures/DMChannel.js').DMChannel);
const getAnnouncementChannel = lazy(() => require('../structures/AnnouncementChannel.js').AnnouncementChannel);
const getTextChannel = lazy(() => require('../structures/TextChannel.js').TextChannel);
const getThreadChannel = lazy(() => require('../structures/ThreadChannel.js').ThreadChannel);
const getPartialGroupDMChannel = lazy(() => require('../structures/PartialGroupDMChannel.js').PartialGroupDMChannel);
const getMediaChannel = lazy(() => require('../structures/MediaChannel.js').MediaChannel);

const nameMap = {
	[ChannelType.GuildText]: 'TextChannel',
	[ChannelType.GuildVoice]: 'VoiceChannel',
	[ChannelType.GuildCategory]: 'CategoryChannel',
	[ChannelType.GuildAnnouncement]: 'AnnouncementChannel',
	[ChannelType.AnnouncementThread]: 'ThreadChannel',
	[ChannelType.PublicThread]: 'ThreadChannel',
	[ChannelType.PrivateThread]: 'ThreadChannel',
	[ChannelType.DM]: 'DMChannel',
	[ChannelType.GroupDM]: 'PartialGroupDMChannel',
	[ChannelType.GuildMedia]: 'MediaChannel',
}
/**
 * Creates a discord.js channel from data received from the API.
 *
 * @param {Client} client The client
 * @param {APIChannel} data The data of the channel to create
 * @param {Guild} [guild] The guild where this channel belongs
 * @param {CreateChannelOptions} [extras] Extra information to supply for creating this channel
 * @returns {BaseChannel} Any kind of channel.
 * @ignore
 */
function createChannel(client, data, guild, { allowUnknownGuild } = {}) {
	// console.log(`Creating ${nameMap[data.type]} ${data.name} channel ${data.id} in guild ${guild?.id ?? 'unknown'}`);
	let channel;
	const resolvedGuild = guild ?? client.guilds.cache.get(data.guild_id);

	if (!data.guild_id && !resolvedGuild) {
		if ((data.recipients && data.type !== ChannelType.GroupDM) || data.type === ChannelType.DM) {
			channel = new (getDMChannel())(client, data);
		} else if (data.type === ChannelType.GroupDM) {
			channel = new (getPartialGroupDMChannel())(client, data);
		}
	} else if (resolvedGuild || allowUnknownGuild) {
		switch (data.type) {
			case ChannelType.GuildText: {
				channel = new (getTextChannel())(resolvedGuild, data, client);
				break;
			}

			case ChannelType.GuildCategory: {
				channel = new (getCategoryChannel())(resolvedGuild, data, client);
				break;
			}

			case ChannelType.GuildAnnouncement: {
				channel = new (getAnnouncementChannel())(resolvedGuild, data, client);
				break;
			}

			case ChannelType.AnnouncementThread:
			case ChannelType.PublicThread:
			case ChannelType.PrivateThread: {
				channel = new (getThreadChannel())(resolvedGuild, data, client);
				if (!allowUnknownGuild) channel.parent?.threads.cache.set(channel.id, channel);
				break;
			}

			case ChannelType.GuildMedia:
				channel = new (getMediaChannel())(resolvedGuild, data, client);
				break;
			default:
				break;
		}

		if (channel && !allowUnknownGuild) resolvedGuild.channels?.cache.set(channel.id, channel);
	}

	return channel;
}

exports.createChannel = createChannel;
