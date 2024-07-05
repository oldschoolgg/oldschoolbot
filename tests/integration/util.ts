import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';
import { randInt, shuffleArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';

import { integer, nodeCrypto } from 'random-js';
import { vi } from 'vitest';
import { MUserClass } from '../../src/lib/MUser';
import { processPendingActivities } from '../../src/lib/Task';
import { globalConfig } from '../../src/lib/constants';
import type { ItemBank } from '../../src/lib/types';
import { giveMaxStats } from '../../src/mahoji/commands/testpotato';
import { ironmanCommand } from '../../src/mahoji/lib/abstracted_commands/ironmanCommand';
import type { OSBMahojiCommand } from '../../src/mahoji/lib/util';
import type { ClientStorage, User, UserStats } from '.prisma/client';

const commandRunOptions = (userID: string): Omit<CommandRunOptions, 'options'> => ({
	userID,
	guildID: '342983479501389826',
	member: {} as any,
	user: { id: userID } as any,
	channelID: '111111111',
	interaction: {
		channelId: '1',
		deferReply: () => Promise.resolve(),
		editReply: () => Promise.resolve(),
		followUp: () => Promise.resolve()
	} as any,
	client: {} as any,
	djsClient: {} as any
});

export class TestUser extends MUserClass {
	constructor(user: MUser | User) {
		super(user instanceof MUserClass ? user.user : user);
	}

	async openedBankMatch(bankToMatch: Bank) {
		const stats = await this.fetchStats({ openable_scores: true });
		const currentBank = new Bank(stats.openable_scores as ItemBank);
		if (!currentBank.equals(bankToMatch)) {
			throw new Error(`Expected opened bank to match, difference: ${currentBank.difference(bankToMatch)}`);
		}
	}

	async clMatch(bankToMatch: Bank) {
		await this.sync();
		if (!this.cl.equals(bankToMatch)) {
			throw new Error(`Expected CL to match, difference: ${this.cl.difference(bankToMatch)}`);
		}
	}

	async bankMatch(bankToMatch: Bank) {
		await this.sync();
		if (!this.bank.equals(bankToMatch)) {
			throw new Error(
				`Expected bank to match, CURRENT[${this.bank.toString()}] EXPECTED[${bankToMatch.toString()}]`
			);
		}
	}

	async reset() {
		const res = await ironmanCommand(this, null);
		if (res !== 'You are now an ironman.') {
			throw new Error(`Failed to reset: ${res}`);
		}
		await global.prisma!.userStats.deleteMany({ where: { user_id: BigInt(this.id) } });
		await global.prisma!.user.delete({ where: { id: this.id } });
		const user = await global.prisma!.user.create({ data: { id: this.id } });
		this.user = user;
	}

	async runCommand(command: OSBMahojiCommand, options: object = {}) {
		const result = await command.run({ ...commandRunOptions(this.id), options });
		return result;
	}

	async bankAmountMatch(itemName: string, amount: number) {
		await this.sync();
		if (this.bank.amount(itemName) !== amount) {
			throw new Error(`Expected ${amount}x ${itemName} but got ${this.bank.amount(itemName)}`);
		}
	}

	async gpMatch(amount: number) {
		await this.sync();
		if (this.GP !== amount) {
			throw new Error(`Expected ${amount} GP but got ${this.GP}`);
		}
	}

	async statsMatch(key: keyof UserStats, value: any) {
		await this.sync();
		const stats = await this.fetchStats({ [key]: true });
		if (stats[key] !== value) {
			throw new Error(`Expected ${key} to be ${value} but got ${stats[key]}`);
		}
	}

	async max() {
		await giveMaxStats(this);
		return this;
	}

	randomBankSubset() {
		const bank = new Bank();
		const items = shuffleArr(this.bankWithGP.items()).slice(0, randInt(0, this.bankWithGP.length));
		for (const [item] of items) {
			bank.add(item, randInt(1, this.bankWithGP.amount(item.id)));
		}
		return bank;
	}
}

const idsUsed = new Set<string>();

export function unMockedCyptoRand(min: number, max: number) {
	return integer(min, max)(nodeCrypto);
}

export function mockedId() {
	return unMockedCyptoRand(1_000_000_000_000, 5_000_000_000_000).toString();
}

export async function createTestUser(_bank?: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
	const id = userData?.id ?? mockedId();
	if (idsUsed.has(id)) {
		throw new Error(`ID ${id} has already been used`);
	}
	idsUsed.add(id);

	const bank = _bank ? _bank.clone() : null;
	let GP = Number(userData.GP) ?? 0;
	if (bank) {
		GP += bank.amount('Coins');
		bank.remove('Coins', GP);
	}

	const user = await global.prisma!.user.upsert({
		create: {
			id,
			...userData,
			bank: bank?.bank,
			GP
		},
		update: {
			...userData,
			bank: bank?.bank,
			GP
		},
		where: {
			id
		}
	});

	try {
		await global.prisma!.userStats.create({
			data: {
				user_id: BigInt(user.id)
			}
		});
	} catch (err) {
		console.error(`Failed to make userStats for ${user.id}`);
		throw new Error(err as any);
	}

	return new TestUser(user);
}

class TestClient {
	data: ClientStorage;
	constructor(data: ClientStorage) {
		this.data = data;
	}

	async reset() {
		await global.prisma!.clientStorage.delete({ where: { id: this.data.id } });
		this.data = (await global.prisma!.clientStorage.create({ data: { id: this.data.id } }))!;
	}

	async sync() {
		this.data = (await global.prisma!.clientStorage.findFirst({ where: { id: this.data.id } }))!;
	}

	async expectValueMatch(key: keyof ClientStorage, value: any) {
		await this.sync();
		if (this.data[key] !== value) {
			throw new Error(`Expected ${key} to be ${value} but got ${this.data[key]}`);
		}
	}

	async processActivities() {
		await processPendingActivities();
	}
}

export async function mockClient() {
	const clientId = mockedId();
	const client = await global.prisma!.clientStorage.create({
		data: {
			id: clientId
		}
	});

	globalConfig.clientID = clientId;
	return new TestClient(client);
}

if (uniqueArr([mockedId(), mockedId(), mockedId()]).length !== 3) {
	throw new Error('mockedId is broken');
}

const originalMathRandom = Math.random;
export function mockMathRandom(value: number) {
	vi.spyOn(Math, 'random').mockImplementation(() => value);
	return () => (Math.random = originalMathRandom);
}
