'use strict';

const { Collection } = require('@discordjs/collection');
const { makeURLSearchParams } = require('@discordjs/rest');
const { Routes, RouteBases } = require('discord-api-types/v10');
const { ShardClientUtil } = require('../sharding/ShardClientUtil.js');
const { Guild } = require('../structures/Guild.js');
const { GuildChannel } = require('../structures/GuildChannel.js');
const { GuildMember } = require('../structures/GuildMember.js');
const { OAuth2Guild } = require('../structures/OAuth2Guild.js');
const { Role } = require('../structures/Role.js');
const { CachedManager } = require('./CachedManager.js');

let cacheWarningEmitted = false;

/**
 * Manages API methods for Guilds and stores their cache.
 *
 * @extends {CachedManager}
 */
class GuildManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Guild, iterable);
    if (!cacheWarningEmitted && this._cache.constructor.name !== 'Collection') {
      cacheWarningEmitted = true;
    }
  }

  resolve(guild) {
    if (
      guild instanceof GuildChannel ||
      guild instanceof GuildMember ||
      guild instanceof Role
    ) {
      return super.resolve(guild.guild);
    }

    return super.resolve(guild);
  }

  /**
   * Resolves a {@link GuildResolvable} to a {@link Guild} id string.
   *
   * @method resolveId
   * @memberof GuildManager
   * @instance
   * @param {GuildResolvable} guild The guild resolvable to identify
   * @returns {?Snowflake}
   */
  resolveId(guild) {
    if (
      guild instanceof GuildChannel ||
      guild instanceof GuildMember ||
      guild instanceof Role
    ) {
      return super.resolveId(guild.guild.id);
    }

    return super.resolveId(guild);
  }

  /**
   * Options used to fetch a single guild.
   *
   * @typedef {BaseFetchOptions} FetchGuildOptions
   * @property {GuildResolvable} guild The guild to fetch
   * @property {boolean} [withCounts=true] Whether the approximate member and presence counts should be returned
   */

  /**
   * Options used to fetch multiple guilds.
   *
   * @typedef {Object} FetchGuildsOptions
   * @property {Snowflake} [before] Get guilds before this guild id
   * @property {Snowflake} [after] Get guilds after this guild id
   * @property {number} [limit] Maximum number of guilds to request (1-200)
   */

  /**
   * Obtains one or multiple guilds from Discord, or the guild cache if it's already available.
   *
   * @param {GuildResolvable|FetchGuildOptions|FetchGuildsOptions} [options] The guild's id or options
   * @returns {Promise<Guild|Collection<Snowflake, OAuth2Guild>>}
   */
  async fetch(options = {}) {
    const id = this.resolveId(options) ?? this.resolveId(options.guild);

    if (id) {
      if (!options.force) {
        const existing = this.cache.get(id);
        if (existing) return existing;
      }

      const innerData = await this.client.rest.get(Routes.guild(id), {
        query: makeURLSearchParams({ with_counts: options.withCounts ?? true }),
      });
      innerData.shardId = ShardClientUtil.shardIdForGuildId(id, await this.client.ws.fetchShardCount());
      return this._add(innerData, options.cache);
    }

    const data = await this.client.rest.get(Routes.userGuilds(), { query: makeURLSearchParams(options) });
    return data.reduce((coll, guild) => coll.set(guild.id, new OAuth2Guild(this.client, guild)), new Collection());
  }

}

exports.GuildManager = GuildManager;
