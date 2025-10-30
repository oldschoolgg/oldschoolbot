'use strict';

const { Collection } = require('@discordjs/collection');
const { makeURLSearchParams } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { Message } = require('../structures/Message.js');
const { MessagePayload } = require('../structures/MessagePayload.js');
const { MakeCacheOverrideSymbol } = require('../util/Symbols.js');
const { resolvePartialEmoji } = require('../util/Util.js');
const { CachedManager } = require('./CachedManager.js');

/**
 * Manages API methods for Messages and holds their cache.
 *
 * @extends {CachedManager}
 * @abstract
 */
class MessageManager extends CachedManager {
	static [MakeCacheOverrideSymbol] = MessageManager;

	constructor(channel, iterable) {
		super(channel.client, Message, iterable);

		/**
		 * The channel that the messages belong to
		 *
		 * @type {TextBasedChannels}
		 */
		this.channel = channel;
	}

	_add(data, cache) {
		return super._add(data, cache);
	}

	async fetch(options) {
		if (!options) return this._fetchMany();
		const { message, cache, force } = options;
		const resolvedMessage = this.resolveId(message ?? options);
		if (resolvedMessage) return this._fetchSingle({ message: resolvedMessage, cache, force });
		return this._fetchMany(options);
	}

	async _fetchSingle({ message, cache, force = false }) {
		if (!force) {
			const existing = this.cache.get(message);
			if (existing && !existing.partial) return existing;
		}

		const data = await this.client.rest.get(Routes.channelMessage(this.channel.id, message));
		return this._add(data, cache);
	}

	async _fetchMany(options = {}) {
		const data = await this.client.rest.get(Routes.channelMessages(this.channel.id), {
			query: makeURLSearchParams(options),
		});

		return data.reduce((_data, message) => _data.set(message.id, this._add(message, options.cache)), new Collection());
	}

	async edit(message, options) {
		const messageId = this.resolveId(message);
		if (!messageId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'message', 'MessageResolvable');

		const { body, files } = await (
			options instanceof MessagePayload
				? options
				: MessagePayload.create(message instanceof Message ? message : this, options)
		)
			.resolveBody()
			.resolveFiles();
		const data = await this.client.rest.patch(Routes.channelMessage(this.channel.id, messageId), { body, files });

		const existing = this.cache.get(messageId);
		if (existing) {
			const clone = existing._clone();
			clone._patch(data);
			return clone;
		}

		return this._add(data);
	}

	/**
	 * Deletes a message, even if it's not cached.
	 *
	 * @param {MessageResolvable} message The message to delete
	 * @returns {Promise<void>}
	 */
	async delete(message) {
		const messageId = this.resolveId(message);
		if (!messageId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'message', 'MessageResolvable');

		await this.client.rest.delete(Routes.channelMessage(this.channel.id, messageId));
	}

	/**
	 * Ends a poll.
	 *
	 * @param {Snowflake} messageId The id of the message
	 * @returns {Promise<Message>}
	 */
	async endPoll(messageId) {
		const message = await this.client.rest.post(Routes.expirePoll(this.channel.id, messageId));
		return this._add(message, false);
	}

	/**
	 * Options used for fetching voters of an answer in a poll.
	 *
	 * @typedef {BaseFetchPollAnswerVotersOptions} FetchPollAnswerVotersOptions
	 * @param {Snowflake} messageId The id of the message
	 * @param {number} answerId The id of the answer
	 */

	/**
	 * Fetches the users that voted for a poll answer.
	 *
	 * @param {FetchPollAnswerVotersOptions} options The options for fetching the poll answer voters
	 * @returns {Promise<Collection<Snowflake, User>>}
	 */
	async fetchPollAnswerVoters({ messageId, answerId, after, limit }) {
		const voters = await this.client.rest.get(Routes.pollAnswerVoters(this.channel.id, messageId, answerId), {
			query: makeURLSearchParams({ limit, after }),
		});

		return voters.users.reduce((acc, user) => acc.set(user.id, this.client.users._add(user, false)), new Collection());
	}
}

exports.MessageManager = MessageManager;
