import { toSnakeCase } from 'remeda';

import { paramsToObj } from '../../util/paramsToObj.js';
import { splitVariations } from '../../util/variations.js';
import { stripHtmlComments } from '../../util.js';
import type { TemplateNode } from '../types.js';

const KEY_REMAPPINGS = {
	astab: 'attack_stab',
	aslash: 'attack_slash',
	acrush: 'attack_crush',
	amagic: 'attack_magic',
	arange: 'attack_ranged',

	dstab: 'defence_stab',
	dslash: 'defence_slash',
	dcrush: 'defence_crush',
	dmagic: 'defence_magic',
	drange: 'defence_ranged',

	str: 'melee_strength',
	rstr: 'ranged_strength',
	mdmg: 'magic_damage',
	attackrange: 'attack_range',
	combatstyle: 'combat_style'
};

const STAT_KEYS = [
	'attack_stab',
	'attack_slash',
	'attack_crush',
	'attack_magic',
	'attack_ranged',

	'defence_stab',
	'defence_slash',
	'defence_crush',
	'defence_magic',
	'defence_ranged',

	'melee_strength',
	'ranged_strength',
	'magic_damage'
];

const KEYS_TO_DELETE = ['altimage', 'image'];

export type BonusInfobox = Record<string, any>;

export function parseBonusesInfobox(node: TemplateNode): BonusInfobox[] {
	const objVersion = paramsToObj(node.params);
	const variations = splitVariations(objVersion);

	const results: BonusInfobox[] = [];

	for (const objVersion of variations) {
		const output: BonusInfobox = {};
		for (let [inputKey, val] of Object.entries(objVersion)) {
			let key = toSnakeCase(inputKey!.trim());

			if (
				KEYS_TO_DELETE.includes(key) ||
				key.includes('version_') ||
				key.includes('image_') ||
				key.includes('bucketname')
			) {
				delete output[key];
				continue;
			}
			if (key in KEY_REMAPPINGS) {
				const newKey = KEY_REMAPPINGS[key as keyof typeof KEY_REMAPPINGS];
				output[newKey] = output[key];
				delete output[key];
				key = newKey;
			}
			if (typeof val === 'string' && val.includes('<!--')) {
				val = stripHtmlComments(val);
			}
			if (!Number.isNaN(Number(val))) {
				output[key] = Number(val);
			} else {
				output[key] = val;
			}
			if (STAT_KEYS.includes(key) && !Number.isInteger(output[key]) && key !== 'attack_range') {
				throw new Error(`${key} is ${output[key]} ${typeof output[key]}`);
			}
		}
		results.push(output);
	}

	return results;
}
