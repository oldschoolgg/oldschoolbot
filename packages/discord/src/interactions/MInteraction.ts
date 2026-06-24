import type {
	IButtonInteraction,
	IChatInputCommandInteraction,
	IInteractionResponse,
	IMember
} from '@oldschoolgg/schemas';
import { deepMerge } from '@oldschoolgg/toolkit';
import {
	type APIChatInputApplicationCommandInteraction,
	type APIMessage,
	type APIMessageComponentInteraction,
	InteractionType
} from 'discord-api-types/v10';

import type { DiscordClient } from '../client/DiscordClient.js';
import type { BaseSendableMessage, SendableMessage } from '../client/types.js';
import { convertApiMemberToZMember } from '../conversions.js';
import type { SpecialResponse } from '../util.js';
import { BaseInteraction } from './BaseInteraction.js';
import { interactionConfirmation } from './confirmation.js';
import { PaginatedMessage, type PaginatedMessageOptions } from './PaginatedMessage.js';

export type AnyInteraction = IChatInputCommandInteraction | IButtonInteraction;
type RawFor<T> = T extends IButtonInteraction
	? APIMessageComponentInteraction
	: T extends IChatInputCommandInteraction
		? APIChatInputApplicationCommandInteraction
		: never;

export type InputItx<T extends AnyInteraction> = {
	interaction: T;
	rawInteraction: RawFor<T>;
	client: DiscordClient;
};

export class MInteraction<T extends AnyInteraction = AnyInteraction> extends BaseInteraction {
	public interaction: T;
	public interactionResponse: APIMessage | null = null;
	public isPaginated = false;
	public isConfirmation = false;

	constructor({ interaction, rawInteraction, client }: InputItx<T>) {
		super({
			client,
			data: interaction,
			applicationId: rawInteraction.application_id,
			rawInteraction
		});
		this.interaction = interaction;
	}

	isButton(): this is MInteraction<IButtonInteraction> {
		return this.kind === 'Button';
	}

	get member(): IMember | null {
		if (!this.rawInteraction.member) return null;
		return convertApiMemberToZMember({
			userId: this.interaction.user_id,
			guildId: this.rawInteraction.guild_id!,
			apiMember: this.rawInteraction.member
		});
	}

	get message(): APIMessage | null {
		if (this.rawInteraction.type !== InteractionType.MessageComponent) return null;
		return this.rawInteraction.message;
	}

	isChatInput(): this is MInteraction<IChatInputCommandInteraction> {
		return this.kind === 'ChatInputCommand';
	}

	makePaginatedMessage(options: PaginatedMessageOptions): Promise<SpecialResponse.PaginatedMessageResponse> {
		this.isPaginated = true;
		return new PaginatedMessage({ interaction: this, ...options }).run([this.userId]);
	}

	async defer({ ephemeral }: { ephemeral?: boolean } = {}): Promise<void> {
		await this.baseDeferReply({ ephemeral });
	}

	async reply(message: SendableMessage): Promise<null> {
		try {
			await this.baseReply(message);
		} catch (_err) {
			this.client.emit('error', _err as Error);
			return null;
		}
		return null;
	}

	async replyWithResponse(message: BaseSendableMessage): Promise<IInteractionResponse | null> {
		try {
			const response = await this.baseReply({ ...message, withResponse: true })!;
			if (!response) throw new Error('No response from baseReply');
			if ('id' in response) {
				return {
					message_id: response.id
				};
			}
			if (!response.interaction.response_message_id) {
				throw new Error('No response message ID found');
			}
			return {
				message_id: response.interaction.response_message_id
			};
		} catch (_err) {
			this.client.emit('error', _err as Error);
		}
		return null;
	}

	/**
	 * You cannot use ephemeral if more than one user is required to confirm.
	 */
	async confirmation(
		message:
			| string
			| ({ content: string; timeout?: number } & (
					| { ephemeral?: false; users?: string[] }
					| { ephemeral?: boolean; users?: undefined }
			  ))
	): Promise<void> {
		return interactionConfirmation(this, message);
	}

	returnStringOrFile(string: string | BaseSendableMessage): BaseSendableMessage {
		const TOO_LONG_STR = 'The result was too long (over 2000 characters), please read the attached file.';

		if (typeof string === 'string') {
			if (string.length > 2000) {
				return {
					content: TOO_LONG_STR,
					files: [{ buffer: Buffer.from(string), name: 'result.txt' }]
				};
			}
			return { content: string };
		}
		if (string.content && string.content.length > 2000) {
			return deepMerge(
				string,
				{
					content: TOO_LONG_STR,
					files: [{ buffer: Buffer.from(string.content), name: 'result.txt' }]
				},
				{ clone: false }
			);
		}
		return string;
	}
}

export type ButtonMInteraction = MInteraction<IButtonInteraction>;
export type ChatInputMInteraction = MInteraction<IChatInputCommandInteraction>;
