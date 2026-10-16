import { USELESS_ITEMS } from '@/structures/ItemsClass.js';
import type { MoidSourceItem } from './types.js';

const ignoredConfigSubstrings = ['_riddle', '_skillguide_'];
const ignoredConfigPrefixes = [
	'cargo_crate_',
	'dummy_',
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
];
const ignoredConfigSuffixes = ['_worn', '_dummy'];
const ignoredNameParts = ['clue scroll', 'challenge scroll', 'casket', 'puzzle box', 'armour set'];

export function getItemExclusionReason(item: MoidSourceItem): string | null {
	const name = item.name.trim().toLowerCase();
	const configName = item.configName.toLowerCase();

	if (name.length === 0) return 'empty item name';
	if (name === 'null') return 'null item name';
	if (ignoredConfigSubstrings.some(part => configName.includes(part))) return 'excluded config name';
	if (ignoredConfigPrefixes.some(prefix => configName.startsWith(prefix))) return 'excluded config prefix';
	if (ignoredConfigSuffixes.some(suffix => configName.endsWith(suffix))) return 'excluded config suffix';
	if (ignoredNameParts.some(part => name.includes(part))) return 'excluded item name';
	if (USELESS_ITEMS.includes(item.id)) return 'USELESS_ITEMS';
	return null;
}

export function parseExplicitItemIDs(args: string[]): number[] | null {
	if (args.length === 0) return null;

	const parsedIDs = args.map(Number);
	const invalidArgs = args.filter((_, index) => !Number.isSafeInteger(parsedIDs[index]) || parsedIDs[index]! <= 0);
	if (invalidArgs.length > 0) {
		throw new Error(`Invalid item ID argument${invalidArgs.length === 1 ? '' : 's'}: ${invalidArgs.join(', ')}`);
	}

	return [...new Set(parsedIDs)];
}
