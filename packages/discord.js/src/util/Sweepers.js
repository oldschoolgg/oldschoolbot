'use strict';

const { setInterval, clearInterval } = require('node:timers');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { ThreadChannelTypes, SweeperKeys } = require('./Constants.js');
const { Events } = require('./Events.js');

/**
 * @typedef {Function} GlobalSweepFilter
 * @returns {?Function} Return `null` to skip sweeping, otherwise a function passed to `sweep()`,
 * See {@link https://discord.js.org/docs/packages/collection/stable/Collection:Class#sweep Collection#sweep}
 * for the definition of this function.
 */

/**
 * A container for all cache sweeping intervals and their associated sweep methods.
 */
class Sweepers {
	constructor(client, options) {
		/**
		 * The client that instantiated this
		 *
		 * @type {Client}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The options the sweepers were instantiated with
		 *
		 * @type {SweeperOptions}
		 */
		this.options = options;

		/**
		 * A record of interval timeout that is used to sweep the indicated items, or null if not being swept
		 *
		 * @type {Object<SweeperKey, ?Timeout>}
		 */
		this.intervals = Object.fromEntries(SweeperKeys.map(key => [key, null]));

		for (const key of SweeperKeys) {
			if (!(key in options)) continue;

			this._validateProperties(key);

			const clonedOptions = { ...this.options[key] };

			// Handle cases that have a "lifetime"
			if (!('filter' in clonedOptions)) {
				switch (key) {
					case 'messages':
						clonedOptions.filter = this.constructor.outdatedMessageSweepFilter(clonedOptions.lifetime);
						break;
					case 'threads':
						clonedOptions.filter = this.constructor.archivedThreadSweepFilter(clonedOptions.lifetime);
						break;
					default:
						break;
				}
			}

			this._initInterval(key, `sweep${key[0].toUpperCase()}${key.slice(1)}`, clonedOptions);
		}
	}

	sweepApplicationCommands(filter) {
		const { guilds, items: guildCommands } = this._sweepGuildDirectProp('commands', filter, { emit: false });

		const globalCommands = this.client.application?.commands.cache.sweep(filter) ?? 0;

		this.client.emit(
			Events.CacheSweep,
			`Swept ${globalCommands} global application commands and ${guildCommands} guild commands in ${guilds} guilds.`,
		);
		return guildCommands + globalCommands;
	}

	/**
	 * Sweeps all guild members and removes the ones which are indicated by the filter.
	 * <info>It is highly recommended to keep the client guild member cached</info>
	 *
	 * @param {Function} filter The function used to determine which guild members will be removed from the caches.
	 * @returns {number} Amount of guild members that were removed from the caches
	 */
	sweepGuildMembers(filter) {
		return this._sweepGuildDirectProp('members', filter, { outputName: 'guild members' }).items;
	}

	sweepMessages(filter) {
		if (typeof filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'filter', 'function');
		}

		let channels = 0;
		let messages = 0;

		for (const channel of this.client.channels.cache.values()) {
			if (!channel.isTextBased()) continue;

			channels++;
			messages += channel.messages.cache.sweep(filter);
		}

		this.client.emit(Events.CacheSweep, `Swept ${messages} messages in ${channels} text-based channels.`);
		return messages;
	}

	/**
	 * Sweeps all thread members and removes the ones which are indicated by the filter.
	 * <info>It is highly recommended to keep the client thread member cached</info>
	 *
	 * @param {Function} filter The function used to determine which thread members will be removed from the caches.
	 * @returns {number} Amount of thread members that were removed from the caches
	 */
	sweepThreadMembers(filter) {
		if (typeof filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'filter', 'function');
		}

		let threads = 0;
		let members = 0;
		for (const channel of this.client.channels.cache.values()) {
			if (!ThreadChannelTypes.includes(channel.type)) continue;
			threads++;
			members += channel.members.cache.sweep(filter);
		}

		this.client.emit(Events.CacheSweep, `Swept ${members} thread members in ${threads} threads.`);
		return members;
	}

	sweepThreads(filter) {
		if (typeof filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'filter', 'function');
		}

		let threads = 0;
		for (const [key, val] of this.client.channels.cache.entries()) {
			if (!ThreadChannelTypes.includes(val.type)) continue;
			if (filter(val, key, this.client.channels.cache)) {
				threads++;
				this.client.channels._remove(key);
			}
		}

		this.client.emit(Events.CacheSweep, `Swept ${threads} threads.`);
		return threads;
	}

	/**
	 * Sweeps all users and removes the ones which are indicated by the filter.
	 *
	 * @param {Function} filter The function used to determine which users will be removed from the caches.
	 * @returns {number} Amount of users that were removed from the caches
	 */
	sweepUsers(filter) {
		if (typeof filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'filter', 'function');
		}

		const users = this.client.users.cache.sweep(filter);

		this.client.emit(Events.CacheSweep, `Swept ${users} users.`);

		return users;
	}

	/**
	 * Cancels all sweeping intervals
	 *
	 * @returns {void}
	 */
	destroy() {
		for (const key of SweeperKeys) {
			if (this.intervals[key]) clearInterval(this.intervals[key]);
		}
	}

	/**
	 * Options for generating a filter function based on lifetime
	 *
	 * @typedef {Object} LifetimeFilterOptions
	 * @property {number} [lifetime=14400] How long, in seconds, an entry should stay in the collection
	 * before it is considered sweepable.
	 * @property {Function} [getComparisonTimestamp=e => e?.createdTimestamp] A function that takes an entry, key,
	 * and the collection and returns a timestamp to compare against in order to determine the lifetime of the entry.
	 * @property {Function} [excludeFromSweep=() => false] A function that takes an entry, key, and the collection
	 * and returns a boolean, `true` when the entry should not be checked for sweepability.
	 */

	/**
	 * Create a sweepFilter function that uses a lifetime to determine sweepability.
	 *
	 * @param {LifetimeFilterOptions} [options={}] The options used to generate the filter function
	 * @returns {GlobalSweepFilter}
	 */
	static filterByLifetime({
		lifetime = 14_400,
		getComparisonTimestamp = item => item?.createdTimestamp,
		excludeFromSweep = () => false,
	} = {}) {
		if (typeof lifetime !== 'number') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'lifetime', 'number');
		}

		if (typeof getComparisonTimestamp !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'getComparisonTimestamp', 'function');
		}

		if (typeof excludeFromSweep !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'excludeFromSweep', 'function');
		}

		return () => {
			if (lifetime <= 0) return null;
			const lifetimeMs = lifetime * 1_000;
			const now = Date.now();
			return (entry, key, coll) => {
				if (excludeFromSweep(entry, key, coll)) {
					return false;
				}

				const comparisonTimestamp = getComparisonTimestamp(entry, key, coll);
				if (!comparisonTimestamp || typeof comparisonTimestamp !== 'number') return false;
				return now - comparisonTimestamp > lifetimeMs;
			};
		};
	}

	/**
	 * Creates a sweep filter that sweeps archived threads
	 *
	 * @param {number} [lifetime=14400] How long a thread has to be archived to be valid for sweeping
	 * @returns {GlobalSweepFilter}
	 */
	static archivedThreadSweepFilter(lifetime = 14_400) {
		return this.filterByLifetime({
			lifetime,
			getComparisonTimestamp: thread => thread.archiveTimestamp,
			excludeFromSweep: thread => !thread.archived,
		});
	}

	/**
	 * Creates a sweep filter that sweeps outdated messages (edits taken into account)
	 *
	 * @param {number} [lifetime=3600] How long ago a message has to have been sent or edited to be valid for sweeping
	 * @returns {GlobalSweepFilter}
	 */
	static outdatedMessageSweepFilter(lifetime = 3_600) {
		return this.filterByLifetime({
			lifetime,
			getComparisonTimestamp: message => message.editedTimestamp ?? message.createdTimestamp,
		});
	}

	/**
	 * Configuration options for emitting the cache sweep client event
	 *
	 * @typedef {Object} SweepEventOptions
	 * @property {boolean} [emit=true] Whether to emit the client event in this method
	 * @property {string} [outputName] A name to output in the client event if it should differ from the key
	 * @private
	 */

	/**
	 * Sweep a direct sub property of all guilds
	 *
	 * @param {string} key The name of the property
	 * @param {Function} filter Filter function passed to sweep
	 * @param {SweepEventOptions} [eventOptions={}] Options for the Client event emitted here
	 * @returns {Object} Object containing the number of guilds swept and the number of items swept
	 * @private
	 */
	_sweepGuildDirectProp(key, filter, { emit = true, outputName } = {}) {
		if (typeof filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'filter', 'function');
		}

		let guilds = 0;
		let items = 0;

		for (const guild of this.client.guilds.cache.values()) {
			// We may be unable to sweep the cache if the guild is unavailable and was never patched
			if (!guild.available) continue;

			const { cache } = guild[key];

			guilds++;
			items += cache.sweep(filter);
		}

		if (emit) {
			this.client.emit(Events.CacheSweep, `Swept ${items} ${outputName ?? key} in ${guilds} guilds.`);
		}

		return { guilds, items };
	}

	/**
	 * Validates a set of properties
	 *
	 * @param {string} key Key of the options object to check
	 * @private
	 */
	_validateProperties(key) {
		const props = this.options[key];
		if (typeof props !== 'object') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, `sweepers.${key}`, 'object', true);
		}

		if (typeof props.interval !== 'number') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, `sweepers.${key}.interval`, 'number');
		}

		// Invites, Messages, and Threads can be provided a lifetime parameter, which we use to generate the filter
		if (['messages', 'threads'].includes(key) && !('filter' in props)) {
			if (typeof props.lifetime !== 'number') {
				throw new DiscordjsTypeError(ErrorCodes.InvalidType, `sweepers.${key}.lifetime`, 'number');
			}

			return;
		}

		if (typeof props.filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, `sweepers.${key}.filter`, 'function');
		}
	}

	/**
	 * Initialize an interval for sweeping
	 *
	 * @param {string} intervalKey The name of the property that stores the interval for this sweeper
	 * @param {string} sweepKey The name of the function that sweeps the desired caches
	 * @param {Object} opts Validated options for a sweep
	 * @private
	 */
	_initInterval(intervalKey, sweepKey, opts) {
		if (opts.interval <= 0 || opts.interval === Infinity) return;
		this.intervals[intervalKey] = setInterval(() => {
			const sweepFn = opts.filter();
			if (sweepFn === null) return;
			if (typeof sweepFn !== 'function') throw new DiscordjsTypeError(ErrorCodes.SweepFilterReturn);
			this[sweepKey](sweepFn);
		}, opts.interval * 1_000).unref();
	}
}

exports.Sweepers = Sweepers;
