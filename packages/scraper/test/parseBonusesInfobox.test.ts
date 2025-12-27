import { assert, describe, expect, test } from 'vitest';

import { parseBonusesInfobox } from '../src/parser/infoboxes/bonuses-infobox.js';
import type { TemplateNode } from '../src/parser/types.js';
import xxx from './infoboxestest.json' with { type: 'json' };

describe('parseBonusesInfobox', () => {
	test('test', () => {
		const bonusesRaw: TemplateNode = xxx.find(_p => _p.name.toLowerCase().includes('bonuses'))! as TemplateNode;
		expect(parseBonusesInfobox(bonusesRaw)).toEqual([
			{
				attack_crush: -10,
				attack_magic: 15,
				attack_ranged: -10,
				attack_slash: -10,
				attack_stab: -10,
				defence_crush: 25,
				defence_magic: 15,
				defence_ranged: -55,
				defence_slash: 30,
				defence_stab: 22,
				magic_damage: 2,
				prayer: 0,
				ranged_strength: 0,
				slot: 'shield',
				melee_strength: -2,
				version: 'Uncharged'
			},
			{
				attack_crush: -10,
				attack_magic: 15,
				attack_ranged: -10,
				attack_slash: -10,
				attack_stab: -10,
				defence_crush: 75,
				defence_magic: 15,
				defence_ranged: -5,
				defence_slash: 80,
				defence_stab: 72,
				magic_damage: 2,
				prayer: 0,
				ranged_strength: 0,
				slot: 'shield',
				melee_strength: -2,
				version: 'Charged'
			}
		]);
	});
});
