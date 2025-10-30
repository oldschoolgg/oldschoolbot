'use strict';
const { DiscordSnowflake } = require('@sapphire/snowflake');
const { Routes } = require('discord-api-types/v10');
const { Base } = require('./Base.js');

/**
 * Represents the data about the guild any bot can preview, connected to the specified guild.
 *
 * @extends {Base}
 */
class GuildPreview extends Base {
  constructor(client, data) {
    super(client);

    if (!data) return;

    this._patch(data);
  }

  _patch(data) {
    /**
     * The id of this guild
     *
     * @type {string}
     */
    this.id = data.id;

    if ('name' in data) {
      /**
       * The name of this guild
       *
       * @type {string}
       */
      this.name = data.name;
    }

  }

  /**
   * The timestamp this guild was created at
   *
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return DiscordSnowflake.timestampFrom(this.id);
  }

  /**
   * The time this guild was created at
   *
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The URL to this guild's icon.
   *
   * @param {ImageURLOptions} [options={}] Options for the image URL
   * @returns {?string}
   */
  iconURL(options = {}) {
    return this.icon && this.client.rest.cdn.icon(this.id, this.icon, options);
  }

  /**
   * Fetches this guild.
   *
   * @returns {Promise<GuildPreview>}
   */
  async fetch() {
    const data = await this.client.rest.get(Routes.guildPreview(this.id));
    this._patch(data);
    return this;
  }

  /**
   * When concatenated with a string, this automatically returns the guild's name instead of the Guild object.
   *
   * @returns {string}
   * @example
   * // Logs: Hello from My Guild!
   * console.log(`Hello from ${previewGuild}!`);
   */
  toString() {
    return this.name;
  }

  toJSON() {
    const json = super.toJSON();
    json.iconURL = this.iconURL();
    return json;
  }
}

exports.GuildPreview = GuildPreview;
