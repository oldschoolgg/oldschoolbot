'use strict';

const { DefaultRestOptions, DefaultUserAgentAppendix } = require('@discordjs/rest');
const { DefaultWebSocketManagerOptions } = require('@oldschoolgg/djsws');
const { version } = require('../../package.json');
const { toSnakeCase } = require('./Transformers.js');

class Options extends null {
	/**
	 * The default user agent appendix.
	 *
	 * @type {string}
	 * @memberof Options
	 * @private
	 */
	static userAgentAppendix = `discord.js/${version} ${DefaultUserAgentAppendix}`.trimEnd();

	/**
	 * The default client options.
	 *
	 * @returns {ClientOptions}
	 */
	static createDefault() {
		return {
			closeTimeout: 5_000,
			waitGuildTimeout: 15_000,
			makeCache: this.cacheWithLimits(this.DefaultMakeCacheSettings),
			partials: [],
			failIfNotExists: true,
			enforceNonce: false,
			sweepers: this.DefaultSweeperSettings,
			ws: {
				...DefaultWebSocketManagerOptions,
				largeThreshold: 50,
				version: 10,
			},
			rest: {
				...DefaultRestOptions,
				userAgentAppendix: this.userAgentAppendix,
			},
			jsonTransformer: toSnakeCase,
		};
	}

	/**
	 * Create a cache factory using predefined settings to sweep or limit.
	 *
	 * @param {Object<string, LimitedCollectionOptions|number>} [settings={}] Settings passed to the relevant constructor.
	 * If no setting is provided for a manager, it uses Collection.
	 * If a number is provided for a manager, it uses that number as the max size for a LimitedCollection.
	 * If LimitedCollectionOptions are provided for a manager, it uses those settings to form a LimitedCollection.
	 * @returns {CacheFactory}
	 * @example
	 * // Store up to 200 messages per channel and 200 members per guild, always keeping the client member.
	 * Options.cacheWithLimits({
	 *    MessageManager: 200,
	 *    GuildMemberManager: {
	 *      maxSize: 200,
	 *      keepOverLimit: (member) => member.id === client.user.id,
	 *    },
	 *  });
	 */
	static cacheWithLimits(settings = {}) {
		const { Collection } = require('@discordjs/collection');
		const { LimitedCollection } = require('./LimitedCollection.js');

		return ({ managerType, manager }) => {
			const setting = settings[manager.name] ?? settings[managerType.name];
			/* eslint-disable-next-line eqeqeq */
			if (setting == null) {
				return new Collection();
			}

			if (typeof setting === 'number') {
				if (setting === Infinity) {
					return new Collection();
				}

				return new LimitedCollection({ maxSize: setting });
			}

			/* eslint-disable-next-line eqeqeq */
			const noLimit = setting.maxSize == null || setting.maxSize === Infinity;
			if (noLimit) {
				return new Collection();
			}

			return new LimitedCollection(setting);
		};
	}

	/**
	 * Create a cache factory that always caches everything.
	 *
	 * @returns {CacheFactory}
	 */
	static cacheEverything() {
		const { Collection } = require('@discordjs/collection');
		return () => new Collection();
	}

	/**
	 * The default settings passed to {@link ClientOptions.makeCache}.
	 * The caches that this changes are:
	 * - `MessageManager` - Limit to 200 messages
	 * <info>If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
	 * `makeCache: Options.cacheWithLimits({ ...Options.DefaultMakeCacheSettings, ReactionManager: 0 })`</info>
	 *
	 * @type {Object<string, LimitedCollectionOptions|number>}
	 */
	static get DefaultMakeCacheSettings() {
		return {
			MessageManager: 200,
		};
	}

	/**
	 * The default settings passed to {@link ClientOptions.sweepers}.
	 * The sweepers that this changes are:
	 * - `threads` - Sweep archived threads every hour, removing those archived more than 4 hours ago
	 * <info>If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
	 * `sweepers: { ...Options.DefaultSweeperSettings, messages: { interval: 300, lifetime: 600 } }`</info>
	 *
	 * @type {SweeperOptions}
	 */
	static get DefaultSweeperSettings() {
		return {
			threads: {
				interval: 3_600,
				lifetime: 14_400,
			},
		};
	}
}

exports.Options = Options;
