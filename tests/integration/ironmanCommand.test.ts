import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { prisma } from '../../src/lib/settings/prisma';
import { ironmanCommand } from '../../src/mahoji/lib/abstracted_commands/ironmanCommand';
import { Prisma } from '.prisma/client';

describe('Ironman Command', () => {
	let activityId = 1;
	async function createUserWithEverything(userId: string, userData: Partial<Prisma.UserCreateInput> = {}) {
		activityId += 1;
		await prisma.user.create({
			data: { id: userId, skills_agility: 100_000_000, skills_attack: 100_000_000, ...userData }
		});
		await prisma.newUser.create({ data: { id: userId } });
		await prisma.activity.create({
			data: {
				id: activityId,
				user_id: BigInt(userId),
				start_date: new Date(),
				finish_date: new Date(),
				duration: 1,
				completed: false,
				group_activity: false,
				type: 'AerialFishing',
				channel_id: BigInt(1),
				data: {}
			}
		});
		await prisma.tame.create({
			data: {
				id: activityId,
				user_id: userId,
				species_id: 1,
				max_artisan_level: 1,
				max_combat_level: 1,
				max_gatherer_level: 1,
				max_support_level: 1,
				max_total_loot: {},
				growth_stage: 'adult'
			}
		});
		await Promise.all([
			prisma.botItemSell.create({ data: { user_id: userId, item_id: 1, quantity: 1, gp_received: 1 } }),
			prisma.pinnedTrip.create({
				data: { user_id: userId, id: '1', activity_id: activityId, activity_type: 'Mining' }
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
			prisma.fishingContestCatch.create({ data: { user_id: BigInt(userId), name: 'a', length_cm: 1 } }),
			prisma.tameActivity.create({
				data: {
					tame_id: activityId,
					user_id: userId,
					start_date: new Date(),
					finish_date: new Date(),
					duration: 1,
					completed: false,
					type: 'asdf',
					channel_id: '',
					data: {}
				}
			})
		]);
	}

	test('Should reset everything', async () => {
		const userId = '1234569669';
		await createUserWithEverything(userId);

		const result = await ironmanCommand(await mUserFetch(userId), null);
		expect(result).toEqual('You are now an ironman.');
		const user = await mUserFetch(userId);
		expect(user.GP).toEqual(0);
		expect(user.isIronman).toEqual(true);
		expect(user.totalLevel).toEqual(34);
		expect(user.QP).toEqual(0);
		expect(user.bank.equals(new Bank())).toEqual(true);
		expect(user.cl.equals(new Bank())).toEqual(true);

		const results = await Promise.all([
			prisma.activity.count({ where: { user_id: BigInt(userId) } }),
			prisma.botItemSell.count({ where: { user_id: userId } }),
			prisma.pinnedTrip.count({ where: { user_id: userId } }),
			prisma.farmedCrop.count({ where: { user_id: userId } }),
			prisma.slayerTask.count({ where: { user_id: userId } }),
			prisma.playerOwnedHouse.count({ where: { user_id: userId } }),
			prisma.minigame.count({ where: { user_id: userId } }),
			prisma.xPGain.count({ where: { user_id: BigInt(userId) } }),
			prisma.stashUnit.count({ where: { user_id: BigInt(userId) } }),
			prisma.userStats.count({ where: { user_id: BigInt(userId) } }),
			prisma.fishingContestCatch.count({ where: { user_id: BigInt(userId) } }),
			prisma.tameActivity.count({ where: { user_id: userId } }),
			prisma.tame.count({ where: { user_id: userId } })
		]);

		for (const count of results) {
			expect(count).toEqual(0);
		}
	});

	test('Should de-iron', async () => {
		const userId = '23242';
		await createUserWithEverything(userId, { minion_ironman: true });
		const initialUser = await mUserFetch(userId);
		expect(initialUser.isIronman).toEqual(true);
		const result = await ironmanCommand(initialUser, null);
		expect(result).toEqual('You are already an ironman.');
		const user = await mUserFetch(userId);
		expect(user.isIronman).toEqual(true);
	});
});
