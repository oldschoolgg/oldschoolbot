import { makeURLSearchParams, type RawFile, type REST } from '@discordjs/rest';
import {
	type APIAttachment,
	type APIMessage,
	InteractionResponseType,
	MessageFlags,
	Routes
} from '@oldschoolgg/discord';
import type { IButtonInteraction, IChatInputCommandInteraction } from '@oldschoolgg/schemas';
import { isObject } from '@oldschoolgg/toolkit';

import {
	type APISendableMessage,
	type SendableMessage,
	sendableMsgToApiCreate
} from '@/lib/discord/SendableMessage.js';

type EditMessageOptions = SendableMessage;

export class BaseInteraction {
	public readonly id: string;
	private readonly token: string;
	private readonly applicationId: string;
	private _deferred = false;
	private _replied = false;
	private _ephemeral = false;
	private readonly rest: REST;
	private _data: IChatInputCommandInteraction | IButtonInteraction;
	public userId: string;

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
		this.userId = data.user_id;
	}

	get customId() {
		if (this._data.kind !== 'Button') throw new Error('Interaction is not a button interaction.');
		return this._data.custom_id;
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

	get createdTimestamp() {
		return this._data.created_timestamp;
	}

	get kind() {
		return this._data.kind;
	}

	get messageId() {
		if (this._data.kind !== 'Button') throw new Error('InteractionHasNoMessage');
		return this._data.message.id;
	}

	private async toBody(options: SendableMessage): Promise<APISendableMessage> {
		const result = await sendableMsgToApiCreate(options);
		if (result.message.flags === MessageFlags.Ephemeral) {
			this._ephemeral = true;
		}
		return result;
	}

	private async sendCallback(
		type: InteractionResponseType,
		options?: SendableMessage & { withResponse?: boolean }
	): Promise<APIMessage | null> {
		const query = makeURLSearchParams({
			with_response: options?.withResponse ?? false,
			thread_id: isObject(options) && 'threadId' in options ? options.threadId : undefined
		});
		const { files, message } = options ? await this.toBody(options) : { files: undefined, message: undefined };
		return this.rest.post(Routes.interactionCallback(this.id, this.token), {
			auth: false,
			body: { type, data: message },
			files: files ?? undefined,
			query
		}) as Promise<APIMessage | null>;
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
		if (this._deferred) return;
		if (this.replied) throw new Error('baseDeferReply: Tried to defer an interaction that was already replied');
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
			return this.baseEditReply(options);
		}
		this._replied = true;
		const res = await this.sendCallback(InteractionResponseType.ChannelMessageWithSource, options);
		return res;
	}

	async baseDeferUpdate(options: { withResponse?: boolean } = {}) {
		if (this._deferred || this._replied) throw new Error('baseDeferUpdate: InteractionAlreadyReplied');
		const res = await this.sendCallback(InteractionResponseType.DeferredMessageUpdate);
		this._deferred = true;
		return options.withResponse ? res : undefined;
	}

	async update(options: SendableMessage & { withResponse?: boolean }) {
		if (this._deferred || this._replied) throw new Error('update: InteractionAlreadyReplied');
		const res = await this.sendCallback(InteractionResponseType.UpdateMessage, options);
		this._replied = true;
		return options.withResponse ? res : undefined;
	}

	async followUp(options: SendableMessage): Promise<APIMessage> {
		if (!this._deferred && !this._replied) throw new Error('followUp: InteractionNotReplied');
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
		await this.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredMessageUpdate
			}
		});
	}

	public async deferredMessageUpdate() {
		return this.rest.post(Routes.interactionCallback(this.id, this.token), {
			body: {
				type: InteractionResponseType.DeferredMessageUpdate
			}
		});
	}
}
