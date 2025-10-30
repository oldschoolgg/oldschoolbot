'use strict';

const { Attachment } = require('./Attachment.js');
const { BaseInteraction } = require('./BaseInteraction.js');
const { InteractionWebhook } = require('./InteractionWebhook.js');
const { InteractionResponses } = require('./interfaces/InteractionResponses.js');

/**
 * Represents a command interaction.
 *
 * @extends {BaseInteraction}
 * @implements {InteractionResponses}
 * @abstract
 */
class CommandInteraction extends BaseInteraction {
	constructor(client, data) {
		super(client, data);

		/**
		 * The id of the channel this interaction was sent in
		 *
		 * @type {Snowflake}
		 * @name CommandInteraction#channelId
		 */

		/**
		 * The invoked application command's id
		 *
		 * @type {Snowflake}
		 */
		this.commandId = data.data.id;

		/**
		 * The invoked application command's name
		 *
		 * @type {string}
		 */
		this.commandName = data.data.name;

		/**
		 * The invoked application command's type
		 *
		 * @type {ApplicationCommandType}
		 */
		this.commandType = data.data.type;

		/**
		 * The id of the guild the invoked application command is registered to
		 *
		 * @type {?Snowflake}
		 */
		this.commandGuildId = data.data.guild_id ?? null;

		/**
		 * Whether the reply to this interaction has been deferred
		 *
		 * @type {boolean}
		 */
		this.deferred = false;

		/**
		 * Whether this interaction has already been replied to
		 *
		 * @type {boolean}
		 */
		this.replied = false;

		/**
		 * Whether the reply to this interaction is ephemeral
		 *
		 * @type {?boolean}
		 */
		this.ephemeral = null;

		/**
		 * An associated interaction webhook, can be used to further interact with this interaction
		 *
		 * @type {InteractionWebhook}
		 */
		this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
	}

	/**
	 * The invoked application command, if it was fetched before
	 *
	 * @type {?ApplicationCommand}
	 */
	get command() {
		const id = this.commandId;
		return this.guild?.commands.cache.get(id) ?? this.client.application.commands.cache.get(id) ?? null;
	}

	transformOption(option, resolved) {
		const result = {
			name: option.name,
			type: option.type,
		};

		if ('value' in option) result.value = option.value;
		if ('options' in option) result.options = option.options.map(opt => this.transformOption(opt, resolved));

		if (resolved) {
			const user = resolved.users?.[option.value];
			if (user) result.user = this.client.users._add(user);

			const member = resolved.members?.[option.value];
			if (member) result.member = member;

			const channel = resolved.channels?.[option.value];
			if (channel) result.channel = this.client.channels._add(channel, this.guild) ?? channel;

			const role = resolved.roles?.[option.value];
			if (role) result.role = this.guild?.roles._add(role) ?? role;

			const attachment = resolved.attachments?.[option.value];
			if (attachment) result.attachment = new Attachment(attachment);
		}

		return result;
	}

	// These are here only for documentation purposes - they are implemented by InteractionResponses

	deferReply() { }

	reply() { }

	fetchReply() { }

	editReply() { }

	deleteReply() { }

	followUp() { }

	launchActivity() { }

	showModal() { }

	awaitModalSubmit() { }
}

InteractionResponses.applyToClass(CommandInteraction, ['deferUpdate', 'update']);

exports.CommandInteraction = CommandInteraction;
