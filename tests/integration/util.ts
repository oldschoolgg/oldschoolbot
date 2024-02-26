import { Prisma } from '@prisma/client';
import { randInt, shuffleArr, Time, uniqueArr } from 'e';
import { CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { globalConfig } from '../../src/lib/constants';
import { MUserClass } from '../../src/lib/MUser';
import { convertStoredActivityToFlatActivity, prisma } from '../../src/lib/settings/prisma';
import { processPendingActivities } from '../../src/lib/Task';
import { ItemBank } from '../../src/lib/types';
import { ActivityTaskOptions } from '../../src/lib/types/minions';
import { cryptoRand } from '../../src/lib/util';
import { giveMaxStats } from '../../src/mahoji/commands/testpotato';
import { ironmanCommand } from '../../src/mahoji/lib/abstracted_commands/ironmanCommand';
import { OSBMahojiCommand } from '../../src/mahoji/lib/util';
import { ClientStorage, User, UserStats } from '.prisma/client';

export const commandRunOptions = (userID: string): Omit<CommandRunOptions, 'options'> => ({
	userID,
	guildID: '342983479501389826',
	member: {} as any,
	user: { id: userID, createdAt: new Date().getTime() - Time.Year } as any,
	channelID: '111111111',
	interaction: {
		deferReply: () => Promise.resolve(),
		editReply: () => Promise.resolve(),
		followUp: () => Promise.resolve()
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
		await ironmanCommand(this, null);
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
		if (value instanceof Bank) {
			if (!new Bank(stats[key]).equals(value)) {
				throw new Error(`Expected ${key} to be ${value} but got ${new Bank(stats[key])}`);
			}
		} else if (stats[key] !== value) {
			throw new Error(`Expected ${key} to be ${value} but got ${stats[key]}`);
		}
	}

	async max() {
		await giveMaxStats(this);
		return this;
	}

	async runActivity<T extends ActivityTaskOptions>(): Promise<T> {
		const [finishedActivity] = await processPendingActivities();
		if (!finishedActivity) {
			throw new Error('runActivity: No activity was ran');
		}
		if (finishedActivity.user_id.toString() !== this.id) {
			throw new Error('runActivity: Ran activity, but it didnt belong to this user');
		}
		const data = convertStoredActivityToFlatActivity(finishedActivity);
		return data as any;
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

export function mockedId() {
	return cryptoRand(1_000_000_000, 5_000_000_000_000).toString();
}

export async function createTestUser(bank?: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
	const id = userData?.id ?? mockedId();
	if (idsUsed.has(id)) {
		throw new Error(`ID ${id} has already been used`);
	}
	idsUsed.add(id);
	const user = await global.prisma!.user.upsert({
		create: {
			id,
			...userData,
			bank: bank?.bank
		},
		update: {
			...userData,
			bank: bank?.bank
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
