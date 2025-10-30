'use strict';

const { Collection } = require('@discordjs/collection');
const { ChannelType, Routes } = require('discord-api-types/v10');
const { DiscordjsError, DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { GuildChannel } = require('../structures/GuildChannel.js');
const { PermissionOverwrites } = require('../structures/PermissionOverwrites.js');
const { ThreadChannel } = require('../structures/ThreadChannel.js');
const { Webhook } = require('../structures/Webhook.js');
const { ChannelFlagsBitField } = require('../util/ChannelFlagsBitField.js');
const { transformGuildForumTag, transformGuildDefaultReaction } = require('../util/Channels.js');
const { ThreadChannelTypes } = require('../util/Constants.js');
const { resolveImage } = require('../util/DataResolver.js');
const { setPosition } = require('../util/Util.js');
const { CachedManager } = require('./CachedManager.js');
const { GuildTextThreadManager } = require('./GuildTextThreadManager.js');

let cacheWarningEmitted = false;

/**
 * Manages API methods for GuildChannels and stores their cache.
 *
 * @extends {CachedManager}
 */
class GuildChannelManager extends CachedManager {
	constructor(guild, iterable) {
		super(guild.client, GuildChannel, iterable);
		const defaultCaching =
			this._cache.constructor.name === 'Collection' ||
			this._cache.maxSize === undefined ||
			this._cache.maxSize === Infinity;
		if (!cacheWarningEmitted && !defaultCaching) {
			cacheWarningEmitted = true;
		}

		/**
		 * The guild this Manager belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;
	}

	/**
	 * The number of channels in this managers cache excluding thread channels
	 * that do not count towards a guild's maximum channels restriction.
	 *
	 * @type {number}
	 * @readonly
	 */
	get channelCountWithoutThreads() {
		return this.cache.reduce((acc, channel) => {
			if (ThreadChannelTypes.includes(channel.type)) return acc;
			return acc + 1;
		}, 0);
	}

	/**
	 * The cache of this Manager
	 *
	 * @type {Collection<Snowflake, GuildChannel|ThreadChannel>}
	 * @name GuildChannelManager#cache
	 */

	_add(channel) {
		const existing = this.cache.get(channel.id);
		if (existing) return existing;
		this.cache.set(channel.id, channel);
		return channel;
	}

	/**
	 * Data that can be resolved to give a Guild Channel object. This can be:
	 * - A GuildChannel object
	 * - A ThreadChannel object
	 * - A Snowflake
	 *
	 * @typedef {GuildChannel|ThreadChannel|Snowflake} GuildChannelResolvable
	 */

	/**
	 * Resolves a GuildChannelResolvable to a Channel object.
	 *
	 * @param {GuildChannelResolvable} channel The GuildChannel resolvable to resolve
	 * @returns {?(GuildChannel|ThreadChannel)}
	 */
	resolve(channel) {
		if (channel instanceof ThreadChannel) return super.cache.get(channel.id) ?? null;
		return super.resolve(channel);
	}

	/**
	 * Resolves a GuildChannelResolvable to a channel id.
	 *
	 * @param {GuildChannelResolvable} channel The GuildChannel resolvable to resolve
	 * @returns {?Snowflake}
	 */
	resolveId(channel) {
		if (channel instanceof ThreadChannel) return super.resolveId(channel.id);
		return super.resolveId(channel);
	}

	/**
	 * Creates a webhook for the channel.
	 *
	 * @param {WebhookCreateOptions} options Options for creating the webhook
	 * @returns {Promise<Webhook>} Returns the created Webhook
	 * @example
	 * // Create a webhook for the current channel
	 * guild.channels.createWebhook({
	 *   channel: '222197033908436994',
	 *   name: 'Snek',
	 *   avatar: 'https://i.imgur.com/mI8XcpG.jpg',
	 *   reason: 'Needed a cool new Webhook'
	 * })
	 *   .then(console.log)
	 *   .catch(console.error)
	 */
	async createWebhook({ channel, name, avatar, reason }) {
		const channelId = this.resolveId(channel);
		if (!channelId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const resolvedAvatar = await resolveImage(avatar);

		const data = await this.client.rest.post(Routes.channelWebhooks(channelId), {
			body: {
				name,
				avatar: resolvedAvatar,
			},
			reason,
		});

		return new Webhook(this.client, data);
	}

	/**
	 * Sets a new position for the guild channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to set the position for
	 * @param {number} position The new position for the guild channel
	 * @param {SetChannelPositionOptions} options Options for setting position
	 * @returns {Promise<GuildChannel>}
	 * @example
	 * // Set a new channel position
	 * guild.channels.setPosition('222078374472843266', 2)
	 *   .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
	 *   .catch(console.error);
	 */
	async setPosition(channel, position, { relative, reason } = {}) {
		const resolvedChannel = this.resolve(channel);
		if (!resolvedChannel) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const updatedChannels = await setPosition(
			resolvedChannel,
			position,
			relative,
			this.guild._sortedChannels(resolvedChannel),
			this.client,
			Routes.guildChannels(this.guild.id),
			reason,
		);

		this.client.actions.GuildChannelsPositionUpdate.handle({
			guild_id: this.guild.id,
			channels: updatedChannels,
		});

		return resolvedChannel;
	}

	/**
	 * Obtains one or more guild channels from Discord, or the channel cache if they're already available.
	 *
	 * @param {Snowflake} [id] The channel's id
	 * @param {BaseFetchOptions} [options] Additional options for this fetch
	 * @returns {Promise<?GuildChannel|ThreadChannel|Collection<Snowflake, ?GuildChannel>>}
	 * @example
	 * // Fetch all channels from the guild (excluding threads)
	 * message.guild.channels.fetch()
	 *   .then(channels => console.log(`There are ${channels.size} channels.`))
	 *   .catch(console.error);
	 * @example
	 * // Fetch a single channel
	 * message.guild.channels.fetch('222197033908436994')
	 *   .then(channel => console.log(`The channel name is: ${channel.name}`))
	 *   .catch(console.error);
	 */
	async fetch(id, { cache = true, force = false } = {}) {
		if (id && !force) {
			const existing = this.cache.get(id);
			if (existing) return existing;
		}

		if (id) {
			const innerData = await this.client.rest.get(Routes.channel(id));
			// Since this is the guild manager, throw if on a different guild
			if (this.guild.id !== innerData.guild_id) throw new DiscordjsError(ErrorCodes.GuildChannelUnowned);
			return this.client.channels._add(innerData, this.guild, { cache });
		}

		const data = await this.client.rest.get(Routes.guildChannels(this.guild.id));
		const channels = new Collection();
		for (const channel of data) channels.set(channel.id, this.client.channels._add(channel, this.guild, { cache }));
		return channels;
	}

	/**
	 * Fetches all webhooks for the channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to fetch webhooks for
	 * @returns {Promise<Collection<Snowflake, Webhook>>}
	 * @example
	 * // Fetch webhooks
	 * guild.channels.fetchWebhooks('769862166131245066')
	 *   .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
	 *   .catch(console.error);
	 */
	async fetchWebhooks(channel) {
		const id = this.resolveId(channel);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');
		const data = await this.client.rest.get(Routes.channelWebhooks(id));
		return data.reduce((hooks, hook) => hooks.set(hook.id, new Webhook(this.client, hook)), new Collection());
	}

	/**
	 * Data that can be resolved to give a Category Channel object. This can be:
	 * - A CategoryChannel object
	 * - A Snowflake
	 *
	 * @typedef {CategoryChannel|Snowflake} CategoryChannelResolvable
	 */

	/**
	 * The data needed for updating a channel's position.
	 *
	 * @typedef {Object} ChannelPosition
	 * @property {GuildChannel|Snowflake} channel Channel to update
	 * @property {number} [position] New position for the channel
	 * @property {CategoryChannelResolvable} [parent] Parent channel for this channel
	 * @property {boolean} [lockPermissions] If the overwrites should be locked to the parents overwrites
	 */


	/**
	 * Data returned from fetching threads.
	 *
	 * @typedef {Object} FetchedThreads
	 * @property {Collection<Snowflake, ThreadChannel>} threads The threads that were fetched
	 * @property {Collection<Snowflake, ThreadMember>} members The thread members in the received threads
	 */

	/**
	 * Obtains all active thread channels in the guild.
	 *
	 * @param {boolean} [cache=true] Whether to cache the fetched data
	 * @returns {Promise<FetchedThreads>}
	 * @example
	 * // Fetch all threads from the guild
	 * message.guild.channels.fetchActiveThreads()
	 *   .then(fetched => console.log(`There are ${fetched.threads.size} threads.`))
	 *   .catch(console.error);
	 */
	async fetchActiveThreads(cache = true) {
		const data = await this.rawFetchGuildActiveThreads();
		return GuildTextThreadManager._mapThreads(data, this.client, { guild: this.guild, cache });
	}

	/**
	 * `GET /guilds/{guild.id}/threads/active`
	 *
	 * @private
	 * @returns {Promise<RESTGetAPIGuildThreadsResult>}
	 */
	async rawFetchGuildActiveThreads() {
		return this.client.rest.get(Routes.guildActiveThreads(this.guild.id));
	}

	/**
	 * Deletes the channel.
	 *
	 * @param {GuildChannelResolvable} channel The channel to delete
	 * @param {string} [reason] Reason for deleting this channel
	 * @returns {Promise<void>}
	 * @example
	 * // Delete the channel
	 * guild.channels.delete('858850993013260338', 'making room for new channels')
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	async delete(channel, reason) {
		const id = this.resolveId(channel);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');
		await this.client.rest.delete(Routes.channel(id), { reason });
		this.client.actions.ChannelDelete.handle({ id });
	}
}

exports.GuildChannelManager = GuildChannelManager;
