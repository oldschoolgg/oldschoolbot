import { makeURLSearchParams, type RawFile, type REST } from '@discordjs/rest';
import type { IButtonInteraction, IChatInputCommandInteraction } from '@oldschoolgg/schemas';
import {
	type APIAttachment,
	type APIMessage,
	InteractionResponseType,
	MessageFlags,
	Routes
} from 'discord-api-types/v10';

import {
	type APISendableMessage,
	type SendableMessage,
	sendableMsgToApiCreate
} from '@/lib/discord/SendableMessage.js';

type EditMessageOptions = SendableMessage;

export class BaseInteraction {
	readonly id: string;
	readonly token: string;
	readonly applicationId: string;
	private _deferred = false;
	private _replied = false;
	private _ephemeral = false;
	private readonly rest: REST;
	public _data: IChatInputCommandInteraction | IButtonInteraction;

	constructor({
		data,
		rest,
		applicationId
	}: { data: IChatInputCommandInteraction | IButtonInteraction; rest: REST; applicationId: string }) {
		this.id = data.id;
		this.token = data.token;
		this.applicationId = applicationId;
		this.rest = rest;
		this._data = data;
	}

	get raw() {
		return this._data;
	}

	get deferred() {
		return this._deferred;
	}
	get replied() {
		return this._replied;
	}
	get ephemeral() {
		return this._ephemeral;
	}
	get channelId() {
		return this._data.channel_id;
	}
	get guildId() {
		return this._data.guild_id;
	}
	get userId() {
		return this._data.user.id;
	}

	get createdTimestamp() {
		return this._data.created_timestamp;
	}

	get messageId() {
		if (this._data.kind !== 'Button') throw new Error('InteractionHasNoMessage');
		return this._data.message.id;
	}

	private async toBody(options: SendableMessage): Promise<APISendableMessage> {
		return sendableMsgToApiCreate(options);
	}

	private async sendCallback(type: InteractionResponseType, options?: SendableMessage & { withResponse?: boolean }) {
		const query = makeURLSearchParams({
			with_response: options?.withResponse ?? false,
			thread_id: (options as any)?.threadId
		});
		if (options) {
			const { files, message } = await this.toBody(options);
			return this.rest.post(Routes.interactionCallback(this.id, this.token), {
				auth: false,
				body: { type, data: message },
				files: files ?? undefined,
				query
			});
		}
		return this.rest.post(Routes.interactionCallback(this.id, this.token), {
			auth: false,
			body: { type },
			query
		});
	}

	private async sendWebhookCreate(options: SendableMessage): Promise<APIMessage> {
		const { files, message } = await this.toBody(options);
		return this.rest.post(Routes.webhook(this.applicationId, this.token), {
			auth: false,
			body: message,
			files: files ?? undefined,
			query: makeURLSearchParams({ thread_id: (options as any)?.threadId })
		}) as Promise<APIMessage>;
	}

	private async sendWebhookEdit(messageId: string, options: SendableMessage): Promise<APIMessage> {
		const { files, message } = await this.toBody(options);
		return this.rest.patch(Routes.webhookMessage(this.applicationId, this.token, messageId), {
			auth: false,
			body: message,
			files: files ?? undefined
		}) as Promise<APIMessage>;
	}

	async baseDeferReply(options: { ephemeral?: boolean; withResponse?: boolean; threadId?: string } = {}) {
		if (this._deferred || this._replied) throw new Error('InteractionAlreadyReplied');
		const flags = options.ephemeral ? MessageFlags.Ephemeral : 0;
		const res = await this.rest.post(Routes.interactionCallback(this.id, this.token), {
			auth: false,
			body: { type: InteractionResponseType.DeferredChannelMessageWithSource, data: { flags } },
			query: makeURLSearchParams({ with_response: options.withResponse ?? false, thread_id: options.threadId })
		});
		this._deferred = true;
		this._ephemeral = Boolean(flags & MessageFlags.Ephemeral);
		return options.withResponse ? res : undefined;
	}

	async baseReply(options: SendableMessage): Promise<APIMessage | null> {
		if (this._deferred || this._replied) {
			// TODO: might need to return interaction respnose here
			return this.baseEditReply(options);
		}
		const res = await this.sendCallback(InteractionResponseType.ChannelMessageWithSource, options);
		this._ephemeral = Boolean((options as any)?.ephemeral);
		this._replied = true;
		return (options as any)?.withResponse ? (res as APIMessage) : null;
	}

	async baseDeferUpdate(options: { withResponse?: boolean } = {}) {
		if (this._deferred || this._replied) throw new Error('InteractionAlreadyReplied');
		const res = await this.sendCallback(InteractionResponseType.DeferredMessageUpdate);
		this._deferred = true;
		return options.withResponse ? res : undefined;
	}

	async update(options: SendableMessage & { withResponse?: boolean }) {
		if (this._deferred || this._replied) throw new Error('InteractionAlreadyReplied');
		const res = await this.sendCallback(InteractionResponseType.UpdateMessage, options);
		this._replied = true;
		return options.withResponse ? res : undefined;
	}

	async followUp(options: SendableMessage): Promise<APIMessage> {
		if (!this._deferred && !this._replied) throw new Error('InteractionNotReplied');
		return this.sendWebhookCreate(options);
	}

	async fetchReply(message: string | '@original' = '@original'): Promise<APIMessage> {
		return this.rest.get(Routes.webhookMessage(this.applicationId, this.token, message), {
			auth: false
		}) as Promise<APIMessage>;
	}

	async baseEditReply(options: EditMessageOptions): Promise<APIMessage> {
		if (!this._deferred && !this._replied) throw new Error('InteractionNotReplied');
		return this.sendWebhookEdit('@original', options);
	}

	async deleteReply(message: string | '@original' = '@original'): Promise<void> {
		if (!this._deferred && !this._replied) throw new Error('InteractionNotReplied');
		await this.rest.delete(Routes.webhookMessage(this.applicationId, this.token, message), { auth: false });
	}

	static attachmentsFrom(files?: RawFile[]): Pick<APIAttachment, 'filename' | 'id'>[] | undefined {
		if (!files || files.length === 0) return undefined;
		const out: Pick<APIAttachment, 'filename' | 'id'>[] = [];
		let i = 0;
		for (const f of files) out.push({ filename: f.name ?? `file${i++}`, id: `${i}` });
		return out;
	}

	public async silentButtonAck() {
		return this.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredMessageUpdate
			}
		});
	}

	// async showModal(modal: APIInteractionResponseCallbackData & { custom_id: string; title: string; components: APIActionRowComponent<ComponentType>[] }, options: { withResponse?: boolean } = {}) {
	// 	if (this._deferred || this._replied) throw new Error('InteractionAlreadyReplied');
	// 	const res = await this.rest.post(Routes.interactionCallback(this.id, this.token), {
	// 		auth: false,
	// 		body: { type: InteractionResponseType.Modal, data: modal },
	// 		query: makeURLSearchParams({ with_response: options.withResponse ?? false })
	// 	});
	// 	this._replied = true;
	// 	return options.withResponse ? res : undefined;
	// }
}
