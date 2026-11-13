import { AsyncLocalStorage } from 'node:async_hooks';
import type { Bank } from 'oldschooljs';

import type { Activity, BingoSeason, Prisma } from '@/prisma/main.js';
import { bingoBoardSchema, challengeItemIDs } from '@/lib/bingo/bingoTypes.js';

// Only earned activity rewards. Buying, crafting from banked ingredients, transfers,
// giveaways and ordinary collection-log additions must not become bingo events.
const eligibleActivities = new Set<string>([
	'MonsterKilling',
	'GroupMonsterKilling',
	'Yama',
	'Nex',
	'Nightmare',
	'Raids',
	'TheatreOfBlood',
	'TombsOfAmascut',
	'Gauntlet',
	'Colosseum',
	'DoomOfMokhaiotl',
	'Revenants',
	'ClueCompletion',
	'Woodcutting',
	'Fishing',
	'Mining',
	'MotherlodeMining',
	'Hunter',
	'Birdhouse',
	'AerialFishing',
	'DriftNet',
	'Pickpocket',
	'Agility',
	'Runecraft',
	'Farming',
	'Wintertodt',
	'Tempoross',
	'Zalcano',
	'Sepulchre',
	'Plunder',
	'FishingTrawler',
	'GnomeRestaurant',
	'GloryCharging',
	'GuardiansOfTheRift',
	'VolcanicMine',
	'ShootingStars',
	'PuroPuro',
	'Trekking',
	'BarbarianAssault',
	'FightCaves',
	'Inferno',
	'Cyclops',
	'AnimatedArmour',
	'ValeTotems'
]);

interface BingoActivityContext {
	activity: Activity;
	boards: {
		season: BingoSeason;
		teams: Map<string, number>;
		itemIDs: Set<number>;
		trackCompletion: boolean;
	}[];
	sequences: Map<string, number>;
	open: boolean;
}

const activityContext = new AsyncLocalStorage<BingoActivityContext>();

async function prepareBingoContext(activity: Activity): Promise<BingoActivityContext | null> {
	const now = new Date();
	const userIDs = [...new Set([activity.user_id, ...activity.all_user_ids].map(id => id.toString()))];
	const seasons = await prisma.bingoSeason.findMany({
		where: {
			start_date: { lte: activity.start_date },
			end_date: { gt: now },
			bingo: { is: { was_finalized: false, bingo_participant: { some: { user_id: { in: userIDs } } } } }
		},
		include: { bingo: { select: { bingo_participant: { where: { user_id: { in: userIDs } } } } } }
	});
	if (seasons.length === 0) return null;
	return {
		activity,
		open: true,
		sequences: new Map(),
		boards: seasons.map(season => {
			const challenges = bingoBoardSchema.parse(season.challenges);
			return {
				season,
				teams: new Map(season.bingo!.bingo_participant.map(p => [p.user_id, p.bingo_team_id])),
				itemIDs: new Set(challenges.flatMap(challengeItemIDs)),
				trackCompletion: challenges.some(
					c => c.type === 'activity_completion' && c.activityID === activity.type
				)
			};
		})
	};
}

export async function withBingoActivity<T>(activity: Activity, fn: () => Promise<T>): Promise<T> {
	if (!eligibleActivities.has(activity.type)) return activityContext.exit(fn);
	const context = await prepareBingoContext(activity).catch(err => {
		// A bingo lookup/configuration failure must not stop the activity granting its loot.
		Logging.logError(err, { activity_id: activity.id, type: 'BINGO_CONTEXT' });
		return null;
	});
	if (!context) return activityContext.exit(fn);
	return activityContext.run(context, async () => {
		try {
			return await fn();
		} finally {
			context.open = false;
		}
	});
}

// This Prisma query is executed by rawUpdate in the SAME transaction as the bank write.
export function bingoRewardQuery(
	userID: string,
	earnedItems: () => Bank,
	collectionLog: boolean | undefined,
	activityCompletion: boolean
) {
	const context = activityContext.getStore();
	if (!context?.open || !collectionLog) return null;
	const { activity } = context;
	if (activity.user_id.toString() !== userID && !activity.all_user_ids.includes(BigInt(userID))) return null;
	const items = earnedItems();
	const sequence = context.sequences.get(userID) ?? 0;
	context.sequences.set(userID, sequence + 1);
	const data: Prisma.SeasonalBingoEventCreateManyInput[] = [];
	for (const board of context.boards) {
		const teamID = board.teams.get(userID);
		if (!teamID) continue;
		const completed = activityCompletion && board.trackCompletion;
		if (!completed && !items.items().some(([item]) => board.itemIDs.has(item.id))) continue;
		data.push({
			id: `${board.season.id}:${activity.id}:${userID}:${sequence}`,
			season_id: board.season.id,
			team_id: teamID,
			user_id: userID,
			activity_id: activity.id,
			activity_type: activity.type,
			activity_completion: completed,
			started_at: activity.start_date,
			items: items.toJSON() as Prisma.InputJsonObject
		});
	}
	if (data.length === 0) return null;
	return prisma.seasonalBingoEvent.createMany({
		data,
		skipDuplicates: true
	});
}
