import { expect, test } from 'vitest';

import { TSRedis } from '@oldschoolgg/toolkit/TSRedis';
import { sleep } from 'e';
import { BadgesEnum, globalConfig } from '../../src/lib/constants';
import { roboChimpCache } from '../../src/lib/roboChimp';
import { createTestUser } from './util';

function makeSender() {
	return new TSRedis({ mocked: !globalConfig.redisPort, port: globalConfig.redisPort });
}

test('Should add patron badge', async () => {
	const user = await createTestUser();
	expect(user.user.badges).not.includes(BadgesEnum.Patron);
	const _redis = makeSender();
	_redis.publish({
		type: 'patron_tier_change',
		discord_ids: [user.id],
		new_tier: 1,
		old_tier: 0,
		first_time_patron: false
	});
	await sleep(100);
	await user.sync();
	expect(user.user.badges).includes(BadgesEnum.Patron);
});

test('Should remove patron badge', async () => {
	const user = await createTestUser(undefined, { badges: [BadgesEnum.Patron] });
	expect(user.user.badges).includes(BadgesEnum.Patron);
	const _redis = makeSender();
	_redis.publish({
		type: 'patron_tier_change',
		discord_ids: [user.id],
		new_tier: 0,
		old_tier: 1,
		first_time_patron: false
	});
	await sleep(100);
	await user.sync();
	expect(user.user.badges).not.includes(BadgesEnum.Patron);
});

test('Should add to cache', async () => {
	const users = [await createTestUser(), await createTestUser(), await createTestUser()];
	await roboChimpClient.user.updateMany({
		where: {
			id: {
				in: users.map(u => BigInt(u.id))
			}
		},
		data: {
			perk_tier: 5
		}
	});
	const _redis = makeSender();
	_redis.publish({
		type: 'patron_tier_change',
		discord_ids: users.map(u => u.id),
		new_tier: 5,
		old_tier: 2,
		first_time_patron: false
	});
	await sleep(100);
	for (const user of users) {
		const cached = roboChimpCache.get(user.id);
		expect(cached!.perk_tier).toEqual(5);
	}
});

test('Should remove from cache', async () => {
	const users = [await createTestUser(), await createTestUser(), await createTestUser()];
	await roboChimpClient.user.updateMany({
		where: {
			id: {
				in: users.map(u => BigInt(u.id))
			}
		},
		data: {
			perk_tier: 0
		}
	});
	const _redis = makeSender();
	_redis.publish({
		type: 'patron_tier_change',
		discord_ids: users.map(u => u.id),
		new_tier: 0,
		old_tier: 5,
		first_time_patron: false
	});
	await sleep(100);
	for (const user of users) {
		const cached = roboChimpCache.get(user.id);
		expect(cached!.perk_tier).toEqual(0);
	}
});
