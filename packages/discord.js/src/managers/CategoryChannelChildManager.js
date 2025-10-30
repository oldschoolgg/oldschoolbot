'use strict';

const { GuildChannel } = require('../structures/GuildChannel.js');
const { DataManager } = require('./DataManager.js');

/**
 * Manages API methods for CategoryChannels' children.
 *
 * @extends {DataManager}
 */
class CategoryChannelChildManager extends DataManager {
  constructor(channel) {
    super(channel.client, GuildChannel);
    /**
     * The category channel this manager belongs to
     *
     * @type {CategoryChannel}
     */
    this.channel = channel;
  }

  /**
   * The channels that are a part of this category
   *
   * @type {Collection<Snowflake, GuildChannel>}
   * @readonly
   */
  get cache() {
    return this.guild.channels.cache.filter(channel => channel.parentId === this.channel.id);
  }

  get guild() {
    return this.channel.guild;
  }

  async create(options) {
    return this.guild.channels.create({
      ...options,
      parent: this.channel.id,
    });
  }
}

exports.CategoryChannelChildManager = CategoryChannelChildManager;
