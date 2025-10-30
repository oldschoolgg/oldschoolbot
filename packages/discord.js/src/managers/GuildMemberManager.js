'use strict';

const { setTimeout, clearTimeout } = require('node:timers');
const { Collection } = require('@discordjs/collection');
const { makeURLSearchParams } = require('@discordjs/rest');
const { DiscordSnowflake } = require('@sapphire/snowflake');
const { Routes, GatewayOpcodes } = require('discord-api-types/v10');
const { DiscordjsError, DiscordjsTypeError, DiscordjsRangeError, ErrorCodes } = require('../errors/index.js');
const { GuildMember } = require('../structures/GuildMember.js');
const { Role } = require('../structures/Role.js');
const { resolveImage } = require('../util/DataResolver.js');
const { Events } = require('../util/Events.js');
const { GuildMemberFlagsBitField } = require('../util/GuildMemberFlagsBitField.js');
const { Partials } = require('../util/Partials.js');
const { CachedManager } = require('./CachedManager.js');

/**
 * Manages API methods for GuildMembers and stores their cache.
 *
 * @extends {CachedManager}
 */
class GuildMemberManager extends CachedManager {
  constructor(guild, iterable) {
    super(guild.client, GuildMember, iterable);

    /**
     * The guild this manager belongs to
     *
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The cache of this Manager
   *
   * @type {Collection<Snowflake, GuildMember>}
   * @name GuildMemberManager#cache
   */

  _add(data, cache = true) {
    return super._add(data, cache, { id: data.user.id, extras: [this.guild] });
  }

  /**
   * Resolves a {@link UserResolvable} to a {@link GuildMember} object.
   *
   * @param {UserResolvable} member The user that is part of the guild
   * @returns {?GuildMember}
   */
  resolve(member) {
    const memberResolvable = super.resolve(member);
    if (memberResolvable) return memberResolvable;
    const userResolvable = this.client.users.resolveId(member);
    if (userResolvable) return super.cache.get(userResolvable) ?? null;
    return null;
  }

  /**
   * Resolves a {@link UserResolvable} to a member id.
   *
   * @param {UserResolvable} member The user that is part of the guild
   * @returns {?Snowflake}
   */
  resolveId(member) {
    const memberResolvable = super.resolveId(member);
    if (memberResolvable) return memberResolvable;
    const userResolvable = this.client.users.resolveId(member);
    return this.cache.has(userResolvable) ? userResolvable : null;
  }

  /**
   * The client user as a GuildMember of this guild
   *
   * @type {?GuildMember}
   * @readonly
   */
  get me() {
    return (
      this.cache.get(this.client.user.id) ??
      (this.client.options.partials.includes(Partials.GuildMember)
        ? this._add({ user: { id: this.client.user.id } }, true)
        : null)
    );
  }

  /**
   * Options used to fetch a single member from a guild.
   *
   * @typedef {BaseFetchOptions} FetchMemberOptions
   * @property {UserResolvable} user The user to fetch
   */

  /**
   * Options used to fetch multiple members from a guild.
   *
   * @typedef {Object} FetchMembersOptions
   * @property {UserResolvable|UserResolvable[]} [user] The user(s) to fetch
   * @property {?string} [query] Limit fetch to members with similar usernames
   * @property {number} [limit=0] Maximum number of members to request
   * @property {number} [time=120e3] Timeout for receipt of members
   * @property {?string} [nonce] Nonce for this request (32 characters max - default to base 16 now timestamp)
   */

  /**
   * Fetches member(s) from a guild.
   *
   * @param {UserResolvable|FetchMemberOptions|FetchMembersOptions} [options] Options for fetching member(s).
   * Omitting the parameter or providing `undefined` will fetch all members.
   * @returns {Promise<GuildMember|Collection<Snowflake, GuildMember>>}
   * @example
   * // Fetch all members from a guild
   * guild.members.fetch()
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch a single member
   * guild.members.fetch('66564597481480192')
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch a single member without checking cache
   * guild.members.fetch({ user, force: true })
   *   .then(console.log)
   *   .catch(console.error)
   * @example
   * // Fetch a single member without caching
   * guild.members.fetch({ user, cache: false })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * @example
   * // Fetch by query
   * guild.members.fetch({ query: 'hydra', limit: 1 })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async fetch(options) {
    if (!options) return this._fetchMany();
    const withPresences = false;
    const { user: users, limit, cache, force } = options;
    const resolvedUser = this.client.users.resolveId(users ?? options);
    if (resolvedUser && !limit && !withPresences) return this._fetchSingle({ user: resolvedUser, cache, force });
    const resolvedUsers = users?.map?.(user => this.client.users.resolveId(user)) ?? resolvedUser ?? undefined;
    return this._fetchMany({ ...options, users: resolvedUsers });
  }

  async _fetchSingle({ user, cache, force = false }) {
    if (!force) {
      const existing = this.cache.get(user);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.client.rest.get(Routes.guildMember(this.guild.id, user));
    return this._add(data, cache);
  }

  async _fetchMany({
    limit = 0,
    users,
    query: initialQuery,
    time = 120e3,
    nonce = DiscordSnowflake.generate().toString(),
  } = {}) {

    if (nonce.length > 32) throw new DiscordjsRangeError(ErrorCodes.MemberFetchNonceLength);

    const query = initialQuery ?? (users ? undefined : '');

    return new Promise((resolve, reject) => {
      this.guild.client.ws.send(this.guild.shardId, {
        op: GatewayOpcodes.RequestGuildMembers,
        d: {
          guild_id: this.guild.id,
          presences: false,
          user_ids: users,
          query,
          nonce,
          limit,
        },
      });
      const fetchedMembers = new Collection();
      let index = 0;
      const handler = (members, _, chunk) => {
        if (chunk.nonce !== nonce) return;

        // eslint-disable-next-line no-use-before-define
        timeout.refresh();
        index++;
        for (const member of members.values()) {
          fetchedMembers.set(member.id, member);
        }

        if (members.size < 1_000 || (limit && fetchedMembers.size >= limit) || index === chunk.count) {
          // eslint-disable-next-line no-use-before-define
          clearTimeout(timeout);
          this.client.removeListener(Events.GuildMembersChunk, handler);
          this.client.decrementMaxListeners();
          resolve(users && !Array.isArray(users) && fetchedMembers.size ? fetchedMembers.first() : fetchedMembers);
        }
      };

      const timeout = setTimeout(() => {
        this.client.removeListener(Events.GuildMembersChunk, handler);
        this.client.decrementMaxListeners();
        reject(new DiscordjsError(ErrorCodes.GuildMembersTimeout));
      }, time).unref();
      this.client.incrementMaxListeners();
      this.client.on(Events.GuildMembersChunk, handler);
    });
  }

  /**
   * Fetches the client user as a GuildMember of the guild.
   *
   * @param {BaseFetchOptions} [options] The options for fetching the member
   * @returns {Promise<GuildMember>}
   */
  async fetchMe(options) {
    return this.fetch({ ...options, user: this.client.user.id });
  }

  /**
   * Options used for searching guild members.
   *
   * @typedef {Object} GuildSearchMembersOptions
   * @property {string} query Filter members whose username or nickname start with this query
   * @property {number} [limit] Maximum number of members to search
   * @property {boolean} [cache=true] Whether or not to cache the fetched member(s)
   */

  /**
   * Options used for listing guild members.
   *
   * @typedef {Object} GuildListMembersOptions
   * @property {Snowflake} [after] Limit fetching members to those with an id greater than the supplied id
   * @property {number} [limit] Maximum number of members to list
   * @property {boolean} [cache=true] Whether or not to cache the fetched member(s)
   */

  /**
   * Lists up to 1000 members of the guild.
   *
   * @param {GuildListMembersOptions} [options] Options for listing members
   * @returns {Promise<Collection<Snowflake, GuildMember>>}
   */
  async list({ after, limit, cache = true } = {}) {
    const query = makeURLSearchParams({ limit, after });
    const data = await this.client.rest.get(Routes.guildMembers(this.guild.id), { query });
    return data.reduce((col, member) => col.set(member.user.id, this._add(member, cache)), new Collection());
  }

  async edit(user, { reason, ...options }) {
    const id = this.client.users.resolveId(user);
    if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'user', 'UserResolvable');

    options.roles &&= options.roles.map(role => (role instanceof Role ? role.id : role));

    if (options.flags !== undefined) {
      options.flags = GuildMemberFlagsBitField.resolve(options.flags);
    }

    const data = await this.client.rest.patch(Routes.guildMember(this.guild.id, id), { body: options, reason });
    const clone = this.cache.get(id)?._clone();
    clone?._patch(data);
    return clone ?? this._add(data, false);
  }

  async editMe({ reason, ...options }) {
    const data = await this.client.rest.patch(Routes.guildMember(this.guild.id, '@me'), {
      body: {
        ...options,
        banner: options.banner && (await resolveImage(options.banner)),
        avatar: options.avatar && (await resolveImage(options.avatar)),
      },
      reason,
    });

    const clone = this.me?._clone();
    clone?._patch(data);
    return clone ?? this._add(data, false);
  }

  /**
   * Kicks a user from the guild.
   * <info>The user must be a member of the guild</info>
   *
   * @param {UserResolvable} user The member to kick
   * @param {string} [reason] Reason for kicking
   * @returns {Promise<void>}
   * @example
   * // Kick a user by id (or with a user/guild member object)
   * await guild.members.kick('84484653687267328');
   */
  async kick(user, reason) {
    const id = this.client.users.resolveId(user);
    if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'user', 'UserResolvable');

    await this.client.rest.delete(Routes.guildMember(this.guild.id, id), { reason });
  }

  /**
   * Options used for adding or removing a role from a member.
   *
   * @typedef {Object} AddOrRemoveGuildMemberRoleOptions
   * @property {UserResolvable} user The user to add/remove the role from
   * @property {RoleResolvable} role The role to add/remove
   * @property {string} [reason] Reason for adding/removing the role
   */

  /**
   * Adds a role to a member.
   *
   * @param {AddOrRemoveGuildMemberRoleOptions} options Options for adding the role
   * @returns {Promise<void>}
   */
  async addRole(options) {
    const { user, role, reason } = options;
    const userId = this.resolveId(user);
    const roleId = this.guild.roles.resolveId(role);
    await this.client.rest.put(Routes.guildMemberRole(this.guild.id, userId, roleId), { reason });
  }

  /**
   * Removes a role from a member.
   *
   * @param {AddOrRemoveGuildMemberRoleOptions} options Options for removing the role
   * @returns {Promise<void>}
   */
  async removeRole(options) {
    const { user, role, reason } = options;
    const userId = this.resolveId(user);
    const roleId = this.guild.roles.resolveId(role);
    await this.client.rest.delete(Routes.guildMemberRole(this.guild.id, userId, roleId), { reason });
  }
}

exports.GuildMemberManager = GuildMemberManager;
