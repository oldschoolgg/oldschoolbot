'use strict';

const { GuildMessageManager } = require('../managers/GuildMessageManager.js');
const { GuildTextThreadManager } = require('../managers/GuildTextThreadManager.js');
const { GuildChannel } = require('./GuildChannel.js');
const { TextBasedChannel } = require('./interfaces/TextBasedChannel.js');

/**
 * Represents a text-based guild channel on Discord.
 *
 * @extends {GuildChannel}
 * @implements {TextBasedChannel}
 */
class BaseGuildTextChannel extends GuildChannel {
  constructor(guild, data, client) {
    super(guild, data, client, false);

    /**
     * A manager of the messages sent to this channel
     *
     * @type {GuildMessageManager}
     */
    this.messages = new GuildMessageManager(this);

    /**
     * A manager of the threads belonging to this channel
     *
     * @type {GuildTextThreadManager}
     */
    this.threads = new GuildTextThreadManager(this);

    /**
     * If the guild considers this channel NSFW
     *
     * @type {boolean}
     */
    this.nsfw = Boolean(data.nsfw);

    this._patch(data);
  }

  _patch(data) {
    super._patch(data);

    if ('topic' in data) {
      /**
       * The topic of the text channel
       *
       * @type {?string}
       */
      this.topic = data.topic;
    }

    if ('nsfw' in data) {
      this.nsfw = Boolean(data.nsfw);
    }

    if ('messages' in data) {
      for (const message of data.messages) this.messages._add(message);
    }
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel

  send() { }

  createMessageCollector() { }

  awaitMessages() { }

  createMessageComponentCollector() { }

  awaitMessageComponent() { }

  bulkDelete() { }

  fetchWebhooks() { }

  createWebhook() { }

}

TextBasedChannel.applyToClass(BaseGuildTextChannel);

exports.BaseGuildTextChannel = BaseGuildTextChannel;
