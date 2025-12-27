import type { FullItem } from 'oldschooljs';

import { paramsToObj } from '../../util/paramsToObj.js';
import { splitVariations } from '../../util/variations.js';
import { stripHtmlComments } from '../../util.js';
import type { TemplateParam } from '../types.js';
import { parseBoolean } from '../utils.js';
import type { BonusInfobox } from './bonuses-infobox.js';

const BOOLEAN_KEYS = [
	'noteable',
	'tradeable',
	'placeholder',
	'equipable',
	'stackable',
	'exchange',
	'quest_item',
	'members',
	'alchable',
	'bankable',
	'edible',
	'stacks_in_bank'
];

const NUMERIC_KEYS = ['id', 'value', 'weight', 'respawn'];

const ARRAY_KEYS = ['options', 'league_region', 'worn_options'];

const KEY_REMAPPINGS = {
	quest: 'quest_item',
	stacksinbank: 'stacks_in_bank',
	removalupdate: 'removalupdate',
	wornoptions: 'worn_options'
} as const;

const KEYS_TO_DELETE = ['image', 'defver', 'gemwname'];

function parseInfoboxItem(infoboxObj: ItemInfobox): ItemInfobox {
	const out = { ...infoboxObj };
	for (const key of KEYS_TO_DELETE) {
		delete out[key];
	}
	for (let [key, value] of Object.entries(out)) {
		if (KEY_REMAPPINGS[key as keyof typeof KEY_REMAPPINGS]) {
			const newKey = KEY_REMAPPINGS[key as keyof typeof KEY_REMAPPINGS];
			out[newKey] = out[key];
			delete out[key];
			key = newKey;
		}

		if (ARRAY_KEYS.includes(key) && value && typeof value === 'string') {
			const SPLIT_CHARACTER = value.includes('&') ? '&' : ',';
			const arr = value
				.toLowerCase()
				.split(SPLIT_CHARACTER)
				.map((x: string) => x.trim())
				.filter(i => i !== 'no');
			if (arr.length > 0) {
				out[key] = arr;
			}
		} else if (BOOLEAN_KEYS.includes(key.toLowerCase())) {
			out[key] = parseBoolean(value);
		} else if (NUMERIC_KEYS.includes(key.toLowerCase()) && !isNaN(Number(value))) {
			out[key] = Number(value);
		}

		if (typeof out[key] === 'string' && out[key].includes('<!--')) {
			out[key] = stripHtmlComments(out[key]);
		}

		if (
			[
				'update',
				'removal_update',
				'removal',
				'worn_options',
				'options',
				'destroy',
				'release',
				'respawn',
				'league_region'
			].includes(key.toLowerCase()) &&
			(value.length === 0 || ['no', 'n/a'].includes(value.toLowerCase()))
		) {
			delete out[key];
		}
	}

	return out;
}

export type ItemInfobox = Record<string, any>;

export function parseItemInfobox(values: TemplateParam[], bonusesInfoboxes: BonusInfobox[]): FullItem[] {
	const objectVersion = paramsToObj(values) as { id?: string };
	if (objectVersion.id?.includes(',')) {
		const ids = objectVersion.id!.split(',').map(id => Number(id.trim()));
		delete objectVersion.id;
		for (let i = 0; i < ids.length; i++) {
			(objectVersion as any)[`id${i + 1}`] = ids[i];
		}
	}

	const variations = splitVariations(objectVersion);

	const results: FullItem[] = [];
	for (let i = 0; i < variations.length; i++) {
		const parsed = parseInfoboxItem(variations[i]);
		const bonusInfo = bonusesInfoboxes?.[i] || bonusesInfoboxes?.[0];
		if (bonusInfo) {
			parsed.equipment = bonusInfo;
		}

		if (typeof parsed.id === 'string' && parsed.id.includes(',')) {
			const ids = parsed.id.split(',').map(id => Number(id.trim()));
			for (const id of ids) {
				results.push({ ...(parsed as FullItem), id });
			}
		} else {
			results.push(parsed as FullItem);
		}
	}

	return results.filter(_item => {
		if (typeof _item.id === 'string') {
			if ((_item.id as string).startsWith('hist')) return false;
			else throw new Error(`Item has string id: ${_item.id}`);
		}
		return true;
	});
}
