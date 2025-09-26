import { LootTable } from 'oldschooljs';
import { isFunction, omit, omitBy } from 'remeda';
import { expect, it } from 'vitest';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { BOT_TYPE } from '../../src/lib/constants.js';

it(`${BOT_TYPE} KillableMonsters`, () => {
	const result = [...killableMonsters]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(m =>
			omitBy(
				m,
				(val, _key) => val instanceof LootTable || isFunction(val) || ['table', 'superior'].includes(_key)
			)
		);
	expect(result).toMatchSnapshot();
});

omit;
