'use strict';

const { Collection } = require('@discordjs/collection');
const { Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { Role } = require('../structures/Role.js');
const { CachedManager } = require('./CachedManager.js');

let cacheWarningEmitted = false;

/**
 * Manages API methods for roles and stores their cache.
 *
 * @extends {CachedManager}
 */
class RoleManager extends CachedManager {
  constructor(guild, iterable) {
    super(guild.client, Role, iterable);
    if (!cacheWarningEmitted && this._cache.constructor.name !== 'Collection') {
      cacheWarningEmitted = true;
    }

    /**
     * The guild belonging to this manager
     *
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The role cache of this manager
   *
   * @type {Collection<Snowflake, Role>}
   * @name RoleManager#cache
   */

  _add(data, cache) {
    return super._add(data, cache, { extras: [this.guild] });
  }

  /**
   * Obtains a role from Discord, or the role cache if they're already available.
   *
   * @param {Snowflake} [id] The role's id
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<Role|Collection<Snowflake, Role>>}
   * @example
   * // Fetch all roles from the guild
   * message.guild.roles.fetch()
   *   .then(roles => console.log(`There are ${roles.size} roles.`))
   *   .catch(console.error);
   * @example
   * // Fetch a single role
   * message.guild.roles.fetch('222078108977594368')
   *   .then(role => console.log(`The role color is: ${role.colors.primaryColor}`))
   *   .catch(console.error);
   */
  async fetch(id, { cache = true, force = false } = {}) {
    if (!id) {
      const innerData = await this.client.rest.get(Routes.guildRoles(this.guild.id));
      const roles = new Collection();
      for (const role of innerData) roles.set(role.id, this._add(role, cache));
      return roles;
    }

    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    const data = await this.client.rest.get(Routes.guildRole(this.guild.id, id));
    return this._add(data, cache);
  }

  /**
   * Compares the positions of two roles.
   *
   * @param {RoleResolvable} role1 First role to compare
   * @param {RoleResolvable} role2 Second role to compare
   * @returns {number} Negative number if the first role's position is lower (second role's is higher),
   * positive number if the first's is higher (second's is lower), 0 if equal
   */
  comparePositions(role1, role2) {
    const resolvedRole1 = this.resolve(role1);
    const resolvedRole2 = this.resolve(role2);
    if (!resolvedRole1 || !resolvedRole2) {
      throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'role', 'Role nor a Snowflake');
    }

    const role1Position = resolvedRole1.position;
    const role2Position = resolvedRole2.position;

    if (role1Position === role2Position) {
      return Number(BigInt(resolvedRole2.id) - BigInt(resolvedRole1.id));
    }

    return role1Position - role2Position;
  }

  /**
   * Gets the managed role a user created when joining the guild, if any
   * <info>Only ever available for bots</info>
   *
   * @param {UserResolvable} user The user to access the bot role for
   * @returns {?Role}
   */
  botRoleFor(user) {
    const userId = this.client.users.resolveId(user);
    if (!userId) return null;
    return this.cache.find(role => role.tags?.botId === userId) ?? null;
  }

  /**
   * The `@everyone` role of the guild
   *
   * @type {Role}
   * @readonly
   */
  get everyone() {
    return this.cache.get(this.guild.id);
  }

  /**
   * The premium subscriber role of the guild, if any
   *
   * @type {?Role}
   * @readonly
   */
  get premiumSubscriberRole() {
    return this.cache.find(role => role.tags?.premiumSubscriberRole) ?? null;
  }

  /**
   * The role with the highest position in the cache
   *
   * @type {Role}
   * @readonly
   */
  get highest() {
    return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), this.cache.first());
  }
}

exports.RoleManager = RoleManager;
