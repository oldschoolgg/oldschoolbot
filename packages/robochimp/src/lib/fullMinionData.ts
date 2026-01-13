import type { IBotType } from '@oldschoolgg/schemas';
import type { ItemBank } from 'oldschooljs';

import type { FullMinionData } from '@/http/api-types.js';

type LeaderboardRanks = FullMinionData['leaderboards'];

async function fetchLeaderboardRanks(
	bot: IBotType,
	targetUserId: string,
	skillColumns: string[]
): Promise<LeaderboardRanks> {
	const botClient = bot === 'osb' ? osbClient : bsoClient;
	const clRankQuery = `
WITH ranked AS (
	SELECT id::text as id,
		CARDINALITY(cl_array) AS qty,
		ROW_NUMBER() OVER (ORDER BY CARDINALITY(cl_array) DESC, id ASC) AS rank
	FROM users
	WHERE CARDINALITY(cl_array) > 0
)
SELECT rank FROM ranked WHERE id = $1;`;
	const ironmanClRankQuery = `
WITH ranked AS (
	SELECT id::text as id,
		CARDINALITY(cl_array) AS qty,
		ROW_NUMBER() OVER (ORDER BY CARDINALITY(cl_array) DESC, id ASC) AS rank
	FROM users
	WHERE CARDINALITY(cl_array) > 0
	AND "minion.ironman" = true
)
SELECT rank FROM ranked WHERE id = $1;`;

	const masteryRankQuery = `
WITH ranked AS (
	SELECT id::text as id,
		mastery_percentage AS mastery,
		ROW_NUMBER() OVER (ORDER BY mastery_percentage DESC, id ASC) AS rank
	FROM users
	WHERE mastery_percentage IS NOT NULL
)
SELECT rank FROM ranked WHERE id = $1;`;
	const ironmanMasteryRankQuery = `
WITH ranked AS (
	SELECT id::text as id,
		mastery_percentage AS mastery,
		ROW_NUMBER() OVER (ORDER BY mastery_percentage DESC, id ASC) AS rank
	FROM users
	WHERE mastery_percentage IS NOT NULL
	AND "minion.ironman" = true
)
SELECT rank FROM ranked WHERE id = $1;`;

	const totalXpExpression =
		skillColumns.length > 0
			? skillColumns.map(column => `"skills.${column.replace('skills_', '')}"::int8`).join(' + ')
			: '0';
	const skillsRankQuery = `
WITH totals AS (
	SELECT id::text as id,
		${totalXpExpression} AS totalxp
	FROM users
),
ranked AS (
	SELECT id,
		totalxp,
		ROW_NUMBER() OVER (ORDER BY totalxp DESC, id ASC) AS rank
	FROM totals
)
SELECT rank FROM ranked WHERE id = $1;`;
	const ironmanSkillsRankQuery = `
WITH totals AS (
	SELECT id::text as id,
		${totalXpExpression} AS totalxp
	FROM users
	WHERE "minion.ironman" = true
),
ranked AS (
	SELECT id,
		totalxp,
		ROW_NUMBER() OVER (ORDER BY totalxp DESC, id ASC) AS rank
	FROM totals
)
SELECT rank FROM ranked WHERE id = $1;`;

	const [clRank, ironmanClRank, masteryRank, ironmanMasteryRank, skillsRank, ironmanSkillsRank] = await Promise.all([
		botClient.$queryRawUnsafe<{ rank: number }[]>(clRankQuery, targetUserId),
		botClient.$queryRawUnsafe<{ rank: number }[]>(ironmanClRankQuery, targetUserId),
		botClient.$queryRawUnsafe<{ rank: number }[]>(masteryRankQuery, targetUserId),
		botClient.$queryRawUnsafe<{ rank: number }[]>(ironmanMasteryRankQuery, targetUserId),
		botClient.$queryRawUnsafe<{ rank: number }[]>(skillsRankQuery, targetUserId),
		botClient.$queryRawUnsafe<{ rank: number }[]>(ironmanSkillsRankQuery, targetUserId)
	]);

	return {
		cl: {
			overall_rank: clRank[0]?.rank ?? null,
			ironman_rank: ironmanClRank[0]?.rank ?? null
		},
		mastery_rank: masteryRank[0]?.rank ?? null,
		mastery_ironman_rank: ironmanMasteryRank[0]?.rank ?? null,
		skills_rank: skillsRank[0]?.rank ?? null,
		skills_ironman_rank: ironmanSkillsRank[0]?.rank ?? null
	};
}

export async function fetchFullMinionData(bot: IBotType, targetUserId: string): Promise<FullMinionData | null> {
	const opt = { where: { id: targetUserId } } as const;
	const botUser = await (bot === 'osb' ? osbClient.user.findFirst(opt) : bsoClient.user.findFirst(opt));
	if (!botUser) {
		return null;
	}
	const skillsXp: Record<string, number> = {};
	const gear: Record<string, any> = {};
	const skillColumns: string[] = [];

	for (const [key, value] of Object.entries(botUser)) {
		if (key.startsWith('skills_')) {
			const skillName = key.replace('skills_', '');
			skillsXp[skillName] = Number(value);
			skillColumns.push(key);
		}
		if (key.startsWith('gear_')) {
			const gearSlot = key.replace('gear_', '');
			gear[gearSlot] = value;
		}
	}

	const minigameData: Record<string, number> = {};

	const rawMinigameScores = await (bot === 'osb'
		? osbClient.minigame.findFirst({ where: { user_id: targetUserId } })
		: bsoClient.minigame.findFirst({ where: { user_id: targetUserId } }));
	if (rawMinigameScores) {
		for (const [key, value] of Object.entries(rawMinigameScores)) {
			if (!['user_id', 'id'].includes(key)) {
				minigameData[key] = value as number;
			}
		}
	}

	const leaderboards = await fetchLeaderboardRanks(bot, targetUserId, skillColumns);
	const response: FullMinionData = {
		user_id: botUser.id,
		bot: bot,
		name: botUser.minion_name,
		icon: botUser.minion_icon,

		is_ironman: botUser.minion_ironman,
		gp: Number(botUser.GP),
		qp: botUser.QP,
		leaderboards,

		bank: botUser.bank as ItemBank,
		collection_log_bank: botUser.collectionLogBank as ItemBank,
		bitfield: botUser.bitfield,
		bought_date: botUser.minion_bought_date ? botUser.minion_bought_date.toISOString() : null,
		total_sacrificed_value: Number(botUser.sacrificedValue),

		finished_quest_ids: botUser.finished_quest_ids as number[],
		gambling_lockout_expiry: botUser.gambling_lockout_expiry ? botUser.gambling_lockout_expiry.toISOString() : null,

		skills_xp: skillsXp,

		points: {
			lms: botUser.lms_points,
			volcanic_mine: botUser.volcanic_mine_points,
			nmz: botUser.nmz_points,
			carpenter: botUser.carpenter_points,
			zeal_tokens: botUser.zeal_tokens,
			slayer: botUser.slayer_points
		},

		charges: {
			tentacle: botUser.tentacle_charges,
			sang: botUser.sang_charges,
			celestial_ring: botUser.celestial_ring_charges,
			ash_sanctifier: botUser.ash_sanctifier_charges,
			serp_helm: botUser.serp_helm_charges,
			blood_fury: botUser.blood_fury_charges,
			tum_shadow: botUser.tum_shadow_charges,
			blood_essence: botUser.blood_essence_charges,
			trident: botUser.trident_charges,
			venator_bow: botUser.venator_bow_charges,
			scythe_of_vitur: botUser.scythe_of_vitur_charges
		},

		minigames: minigameData,

		slayer_unlocks: botUser.slayer_unlocks,
		slayer_blocked_ids: botUser.slayer_blocked_ids,
		slayer_last_task: botUser.slayer_last_task,
		slayer_remember_master: botUser.slayer_remember_master,
		slayer_autoslay_options: botUser.slayer_autoslay_options,
		slayer_points: botUser.slayer_points,

		gear: {
			pet: botUser.minion_equippedPet
		},

		config: {
			bank_sort_method: botUser.bank_sort_method,
			bank_sort_weightings: botUser.bank_sort_weightings as Record<string, number>,

			favorite_items: botUser.favoriteItems,
			favorite_alchables: botUser.favorite_alchables,
			favorite_foods: botUser.favorite_food,
			favorite_bh_seeds: botUser.favorite_bh_seeds,

			auto_farm_filter: botUser.auto_farm_filter,
			default_compost: botUser.minion_defaultCompostToUse,
			attack_style: botUser.attack_style,
			combat_options: botUser.combat_options
		}
	};
	return response;
}
