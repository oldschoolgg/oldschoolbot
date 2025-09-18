import type { ClientStorage, GearSetupType, Prisma, User, UserStats } from '@prisma/client';
import type { User as DJSUser } from 'discord.js';
import { objectKeys, randInt, shuffleArr, uniqueArr } from 'e';
import { Bank, type EMonster, Items, Monsters, convertLVLtoXP } from 'oldschooljs';
import { integer, nodeCrypto } from 'random-js';
import { clone } from 'remeda';
import { expect, vi } from 'vitest';

import { MUserClass } from '../../src/lib/MUser';
import { type PvMMethod, globalConfig } from '../../src/lib/constants';
import { type SkillNameType, SkillsArray } from '../../src/lib/skilling/types';
import { slayerMasters } from '../../src/lib/slayer/slayerMasters';
import { Gear } from '../../src/lib/structures/Gear';
import type { ItemBank, SkillsRequired } from '../../src/lib/types';
import type { MonsterActivityTaskOptions } from '../../src/lib/types/minions';
import { minionKCommand } from '../../src/mahoji/commands/k';
import { giveMaxStats } from '../../src/mahoji/commands/testpotato';
import { ironmanCommand } from '../../src/mahoji/lib/abstracted_commands/ironmanCommand';

export const TEST_CHANNEL_ID = '1111111111111111';

export function mockDjsUser({ userId }: { userId: string }) {
	return {
		id: userId,
		username: 'TestUser',
		discriminator: '0001',
		bot: false,
		system: false,
		mfaEnabled: false,
		avatarURL: () => 'https://example.com/avatar.png',
		toString: () => '<@123456789>'
	} as any as DJSUser;
}

export function mockInteraction({ userId }: { userId: string }) {
	return {
		channelId: TEST_CHANNEL_ID,
		deferReply: () => Promise.resolve(),
		editReply: () => Promise.resolve(),
		followUp: () => Promise.resolve(),
		user: {
			id: userId
		}
	} as any;
}

export function mockChannel({ userId }: { userId: string }) {
	return {
		id: TEST_CHANNEL_ID,
		isTextBased: () => true,
		isDMBased: () => false,
		permissionsFor: () => ({
			has: () => true
		}),
		send: vi.fn(() => {
			// console.log('TestChannel send called with args:', args);
			return Promise.resolve(mockMessage({ userId }));
		})
	} as any;
}

export function mockMessage({ userId }: { userId: string }) {
	const TestChannel = mockChannel({ userId });
	return {
		author: mockDjsUser({ userId }),
		channel: TestChannel,
		send: vi.fn(() => {
			// console.log('TestMessage send called with args:', args);
			return Promise.resolve({
				id: '123456789',
				channel: TestChannel
			});
		}),
		reply: vi.fn(() => {
			// console.log('TestMessage reply called with args:', args);
			return Promise.resolve({
				id: '123456789',
				channel: TestChannel
			});
		}),
		edit: vi.fn(() => {
			// console.log('TestMessage edit called with args:', args);
			return Promise.resolve({
				id: '123456789',
				channel: TestChannel
			});
		}),
		delete: vi.fn(() => {
			// console.log('TestMessage delete called');
			return Promise.resolve();
		})
	};
}

const commandRunOptions = (userId: string): Omit<CommandRunOptions, 'options'> => ({
	userID: userId,
	guildID: '342983479501389826',
	member: {} as any,
	user: { id: userId } as any,
	channelID: TEST_CHANNEL_ID,
	interaction: mockInteraction({ userId }),
	client: {} as any
});

export class TestUser extends MUserClass {
	public client!: TestClient;

	constructor(user: MUser | User, client?: TestClient) {
		super(user instanceof MUserClass ? user.user : user);
		this.client = client!;
	}

	async runActivity() {
		const activity = await prisma.activity.findFirst({
			where: {
				user_id: BigInt(this.id),
				completed: false
			}
		});
		if (!activity) {
			return;
		}

		await prisma.activity.update({
			where: {
				id: activity.id
			},
			data: {
				completed: true
			}
		});

		TestClient.activitiesProcessed++;
		await ActivityManager.completeActivity(activity);
		await this.sync();
		return ActivityManager.convertStoredActivityToFlatActivity(activity);
	}
	async setLevel(skill: SkillNameType, level: number) {
		await this.update({ [`skills_${skill}`]: convertLVLtoXP(level) });
		return this;
	}

	async equip(setup: GearSetupType, gear: number[]) {
		const gearObj = this.gear[setup];
		for (const item of gear) {
			gearObj.equip(Items.getOrThrow(item));
		}
		await this.update({
			[`gear_${setup}`]: gearObj.raw()
		});
		return this;
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
		await global.prisma!.userStats.create({ data: { user_id: BigInt(this.id) } });
		this.user = user;
	}

	async giveSlayerTask(monster: EMonster, quantity = 1000) {
		await prisma.slayerTask.deleteMany({
			where: {
				user_id: this.id
			}
		});
		await prisma.slayerTask.create({
			data: {
				user_id: this.id,
				quantity: quantity,
				quantity_remaining: quantity,
				slayer_master_id: slayerMasters.find(m => m.tasks.some(t => t.monster.id === monster))!.id,
				monster_id: monster,
				skipped: false
			}
		});
	}

	async kill(
		monster: EMonster,
		{ quantity, method, shouldFail = false }: { method?: PvMMethod; shouldFail?: boolean; quantity?: number } = {}
	) {
		const previousBank = this.bank.clone();
		const currentXP = clone(this.skillsAsXP);
		const commandResult = await this.runCommand(
			minionKCommand,
			{ name: Monsters.get(monster)!.name, method, quantity },
			true
		);
		if (shouldFail) {
			expect(commandResult).not.toContain('is now killing');
		}
		const tripStartBank = this.bank.clone();
		const activityResult = (await this.runActivity()) as MonsterActivityTaskOptions | undefined;
		const newKC = await this.getKC(monster);
		const newXP = clone(this.skillsAsXP);
		const xpGained: SkillsRequired = {} as SkillsRequired;
		for (const skill of SkillsArray) xpGained[skill] = 0;
		for (const skill of objectKeys(newXP)) {
			xpGained[skill as SkillNameType] = newXP[skill] - currentXP[skill];
		}

		return { commandResult, newKC, xpGained, previousBank, tripStartBank, activityResult };
	}

	async runCommand(command: OSBMahojiCommand, options: object = {}, syncAfter = false) {
		const result = await command.run({
			...commandRunOptions(this.id),
			user: { createdAt: new Date(), id: this.id } as DJSUser,
			options
		});
		if (syncAfter) {
			await this.sync();
		}
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
	return unMockedCyptoRand(1, 5_000_000_000_000).toString();
}

export async function mockUser(
	options: Partial<{
		rangeGear: number[];
		rangeLevel: number;
		mageGear: number[];
		mageLevel: number;
		meleeGear: number[];
		slayerLevel: number;
		venatorBowCharges: number;
		bank: Bank;
		QP: number;
		maxed: boolean;
	}>
) {
	const rangeGear = new Gear();
	if (options.rangeGear) {
		for (const item of options.rangeGear) {
			rangeGear.equip(Items.getOrThrow(item));
		}
	}
	const mageGear = new Gear();
	if (options.mageGear) {
		for (const item of options.mageGear) {
			mageGear.equip(Items.getOrThrow(item));
		}
	}

	const meleeGear = new Gear();
	if (options.meleeGear) {
		for (const item of options.meleeGear) {
			meleeGear.equip(Items.getOrThrow(item));
		}
	}

	const user = await createTestUser(options.bank, {
		skills_ranged: options.rangeLevel ? convertLVLtoXP(options.rangeLevel) : undefined,
		skills_slayer: options.slayerLevel ? convertLVLtoXP(options.slayerLevel) : undefined,
		skills_magic: options.mageLevel ? convertLVLtoXP(options.mageLevel) : undefined,
		gear_mage: options.mageGear ? (mageGear.raw() as Prisma.InputJsonValue) : undefined,
		gear_melee: options.meleeGear ? (meleeGear.raw() as Prisma.InputJsonValue) : undefined,
		gear_range: options.rangeGear ? (rangeGear.raw() as Prisma.InputJsonValue) : undefined,
		venator_bow_charges: options.venatorBowCharges,
		QP: options.QP
	});
	if (options.maxed) {
		await user.max();
	}
	await prisma.newUser.create({
		data: {
			id: user.id
		}
	});
	return user;
}

export async function createTestUser(_bank?: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
	const id = userData?.id ?? mockedId();
	if (idsUsed.has(id)) {
		throw new Error(`ID ${id} has already been used`);
	}
	idsUsed.add(id);

	const bank = _bank ? _bank.clone() : null;
	let GP = userData.GP ? Number(userData.GP) : undefined;
	if (bank) {
		if (GP) {
			GP += bank.amount('Coins');
		} else {
			GP = bank.amount('Coins');
		}
		bank.remove('Coins', GP);
	}

	const [user] = await prisma.$transaction([
		global.prisma!.user.upsert({
			create: {
				id,
				...userData,
				bank: bank?.toJSON(),
				GP: GP ?? undefined
			},
			update: {
				...userData,
				bank: bank?.toJSON(),
				GP
			},
			where: {
				id
			}
		}),
		global.prisma!.userStats.upsert({
			create: {
				user_id: BigInt(id)
			},
			update: {},
			where: {
				user_id: BigInt(id)
			}
		}),
		global.prisma!.minigame.upsert({
			create: {
				user_id: id
			},
			update: {},
			where: {
				user_id: id
			}
		})
	]);

	return new TestUser(user);
}

export class TestClient {
	public static activitiesProcessed = 0;
	data: ClientStorage;
	constructor(data: ClientStorage) {
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
	process.env.CLIENT_ID = clientId;
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
