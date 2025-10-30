'use strict';

const { lazy } = require('@discordjs/util');
const { ChannelType } = require('discord-api-types/v10');

const getCategoryChannel = lazy(() => require('../structures/CategoryChannel.js').CategoryChannel);
const getDMChannel = lazy(() => require('../structures/DMChannel.js').DMChannel);
const getAnnouncementChannel = lazy(() => require('../structures/AnnouncementChannel.js').AnnouncementChannel);
const getTextChannel = lazy(() => require('../structures/TextChannel.js').TextChannel);
const getThreadChannel = lazy(() => require('../structures/ThreadChannel.js').ThreadChannel);
const getDirectoryChannel = lazy(() => require('../structures/DirectoryChannel.js').DirectoryChannel);
const getPartialGroupDMChannel = lazy(() => require('../structures/PartialGroupDMChannel.js').PartialGroupDMChannel);
const getForumChannel = lazy(() => require('../structures/ForumChannel.js').ForumChannel);
const getMediaChannel = lazy(() => require('../structures/MediaChannel.js').MediaChannel);

/**
 * Extra options for creating a channel.
 *
 * @typedef {Object} CreateChannelOptions
 * @property {boolean} [allowFromUnknownGuild] Whether to allow creating a channel from an unknown guild
 * @private
 */

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
  console.log('createChannel');
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

      // case ChannelType.GuildVoice: {
      //   channel = new (getVoiceChannel())(resolvedGuild, data, client);
      //   break;
      // }

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

      case ChannelType.GuildDirectory:
        channel = new (getDirectoryChannel())(resolvedGuild, data, client);
        break;
      case ChannelType.GuildForum:
        channel = new (getForumChannel())(resolvedGuild, data, client);
        break;
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
