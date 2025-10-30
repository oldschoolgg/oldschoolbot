'use strict';

const { BaseGuildTextChannel } = require('./BaseGuildTextChannel.js');

/**
 * Represents a guild text channel on Discord.
 *
 * @extends {BaseGuildTextChannel}
 */
class TextChannel extends BaseGuildTextChannel {
  _patch(data) {
    super._patch(data);

    if ('rate_limit_per_user' in data) {
      /**
       * The rate limit per user (slowmode) for this channel in seconds
       *
       * @type {number}
       */
      this.rateLimitPerUser = data.rate_limit_per_user;
    }
  }
}

exports.TextChannel = TextChannel;
