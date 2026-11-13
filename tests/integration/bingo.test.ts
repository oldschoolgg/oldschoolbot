import { randomUUID } from 'node:crypto';
import { Bank, itemID } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Activity, BingoSeason } from '@/prisma/main.js';
import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { withBingoActivity } from '@/lib/bingo/bingoEvents.js';
import {
	bingoContributorLeaderboard,
	processBingoEvent,
	setBingoChallengeCompletion
} from '@/lib/bingo/bingoSeason.js';
import { createTestUser } from './util.js';

describe('Seasonal bingo persistence', () => {
	let season: BingoSeason;
	beforeEach(async () => {
		season = await prisma.bingoSeason.create({
			data: {
				name: 'Bingo regression fixture',
				theme: 'winter',
				year: 2026,
				status: 'completed',
				start_date: new Date(Date.now() - 60_000),
				end_date: new Date(Date.now() + 60_000),
				challenges: defaultBingoChallenges()
			}
		});
	});
	afterEach(async () => {
		await prisma.bingoSeason.delete({ where: { id: season.id } });
	});
	async function reward(userID: string, items: Bank, dates: { occurred_at?: Date; started_at?: Date } = {}) {
		return prisma.seasonalBingoEvent.create({
			data: {
				id: randomUUID(),
				season_id: season.id,
				user_id: userID,
				activity_type: 'Woodcutting',
				started_at: season.start_date,
				items: items.toJSON(),
				...dates
			}
		});
	}
	async function progress(challengeID: string) {
		return prisma.seasonalBingoProgress.findUnique({
			where: { season_id_challenge_id: { season_id: season.id, challenge_id: challengeID } }
		});
	}
	it('serialises community contributions and handles duplicate deliveries exactly once', async () => {
		const events = await Promise.all(
			Array.from({ length: 10 }, (_, i) => reward(String(100 + i), new Bank().add('Redwood logs', 1000)))
		);
		await Promise.all(
			events.flatMap(e => [processBingoEvent(e.id, season.id), processBingoEvent(e.id, season.id)])
		);
		const p = await progress('redwoods');
		expect(p?.quantity).toBe(5000);
		expect(p?.completed_at).not.toBeNull();
		const leaders = await bingoContributorLeaderboard(season.id);
		expect(leaders.reduce((sum, u) => sum + u.score, 0)).toBeCloseTo(1);
		expect(await prisma.seasonalBingoProgress.count({ where: { season_id: season.id } })).toBe(1);
	});
	it('does not credit repeated drops after a tile completes', async () => {
		for (const id of ['100', '101']) {
			const e = await reward(id, new Bank().add('Elysian sigil'));
			await processBingoEvent(e.id, season.id);
		}
		expect((await progress('sigil'))?.completed_by).toBe('100');
		expect(await bingoContributorLeaderboard(season.id)).toEqual([{ user_id: '100', score: 1 }]);
	});
	it('ignores rewards outside the season and unrelated items', async () => {
		const events = await Promise.all([
			reward('100', new Bank().add('Zenyte shard'), { started_at: new Date(season.start_date.getTime() - 1) }),
			reward('100', new Bank().add('Zenyte shard'), { occurred_at: season.end_date }),
			reward('100', new Bank().add('Logs', 5000))
		]);
		for (const e of events) await processBingoEvent(e.id, season.id);
		expect(await progress('zenyte')).toBeNull();
		expect(await progress('redwoods')).toBeNull();
	});
	it('records manual actions and prevents old pending rewards or retries restoring a reversed tile', async () => {
		const e = await reward('100', new Bank().add('Zenyte shard'));
		await processBingoEvent(e.id, season.id);
		const pending = await reward('101', new Bank().add('Zenyte shard'));
		await setBingoChallengeCompletion({
			seasonID: season.id,
			challengeID: 'zenyte',
			adminID: '999',
			completed: false,
			reason: 'Incorrect completion'
		});
		await processBingoEvent(e.id, season.id);
		await processBingoEvent(pending.id, season.id);
		expect((await progress('zenyte'))?.quantity).toBe(0);
		expect(await bingoContributorLeaderboard(season.id)).toEqual([]);
		await setBingoChallengeCompletion({
			seasonID: season.id,
			challengeID: 'zenyte',
			adminID: '999',
			completed: true,
			reason: 'Verified by an administrator'
		});
		expect((await progress('zenyte'))?.completed_by).toBe('999');
		expect(await bingoContributorLeaderboard(season.id)).toEqual([]);
		expect(
			await prisma.seasonalBingoEvent.count({
				where: { season_id: season.id, metadata: { path: ['challengeID'], equals: 'zenyte' } }
			})
		).toBe(2);
	});
	it('persists alternate set components even when they add no immediate score', async () => {
		for (const item of [
			"Ahrim's hood",
			"Dharok's helm",
			"Dharok's platebody",
			"Dharok's platelegs",
			"Dharok's greataxe"
		]) {
			const e = await reward('100', new Bank().add(item));
			await processBingoEvent(e.id, season.id);
		}
		expect((await progress('barrows'))?.quantity).toBe(1);
	});
	it('captures only actually granted activity rewards and retains event IDs on retries', async () => {
		await prisma.bingoSeason.update({ where: { id: season.id }, data: { status: 'active' } });
		const user = await createTestUser();
		const activity: Activity = {
			id: 12345,
			user_id: BigInt(user.id),
			type: 'Woodcutting',
			start_date: season.start_date,
			finish_date: new Date(),
			duration: 1000,
			completed: true,
			group_activity: false,
			all_user_ids: [BigInt(user.id)],
			data: {},
			channel_id: null
		};
		await user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true });
		expect(await prisma.seasonalBingoEvent.count({ where: { season_id: season.id } })).toBe(0);
		await withBingoActivity({ ...activity, type: 'Buy' }, () =>
			user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true })
		);
		expect(await prisma.seasonalBingoEvent.count({ where: { season_id: season.id } })).toBe(0);
		for (let retry = 0; retry < 2; retry++) {
			await withBingoActivity(activity, () =>
				user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true })
			);
		}
		expect(await prisma.seasonalBingoEvent.count({ where: { season_id: season.id } })).toBe(1);
		const stored = await prisma.seasonalBingoEvent.findFirstOrThrow({ where: { season_id: season.id } });
		expect((stored.items as Record<string, number>)[itemID('Redwood logs')]).toBe(1000);
		await processBingoEvent(stored.id, season.id);
		expect((await progress('redwoods'))?.quantity).toBe(1000);
		await expect(
			withBingoActivity({ ...activity, id: 12346 }, () =>
				user.transactItems({
					itemsToAdd: new Bank().add('Redwood logs', 1000),
					itemsToRemove: new Bank().add('Elysian sigil'),
					collectionLog: true
				})
			)
		).rejects.toThrow();
		expect(await prisma.seasonalBingoEvent.count({ where: { season_id: season.id } })).toBe(1);
	});
	it('preserves separate activity contexts across the same user queue', async () => {
		await prisma.bingoSeason.update({ where: { id: season.id }, data: { status: 'active' } });
		const user = await createTestUser();
		const activity: Activity = {
			id: 20001,
			user_id: BigInt(user.id),
			type: 'Woodcutting',
			start_date: season.start_date,
			finish_date: new Date(),
			duration: 1000,
			completed: true,
			group_activity: false,
			all_user_ids: [BigInt(user.id)],
			data: {},
			channel_id: null
		};
		await Promise.all(
			[20001, 20002].map(id =>
				withBingoActivity({ ...activity, id }, () =>
					user.addItemsToBank({
						items: new Bank().add('Redwood logs', 1000),
						collectionLog: true
					})
				)
			)
		);
		const events = await prisma.seasonalBingoEvent.findMany({ where: { season_id: season.id } });
		expect(events.map(e => e.activity_id).sort()).toEqual([20001, 20002]);
		for (const e of events) await processBingoEvent(e.id, season.id);
		expect((await progress('redwoods'))?.quantity).toBe(2000);
	});
});
