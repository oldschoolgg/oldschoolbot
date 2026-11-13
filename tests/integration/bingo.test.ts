import { Bank, type ItemBank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Bingo, Prisma } from '@/prisma/main.js';
import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { bingoCommand, getBingoFromUserInput } from '@/mahoji/commands/bingo.js';
import { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import { parseBingoConfiguration } from '@/mahoji/lib/bingo/seasonalBingo.js';
import { createTestUser } from './util.js';

describe('Seasonal artwork on the existing team bingo system', () => {
	let bingo: Bingo;
	let teamID: number;
	let opponentID: number;
	let creator: Awaited<ReturnType<typeof createTestUser>>;
	beforeEach(async () => {
		creator = await createTestUser();
		bingo = await prisma.bingo.create({
			data: {
				creator_id: creator.id,
				title: 'Winter bingo',
				theme: 'winter',
				team_size: 2,
				ticket_price: 0,
				start_date: new Date(Date.now() - 60_000),
				duration_days: 1,
				guild_id: '1111111111111111',
				notifications_channel_id: '1111111111111111',
				bingo_tiles: parseBingoConfiguration(defaultBingoChallenges()) as unknown as Prisma.InputJsonObject[]
			}
		});
		teamID = (await prisma.bingoTeam.create({ data: { bingo_id: bingo.id } })).id;
		opponentID = (await prisma.bingoTeam.create({ data: { bingo_id: bingo.id } })).id;
	});
	afterEach(async () => {
		vi.restoreAllMocks();
		await prisma.bingoParticipant.deleteMany({ where: { bingo_id: bingo.id } });
		await prisma.bingoTeam.deleteMany({ where: { bingo_id: bingo.id } });
		await prisma.bingo.delete({ where: { id: bingo.id } });
	});
	async function join(team = teamID) {
		const user = await createTestUser();
		await prisma.bingoParticipant.create({
			data: { user_id: user.id, bingo_id: bingo.id, bingo_team_id: team, tickets_bought: 1 }
		});
		return user;
	}
	it('uses existing participant CLs for team progress, quantities and leaderboard rankings', async () => {
		const [first, second, opponent] = await Promise.all([join(), join(), join(opponentID)]);
		const manager = new BingoManager(bingo);
		await manager.handleNewItems(first.id, new Bank().add('Redwood logs', 1000));
		await manager.handleNewItems(second.id, new Bank().add('Redwood logs', 4000));
		await manager.handleNewItems(opponent.id, new Bank().add('Redwood logs', 1000));
		const progress = await manager.determineProgressOfTeam(teamID);
		expect(progress?.tilesCompletedCount).toBe(1);
		expect(progress?.cl.amount('Redwood logs')).toBe(5000);
		expect((await manager.determineProgressOfTeam(opponentID))?.tilesCompletedCount).toBe(0);
		const { teams } = await manager.fetchAllParticipants();
		expect(teams.map(t => [t.team_id, t.tilesCompletedCount])).toEqual([
			[teamID, 1],
			[opponentID, 0]
		]);
	});
	it('automatically uses the original bank reward hook without an activity context or event ledger', async () => {
		const user = await join();
		await user.addItemsToBank({ items: new Bank().add('Redwood logs', 5000), collectionLog: false });
		const spy = vi.spyOn(BingoManager.prototype, 'handleNewItems');
		await user.addItemsToBank({ items: new Bank().add('Redwood logs', 1000), collectionLog: true });
		// The established bank hook schedules these updates without awaiting them.
		await Promise.all(spy.mock.results.map(result => result.value));
		const participant = await prisma.bingoParticipant.findUniqueOrThrow({
			where: { user_id_bingo_id: { user_id: user.id, bingo_id: bingo.id } }
		});
		expect(new Bank(participant.cl as ItemBank).amount('Redwood logs')).toBe(1000);
	});
	it('returns the team image without exporting JSON in the normal view command', async () => {
		const user = await join();
		const response = await user.runCommand(bingoCommand, { view: { bingo: String(bingo.id) } });
		expect(response).toMatchObject({
			files: [expect.objectContaining({ name: `bingo-${bingo.id}-team-${teamID}.png` })]
		});
	});
	it('keeps existing registration and organiser-selected team sizes', async () => {
		await prisma.bingo.update({ where: { id: bingo.id }, data: { start_date: new Date(Date.now() + 3_600_000) } });
		const captain = await createTestUser();
		const teammate = await createTestUser();
		expect(await captain.runCommand(bingoCommand, { make_team: { bingo: String(bingo.id) } })).toBe(
			'Your team must have only 2 users, no more or less.'
		);
		await captain.runCommand(bingoCommand, {
			make_team: { bingo: String(bingo.id), second_user: { user: teammate.getIUser() } }
		});
		const members = await prisma.bingoParticipant.findMany({ where: { bingo_id: bingo.id } });
		expect(members.map(p => p.user_id).sort()).toEqual([captain.id, teammate.id].sort());
		expect(new Set(members.map(p => p.bingo_team_id)).size).toBe(1);
	});
	it('uses a normal bingo for default leaderboard selection and gives a clear empty result', async () => {
		expect((await getBingoFromUserInput(undefined, creator.id))?.id).toBe(bingo.id);
		expect(await creator.runCommand(bingoCommand, { leaderboard: {} })).toContain('has no teams');
	});
});
