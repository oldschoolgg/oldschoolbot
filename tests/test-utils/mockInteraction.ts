import { InteractionType } from '@oldschoolgg/discord';
import type { IInteractionResponse } from '@oldschoolgg/schemas';
import { MathRNG } from 'node-rng';

import { TEST_CHANNEL_ID } from '../integration/constants.js';

class MockInteraction {
	id = '111155555';
	__response__: any = {};
	public rawInteraction: any;
	public userId: string;
	public user: MUser;

	constructor({ user }: { user: MUser }) {
		this.userId = user.id;
		this.user = user;
		this.rawInteraction = {
			guild_id: '1',
			data: {
				options: [],
				resolved: {}
			},
			channel_id: TEST_CHANNEL_ID,
			type: InteractionType.ApplicationCommand
		};
	}

	get rng() {
		return MathRNG;
	}

	async deferReply() {
		return Promise.resolve();
	}
	async editReply(res: any) {
		this.__response__ = res;
	}
	async followUp(res: any) {
		this.__response__ = res;
	}
	async reply(res: any) {
		this.__response__ = res;
	}
	async replyWithResponse(res: any): Promise<IInteractionResponse> {
		this.__response__ = res;
		return { message_id: '2222555555' };
	}

	get channelId() {
		return '1111111111111111';
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

export function mockInteraction({ user }: { user: MUser }): OSInteraction {
	return new MockInteraction({ user }) as any as OSInteraction;
}
