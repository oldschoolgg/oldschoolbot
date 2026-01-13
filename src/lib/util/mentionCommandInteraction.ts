import { InteractionType } from '@oldschoolgg/discord';
import type { IInteractionResponse, IMessage } from '@oldschoolgg/schemas';

class MentionCommandInteraction {
	__response__: unknown = {};
	rawInteraction: {
		guild_id?: string;
		channel_id: string;
		data: { options: []; resolved: Record<string, never> };
		type: InteractionType.ApplicationCommand;
	};
	userId: string;
	channelId: string;
	guildId?: string;
	member: null = null;

	constructor({ user, message }: { user: MUser; message: IMessage }) {
		this.userId = user.id;
		this.channelId = message.channel_id;
		this.guildId = message.guild_id ?? undefined;
		this.rawInteraction = {
			guild_id: message.guild_id ?? undefined,
			channel_id: message.channel_id,
			data: {
				options: [],
				resolved: {}
			},
			type: InteractionType.ApplicationCommand
		};
	}

	async deferReply() {
		return Promise.resolve();
	}

	async editReply(res: unknown) {
		this.__response__ = res;
	}

	async followUp(res: unknown) {
		this.__response__ = res;
	}

	async reply(res: unknown) {
		this.__response__ = res;
	}

	async replyWithResponse(res: unknown): Promise<IInteractionResponse> {
		this.__response__ = res;
		return { message_id: 'mention-command' };
	}

	async confirmation() {
		return Promise.resolve();
	}

	async makePaginatedMessage() {
		return Promise.resolve();
	}

	async makeParty(): Promise<MUser[]> {
		return [await mUserFetch(this.userId)];
	}

	async defer() {
		return Promise.resolve();
	}

	async returnStringOrFile() {
		return Promise.resolve();
	}
}

export function createMentionInteraction({ user, message }: { user: MUser; message: IMessage }): MInteraction {
	return new MentionCommandInteraction({ user, message }) as unknown as MInteraction;
}
