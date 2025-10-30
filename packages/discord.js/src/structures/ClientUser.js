'use strict';

const { Routes } = require('discord-api-types/v10');
const { resolveImage } = require('../util/DataResolver.js');
const { User } = require('./User.js');

/**
 * Represents the logged in client's Discord user.
 *
 * @extends {User}
 */
class ClientUser extends User {
  _patch(data) {
    super._patch(data);

    if ('verified' in data) {
      /**
       * Whether or not this account has been verified
       *
       * @type {boolean}
       */
      this.verified = data.verified;
    }

    if ('mfa_enabled' in data) {
      /**
       * If the bot's {@link ClientApplication#owner Owner} has MFA enabled on their account
       *
       * @type {?boolean}
       */
      this.mfaEnabled = typeof data.mfa_enabled === 'boolean' ? data.mfa_enabled : null;
    } else {
      this.mfaEnabled ??= null;
    }

    if ('token' in data) this.client.token = data.token;
  }
  /**
   * Edits the logged in client.
   *
   * @param {ClientUserEditOptions} options The options to provide
   * @returns {Promise<ClientUser>}
   */
  async edit({ username, avatar, banner }) {
    const data = await this.client.rest.patch(Routes.user(), {
      body: {
        username,
        avatar: avatar && (await resolveImage(avatar)),
        banner: banner && (await resolveImage(banner)),
      },
    });

    const { updated } = this.client.actions.UserUpdate.handle(data);
    return updated ?? this;
  }
}

exports.ClientUser = ClientUser;
