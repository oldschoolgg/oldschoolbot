'use strict';

const { InteractionType } = require('discord-api-types/v10');
const { DiscordjsError, ErrorCodes } = require('../../errors/index.js');
const { InteractionCollector } = require('../InteractionCollector.js');
// eslint-disable-next-line import-x/order
const { MessageCollector } = require('../MessageCollector.js');

/**
 * Interface for classes that have text-channel-like features.
 *
 * @interface
 */
class TextBasedChannel {
	constructor() {
		/**
		 * A manager of the messages sent to this channel
		 *
		 * @type {GuildMessageManager}
		 */
		// eslint-disable-next-line no-use-before-define
		this.messages = new GuildMessageManager(this);
	}

	async send(options) {
		return this.client.channels.createMessage(this, options);
	}

	createMessageCollector(options = {}) {
		return new MessageCollector(this, options);
	}


	async awaitMessages(options = {}) {
		return new Promise((resolve, reject) => {
			const collector = this.createMessageCollector(options);
			collector.once('end', (collection, reason) => {
				if (options.errors?.includes(reason)) {
					reject(collection);
				} else {
					resolve(collection);
				}
			});
		});
	}

	createMessageComponentCollector(options = {}) {
		return new InteractionCollector(this.client, {
			...options,
			interactionType: InteractionType.MessageComponent,
			channel: this,
		});
	}

	async awaitMessageComponent(options = {}) {
		const _options = { ...options, max: 1 };
		return new Promise((resolve, reject) => {
			const collector = this.createMessageComponentCollector(_options);
			collector.once('end', (interactions, reason) => {
				const interaction = interactions.first();
				if (interaction) resolve(interaction);
				else reject(new DiscordjsError(ErrorCodes.InteractionCollectorError, reason));
			});
		});
	}

	async fetchWebhooks() {
		return this.guild.channels.fetchWebhooks(this.id);
	}

	async createWebhook(options) {
		return this.guild.channels.createWebhook({ channel: this.id, ...options });
	}

	static applyToClass(structure, ignore = []) {
		const props = [
			'createMessageCollector',
			'awaitMessages',
			'createMessageComponentCollector',
			'awaitMessageComponent',
			'fetchWebhooks',
			'createWebhook',
			'send',
		];

		for (const prop of props) {
			if (ignore.includes(prop)) continue;
			Object.defineProperty(
				structure.prototype,
				prop,
				Object.getOwnPropertyDescriptor(TextBasedChannel.prototype, prop),
			);
		}
	}
}

exports.TextBasedChannel = TextBasedChannel;

// Fixes Circular
// eslint-disable-next-line import-x/order
const { GuildMessageManager } = require('../../managers/GuildMessageManager.js');
