import { cryptoRng, type RNGProvider } from '@oldschoolgg/rng';
import type { IChannel, IMember } from '@oldschoolgg/schemas';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';

import type { ClientStorage } from '@/prisma/main.js';
import { globalConfig } from '@/lib/constants.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';
import { mockMessage, mockUser } from '../integration/util.js';
import { TestLogs } from './logs.js';
import { mockedId, mockSnowflake } from './misc.js';
import { mockChannel } from './mockChannel.js';
import { mockRandomMember } from './mockMember.js';

export class TestClient extends AsyncEventEmitter<any> implements AsyncDisposable {
	public allCommands = allCommandsDONTIMPORT;
	public static activitiesProcessed = 0;
	public rng: RNGProvider = cryptoRng;
	public isReady = true;

	data: ClientStorage;
	constructor(data: ClientStorage) {
		super();
		this.data = data;
	}

	async mockUser(...args: Parameters<typeof mockUser>) {
		const user = await mockUser(...args);
		user.client = this;
		return user;
	}

	async reset() {
		await global.prisma!.clientStorage.delete({ where: { id: this.data.id } });
		this.data = (await global.prisma!.clientStorage.create({ data: { id: this.data.id } }))!;
	}

	async sync() {
		this.data = (await global.prisma!.clientStorage.findFirst({ where: { id: this.data.id } }))!;
	}

	async fetchChannel() {
		return mockChannel(this.rng);
	}

	async editMessage() {
		return Promise.resolve();
	}

	async channelIsSendable() {
		return this.rng.pick([true, false]);
	}

	async expectValueMatch(key: keyof ClientStorage, value: any) {
		await this.sync();
		if (this.data[key] !== value) {
			throw new Error(`Expected ${key} to be ${value} but got ${this.data[key]}`);
		}
	}

	async pickStringWithButtons(data: { options: string[]; interaction: MInteraction }) {
		const picked = this.rng.pick(data.options);
		return { choice: { id: picked }, userId: data.interaction.userId };
	}

	async fetchMessage(_messageId: string) {
		return mockMessage();
	}

	async sendMessage(channelId: string, message: SendableMessage) {
		// TODO simulate failures
		TestLogs.Debug(`Client ${this.data.id} sending message to channel ${channelId}: ${JSON.stringify(message)}`);
		return mockMessage({ userId: mockSnowflake(this.rng) });
	}

	async sendDm(userId: string, message: SendableMessage) {
		TestLogs.Debug(`Client ${this.data.id} sending dm to user ${userId}: ${JSON.stringify(message)}`);
	}

	async fetchMember({ guildId, userId }: { guildId: string; userId: string }): Promise<IMember> {
		return mockRandomMember({ guildId, userId, rng: this.rng });
	}

	async memberHasPermissions() {
		return this.rng.pick([true, false]);
	}

	async fetchChannelMessages() {
		return [];
	}

	async fetchChannelsOfGuild(): Promise<IChannel[]> {
		return await Promise.all(new Array(5).fill(null).map(() => mockChannel(this.rng)));
	}

	async setPresence(...args: any) {
		TestLogs.Debug(`Client ${this.data.id} setting presence: ${JSON.stringify(args)}`);
	}

	public async [Symbol.asyncDispose]() {}
}

export async function mockClient() {
	const clientId = mockedId();
	const client = await global.prisma!.clientStorage.create({
		data: {
			id: clientId
		}
	});

	globalConfig.clientID = clientId;
	process.env.CLIENT_ID = clientId;
	return new TestClient(client);
}
