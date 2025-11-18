// import { cryptoRng } from '@oldschoolgg/rng';
// import type { IMember, IMessage, IUser } from '@oldschoolgg/schemas';
// import { sleep } from '@oldschoolgg/toolkit';
// import { vi } from 'vitest';

// import { mockedId } from '../test-utils/misc.js';
// import { mockClient, TestClient } from '../test-utils/mockClient.js';
// import { createTestUser, mockUser, TestUser } from '../test-utils/mockUser.js';

// export const TEST_CHANNEL_ID = '1111111111111111';

// export function mockIUser({ userId }: { userId: string }): IUser {
// 	const mocked = {
// 		id: userId,
// 		username: 'TestUser',
// 		bot: false
// 	};
// 	return mocked;
// }

// export function mockIMember({ userId }: { userId: string }): IMember {
// 	return {
// 		guild_id: mockedId(),
// 		user_id: userId,
// 		roles: [],
// 		permissions: []
// 	};
// }

// export function mockUserOption(userId?: string): MahojiUserOption {
// 	userId ??= mockedId();
// 	return {
// 		user: mockIUser({ userId }),
// 		member: mockIMember({ userId })
// 	};
// }

// export function mockMessage({ userId }: { userId?: string } = {}): IMessage {
// 	return {
// 		id: mockedId(),
// 		content: 'Test message',
// 		guild_id: '342983479501389826',
// 		author_id: userId ?? mockedId(),
// 		channel_id: TEST_CHANNEL_ID
// 	};
// }

// <<<<<<< HEAD
// export class TestUser extends MUserClass {
// 	public client!: TestClient;

// 	constructor(user: MUser | User, client?: TestClient) {
// 		super(user instanceof MUserClass ? user.user : user);
// 		this.client = client!;
// 	}

// 	async setBank(bank: Bank) {
// 		// @ts-expect-error
// 		await this.update({ bank: bank.toJSON() });
// 		return this;
// 	}

// 	async runActivity() {
// 		const activity = await prisma.activity.findFirst({
// 			where: {
// 				user_id: BigInt(this.id),
// 				completed: false
// 			}
// 		});
// 		if (!activity) {
// 			return;
// 		}

// 		await prisma.activity.update({
// 			where: {
// 				id: activity.id
// 			},
// 			data: {
// 				completed: true
// 			}
// 		});

// 		TestClient.activitiesProcessed++;
// 		await ActivityManager.completeActivity(activity);
// 		await this.sync();
// 		return ActivityManager.convertStoredActivityToFlatActivity(activity);
// 	}
// 	async setLevel(skill: SkillNameType, level: number) {
// 		await this.update({ [`skills_${skill}`]: convertLVLtoXP(level) });
// 		return this;
// 	}

// 	async equip(setup: GearSetupType, gear: number[]) {
// 		const gearObj = this.gear[setup];
// 		for (const item of gear) {
// 			gearObj.equip(Items.getOrThrow(item));
// 		}
// 		await this.update({
// 			[`gear_${setup}`]: gearObj.raw()
// 		});
// 		return this;
// 	}

// 	async openedBankMatch(bankToMatch: Bank) {
// 		const stats = await this.fetchStats();
// 		const currentBank = new Bank(stats.openable_scores as ItemBank);
// 		if (!currentBank.equals(bankToMatch)) {
// 			throw new Error(`Expected opened bank to match, difference: ${currentBank.difference(bankToMatch)}`);
// 		}
// 	}

// 	async clMatch(bankToMatch: Bank) {
// 		await this.sync();
// 		if (!this.cl.equals(bankToMatch)) {
// 			throw new Error(`Expected CL to match, difference: ${this.cl.difference(bankToMatch)}`);
// 		}
// 	}

// 	async bankMatch(bankToMatch: Bank) {
// 		await this.sync();
// 		if (!this.bank.equals(bankToMatch)) {
// 			throw new Error(
// 				`Expected bank to match, CURRENT[${this.bank.toString()}] EXPECTED[${bankToMatch.toString()}]`
// 			);
// 		}
// 	}

// 	async reset() {
// 		const res = await ironmanCommand(this, null);
// 		if (res !== 'You are now an ironman.') {
// 			throw new Error(`Failed to reset: ${res}`);
// 		}
// 		await global.prisma!.userStats.deleteMany({ where: { user_id: BigInt(this.id) } });
// 		await global.prisma!.user.delete({ where: { id: this.id } });
// 		const user = await global.prisma!.user.create({ data: { id: this.id } });
// 		await global.prisma!.userStats.create({ data: { user_id: BigInt(this.id) } });
// 		this.user = user;
// 	}

// 	async giveSlayerTask(monster: EMonster, quantity = 1000) {
// 		await prisma.slayerTask.deleteMany({
// 			where: {
// 				user_id: this.id
// 			}
// 		});
// 		await prisma.slayerTask.create({
// 			data: {
// 				user_id: this.id,
// 				quantity: quantity,
// 				quantity_remaining: quantity,
// 				slayer_master_id: slayerMasters.find(m => m.tasks.some(t => t.monster.id === monster))!.id,
// 				monster_id: monster,
// 				skipped: false
// 			}
// 		});
// 	}

// 	async kill(
// 		monster: EMonster,
// 		{
// 			quantity,
// 			method,
// 			shouldFail = false,
// 			wilderness = false
// 		}: { method?: PvMMethod; shouldFail?: boolean; quantity?: number; wilderness?: boolean } = {}
// 	) {
// 		const previousBank = this.bank.clone();
// 		const currentXP = clone(this.skillsAsXP);
// 		const commandResult = await this.runCommand(
// 			minionKCommand,
// 			{ name: Monsters.get(monster)!.name, method, quantity, wilderness },
// 			true
// 		);
// 		if (shouldFail) {
// 			expect(commandResult).not.toContain('is now killing');
// 		}
// 		const tripStartBank = this.bank.clone();
// 		const activityResult = (await this.runActivity()) as MonsterActivityTaskOptions | undefined;
// 		const newKC = await this.getKC(monster);
// 		const newXP = clone(this.skillsAsXP);
// 		const xpGained: SkillsRequired = {} as SkillsRequired;
// 		for (const skill of SkillsArray) xpGained[skill] = 0;
// 		for (const skill of Object.keys(newXP) as SkillNameType[]) {
// 			xpGained[skill as SkillNameType] = newXP[skill] - currentXP[skill];
// 		}

// 		return { commandResult, newKC, xpGained, previousBank, tripStartBank, activityResult };
// 	}

// 	async giveCharges(type: DegradeableItem['settingsKey'], charges: number) {
// 		await this.update({
// 			[type]: charges
// 		});
// 		return this;
// 	}

// 	async runCmdAndTrip(command: AnyCommand, options: object = {}) {
// 		const commandResult = await this.runCommand(command, options, true);
// 		const activityResult = await this.runActivity();
// 		await this.sync();
// 		return { commandResult, activityResult };
// 	}

// 	async runCommand(_command: string | AnyCommand, options: object = {}, syncAfter = false) {
// 		await this.sync();
// 		const mockedInt = mockInteraction({ user: this });
// 		const command =
// 			typeof _command === 'string' ? globalClient.allCommands.find(_c => _c.name === _command)! : _command;
// 		const result = await command.run({
// 			userID: this.user.id,
// 			guildID: '342983479501389826',
// 			member: mockDjsMember({ userId: this.user.id }),
// 			channelID: TEST_CHANNEL_ID,
// 			interaction: mockedInt,
// 			user: this,
// 			options,
// 			rng: MathRNG
// 		});
// 		if (syncAfter) {
// 			await this.sync();
// 		}
// 		return result ?? (mockedInt as any).__response__;
// 	}

// 	async bankAmountMatch(itemName: string, amount: number) {
// 		await this.sync();
// 		if (this.bank.amount(itemName) !== amount) {
// 			throw new Error(`Expected ${amount}x ${itemName} but got ${this.bank.amount(itemName)}`);
// 		}
// 	}

// 	async gpMatch(amount: number) {
// 		await this.sync();
// 		if (this.GP !== amount) {
// 			throw new Error(`Expected ${amount} GP but got ${this.GP}`);
// 		}
// 	}

// 	async statsMatch(key: keyof UserStats, value: any) {
// 		await this.sync();
// 		const stats = await this.fetchStats();
// 		if (stats[key] !== value) {
// 			throw new Error(`Expected ${key} to be ${value} but got ${stats[key]}`);
// 		}
// 	}

// 	async max() {
// 		await giveMaxStats(this);
// 		return this;
// 	}

// 	randomBankSubset() {
// 		const bank = new Bank();
// 		const items = cryptoRng.shuffle(this.bankWithGP.items()).slice(0, cryptoRng.randInt(0, this.bankWithGP.length));
// 		for (const [item] of items) {
// 			bank.add(item, cryptoRng.randInt(1, this.bankWithGP.amount(item.id)));
// 		}
// 		return bank;
// 	}
// }

// const idsUsed = new Set<string>();

// export function mockedId() {
// 	const id = cryptoRng.randInt(1, 5_000_000_000_000).toString();
// 	if (idsUsed.has(id)) {
// 		throw new Error(`ID ${id} has already been used`);
// 	}
// 	idsUsed.add(id);
// 	return id;
// }

// export async function mockUser(
// 	options: Partial<{
// 		rangeGear: number[];
// 		rangeLevel: number;
// 		mageGear: number[];
// 		mageLevel: number;
// 		wildyGear: number[];
// 		meleeGear: number[];
// 		slayerLevel: number;
// 		venatorBowCharges: number;
// 		bank: Bank;
// 		QP: number;
// 		maxed: boolean;
// 		levels: Partial<Record<SkillNameType, number>>;
// 	}> = {}
// ) {
// 	const rangeGear = new Gear();
// 	if (options.rangeGear) {
// 		for (const item of options.rangeGear) {
// 			rangeGear.equip(Items.getOrThrow(item));
// 		}
// 	}
// 	const mageGear = new Gear();
// 	if (options.mageGear) {
// 		for (const item of options.mageGear) {
// 			mageGear.equip(Items.getOrThrow(item));
// 		}
// 	}

// 	const meleeGear = new Gear();
// 	if (options.meleeGear) {
// 		for (const item of options.meleeGear) {
// 			meleeGear.equip(Items.getOrThrow(item));
// 		}
// 	}
// 	const wildyGear = new Gear();
// 	if (options.wildyGear) {
// 		for (const item of options.wildyGear) {
// 			wildyGear.equip(Items.getOrThrow(item));
// 		}
// 	}

// 	const user = await createTestUser(options.bank, {
// 		skills_ranged: options.rangeLevel ? convertLVLtoXP(options.rangeLevel) : undefined,
// 		skills_slayer: options.slayerLevel ? convertLVLtoXP(options.slayerLevel) : undefined,
// 		skills_magic: options.mageLevel ? convertLVLtoXP(options.mageLevel) : undefined,
// 		gear_mage: options.mageGear ? (mageGear.raw() as Prisma.InputJsonValue) : undefined,
// 		gear_melee: options.meleeGear ? (meleeGear.raw() as Prisma.InputJsonValue) : undefined,
// 		gear_range: options.rangeGear ? (rangeGear.raw() as Prisma.InputJsonValue) : undefined,
// 		gear_wildy: options.wildyGear ? (wildyGear.raw() as Prisma.InputJsonValue) : undefined,
// 		venator_bow_charges: options.venatorBowCharges,
// 		QP: options.QP
// 	});
// 	for (const [skill, level] of Object.entries(options.levels ?? {})) {
// 		await user.update({ [`skills_${skill}`]: convertLVLtoXP(level) });
// 	}
// 	if (options.maxed) {
// 		await user.max();
// 	}
// 	await prisma.newUser.create({
// 		data: {
// 			id: user.id
// 		}
// 	});
// 	return user;
// }

// export async function createTestUser(_bank?: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
// 	const id = userData?.id ?? mockedId();

// 	const bank = _bank ? _bank.clone() : null;
// 	let GP = userData.GP ? Number(userData.GP) : undefined;
// 	if (bank) {
// 		if (GP) {
// 			GP += bank.amount('Coins');
// 		} else {
// 			GP = bank.amount('Coins');
// 		}
// 		bank.remove('Coins', GP);
// 	}

// 	const [user] = await prisma.$transaction([
// 		prisma.user.upsert({
// 			create: {
// 				id,
// 				...userData,
// 				bank: bank?.toJSON(),
// 				GP: GP ?? undefined,
// 				minion_hasBought: true
// 			},
// 			update: {
// 				...userData,
// 				bank: bank?.toJSON(),
// 				GP
// 			},
// 			where: {
// 				id
// 			}
// 		}),
// 		prisma.userStats.upsert({
// 			create: {
// 				user_id: BigInt(id)
// 			},
// 			update: {},
// 			where: {
// 				user_id: BigInt(id)
// 			}
// 		}),
// 		prisma.minigame.upsert({
// 			create: {
// 				user_id: id
// 			},
// 			update: {},
// 			where: {
// 				user_id: id
// 			}
// 		})
// 	]);

// 	mockDjsUser({ userId: user.id });
// 	return new TestUser(user);
// }

// export class TestClient {
// 	public static activitiesProcessed = 0;
// 	data: ClientStorage;
// 	constructor(data: ClientStorage) {
// 		this.data = data;
// 	}

// 	async mockUser(...args: Parameters<typeof mockUser>) {
// 		const user = await mockUser(...args);
// 		return user;
// 	}

// 	async reset() {
// 		await global.prisma!.clientStorage.delete({ where: { id: this.data.id } });
// 		this.data = (await global.prisma!.clientStorage.create({ data: { id: this.data.id } }))!;
// 	}

// 	async sync() {
// 		this.data = (await global.prisma!.clientStorage.findFirst({ where: { id: this.data.id } }))!;
// 	}

// 	async expectValueMatch(key: keyof ClientStorage, value: any) {
// 		await this.sync();
// 		if (this.data[key] !== value) {
// 			throw new Error(`Expected ${key} to be ${value} but got ${this.data[key]}`);
// 		}
// 	}
// }

// export async function mockClient() {
// 	const clientId = mockedId();
// 	const client = await global.prisma!.clientStorage.create({
// 		data: {
// 			id: clientId
// 		}
// 	});

// 	globalConfig.clientID = clientId;
// 	process.env.CLIENT_ID = clientId;
// 	return new TestClient(client);
// }

// if (uniqueArr([mockedId(), mockedId(), mockedId()]).length !== 3) {
// 	throw new Error('mockedId is broken');
// }

// =======
// >>>>>>> master
// const originalMathRandom = Math.random;
// export function mockMathRandom(value: number) {
// 	vi.spyOn(Math, 'random').mockImplementation(() => value);
// 	return () => (Math.random = originalMathRandom);
// }

// export async function promiseAllRandom<T>(tasks: (() => Promise<T>)[], maxJitterMs = 5): Promise<T[]> {
// 	const results: T[] = [];
// 	const shuffled = cryptoRng.shuffle(tasks);
// 	for (const fn of shuffled) {
// 		await sleep(Math.random() * maxJitterMs);
// 		results.push(await fn());
// 	}
// 	return results;
// }

// export { mockClient, mockedId, createTestUser, mockUser, TestUser, TestClient };

import { cryptoRng } from '@oldschoolgg/rng';
import type { IMember, IMessage, IUser } from '@oldschoolgg/schemas';
import { sleep } from '@oldschoolgg/toolkit';
import { vi } from 'vitest';

import { mockedId } from '../test-utils/misc.js';
import { mockClient, TestClient } from '../test-utils/mockClient.js';
import { createTestUser, mockUser, TestUser } from '../test-utils/mockUser.js';

export const TEST_CHANNEL_ID = '1111111111111111';

export function mockIUser({ userId }: { userId: string }): IUser {
	const mocked = {
		id: userId,
		username: 'TestUser',
		bot: false
	};
	return mocked;
}

export function mockIMember({ userId }: { userId: string }): IMember {
	return {
		guild_id: mockedId(),
		user_id: userId,
		roles: [],
		permissions: []
	};
}

export function mockUserOption(userId?: string): MahojiUserOption {
	userId ??= mockedId();
	return {
		user: mockIUser({ userId }),
		member: mockIMember({ userId })
	};
}

export function mockMessage({ userId }: { userId?: string } = {}): IMessage {
	return {
		id: mockedId(),
		content: 'Test message',
		guild_id: '342983479501389826',
		author_id: userId ?? mockedId(),
		channel_id: TEST_CHANNEL_ID
	};
}

const originalMathRandom = Math.random;
export function mockMathRandom(value: number) {
	vi.spyOn(Math, 'random').mockImplementation(() => value);
	return () => (Math.random = originalMathRandom);
}

export async function promiseAllRandom<T>(tasks: (() => Promise<T>)[], maxJitterMs = 5): Promise<T[]> {
	const results: T[] = [];
	const shuffled = cryptoRng.shuffle(tasks);
	for (const fn of shuffled) {
		await sleep(Math.random() * maxJitterMs);
		results.push(await fn());
	}
	return results;
}

export { mockClient, mockedId, createTestUser, mockUser, TestUser, TestClient };
