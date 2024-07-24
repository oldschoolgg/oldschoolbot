import { expect, test } from 'vitest';

import { TSRedis } from '@oldschoolgg/toolkit/TSRedis';
import { sleep } from 'e';
import { BadgesEnum, BitField, globalConfig } from '../../src/lib/constants';
import { roboChimpCache } from '../../src/lib/perkTier';
import { getUsersPerkTier } from '../../src/lib/perkTiers';
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
	await sleep(250);
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
	await sleep(250);
	await user.sync();
	expect(user.user.badges).not.includes(BadgesEnum.Patron);
});

test('Should add to cache', async () => {
	const users = [await createTestUser(), await createTestUser(), await createTestUser()];
	await roboChimpClient.user.createMany({
		data: users.map(u => ({
			id: BigInt(u.id),
			perk_tier: 5
		}))
	});
	const _redis = makeSender();
	_redis.publish({
		type: 'patron_tier_change',
		discord_ids: users.map(u => u.id),
		new_tier: 5,
		old_tier: 2,
		first_time_patron: false
	});
	await sleep(250);
	for (const user of users) {
		const cached = roboChimpCache.get(user.id);
		expect(getUsersPerkTier(user)).toEqual(5);
		expect(cached!.perk_tier).toEqual(5);
	}
});

test('Should remove from cache', async () => {
	const users = [await createTestUser(), await createTestUser(), await createTestUser()];
	await roboChimpClient.user.createMany({
		data: users.map(u => ({
			id: BigInt(u.id),
			perk_tier: 0
		}))
	});
	const _redis = makeSender();
	_redis.publish({
		type: 'patron_tier_change',
		discord_ids: users.map(u => u.id),
		new_tier: 0,
		old_tier: 5,
		first_time_patron: false
	});
	await sleep(250);
	for (const user of users) {
		expect(getUsersPerkTier(user)).toEqual(0);
		const cached = roboChimpCache.get(user.id);
		expect(cached).toEqual(undefined);
	}
});

test('Should recognize special bitfields', async () => {
	expect(getUsersPerkTier(await createTestUser(undefined, { bitfield: [BitField.HasPermanentTierOne] }))).toEqual(3);
	expect(
		getUsersPerkTier(await createTestUser(undefined, { bitfield: [BitField.BothBotsMaxedFreeTierOnePerks] }))
	).toEqual(2);
});

test('Should sdffsddfss', async () => {
	const user = await createTestUser();
	roboChimpCache.set(user.id, { perk_tier: 5 } as any);
	expect(getUsersPerkTier(user)).toEqual(5);
});
