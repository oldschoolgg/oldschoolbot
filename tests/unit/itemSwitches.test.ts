import { writeFileSync } from 'node:fs';
import { getItemOrThrow } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs';
import { expect, test } from 'vitest';

import { BOT_TYPE } from '../../src/lib/constants';
import { itemDataSwitches } from '../../src/lib/data/itemAliases';
import { itemNameFromID } from '../../src/lib/util/smallUtils';

test('Item Switches', () => {
	writeFileSync(
		`tests/unit/snapshots/itemSwitches.${BOT_TYPE}.json`,
		`${JSON.stringify(
			itemDataSwitches.map(a => ({
				from: `${itemNameFromID(a.from)} [${a.from}]`,
				to: `${itemNameFromID(a.to)} [${a.to}]`
			})),
			null,
			'	'
		)}\n`
	);
	expect(getItemOrThrow('Ultor ring').equipment?.melee_strength).toBe(12);
	expect(getItemOrThrow('Ultor ring').id).toBe(25485);
	expect(getItemOrThrow('Ultor ring').equipment?.slot).toBe(EquipmentSlot.Ring);
});
