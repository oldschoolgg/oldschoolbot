import { expect, test } from 'vitest';

import { TSRedis } from '@oldschoolgg/toolkit/structures';
import { sleep } from 'e';
import { BadgesEnum, BitField, globalConfig } from '../../src/lib/constants';
import { roboChimpCache } from '../../src/lib/perkTier';
import { getUsersPerkTier } from '../../src/lib/perkTiers';
import { createTestUser } from './util';

function makeSender() {
	return new TSRedis({ mocked: !globalConfig.redisPort, port: globalConfig.redisPort });
}

test.skip('Should add patron badge', async () => {
	const user = await createTestUser();
	expect(user.user.badges).not.includes(BadgesEnum.Patron);
	const _redis = makeSender();
	await _redis.publish({
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

test.skip('Should remove patron badge', async () => {
	const user = await createTestUser(undefined, { badges: [BadgesEnum.Patron] });
	expect(user.user.badges).includes(BadgesEnum.Patron);
	const _redis = makeSender();
	await _redis.publish({
		type: 'patron_tier_change',
		discord_ids: [user.id],
		new_tier: 0,
		old_tier: 1,
		first_time_patron: false
	});
	await sleep(550);
	await user.sync();
	expect(user.user.badges).not.includes(BadgesEnum.Patron);
});

test.skip('Should add to cache', async () => {
	const users = [await createTestUser(), await createTestUser(), await createTestUser()];
	await roboChimpClient.user.createMany({
		data: users.map(u => ({
			id: BigInt(u.id),
			perk_tier: 5
		}))
	});
	const _redis = makeSender();
	await _redis.publish({
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

test.skip(
	'Should remove from cache',
	async () => {
		const users = [await createTestUser(), await createTestUser(), await createTestUser()];
		await roboChimpClient.user.createMany({
			data: users.map(u => ({
				id: BigInt(u.id),
				perk_tier: 0
			}))
		});
		const _redis = makeSender();
		await _redis.publish({
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
	},
	{
		retry: 1
	}
);

test.skip('Should recognize special bitfields', async () => {
	const users = [
		await createTestUser(undefined, { bitfield: [BitField.HasPermanentTierOne] }),
		await createTestUser(undefined, { bitfield: [BitField.BothBotsMaxedFreeTierOnePerks] })
	];
	for (const user of users) {
		expect(getUsersPerkTier(user)).toEqual(2);
	}
});

test.skip('Should sdffsddfss', async () => {
	const user = await createTestUser();
	roboChimpCache.set(user.id, { perk_tier: 5 } as any);
	expect(getUsersPerkTier(user)).toEqual(5);
});
