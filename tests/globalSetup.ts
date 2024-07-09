import '../src/lib/safeglobals';

import { Decimal } from '@prisma/client/runtime/library';
import { Collection } from 'discord.js';
import { vi } from 'vitest';
import { MUserStats } from '../src/lib/structures/MUserStats';

vi.mock('@oldschoolgg/toolkit', async () => {
	const actual: any = await vi.importActual('@oldschoolgg/toolkit');
	return {
		...actual,
		mentionCommand: async (_args: any) => 'hi'
	};
});

vi.mock('../node_modules/@oldschoolgg/toolkit/src/util/discord.ts', async () => {
	const actualToolkit = await vi.importActual('../node_modules/@oldschoolgg/toolkit/src/util/discord.ts');
	return {
		...actualToolkit,
		mentionCommand: vi.fn().mockReturnValue('')
	};
});

global.globalClient = {
	isReady: () => true,
	emit: () => true,
	guilds: { cache: new Collection() },
	mahojiClient: {
		commands: {
			values: () =>
				['test'].map(n => ({
					name: n,
					description: 'test description',
					attributes: { description: 'test description' },
					options: [{ name: 'claim' }]
				}))
		}
	},
	users: {
		cache: new Collection()
	},
	channels: {
		cache: new Collection().set('1', { id: '1' })
	},
	busyCounterCache: new Map<string, number>()
} as any;

if (!process.env.TEST) {
	throw new Error('This file should only be imported in tests.');
}

MUserStats.fromID = async (id: string) => {
	return new MUserStats({
		user_id: BigInt(id),
		sell_gp: 0n,
		items_sold_bank: {},
		puropuro_implings_bank: {},
		passive_implings_bank: {},
		create_cost_bank: {},
		create_loot_bank: {},
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
			199, 201, 203, 205, 207, 209, 211, 213, 215, 217, 313, 436, 526, 554, 557, 558, 562, 877, 882, 995, 1139,
			1203, 1440, 1965, 2485, 2677, 23182
		],
		cl_array_length: 27,
		bars_from_adze_bank: {},
		ores_from_spirits_bank: {},
		bars_from_klik_bank: {},
		portable_tanner_bank: {},
		clue_upgrader_bank: {},
		ic_cost_bank: {},
		ic_loot_bank: {},
		loot_from_zippy_bank: {},
		peky_loot_bank: {},
		obis_loot_bank: {},
		brock_loot_bank: {},
		wilvus_loot_bank: {},
		doug_loot_bank: {},
		harry_loot_bank: {},
		smokey_loot_bank: {},
		doubled_loot_bank: {},
		silverhawk_boots_passive_xp: 0n,
		bonecrusher_prayer_xp: 0n,
		ic_donations_given_bank: {},
		ic_donations_received_bank: {},
		lamped_xp: {},
		tame_cl_bank: {},
		tinker_workshop_mats_bank: {},
		buy_cost_bank: {},
		buy_loot_bank: {},
		tworkshop_material_cost_bank: {},
		tworkshop_xp_gained: 0,
		shades_of_morton_cost_bank: {},
		gp_from_agil_pyramid: 0,
		random_event_completions_bank: {},
		death_touched_darts_used: 0,
		toa_attempts: 0,
		toa_cost: {},
		toa_loot: {},
		total_toa_points: 0,
		toa_raid_levels_bank: {},
		total_toa_duration_minutes: 0,
		on_task_monster_scores: {},
		on_task_with_mask_monster_scores: {},
		deaths: 0,
		pk_evasion_exp: 0,
		dice_wins: 0,
		dice_losses: 0,
		duel_losses: 0,
		duel_wins: 0,
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
		total_cox_points: 0,
		honour_level: 1,
		high_gambles: 0,
		honour_points: 0,
		slayer_task_streak: 0,
		slayer_wildy_task_streak: 0,
		slayer_superior_count: 0,
		slayer_unsired_offered: 0,
		slayer_chewed_offered: 0,
		tob_cost: {},
		tob_loot: {},
		creature_scores: {},
		monster_scores: { '1118': 514 },
		laps_scores: {},
		sacrificed_bank: {},
		openable_scores: {},
		gp_luckypick: 0n,
		gp_dice: 0n,
		gp_slots: 0n,
		gp_hotcold: 0n,
		total_gp_traded: 0n,
		last_daily_timestamp: 0n,
		last_tears_of_guthix_timestamp: 0n,
		herbs_cleaned_while_farming_bank: {},
		forestry_event_completions_bank: {},
		main_server_challenges_won: 0,
		doa_attempts: 0,
		doa_cost: {},
		doa_loot: {},
		doa_room_attempts_bank: {},
		doa_total_minutes_raided: 0,
		chincannon_destroyed_loot_bank: {},
		comp_cape_percent: new Decimal(0),
		untrimmed_comp_cape_percent: new Decimal(0),
		god_favour_bank: null,
		god_items_sacrificed_bank: {},
		steal_cost_bank: {},
		steal_loot_bank: {},
		xp_from_graceful_portent: 0n,
		xp_from_dungeon_portent: 0n,
		xp_from_mining_portent: 0n,
		xp_from_hunter_portent: 0n,
		loot_from_rogues_portent: {},
		loot_from_lucky_portent: {},
		loot_destroyed_by_hunter_portent: {},
		divination_loot: {},
		octo_loot_bank: {},
		turaels_trials_cost_bank: {},
		turaels_trials_loot_bank: {},
		colo_cost: {},
		colo_loot: {},
		colo_kc_bank: {},
		colo_max_glory: null,
		quivers_sacrificed: 0
	});
};
