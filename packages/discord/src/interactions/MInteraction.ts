import type { IButtonInteraction, IChatInputCommandInteraction, IGuild, IMember } from '@oldschoolgg/schemas';
import { deepMerge } from '@oldschoolgg/toolkit';
import type {
	APIChatInputApplicationCommandInteraction,
	APIMessage,
	APIMessageComponentInteraction
} from 'discord-api-types/v10';

import type { DiscordClient } from '../client/DiscordClient.js';
import type { BaseSendableMessage, SendableMessage } from '../client/types.js';
import { BaseInteraction } from './BaseInteraction.js';
import { interactionConfirmation } from './confirmation.js';
import { PaginatedMessage, type PaginatedMessageOptions } from './PaginatedMessage.js';

type AnyInteraction = IChatInputCommandInteraction | IButtonInteraction;
type RawFor<T> = T extends IButtonInteraction
	? APIMessageComponentInteraction
	: T extends IChatInputCommandInteraction
		? APIChatInputApplicationCommandInteraction
		: never;

type InputItx<T extends AnyInteraction> = {
	interaction: T;
	rawInteraction: RawFor<T>;
	client: DiscordClient;
};

export class MInteraction<T extends AnyInteraction = AnyInteraction> extends BaseInteraction {
	public interaction: T;
	public interactionResponse: APIMessage | null = null;
	public isPaginated = false;
	public isConfirmation = false;

	public guild: IGuild | null = null;
	public member: IMember | null = null;

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

	isChatInput(): this is MInteraction<IChatInputCommandInteraction> {
		return this.kind === 'ChatInputCommand';
	}

	makePaginatedMessage(options: PaginatedMessageOptions) {
		this.isPaginated = true;
		return new PaginatedMessage({ interaction: this, ...options }).run([this.userId]);
	}

	async defer({ ephemeral }: { ephemeral?: boolean } = {}) {
		return this.baseDeferReply({ ephemeral });
	}

	async reply(message: SendableMessage): Promise<APIMessage | null> {
		try {
			const response = await this.baseReply(message);
			return response;
		} catch (_err) {
			// Logging.logError(err as Error, {
			// 	userId: this.userId,
			// 	guildId: this.guildId,
			// 	interactionId: this.id,
			// 	response: JSON.stringify(message).slice(0, 1000)
			// });
			return null;
		}
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
	) {
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
