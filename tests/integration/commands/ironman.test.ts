import { miniID, randomSnowflake } from '@oldschoolgg/toolkit';
import { Prisma } from '@prisma/client';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { prisma } from '../../../src/lib/settings/prisma';
import { ironmanCommand } from '../../../src/mahoji/lib/abstracted_commands/ironmanCommand';

describe('Ironman Command', () => {
	async function createUserWithEverything(userId: string, userData: Partial<Prisma.UserCreateInput> = {}) {
		await prisma.user.create({
			data: { id: userId, skills_agility: 100_000_000, skills_attack: 100_000_000, ...userData }
		});
		await prisma.newUser.create({ data: { id: userId } });
		const activity = await prisma.activity.create({
			data: {
				user_id: BigInt(userId),
				start_date: new Date(),
				finish_date: new Date(Date.now() + Time.Hour),
				duration: Time.Hour,
				completed: true,
				group_activity: false,
				type: 'AerialFishing',
				channel_id: BigInt(1),
				data: {}
			}
		});
		await Promise.all([
			prisma.botItemSell.create({ data: { user_id: userId, item_id: 1, quantity: 1, gp_received: 1 } }),
			prisma.pinnedTrip.create({
				data: { user_id: userId, id: miniID(10), activity_id: activity.id, activity_type: 'Mining' }
			}),
			prisma.farmedCrop.create({
				data: {
					user_id: userId,
					date_planted: new Date(),
					item_id: 1,
					quantity_planted: 1,
					was_autofarmed: false,
					paid_for_protection: false
				}
			}),
			prisma.slayerTask.create({
				data: {
					user_id: userId,
					monster_id: 1,
					quantity: 1,
					quantity_remaining: 1,
					slayer_master_id: 1,
					skipped: false
				}
			}),
			prisma.playerOwnedHouse.create({ data: { user_id: userId } }),
			prisma.minigame.create({ data: { user_id: userId } }),
			prisma.xPGain.create({ data: { user_id: BigInt(userId), skill: 'agility', xp: 1 } }),
			prisma.stashUnit.create({ data: { user_id: BigInt(userId), stash_id: 1, has_built: false } }),
			prisma.userStats.create({ data: { user_id: BigInt(userId) } }),
			prisma.historicalData.create({
				data: {
					user_id: userId,
					GP: 100_000,
					total_xp: 10_000,
					cl_completion_percentage: 5,
					cl_completion_count: 5,
					cl_global_rank: 5
				}
			})
		]);
	}

	test('Should reset everything', async () => {
		const userId = randomSnowflake();
		await createUserWithEverything(userId);

		const result = await ironmanCommand(await mUserFetch(userId), null, false);
		expect(result).toEqual('You are now an ironman.');
		const user = await mUserFetch(userId);
		expect(user.GP).toEqual(0);
		expect(user.isIronman).toEqual(true);
		expect(user.totalLevel).toEqual(32);
		expect(user.QP).toEqual(0);
		expect(user.bank.equals(new Bank())).toEqual(true);
		expect(user.cl.equals(new Bank())).toEqual(true);

		expect(await prisma.activity.count({ where: { user_id: BigInt(userId) } })).toEqual(0);
		expect(await prisma.botItemSell.count({ where: { user_id: userId } })).toEqual(0);
		expect(await prisma.pinnedTrip.count({ where: { user_id: userId } })).toEqual(0);
		expect(await prisma.farmedCrop.count({ where: { user_id: userId } })).toEqual(0);
		expect(await prisma.slayerTask.count({ where: { user_id: userId } })).toEqual(0);
		expect(await prisma.playerOwnedHouse.count({ where: { user_id: userId } })).toEqual(0);
		expect(await prisma.minigame.count({ where: { user_id: userId } })).toEqual(0);
		expect(await prisma.xPGain.count({ where: { user_id: BigInt(userId) } })).toEqual(0);
		expect(await prisma.stashUnit.count({ where: { user_id: BigInt(userId) } })).toEqual(0);
		expect(await prisma.historicalData.count({ where: { user_id: userId } })).toEqual(0);
		const userStats = await prisma.userStats.findFirst({ where: { user_id: BigInt(userId) } });
		expect(userStats?.cl_array).toEqual(undefined);
		expect(userStats?.cl_array_length).toEqual(undefined);
	});

	test('Should de-iron', async () => {
		const userId = randomSnowflake();
		await createUserWithEverything(userId, { minion_ironman: true });
		const initialUser = await mUserFetch(userId);
		expect(initialUser.isIronman).toEqual(true);
		const result = await ironmanCommand(initialUser, null, false);
		expect(result).toEqual('You are no longer an ironman.');
		const user = await mUserFetch(userId);
		expect(user.isIronman).toEqual(false);
	});
});
