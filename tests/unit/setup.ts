import { vi } from 'vitest';

import '../../src/lib/data/itemAliases';
import { MUserStats } from '../../src/lib/structures/MUserStats';

vi.mock('../../src/lib/settings/minigames.ts', async () => {
	const actual: any = await vi.importActual('../../src/lib/settings/minigames.ts');
	return {
		...actual,
		getMinigameEntity: async () => ({})
	};
});

MUserStats.fromID = async (id: string) => {
	return new MUserStats({
		user_id: BigInt(id),
		sell_gp: 0n,
		items_sold_bank: {},
		puropuro_implings_bank: {
			'11238': 8,
			'11240': 10,
			'11242': 3
		},
		passive_implings_bank: { '11238': 1, '11240': 1, '11246': 1, '11252': 1 },
		create_cost_bank: { '4708': 1, '4710': 1, '4712': 1, '4714': 1 },
		create_loot_bank: { '12881': 1 },
		bird_eggs_offered_bank: {},
		scattered_ashes_bank: {},
		gf_weapons_made: {},
		gf_cost: {},
		gf_loot: {},
		ash_sanctifier_prayer_xp: 0n,
		gotr_rift_searches: 0,
		farming_plant_cost_bank: {},
		farming_harvest_loot_bank: {},
		cl_array: [
			211, 215, 217, 219, 383, 447, 449, 451, 526, 557, 560, 561, 565, 987, 995, 1436, 1617, 1619, 1621, 1739,
			1759, 1779, 1937, 2132, 2485, 2970, 4067, 5282, 5295, 5298, 5300, 5316, 6034, 11238, 11240, 11242, 11244,
			11246, 11248, 11250, 11252, 11959, 12881, 13421, 13573, 20712, 21543, 21545, 21555, 22097, 23182, 23245,
			25527
		],
		cl_array_length: 53,
		buy_cost_bank: { '995': 2500100 },
		buy_loot_bank: { '1937': 1, '22097': 1 },
		shades_of_morton_cost_bank: {},
		gp_from_agil_pyramid: 0,
		random_event_completions_bank: { '19': 1 },
		toa_attempts: 1,
		toa_cost: {
			'2444': 1,
			'3024': 5,
			'6685': 8,
			'10925': 1,
			'11212': 29,
			'11230': 28,
			'12695': 1
		},
		toa_loot: { '995': 12239, '5295': 7, '5300': 6 },
		total_toa_points: 12239,
		toa_raid_levels_bank: { '100': 1 },
		total_toa_duration_minutes: 39,
		deaths: 0,
		pk_evasion_exp: 0,
		dice_wins: 0,
		dice_losses: 1,
		duel_losses: 0,
		duel_wins: 1,
		fight_caves_attempts: 0,
		firecapes_sacrificed: 0,
		tithe_farms_completed: 0,
		tithe_farm_points: 0,
		pest_control_points: 0,
		inferno_attempts: 0,
		infernal_cape_sacrifices: 0,
		tob_attempts: 0,
		foundry_reputation: 0,
		tob_hard_attempts: 0,
		total_cox_points: 4300,
		honour_level: 1,
		high_gambles: 0,
		honour_points: 0,
		slayer_task_streak: 1,
		slayer_wildy_task_streak: 0,
		slayer_superior_count: 0,
		slayer_unsired_offered: 0,
		slayer_chewed_offered: 0,
		tob_cost: {},
		tob_loot: {},
		creature_scores: { '9': 1021 },
		monster_scores: { '2790': 201, '7797': 24, '9415': 2 },
		laps_scores: {},
		sacrificed_bank: {},
		openable_scores: { '11238': 1, '20544': 1 },
		gp_luckypick: -6831000000n,
		gp_dice: -500000000n,
		gp_slots: 3900000000n,
		gp_hotcold: 0n,
		total_gp_traded: 69n,
		last_daily_timestamp: 1720196666639n,
		last_tears_of_guthix_timestamp: 0n,
		herbs_cleaned_while_farming_bank: {},
		forestry_event_completions_bank: {},
		colo_cost: {},
		colo_loot: {},
		colo_kc_bank: {},
		colo_max_glory: null,
		quivers_sacrificed: 0
	});
};
