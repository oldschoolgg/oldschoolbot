import assert from 'node:assert';
import { MathRNG } from '@oldschoolgg/rng';
import { cryptoRng } from '@oldschoolgg/rng/crypto';
import type { IUser } from '@oldschoolgg/schemas';
import { Bank, convertLVLtoXP, EItem, type EMonster, type ItemBank, Items, Monsters } from 'oldschooljs';
import { clone } from 'remeda';
import { expect } from 'vitest';

import type { GearSetupType, Prisma, User, UserStats } from '@/prisma/main.js';
import { rawCommandHandlerInner } from '@/discord/commandHandler.js';
import { MessageBuilderClass } from '@/discord/MessageBuilder.js';
import type { PvMMethod } from '@/lib/constants.js';
import type { DegradeableItem } from '@/lib/degradeableItems.js';
import { MUserClass } from '@/lib/MUser.js';
import { type SkillNameType, SkillsArray } from '@/lib/skilling/types.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { Gear } from '@/lib/structures/Gear.js';
import type { SkillsRequired } from '@/lib/types/index.js';
import type { ActivityTaskData, MonsterActivityTaskOptions } from '@/lib/types/minions.js';
import { fetchUsernameAndCache } from '@/lib/util.js';
import { minionKCommand } from '@/mahoji/commands/k.js';
import { giveMaxStats } from '@/mahoji/commands/testpotato.js';
import { ironmanCommand } from '@/mahoji/lib/abstracted_commands/ironmanCommand.js';
import { handleTripFinishResults, mockedId } from './misc.js';
import { TestClient } from './mockClient.js';
import { mockInteraction } from './mockInteraction.js';

export class TestUser extends MUserClass {
	public client!: TestClient;

	constructor(user: MUser | User, client?: TestClient) {
		super(user instanceof MUserClass ? user.user : user);
		this.client = client!;
	}

	async setBank(bank: Bank) {
		// @ts-expect-error
		await this.update({ bank: bank.toJSON() });
		return this;
	}

	private async assertJsonBankCLMatch() {
		if (this.cl.length === 0) return;
		const jsonBank = await prisma.jsonBank.findFirstOrThrow({
			where: { user_id: this.id, type: 'CollectionLog' }
		});
		assert(new Bank(jsonBank.bank as ItemBank).equals(this.cl), `Expected JSON bank CL to match user CL`);
	}

	async runActivity(): Promise<ActivityTaskData | null> {
		const activities = await prisma.activity.findMany({
			where: {
				user_id: BigInt(this.id),
				completed: false
			}
		});
		if (activities.length === 0) {
			return null;
		}
		if (activities.length > 1) {
			throw new Error(`User has multiple uncompleted activities!`);
		}
		const activity = activities[0];

		TestClient.activitiesProcessed++;

		await prisma.activity.update({
			where: {
				id: activity.id
			},
			data: {
				completed: true
			}
		});
		await ActivityManager.completeActivity(activity);
		return ActivityManager.convertStoredActivityToFlatActivity(activity);
	}

	async setQP(qp: number) {
		await this.update({ QP: qp });
		return this;
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
		const stats = await this.fetchStats();
		const currentBank = new Bank(stats.openable_scores as ItemBank);
		if (!currentBank.equals(bankToMatch)) {
			throw new Error(`Expected opened bank to match, difference: ${currentBank.difference(bankToMatch)}`);
		}
	}

	async clMatch(bankToMatch: Bank) {
		await this.sync();
		await this.assertJsonBankCLMatch();
		if (!this.cl.equals(bankToMatch)) {
			throw new Error(`Expected CL to match, difference: ${this.cl.difference(bankToMatch)}`);
		}
	}

	async bankMatch(bankToMatch: Bank, ignoreRandomEventItems = true) {
		await this.sync();
		const bankToCheck = ignoreRandomEventItems ? this.bank.clone().remove(EItem.MYSTERY_BOX, 999) : this.bank;
		if (!bankToCheck.equals(bankToMatch)) {
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
		{
			quantity,
			method,
			shouldFail = false,
			wilderness = false
		}: { method?: PvMMethod; shouldFail?: boolean; quantity?: number; wilderness?: boolean } = {}
	) {
		const previousBank = this.bank.clone();
		const currentXP = clone(this.skillsAsXP);
		const commandResult = await this.runCommand(minionKCommand, {
			name: Monsters.get(monster)!.name,
			method,
			quantity,
			wilderness
		});
		if (shouldFail) {
			expect(commandResult).not.toContain('is now killing');
		}
		const tripStartBank = this.bank.clone();
		const activityResult = (await this.runActivity()) as MonsterActivityTaskOptions | null;
		await this.sync();
		await this.assertJsonBankCLMatch();
		const newKC = await this.getKC(monster);
		const newXP = clone(this.skillsAsXP);
		const xpGained: SkillsRequired = {} as SkillsRequired;
		for (const skill of SkillsArray) xpGained[skill] = 0;
		for (const skill of Object.keys(newXP) as SkillNameType[]) {
			xpGained[skill as SkillNameType] = newXP[skill] - currentXP[skill];
		}

		return { commandResult, newKC, xpGained, previousBank, tripStartBank, activityResult };
	}

	getIUser(): IUser {
		return {
			id: this.user.id,
			username: this.user.username || 'UnknownIUser',
			bot: false
		};
	}

	async giveCharges(type: DegradeableItem['settingsKey'], charges: number) {
		await this.update({
			[type]: charges
		});
		return this;
	}

	private resolveCommand(_command: string | AnyCommand): AnyCommand {
		return typeof _command === 'string' ? globalClient.allCommands.find(_c => _c.name === _command)! : _command;
	}

	async runCmdAndTrip(_command: string | AnyCommand, options: Partial<CommandOptions> = {}) {
		const command = this.resolveCommand(_command);
		const commandResult = await this.runCommand(command, options);
		const activityResult = await this.runActivity();
		await this.sync();
		await this.assertJsonBankCLMatch();
		return {
			commandResult,
			activityResult,
			data: !activityResult ? null : handleTripFinishResults.get(`${this.id}-${activityResult.type}`)
		};
	}

	async runCommand(
		_command: string | AnyCommand,
		options: Partial<CommandOptions> = {},
		otherOptions: { bypassBusy?: boolean } = {}
	) {
		await this.sync();
		const interaction = mockInteraction({ user: this });
		const command = this.resolveCommand(_command);

		let result = await rawCommandHandlerInner({
			interaction,
			command,
			options: options as CommandOptions,
			rng: MathRNG,
			ignoreUserIsBusy: otherOptions.bypassBusy ? true : undefined
		});
		if (result instanceof MessageBuilderClass) {
			result = await result.build();
		}
		await this.sync();
		await this.assertJsonBankCLMatch();
		return result;
	}

	async bankAmountMatch(itemName: string, amount: number) {
		await this.sync();
		await this.assertJsonBankCLMatch();
		if (this.bank.amount(itemName) !== amount) {
			throw new Error(`Expected ${amount}x ${itemName} but got ${this.bank.amount(itemName)}`);
		}
	}

	async gpMatch(amount: number) {
		await this.sync();
		await this.assertJsonBankCLMatch();
		if (this.GP !== amount) {
			throw new Error(`Expected ${amount} GP but got ${this.GP}`);
		}
	}

	async statsMatch(key: keyof UserStats, value: any) {
		await this.sync();
		await this.assertJsonBankCLMatch();
		const stats = await this.fetchStats();
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
		const items = cryptoRng.shuffle(this.bankWithGP.items()).slice(0, cryptoRng.randInt(0, this.bankWithGP.length));
		for (const [item] of items) {
			bank.add(item, cryptoRng.randInt(1, this.bankWithGP.amount(item.id)));
		}
		return bank;
	}
}

export async function mockUser(
	options: Partial<{
		rangeGear: number[];
		rangeLevel: number;
		mageGear: number[];
		mageLevel: number;
		wildyGear: number[];
		meleeGear: number[];
		slayerLevel: number;
		venatorBowCharges: number;
		bank: Bank;
		QP: number;
		maxed: boolean;
		levels: Partial<Record<SkillNameType, number>>;
	}> = {}
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
	const wildyGear = new Gear();
	if (options.wildyGear) {
		for (const item of options.wildyGear) {
			wildyGear.equip(Items.getOrThrow(item));
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
		QP: options.QP,
		minion_hasBought: true
	});
	for (const [skill, level] of Object.entries(options.levels ?? {})) {
		await user.update({ [`skills_${skill}`]: convertLVLtoXP(level) });
	}
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
	const id = userData.id ?? mockedId();
	userData.username ??= `TestUser`;

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
		prisma.user.upsert({
			create: {
				id,
				...userData,
				bank: bank?.toJSON(),
				GP: GP ?? undefined,
				minion_hasBought: true
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
		prisma.userStats.upsert({
			create: {
				user_id: BigInt(id)
			},
			update: {},
			where: {
				user_id: BigInt(id)
			}
		}),
		prisma.minigame.upsert({
			create: {
				user_id: id
			},
			update: {},
			where: {
				user_id: id
			}
		})
	]);

	await fetchUsernameAndCache(id);
	return new TestUser(user);
}
