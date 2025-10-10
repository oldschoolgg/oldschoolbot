import { miniID, Time } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { DELETED_USER_ID } from '../../../src/lib/constants.js';
import { ironmanCommand } from '../../../src/mahoji/lib/abstracted_commands/ironmanCommand.js';
import { mockedId } from '../util.js';

describe('Ironman Command', () => {
	async function createUserWithEverything(userId: string, userData: Partial<Prisma.UserCreateInput> = {}) {
		await global.prisma!.user.create({
			data: { id: userId, skills_agility: 100_000_000, skills_attack: 100_000_000, ...userData }
		});
		await global.prisma!.newUser.create({ data: { id: userId } });
		const activity = await global.prisma!.activity.create({
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
			global.prisma!.botItemSell.create({ data: { user_id: userId, item_id: 1, quantity: 1, gp_received: 1 } }),
			global.prisma!.pinnedTrip.create({
				data: { user_id: userId, id: miniID(10), activity_id: activity.id, activity_type: 'Mining' }
			}),
			global.prisma!.farmedCrop.create({
				data: {
					user_id: userId,
					date_planted: new Date(),
					item_id: 1,
					quantity_planted: 1,
					was_autofarmed: false,
					paid_for_protection: false
				}
			}),
			global.prisma!.slayerTask.create({
				data: {
					user_id: userId,
					monster_id: 1,
					quantity: 1,
					quantity_remaining: 1,
					slayer_master_id: 1,
					skipped: false
				}
			}),
			global.prisma!.playerOwnedHouse.create({ data: { user_id: userId } }),
			global.prisma!.minigame.create({ data: { user_id: userId } }),
			global.prisma!.xPGain.create({ data: { user_id: BigInt(userId), skill: 'agility', xp: 1 } }),
			global.prisma!.stashUnit.create({ data: { user_id: BigInt(userId), stash_id: 1, has_built: false } }),
			global.prisma!.userStats.create({ data: { user_id: BigInt(userId) } }),
			global.prisma!.historicalData.create({
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

		// Bingo
		const testBingo = await prisma.bingo.create({
			data: {
				creator_id: userId,
				duration_days: 1,
				team_size: 1,
				title: '',
				notifications_channel_id: '',
				ticket_price: 1,
				guild_id: '1',
				start_date: new Date(Date.now() - Time.Day * 4),
				was_finalized: true
			}
		});
		const testTeam = await prisma.bingoTeam.create({
			data: {
				bingo_id: testBingo.id
			}
		});
		await prisma.bingoParticipant.create({
			data: {
				user_id: userId,
				bingo_team_id: testTeam.id,
				bingo_id: testBingo.id,
				tickets_bought: 1
			}
		});
		return { testBingo };
	}

	test('Should reset everything', async () => {
		const userId = mockedId();
		const { testBingo } = await createUserWithEverything(userId);
		const userBeingReset = await mUserFetch(userId);
		await userBeingReset.addItemsToBank({
			items: new Bank().add('Dragon scimitar').add('Twisted bow').add('Coins', 1_000_000_000),
			collectionLog: true
		});
		expect(userBeingReset.cl.length).toEqual(3);
		expect(await global.prisma!.cLUserItem.count({ where: { user_id: userId } })).toEqual(3);

		const result = await ironmanCommand(userBeingReset, null, false);
		expect(result).toEqual('You are now an ironman.');
		const user = await mUserFetch(userId);
		expect(user.GP).toEqual(0);
		expect(user.isIronman).toEqual(true);
		expect(user.totalLevel).toEqual(32);
		expect(user.QP).toEqual(0);
		expect(user.bank.equals(new Bank())).toEqual(true);
		expect(user.cl.equals(new Bank())).toEqual(true);

		expect(await global.prisma!.activity.count({ where: { user_id: BigInt(userId) } })).toEqual(0);
		expect(await global.prisma!.botItemSell.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.pinnedTrip.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.farmedCrop.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.slayerTask.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.playerOwnedHouse.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.minigame.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.xPGain.count({ where: { user_id: BigInt(userId) } })).toEqual(0);
		expect(await global.prisma!.stashUnit.count({ where: { user_id: BigInt(userId) } })).toEqual(0);
		expect(await global.prisma!.historicalData.count({ where: { user_id: userId } })).toEqual(0);
		expect(await global.prisma!.cLUserItem.count({ where: { user_id: userId } })).toEqual(0);
		const userStats = await global.prisma!.userStats.findFirst({ where: { user_id: BigInt(userId) } });
		expect(userStats?.cl_array).toEqual(undefined);
		expect(userStats?.cl_array_length).toEqual(undefined);

		// Bingo
		expect(await prisma.bingo.count({ where: { creator_id: userId } })).toEqual(0);
		expect(await prisma.bingoParticipant.count({ where: { user_id: userId } })).toEqual(0);
		expect((await prisma.bingo.findUniqueOrThrow({ where: { id: testBingo.id } })).creator_id).toEqual(
			DELETED_USER_ID
		);
	});

	test('Should de-iron', async () => {
		const userId = mockedId();
		await createUserWithEverything(userId, { minion_ironman: true });
		const initialUser = await mUserFetch(userId);
		expect(initialUser.isIronman).toEqual(true);
		const result = await ironmanCommand(initialUser, null, false);
		expect(result).toEqual('You are no longer an ironman.');
		const user = await mUserFetch(userId);
		expect(user.isIronman).toEqual(false);
	});
});
