import type { MoidItem } from '@oldschoolgg/schemas';
import { USELESS_ITEMS } from "@/meta/item-lists.js";
import { Item, ItemGroups, ItemVisibility } from "../../src/index.js";

const CLUE_STEP_REGEX = /^Clue scroll \((beginner|easy|medium|hard|elite|master)\) - .*$/;
const CLUE_SCROLL_NAMES: string[] = [
	'Clue scroll (beginner)',
	'Clue scroll (easy)',
	'Clue scroll (medium)',
	'Clue scroll (hard)',
	'Clue scroll (elite)',
	'Clue scroll (master)'
];
const CLUE_SCROLL_IDS: number[] = [2677, 2801, 2722, 12_073, 19_835, 23_182];

type PossibleOldOptions = {
	duplicate?: boolean;
	noted?: boolean;
	linked_id_item?: number;
	placeholder?: boolean;
	wiki_name?: string;
}

export function checkItemVisibility(item: (Item | MoidItem) & Partial<PossibleOldOptions>): ItemVisibility {
	const n = item.name.toLowerCase();

	if (CLUE_SCROLL_IDS.includes(item.id)) return ItemVisibility.Regular;

	if (ItemGroups.allUnobtainableItems.includes(item.id)) {
		return ItemVisibility.Unobtainable;
	}

	if (item.name === 'Item') {
		// TODO: give them better names, use config name
		return ItemVisibility.Unobtainable;
	}

	if (
		(CLUE_SCROLL_NAMES.includes(item.name) && !CLUE_SCROLL_IDS.includes(item.id)) ||
		USELESS_ITEMS.includes(item.id) ||
		item.duplicate === true ||
		item.noted ||
		item.linked_id_item ||
		item.placeholder ||
		item.name.toLowerCase() === 'null' ||
		item.wiki_name?.includes(' (Worn)') ||
		(item.wiki_name && CLUE_STEP_REGEX.exec(item.wiki_name)) ||
		item.name.trim().length === 0
	) {
		return ItemVisibility.NeverAdd;
	}

	/**
	 *
	 *  Config Name Checks
	 *
	 */
	if ('config_name' in item) {
		const cfnm: string = item.config_name.toLowerCase();
		if (['_riddle'].some(suffix => cfnm?.includes(suffix))) {
			return ItemVisibility.NeverAdd;
		}

		if (cfnm.startsWith('roguetrader_') && cfnm.endsWith('rune')) {
			return ItemVisibility.NeverAdd;
		}
		if (cfnm.includes('skillguide')) {
			return ItemVisibility.Unobtainable;
		}
		if (cfnm.includes('_dummy') || cfnm.includes('dummy_') || cfnm.includes('cert_dummy')) {
			return ItemVisibility.Unobtainable;
		}
		if ([
			'_bh',
		].some(suffix => cfnm?.endsWith(suffix))) {
			return ItemVisibility.Unobtainable;
		}

		if ([
			'olaf2_',
			'slice_artifact_',
			'arravcertificate_',
			'slayerguide',
			'poh_menagerie',
			'hosidius_servery_',
			'bh_emblem',
			'trail_slidingpuzzle',
			'poh_achievementgallery',
			'poh_superior_',
			'raids_bat',
			'raids_fish',
			'raids_seed',
			'raids_vial',
			'pickpocket_guide_',
			'raids_storag',
			'fossil_map',
			'sigil_of_',
			'dni23_',
			'easter17_egg_',
			'vmq3_',
			'osb5_',
			'bh_2023_emble',
			'sigil_of_the_',
			'bas_puzzle',
			'wildy_loot_k',
			'barbassault_ico',
			'_echoing_orb',
			'sailing_charting_drink_crate',
			'dummy_shoe_',

			'agility_swing',
			'agility_balance',
			'agility_contortion',
			'agility_climb',
			'agility_strength',
			'agility_swing',

			'wgs_henge_',
			'wgs_guthix_',
			'dt2_lassar_',
			'dt2_stranglewood',
			'dt2_ghorrock_',
			'dt2_scar_',
			'deadman_blighted_'
		].some(suffix => cfnm?.includes(suffix))) {
			return ItemVisibility.Unobtainable;
		}
		if (cfnm.includes('slug2_') || cfnm.includes('dorgesh_powerstation') || cfnm.includes('surok_')) {
			return ItemVisibility.Unobtainable;
		}
		if (cfnm.includes('eyeglo_') || cfnm.includes('elemental_workshop_2') || cfnm.includes('hw06_spray') || cfnm.includes('huntguide_')) {
			return ItemVisibility.Unobtainable;
		}
		if (cfnm.includes('barbassault_egg') || cfnm.includes('barbassault_heal') || cfnm.includes('barbassault_vial') || cfnm.includes('barbassault_playericon') || cfnm.includes('barbassault_horn_')) {
			return ItemVisibility.Unobtainable;
		}

		if (cfnm.startsWith('arceuus_corpse') && cfnm.endsWith('initial')) {
			return ItemVisibility.NeverAdd;
		}


		if (cfnm.startsWith('pog_') && cfnm.endsWith('lamp')) {
			return ItemVisibility.NeverAdd;
		}

		if (
			[
				'100guide_',
				'cargo_crate_',
				'cluequest_',
				'rocko_',
				'placeholder_',
				'varlamore_nasty',
				'lost_schematic_',
				'beta_',
				'br_',
				'fake_',
				'cert_',
				'pickpocket_coin_',
				'poh_',
				'pvpchamp_',
				'bas_puzzle_',
				'clanwars_',
				'varlamore_fi',
				'con_contract_',
				'nzone',
				'pvpa_',
				'soul_wars_icon',
				'deadman_quest_lamp',
				'gim_icon_',
				'osb9_',
				'gim_playericon',
				'deadman_starter_tuna',
				'speedrun_trophies_',
				'bought_speedrun',
				'bh_xp_',
				'deadman_quest_',
				'trailblazer_reloaded_league_points',
				'bought_trailblazer_reloaded_league_points_negative',
				'any_nails'
			].some(suffix => cfnm?.startsWith(suffix))
		) {
			return ItemVisibility.NeverAdd;
		}
		if (['_worn', '_dummy', '_bh_inactive', '_deadman_starter', '_dummyitem'].some(suffix => cfnm?.endsWith(suffix))) {
			return ItemVisibility.NeverAdd;
		}
		if (
			['clue scroll', 'challenge scroll', 'casket', 'puzzle box', 'armour set',
				'_ornament_25',
				'_ornament_50',
				'_ornament_75',
				'_ornament_100',
			].some(str =>
				n.includes(str)
			)
		) {
			return ItemVisibility.NeverAdd;
		}
	}

	if (n.includes('crate of ') && item.id >= 30_000) {
		return ItemVisibility.Unobtainable;
	}

	return ItemVisibility.Regular;
}
