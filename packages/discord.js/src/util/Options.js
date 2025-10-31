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
			partials: [],
			failIfNotExists: true,
			enforceNonce: false,
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
}

exports.Options = Options;
