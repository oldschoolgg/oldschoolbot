import { randomSnowflake } from '@oldschoolgg/toolkit';
import { uniqueArr } from 'e';
import { CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { globalConfig } from '../../src/lib/constants';
import { MUserClass } from '../../src/lib/MUser';
import { prisma } from '../../src/lib/settings/prisma';
import { ItemBank } from '../../src/lib/types';
import { assert, cryptoRand } from '../../src/lib/util';
import { ironmanCommand } from '../../src/mahoji/lib/abstracted_commands/ironmanCommand';
import { OSBMahojiCommand } from '../../src/mahoji/lib/util';
import { ClientStorage, User, UserStats } from '.prisma/client';

export const commandRunOptions = (userID: string): Omit<CommandRunOptions, 'options'> => ({
	userID,
	guildID: '342983479501389826',
	member: {} as any,
	user: { id: userID } as any,
	channelID: '111111111',
	interaction: {
		deferReply: () => Promise.resolve()
	} as any,
	client: {} as any
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
		await prisma.userStats.deleteMany({ where: { user_id: BigInt(this.id) } });
		await prisma.user.delete({ where: { id: this.id } });
		const user = await prisma.user.create({ data: { id: this.id } });
		this.user = user;
	}

	async runCommand(command: OSBMahojiCommand, options: object = {}) {
		const result = await command.run({ ...commandRunOptions(this.id), options });
		await this.sync();
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
}

export async function createTestUser(id = cryptoRand(1_000_000_000, 5_000_000_000).toString(), bank?: Bank) {
	const user = await prisma.user.upsert({
		create: {
			id,
			bank: bank?.bank
		},
		update: {
			bank: bank?.bank
		},
		where: {
			id
		}
	});

	try {
		await prisma.userStats.create({
			data: {
				user_id: BigInt(user.id)
			}
		});
	} catch (err) {
		console.error(`Failed to make userStats for ${user.id}`);
		throw new Error(`Failed to make userStats for ${user.id}`);
	}

	return new TestUser(user);
}

class TestClient {
	data: ClientStorage;
	constructor(data: ClientStorage) {
		this.data = data;
	}

	async reset() {
		await prisma.clientStorage.delete({ where: { id: this.data.id } });
		this.data = (await prisma.clientStorage.create({ data: { id: this.data.id } }))!;
	}

	async sync() {
		this.data = (await prisma.clientStorage.findFirst({ where: { id: this.data.id } }))!;
	}

	async expectValueMatch(key: keyof ClientStorage, value: any) {
		await this.sync();
		if (this.data[key] !== value) {
			throw new Error(`Expected ${key} to be ${value} but got ${this.data[key]}`);
		}
	}
}

export async function mockClient() {
	const clientId = randomSnowflake();
	const client = await prisma.clientStorage.create({
		data: {
			id: clientId
		}
	});

	globalConfig.clientID = clientId;
	return new TestClient(client);
}

assert(uniqueArr([randomSnowflake(), randomSnowflake(), randomSnowflake()]).length === 3);
