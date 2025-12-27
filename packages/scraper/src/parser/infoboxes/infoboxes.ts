import type { FullItem } from 'oldschooljs';
import { omit } from 'remeda';

import type { ParseResult } from '../types.js';
import { getTemplates } from '../utils.js';
import { type BonusInfobox, parseBonusesInfobox } from './bonuses-infobox.js';
import { parseItemInfobox } from './item-infobox.js';

export function parseItemPage(result: ParseResult): FullItem[] {
	const templates = getTemplates(result);
	const infoboxes = templates.flat(100).filter((t: any) => t.name.toLowerCase().startsWith('infobox'));
	if (infoboxes.length === 0) {
		console.log(`No infoboxes found for page`);
	}

	const bonusesInfoboxes: BonusInfobox[] = infoboxes
		.filter((t: any) => t.name.toLowerCase().includes('bonus'))
		.flatMap(_raw => parseBonusesInfobox(_raw));
	const itemInfoboxes = infoboxes
		.filter((t: any) => t.name.toLowerCase().includes('item'))
		.flatMap(_raw => parseItemInfobox(_raw.params, bonusesInfoboxes));

	return itemInfoboxes.map(item => ({
		...omit(item as FullItem & { version: string }, ['version']),
		noteable: item.noteable ?? false,
		stackable: item.stackable ?? false,
		equipable: item.equipable ?? false,
		tradeable_on_ge: item.tradeable // TODO
	}));
}
