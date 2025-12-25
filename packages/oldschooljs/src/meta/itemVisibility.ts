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
		if (cfnm.startsWith('skillguide')) {
			return ItemVisibility.Unobtainable;
		}
		if (
			[
				'100guide_',
				'pickpocket_guide_',
				'cargo_crate_',
				'rocko_',
				'placeholder_',
				'lost_schematic_',
				'beta_',
				'br_',
				'fake_',
				'cert_',
				'poh_',
				'raids_storage',
				'bas_puzzle_',
				'con_contract_',
				'slayerguide_',
				'nzone_',
				'pvpa_'
			].some(suffix => cfnm?.startsWith(suffix))
		) {
			return ItemVisibility.NeverAdd;
		}
		if (['_worn', '_dummy'].some(suffix => cfnm?.endsWith(suffix))) {
			return ItemVisibility.NeverAdd;
		}
		if (
			['clue scroll', 'challenge scroll', 'casket', 'puzzle box', 'armour set'].some(str =>
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
