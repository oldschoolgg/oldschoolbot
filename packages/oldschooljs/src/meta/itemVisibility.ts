import { USELESS_ITEMS } from '@/meta/item-lists.js';
import { type FullItem, type Item, ItemGroups, ItemVisibility } from '../../src/index.js';

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
};

export function checkItemVisibility(item: (Item | FullItem) & Partial<PossibleOldOptions>): ItemVisibility {
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
		item.name.trim().length === 0 ||
		item.name.endsWith('special attack')
	) {
		return ItemVisibility.NeverAdd;
	}

	if (
		[
			4553,
			4554,
			4555,
			4556,
			4500,
			4597,
			4598,
			4211 // roving_elf_crystal
		].includes(item.id)
	) {
		return ItemVisibility.NeverAdd;
	}
	if (['Dummy'].includes(item.name)) {
		return ItemVisibility.NeverAdd;
	}

	if ([4519, 678].includes(item.id)) {
		return ItemVisibility.Unobtainable;
	}

	if (item.id > 3273 && item.id < 3324) {
		return ItemVisibility.NeverAdd;
	}
	if (item.id > 11142 && item.id < 11150) {
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

		if (
			[
				'hw20_poh_pumpkin_build',
				'xm21_snow',
				'lotg_grubfoot_follower_obj',
				'deadman_apocalypse_bow',
				'deadman_apocalypse_staff',
				'league_bank_heist_teleport',
				'deadman_apocalypse_sword',
				'echo_godsword',
				'weapon_of_sol',
				'league_clue_compass_teleport',
				'league_relic_pocket_kingdom_item',
				'leprechauns_vault',
				'thousand_bone_door',
				'crystal_blessing',
				'sunlight_cuffs',
				'drygore_blowpipe_loaded',
				'ring_of_kings',
				'tangled_lizard_charged',
				'amulet_of_kings',
				'thunder_khopesh',
				'tangled_lizard_uncharged',
				'damned_gloves',
				'drygore_blowpipe',
				'mokhaiotl_puzzle_lore_tablet'
			].includes(cfnm)
		) {
			return ItemVisibility.Unobtainable;
		}

		if (
			[
				'tiara_soul',
				'speedrun_points',
				'league_5_league_points',
				'league_5_league_points_negative',
				'trailblazer_reloaded_league_points',
				'trailblazer_reloaded_league_points_negative',
				'bought_trailblazer_reloaded_league_points_negative',
				'deadman_points',
				'bas_diving_helmet_unfinished',
				'bas_diving_backpack_unfinished',
				'devils_element',
				'easter24_reward_book_easter_open',
				'sunlight_antler',
				'moonlight_antler',
				'hg_lootsack_droptracking'
			].includes(cfnm)
		) {
			return ItemVisibility.NeverAdd;
		}

		if (cfnm.includes('_league_points')) {
			return ItemVisibility.NeverAdd;
		}

		if (
			[
				'gauntlet_',
				'magic_rock_of_',
				'gathering_event_',
				'forestry_poh_',
				'league_4_',
				'tgod_tablet',
				'vmq4_moki_tablet',
				'hw24_poh_'
			].some(suffix => cfnm?.startsWith(suffix))
		) {
			return ItemVisibility.Unobtainable;
		}
		if (['_bh', 'echoing_orb'].some(suffix => cfnm?.endsWith(suffix))) {
			return ItemVisibility.Unobtainable;
		}

		if (
			[
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
				'agility_jump',
				'agility_climb',
				'agility_strength',
				'agility_swing',

				'wgs_henge_',
				'wgs_guthix_',
				'dt2_lassar_',
				'dt2_stranglewood',
				'dt2_ghorrock_',
				'dwarf_rock_',
				'dt2_scar_',
				'troll_key_',
				'swamp_cave_',
				'regicide_alchemy_',
				'easter_egg_2005_',
				'deadman_blighted_',
				'pickpocket_guide',
				'regicide_barrel_',
				'boardgames_',
				'fenk_',
				'100_osman_',
				'brain_inv_crate_',
				'hk_',
				'slice_artifac',
				'pattern_'
			].some(suffix => cfnm?.includes(suffix))
		) {
			return ItemVisibility.Unobtainable;
		}
		if (cfnm.includes('slug2_') || cfnm.includes('dorgesh_powerstation') || cfnm.includes('surok_')) {
			return ItemVisibility.Unobtainable;
		}
		if (
			cfnm.includes('eyeglo_') ||
			cfnm.includes('elemental_workshop_2') ||
			cfnm.includes('hw06_spray') ||
			cfnm.includes('huntguide_')
		) {
			return ItemVisibility.Unobtainable;
		}
		if (
			cfnm.includes('barbassault_egg') ||
			cfnm.includes('barbassault_heal') ||
			cfnm.includes('barbassault_vial') ||
			cfnm.includes('barbassault_playericon') ||
			cfnm.includes('barbassault_horn_')
		) {
			return ItemVisibility.Unobtainable;
		}

		if (cfnm.startsWith('arceuus_corpse') && cfnm.endsWith('initial')) {
			return ItemVisibility.NeverAdd;
		}
		if (cfnm.startsWith('league_5') && cfnm.endsWith('_scroll')) {
			return ItemVisibility.Unobtainable;
		}

		if (cfnm.startsWith('pog_') && cfnm.endsWith('lamp')) {
			return ItemVisibility.NeverAdd;
		}
		if (cfnm.startsWith('brew_') && cfnm.endsWith('_monkey')) {
			return ItemVisibility.Unobtainable;
		}
		if (cfnm.startsWith('slayer_') && cfnm.endsWith('_object')) {
			return ItemVisibility.Unobtainable;
		}
		if (
			[
				'magictraining_bones',
				'magictraining_peachspell',
				'magictraining_encha',
				'magictraining_dragonstone'
			].some(_s => cfnm.startsWith(_s))
		) {
			return ItemVisibility.Unobtainable;
		}

		if (
			[
				'100guide_',
				'cargo_crate_',
				'cluequest_',
				'rocko_',
				'placeholder_',
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
				'any_nails',
				'viking_jug',
				'viking_buck',
				'viking_airti',

				'varlamore_nasty',
				'varlamore_fi',
				'varlamore_nice',
				'aluft_'
			].some(suffix => cfnm?.startsWith(suffix))
		) {
			return ItemVisibility.NeverAdd;
		}
		if (
			['_worn', '_dummy', '_bh_inactive', '_deadman_starter', '_dummyitem'].some(suffix => cfnm?.endsWith(suffix))
		) {
			return ItemVisibility.NeverAdd;
		}
		if (
			[
				'clue scroll',
				'challenge scroll',
				'casket',
				'puzzle box',
				'armour set',
				'_ornament_25',
				'_ornament_50',
				'_ornament_75',
				'_ornament_100'
			].some(str => n.includes(str))
		) {
			return ItemVisibility.NeverAdd;
		}
	}

	if (n.includes('crate of ') && item.id >= 30_000) {
		return ItemVisibility.Unobtainable;
	}

	return ItemVisibility.Regular;
}
