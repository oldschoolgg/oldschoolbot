'use strict';

const { makeURLSearchParams } = require('@discordjs/rest');
const { isJSONEncodable } = require('@discordjs/util');
const { InteractionResponseType, MessageFlags, Routes, InteractionType } = require('discord-api-types/v10');
const { DiscordjsError, ErrorCodes } = require('../../errors/index.js');
const { MessageFlagsBitField } = require('../../util/MessageFlagsBitField.js');
const { InteractionCallbackResponse } = require('../InteractionCallbackResponse.js');
const { InteractionCollector } = require('../InteractionCollector.js');
const { MessagePayload } = require('../MessagePayload.js');

class InteractionResponses {
	async deferReply(options = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);

		const resolvedFlags = new MessageFlagsBitField(options.flags);

		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredChannelMessageWithSource,
				data: {
					flags: resolvedFlags.bitfield,
				},
			},
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});

		this.deferred = true;
		this.ephemeral = resolvedFlags.has(MessageFlags.Ephemeral);

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	async reply(options) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);

		let messagePayload;
		if (options instanceof MessagePayload) messagePayload = options;
		else messagePayload = MessagePayload.create(this, options);

		const { body: data, files } = await messagePayload.resolveBody().resolveFiles();

		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data,
			},
			files,
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});

		this.ephemeral = Boolean(data.flags & MessageFlags.Ephemeral);
		this.replied = true;

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	async fetchReply(message = '@original') {
		return this.webhook.fetchMessage(message);
	}

	async editReply(options) {
		if (!this.deferred && !this.replied) throw new DiscordjsError(ErrorCodes.InteractionNotReplied);
		const msg = await this.webhook.editMessage(options.message ?? '@original', options);
		this.replied = true;
		return msg;
	}

	async deleteReply(message = '@original') {
		if (!this.deferred && !this.replied) throw new DiscordjsError(ErrorCodes.InteractionNotReplied);

		await this.webhook.deleteMessage(message);
	}

	async followUp(options) {
		if (!this.deferred && !this.replied) throw new DiscordjsError(ErrorCodes.InteractionNotReplied);
		const msg = await this.webhook.send(options);
		this.replied = true;
		return msg;
	}

	async deferUpdate(options = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);
		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredMessageUpdate,
			},
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});
		this.deferred = true;

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	async update(options = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);

		let messagePayload;
		if (options instanceof MessagePayload) messagePayload = options;
		else messagePayload = MessagePayload.create(this, options);

		const { body: data, files } = await messagePayload.resolveBody().resolveFiles();

		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.UpdateMessage,
				data,
			},
			files,
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});
		this.replied = true;

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	async launchActivity({ withResponse } = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);
		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			query: makeURLSearchParams({ with_response: withResponse ?? false }),
			body: {
				type: InteractionResponseType.LaunchActivity,
			},
			auth: false,
		});
		this.replied = true;

		return withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	async showModal(modal, options = {}) {
		if (this.deferred || this.replied) throw new DiscordjsError(ErrorCodes.InteractionAlreadyReplied);
		const response = await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.Modal,
				data: isJSONEncodable(modal) ? modal.toJSON() : this.client.options.jsonTransformer(modal),
			},
			auth: false,
			query: makeURLSearchParams({ with_response: options.withResponse ?? false }),
		});
		this.replied = true;

		return options.withResponse ? new InteractionCallbackResponse(this.client, response) : undefined;
	}

	async awaitModalSubmit(options) {
		if (typeof options.time !== 'number') throw new DiscordjsError(ErrorCodes.InvalidType, 'time', 'number');
		const _options = { ...options, max: 1, interactionType: InteractionType.ModalSubmit };
		return new Promise((resolve, reject) => {
			const collector = new InteractionCollector(this.client, _options);
			collector.once('end', (interactions, reason) => {
				const interaction = interactions.first();
				if (interaction) resolve(interaction);
				else reject(new DiscordjsError(ErrorCodes.InteractionCollectorError, reason));
			});
		});
	}

	static applyToClass(structure, ignore = []) {
		const props = [
			'deferReply',
			'reply',
			'fetchReply',
			'editReply',
			'deleteReply',
			'followUp',
			'deferUpdate',
			'update',
			'launchActivity',
			'showModal',
			'awaitModalSubmit',
		];

		for (const prop of props) {
			if (ignore.includes(prop)) continue;
			Object.defineProperty(
				structure.prototype,
				prop,
				Object.getOwnPropertyDescriptor(InteractionResponses.prototype, prop),
			);
		}
	}
}

exports.InteractionResponses = InteractionResponses;
