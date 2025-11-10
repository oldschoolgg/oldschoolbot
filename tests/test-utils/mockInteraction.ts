import { InteractionType } from '@oldschoolgg/discord';

import { TEST_CHANNEL_ID } from '../integration/util.js';

class MockInteraction {
	id = '111155555';
	__response__: any = {};

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

	public rawInteraction: any;
	public userId: string;
	constructor({ user }: { user: MUser }) {
		this.userId = user.id;
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

export function mockInteraction({ user }: { user: MUser }): MInteraction {
	return new MockInteraction({ user }) as any as MInteraction;
}
