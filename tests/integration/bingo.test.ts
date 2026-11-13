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
import { bingoCommand, getBingoFromUserInput } from '@/mahoji/commands/bingo.js';
import { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import { createTestUser } from './util.js';

describe('Seasonal team bingo', () => {
	let season: BingoSeason;
	let bingoID: number;
	let teamID: number;
	let otherTeamID: number;
	let creator: Awaited<ReturnType<typeof createTestUser>>;
	const users = new Map<string, Awaited<ReturnType<typeof createTestUser>>>();
	beforeEach(async () => {
		users.clear();
		creator = await createTestUser();
		const start = new Date(Date.now() - 60_000);
		const bingo = await prisma.bingo.create({
			data: {
				creator_id: creator.id,
				title: 'Seasonal team fixture',
				guild_id: '1111111111111111',
				notifications_channel_id: '1111111111111111',
				duration_days: 1,
				start_date: start,
				ticket_price: 0,
				team_size: 5,
				season: {
					create: {
						name: 'Seasonal team fixture',
						theme: 'winter',
						year: 2026,
						start_date: start,
						end_date: new Date(start.getTime() + 86_400_000),
						challenges: defaultBingoChallenges()
					}
				}
			},
			include: { season: true }
		});
		bingoID = bingo.id;
		season = bingo.season!;
		teamID = (await prisma.bingoTeam.create({ data: { bingo_id: bingo.id } })).id;
		otherTeamID = (await prisma.bingoTeam.create({ data: { bingo_id: bingo.id } })).id;
	});
	afterEach(async () => {
		await prisma.bingoSeason.delete({ where: { id: season.id } });
		await prisma.bingoParticipant.deleteMany({ where: { bingo_id: bingoID } });
		await prisma.bingoTeam.deleteMany({ where: { bingo_id: bingoID } });
		await prisma.bingo.delete({ where: { id: bingoID } });
	});
	async function join(alias: string, team = teamID) {
		let user = users.get(alias);
		if (!user) {
			user = await createTestUser();
			users.set(alias, user);
			await prisma.bingoParticipant.create({
				data: { user_id: user.id, bingo_id: bingoID, bingo_team_id: team, tickets_bought: 1 }
			});
		}
		return user;
	}
	async function reward(
		alias: string,
		items: Bank,
		dates: { occurred_at?: Date; started_at?: Date } = {},
		team = teamID
	) {
		const user = await join(alias, team);
		return prisma.seasonalBingoEvent.create({
			data: {
				id: randomUUID(),
				season_id: season.id,
				team_id: team,
				user_id: user.id,
				activity_type: 'Woodcutting',
				started_at: season.start_date,
				items: items.toJSON(),
				...dates
			}
		});
	}
	async function progress(challengeID: string, team = teamID) {
		return prisma.seasonalBingoProgress.findUnique({
			where: {
				season_id_team_id_challenge_id: { season_id: season.id, team_id: team, challenge_id: challengeID }
			}
		});
	}
	it('combines teammates, isolates other teams and handles duplicate deliveries once', async () => {
		const events = await Promise.all(
			Array.from({ length: 5 }, (_, i) => reward(String(i), new Bank().add('Redwood logs', 1000)))
		);
		const other = await reward('opponent', new Bank().add('Redwood logs', 1000), {}, otherTeamID);
		await Promise.all(
			[...events, other].flatMap(e => [processBingoEvent(e.id, season.id), processBingoEvent(e.id, season.id)])
		);
		expect((await progress('redwoods'))?.quantity).toBe(5000);
		expect((await progress('redwoods'))?.completed_at).not.toBeNull();
		expect((await progress('redwoods', otherTeamID))?.quantity).toBe(1000);
		expect((await progress('redwoods', otherTeamID))?.completed_at).toBeNull();
		expect((await bingoContributorLeaderboard(season.id, teamID)).reduce((sum, u) => sum + u.score, 0)).toBeCloseTo(
			1
		);
		const bingo = await prisma.bingo.findUniqueOrThrow({ where: { id: bingoID }, include: { season: true } });
		const manager = new BingoManager(bingo);
		const { teams } = await manager.fetchAllParticipants();
		expect(teams.find(t => t.team_id === teamID)?.tilesCompletedCount).toBe(1);
		expect(teams.find(t => t.team_id === otherTeamID)?.tilesCompletedCount).toBe(0);
	});
	it('does not credit repeated drops after a team tile completes', async () => {
		for (const alias of ['first', 'second']) {
			const e = await reward(alias, new Bank().add('Elysian sigil'));
			await processBingoEvent(e.id, season.id);
		}
		expect((await progress('sigil'))?.completed_by).toBe(users.get('first')!.id);
		expect(await bingoContributorLeaderboard(season.id)).toEqual([{ user_id: users.get('first')!.id, score: 1 }]);
	});
	it('ignores rewards outside the season and unrelated items', async () => {
		const events = await Promise.all([
			reward('early', new Bank().add('Zenyte shard'), { started_at: new Date(season.start_date.getTime() - 1) }),
			reward('late', new Bank().add('Zenyte shard'), { occurred_at: season.end_date }),
			reward('unrelated', new Bank().add('Logs', 5000))
		]);
		for (const e of events) await processBingoEvent(e.id, season.id);
		expect(await progress('zenyte')).toBeNull();
		expect(await progress('redwoods')).toBeNull();
	});
	it('applies manual corrections only to the selected team and blocks older pending events', async () => {
		const e = await reward('first', new Bank().add('Zenyte shard'));
		const opponent = await reward('opponent', new Bank().add('Zenyte shard'), {}, otherTeamID);
		for (const event of [e, opponent]) await processBingoEvent(event.id, season.id);
		const pending = await reward('second', new Bank().add('Zenyte shard'));
		await setBingoChallengeCompletion({
			seasonID: season.id,
			teamID,
			challengeID: 'zenyte',
			adminID: creator.id,
			completed: false,
			reason: 'Incorrect completion'
		});
		await processBingoEvent(e.id, season.id);
		await processBingoEvent(pending.id, season.id);
		expect((await progress('zenyte'))?.quantity).toBe(0);
		expect((await progress('zenyte', otherTeamID))?.quantity).toBe(1);
		expect(await bingoContributorLeaderboard(season.id, teamID)).toEqual([]);
		await setBingoChallengeCompletion({
			seasonID: season.id,
			teamID,
			challengeID: 'zenyte',
			adminID: creator.id,
			completed: true,
			reason: 'Verified completion'
		});
		expect((await progress('zenyte'))?.completed_by).toBe(creator.id);
		expect(await bingoContributorLeaderboard(season.id, teamID)).toEqual([]);
	});
	it('retains components of alternative sets with no immediate score', async () => {
		for (const item of [
			"Ahrim's hood",
			"Dharok's helm",
			"Dharok's platebody",
			"Dharok's platelegs",
			"Dharok's greataxe"
		]) {
			const e = await reward('first', new Bank().add(item));
			await processBingoEvent(e.id, season.id);
		}
		expect((await progress('barrows'))?.quantity).toBe(1);
	});
	it('captures only granted member rewards, excluding non-members, purchases, old bank contents and failed writes', async () => {
		const user = await join('member');
		const outsider = await createTestUser();
		const activity: Activity = {
			id: 12345,
			user_id: BigInt(user.id),
			type: 'Woodcutting',
			start_date: season.start_date,
			finish_date: new Date(),
			duration: 1000,
			completed: true,
			group_activity: true,
			all_user_ids: [BigInt(user.id), BigInt(outsider.id)],
			data: {},
			channel_id: null
		};
		await user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true });
		await withBingoActivity({ ...activity, type: 'Buy' }, () =>
			user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true })
		);
		await withBingoActivity(activity, () =>
			outsider.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true })
		);
		expect(await prisma.seasonalBingoEvent.count({ where: { season_id: season.id } })).toBe(0);
		for (let retry = 0; retry < 2; retry++) {
			await withBingoActivity(activity, () =>
				user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true })
			);
		}
		const stored = await prisma.seasonalBingoEvent.findFirstOrThrow({ where: { season_id: season.id } });
		expect((stored.items as Record<string, number>)[itemID('Redwood logs')]).toBe(1000);
		expect(stored.team_id).toBe(teamID);
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
		const user = await join('member');
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
					user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true })
				)
			)
		);
		const events = await prisma.seasonalBingoEvent.findMany({ where: { season_id: season.id } });
		expect(events.map(e => e.activity_id).sort()).toEqual([20001, 20002]);
		for (const e of events) await processBingoEvent(e.id, season.id);
		expect((await progress('redwoods'))?.quantity).toBe(2000);
	});
	it('selects a normal team bingo for a leaderboard request without an ID', async () => {
		const response = await creator.runCommand(bingoCommand, { leaderboard: {} });
		expect(response).toBe(
			'**Seasonal team fixture** has no teams on its leaderboard yet. Players can join before it starts using /bingo make_team.'
		);
		const member = await join('member');
		expect((await getBingoFromUserInput(undefined, member.id, null))?.id).toBe(bingoID);
		expect((await getBingoFromUserInput(String(bingoID)))?.season?.id).toBe(season.id);
	});
	it('keeps the normal bingo command flow and removes the separate community commands', () => {
		const names = bingoCommand.options.map(o => o.name);
		expect(names).toEqual([
			'make_team',
			'leave_team',
			'view',
			'leaderboard',
			'create_bingo',
			'manage_bingo',
			'items'
		]);
	});
	it('shows the team image without attaching the challenge JSON', async () => {
		const member = await join('board-member');
		const view = await member.runCommand(bingoCommand, { view: { bingo: String(bingoID) } });
		expect(view).toMatchObject({
			files: [expect.objectContaining({ name: `bingo-${bingoID}-team-${teamID}.png` })]
		});
	});
	it('uses normal team registration and enforces the organiser-selected size', async () => {
		const start = new Date(Date.now() + 3_600_000);
		await prisma.bingo.update({
			where: { id: bingoID },
			data: {
				start_date: start,
				team_size: 2,
				season: { update: { start_date: start, end_date: new Date(start.getTime() + 86_400_000) } }
			}
		});
		const captain = await createTestUser();
		const teammate = await createTestUser();
		expect(await captain.runCommand(bingoCommand, { make_team: { bingo: String(bingoID) } })).toBe(
			'Your team must have only 2 users, no more or less.'
		);
		await captain.runCommand(bingoCommand, {
			make_team: {
				bingo: String(bingoID),
				second_user: { user: teammate.getIUser() }
			}
		});
		const members = await prisma.bingoParticipant.findMany({ where: { bingo_id: bingoID } });
		expect(members.map(p => p.user_id).sort()).toEqual([captain.id, teammate.id].sort());
		expect(new Set(members.map(p => p.bingo_team_id)).size).toBe(1);
		await prisma.bingo.update({ where: { id: bingoID }, data: { start_date: new Date(Date.now() - 1000) } });
		expect(await captain.runCommand(bingoCommand, { leave_team: { bingo: String(bingoID) } })).toBe(
			"You can't leave a bingo team after bingo has started."
		);
	});
});
