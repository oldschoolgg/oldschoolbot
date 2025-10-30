'use strict';

const { Collection } = require('@discordjs/collection');
const { Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { ApplicationEmoji } = require('../structures/ApplicationEmoji.js');
const { resolveImage } = require('../util/DataResolver.js');
const { CachedManager } = require('./CachedManager.js');

/**
 * Manages API methods for ApplicationEmojis and stores their cache.
 *
 * @extends {CachedManager}
 */
class ApplicationEmojiManager extends CachedManager {
	constructor(application, iterable) {
		super(application.client, ApplicationEmoji, iterable);

		/**
		 * The application this manager belongs to
		 *
		 * @type {ClientApplication}
		 */
		this.application = application;
	}

	_add(data, cache) {
		return super._add(data, cache, { extras: [this.application] });
	}

	async create({ attachment, name }) {
		const image = await resolveImage(attachment);
		if (!image) throw new DiscordjsTypeError(ErrorCodes.ReqResourceType);

		const body = { image, name };

		const emoji = await this.client.rest.post(Routes.applicationEmojis(this.application.id), { body });
		return this._add(emoji);
	}

	async fetch(id, { cache = true, force = false } = {}) {
		if (id) {
			if (!force) {
				const existing = this.cache.get(id);
				if (existing) return existing;
			}

			const emoji = await this.client.rest.get(Routes.applicationEmoji(this.application.id, id));
			return this._add(emoji, cache);
		}

		const { items: data } = await this.client.rest.get(Routes.applicationEmojis(this.application.id));
		const emojis = new Collection();
		for (const emoji of data) emojis.set(emoji.id, this._add(emoji, cache));
		return emojis;
	}

	async delete(emoji) {
		const id = this.resolveId(emoji);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'emoji', 'EmojiResolvable', true);
		await this.client.rest.delete(Routes.applicationEmoji(this.application.id, id));
	}

	async edit(emoji, options) {
		const id = this.resolveId(emoji);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'emoji', 'EmojiResolvable', true);

		const newData = await this.client.rest.patch(Routes.applicationEmoji(this.application.id, id), {
			body: {
				name: options.name,
			},
		});
		const existing = this.cache.get(id);
		if (existing) {
			existing._patch(newData);
			return existing;
		}

		return this._add(newData);
	}

	async fetchAuthor(emoji) {
		const id = this.resolveId(emoji);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'emoji', 'EmojiResolvable', true);

		const data = await this.client.rest.get(Routes.applicationEmoji(this.application.id, id));

		return this._add(data).author;
	}
}

exports.ApplicationEmojiManager = ApplicationEmojiManager;
