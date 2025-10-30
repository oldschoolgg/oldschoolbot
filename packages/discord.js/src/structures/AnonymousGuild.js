'use strict';

const { BaseGuild } = require('./BaseGuild.js');

/**
 * Bundles common attributes and methods between {@link Guild} and {@link InviteGuild}
 *
 * @extends {BaseGuild}
 * @abstract
 */
class AnonymousGuild extends BaseGuild {
  constructor(client, data, immediatePatch = true) {
    super(client, data);
    if (immediatePatch) this._patch(data);
  }

  _patch(data) {
    if ('features' in data) this.features = data.features;

    if ('verification_level' in data) {
      /**
       * The verification level of the guild
       *
       * @type {GuildVerificationLevel}
       */
      this.verificationLevel = data.verification_level;
    }

    if ('nsfw_level' in data) {
      /**
       * The NSFW level of this guild
       *
       * @type {GuildNSFWLevel}
       */
      this.nsfwLevel = data.nsfw_level;
    }

    if ('premium_subscription_count' in data) {
      /**
       * The total number of boosts for this server
       *
       * @type {?number}
       */
      this.premiumSubscriptionCount = data.premium_subscription_count;
    } else {
      this.premiumSubscriptionCount ??= null;
    }
  }
}

exports.AnonymousGuild = AnonymousGuild;
