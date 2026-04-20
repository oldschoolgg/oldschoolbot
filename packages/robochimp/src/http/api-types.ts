import type { IBotType } from '@oldschoolgg/schemas';
import type { ItemBank } from 'oldschooljs';

export type AuthenticatedUser = {
	id: string;
	username: string | null;
	avatar: string | null;
	global_name: string | null;
	bits: number[];
};

export type FullMinionData = {
	bot: IBotType;
	user_id: string;
	name: string | null;
	icon: string | null;
	gp: number;
	is_ironman: boolean;
	qp: number;
	leaderboards: {
		cl: {
			overall_rank: number | null;
			ironman_rank: number | null;
		};
		mastery_rank: number | null;
		mastery_ironman_rank: number | null;
		skills_rank: number | null;
		skills_ironman_rank: number | null;
	};

	bank: ItemBank;
	collection_log_bank: ItemBank;

	bitfield: number[];
	bought_date: string | null;
	total_sacrificed_value: number;

	gambling_lockout_expiry: string | null;
	finished_quest_ids: number[];

	slayer_points: number;
	slayer_unlocks: number[];
	slayer_blocked_ids: number[];
	slayer_last_task: number | null;
	slayer_remember_master: string | null;
	slayer_autoslay_options: number[];

	skills_xp: Record<string, number>;

	// Point balances
	points: {
		lms: number;
		volcanic_mine: number;
		nmz: number;
		carpenter: number;
		zeal_tokens: number;
		slayer: number;
	};

	// Item charges
	charges: {
		tentacle: number;
		sang: number;
		celestial_ring: number;
		ash_sanctifier: number;
		serp_helm: number;
		blood_fury: number;
		tum_shadow: number;
		blood_essence: number;
		trident: number;
		venator_bow: number;
		scythe_of_vitur: number;
	};

	minigames: Record<string, number>;

	gear: {
		pet: number | null;
	};

	config: {
		bank_sort_method: string | null;
		bank_sort_weightings: Record<string, number>;

		favorite_items: number[];
		favorite_alchables: number[];
		favorite_foods: number[];
		favorite_bh_seeds: number[];

		auto_farm_filter: string;
		default_compost: string;
		attack_style: string[];
		combat_options: number[];
	};
};

export type SUserIdentity = {
	user_id: string;
	username: string;
	avatar: string | null;
	blacklisted: boolean;
};
