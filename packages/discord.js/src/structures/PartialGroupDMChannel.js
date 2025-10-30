'use strict';

const { DiscordjsError, ErrorCodes } = require('../errors/index.js');
const { PartialGroupDMMessageManager } = require('../managers/PartialGroupDMMessageManager.js');
const { BaseChannel } = require('./BaseChannel.js');
const { TextBasedChannel } = require('./interfaces/TextBasedChannel.js');

/**
 * Represents a Partial Group DM Channel on Discord.
 *
 * @extends {BaseChannel}
 * @implements {TextBasedChannel}
 */
class PartialGroupDMChannel extends BaseChannel {
  constructor(client, data) {
    super(client, data);

    // No flags are present when fetching partial group DM channels.
    this.flags = null;

    /**
     * The name of this Group DM Channel
     *
     * @type {?string}
     */
    this.name = data.name;

    /**
     * The hash of the channel icon
     *
     * @type {?string}
     */
    this.icon = data.icon ?? null;

    /**
     * Recipient data received in a {@link PartialGroupDMChannel}.
     *
     * @typedef {Object} PartialRecipient
     * @property {string} username The username of the recipient
     */

    /**
     * The recipients of this Group DM Channel.
     *
     * @type {PartialRecipient[]}
     */
    this.recipients = data.recipients ?? [];

    /**
     * A manager of the messages belonging to this channel
     *
     * @type {PartialGroupDMMessageManager}
     */
    this.messages = new PartialGroupDMMessageManager(this);

    if ('owner_id' in data) {
      /**
       * The user id of the owner of this Group DM Channel
       *
       * @type {?Snowflake}
       */
      this.ownerId = data.owner_id;
    } else {
      this.ownerId ??= null;
    }
  }

  /**
   * The URL to this channel's icon.
   *
   * @param {ImageURLOptions} [options={}] Options for the image URL
   * @returns {?string}
   */
  iconURL(options = {}) {
    return this.icon && this.client.rest.cdn.channelIcon(this.id, this.icon, options);
  }

  /**
   * Fetches the owner of this Group DM Channel.
   *
   * @param {BaseFetchOptions} [options] The options for fetching the user
   * @returns {Promise<User>}
   */
  async fetchOwner(options) {
    if (!this.ownerId) {
      throw new DiscordjsError(ErrorCodes.FetchOwnerId, 'group DM');
    }

    return this.client.users.fetch(this.ownerId, options);
  }

  async delete() {
    throw new DiscordjsError(ErrorCodes.DeleteGroupDMChannel);
  }

  async fetch() {
    throw new DiscordjsError(ErrorCodes.FetchGroupDMChannel);
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel

  createMessageComponentCollector() { }

  awaitMessageComponent() { }
}

TextBasedChannel.applyToClass(PartialGroupDMChannel, [
  'bulkDelete',
  'send',
  'createMessageCollector',
  'awaitMessages',
  'fetchWebhooks',
  'createWebhook',
]);

exports.PartialGroupDMChannel = PartialGroupDMChannel;
