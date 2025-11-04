import type {
	APIChatInputApplicationCommandInteraction,
	APIMessage,
	APIMessageComponentInteraction
} from '@oldschoolgg/discord';
import type { IButtonInteraction, IChatInputCommandInteraction, IGuild, IMember } from '@oldschoolgg/schemas';
import { deepMerge } from '@oldschoolgg/toolkit';

import { BaseInteraction } from '@/lib/discord/interaction/BaseInteraction.js';
import { interactionConfirmation } from '@/lib/discord/interaction/confirmation.js';
import { makeParty } from '@/lib/discord/interaction/makeParty.js';
import { PaginatedMessage, type PaginatedMessageOptions } from '@/lib/discord/PaginatedMessage.js';
import type { MakePartyOptions } from '@/lib/types/index.js';

type AnyInteraction = IChatInputCommandInteraction | IButtonInteraction;
type RawFor<T> = T extends IButtonInteraction
	? APIMessageComponentInteraction
	: T extends IChatInputCommandInteraction
		? APIChatInputApplicationCommandInteraction
		: never;

type InputItx<T extends AnyInteraction> = {
	interaction: T;
	rawInteraction: RawFor<T>;
};

export class MInteraction<T extends AnyInteraction = AnyInteraction> extends BaseInteraction {
	public interaction: T;
	public interactionResponse: APIMessage | null = null;
	public isPaginated = false;
	public isParty = false;
	public isConfirmation = false;

	public guild: IGuild | null = null;
	public member: IMember | null = null;

	constructor({ interaction, rawInteraction }: InputItx<T>) {
		super({ data: interaction, rest: globalClient.rest, applicationId: rawInteraction.application_id });
		this.interaction = interaction;
		this.member = interaction.member ?? null;
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
		return this.baseReply(message);
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

	public async makeParty(options: MakePartyOptions & { message: string }): Promise<MUser[]> {
		return makeParty(this, options);
	}
}
export const MButtonInteraction = (args: InputItx<IButtonInteraction>) => new MInteraction<IButtonInteraction>(args);
export const MChatInputInteraction = (args: InputItx<IChatInputCommandInteraction>) =>
	new MInteraction<IChatInputCommandInteraction>(args);

export type ButtonMInteraction = MInteraction<IButtonInteraction>;
export type ChatInputMInteraction = MInteraction<IChatInputCommandInteraction>;
