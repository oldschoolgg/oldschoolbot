import { describe, expect, test } from 'vitest';

import { parseBonusesInfobox } from '../src/parser/infoboxes/bonuses-infobox.js';
import type { TemplateNode } from '../src/parser/types.js';
import { paramsToObj } from '../src/util/paramsToObj.js';
import xxx from './infoboxestest.json' with { type: 'json' };

describe('paramsToObj', () => {
	test('test', () => {
		const bonusesRaw: TemplateNode = xxx.find(_p => _p.name.toLowerCase().includes('bonuses'))! as TemplateNode;

		const parsed = paramsToObj(bonusesRaw!.params as any);
		expect(parsed).toEqual({
			acrush: '-10',
			altimage1: '180px',
			altimage2: '180px',
			amagic: '+15',
			arange: '-10',
			aslash: '-10',
			astab: '-10',
			dcrush1: '+25',
			dcrush2: '+75',
			dmagic: '+15',
			drange1: '-55',
			drange2: '-5',
			dslash1: '+30',
			dslash2: '+80',
			dstab1: '+22',
			dstab2: '+72',
			image1: '180px',
			image2: '180px',
			mdmg: '2',
			prayer: '0',
			rstr: '0',
			slot: 'shield',
			str: '-2',
			version1: 'Uncharged',
			version2: 'Charged'
		});

		expect(parseBonusesInfobox(bonusesRaw)).toEqual([
			{
				attack_crush: -10,
				attack_magic: 15,
				attack_range: -10,
				attack_slash: -10,
				attack_stab: -10,
				defence_crush: 25,
				defence_magic: 15,
				defence_range: -55,
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
				attack_range: -10,
				attack_slash: -10,
				attack_stab: -10,
				defence_crush: 75,
				defence_magic: 15,
				defence_range: -5,
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
