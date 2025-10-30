'use strict';

const { GuildForumThreadManager } = require('../managers/GuildForumThreadManager.js');
const { GuildChannel } = require('./GuildChannel.js');
const { TextBasedChannel } = require('./interfaces/TextBasedChannel.js');

class ThreadOnlyChannel extends GuildChannel {
	constructor(guild, data, client) {
		super(guild, data, client, false);

		/**
		 * A manager of the threads belonging to this channel
		 *
		 * @type {GuildForumThreadManager}
		 */
		this.threads = new GuildForumThreadManager(this);

		this._patch(data);
	}

	_patch(data) {
		super._patch(data);

		if ('nsfw' in data) {
			/**
			 * If this channel is considered NSFW.
			 *
			 * @type {boolean}
			 */
			this.nsfw = data.nsfw;
		} else {
			this.nsfw ??= false;
		}

		if ('topic' in data) {
			/**
			 * The topic of this channel.
			 *
			 * @type {?string}
			 */
			this.topic = data.topic;
		}

		if ('default_sort_order' in data) {
			/**
			 * The default sort order mode used to order posts
			 *
			 * @type {?SortOrderType}
			 */
			this.defaultSortOrder = data.default_sort_order;
		} else {
			this.defaultSortOrder ??= null;
		}
	}
}

TextBasedChannel.applyToClass(ThreadOnlyChannel, [
	'send',
	'createMessageCollector',
	'awaitMessages',
	'createMessageComponentCollector',
	'awaitMessageComponent',
]);

exports.ThreadOnlyChannel = ThreadOnlyChannel;
