import { omit } from 'remeda';
import { expect, it } from 'vitest';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { BOT_TYPE } from '../../src/lib/constants.js';
import { serializeSnapshotItem } from './userutil.js';

it(`${BOT_TYPE} KillableMonsters`, () => {
	const result = [...killableMonsters]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
		.map((m: KillableMonster) => {
			const obj: any = {
				...omit(m, ['equippedItemBoosts', 'itemInBankBoosts', 'aliases'])
			};

			if (m.itemInBankBoosts) {
				obj.itemInBankBoosts = m.itemInBankBoosts?.map(ib => Object.entries(ib));
			}
			if (m.equippedItemBoosts) {
				obj.equippedItemBoosts = m.equippedItemBoosts?.map(eb => [
					eb.gearSetup,
					eb.required ?? false,
					eb.items.map(item => Object.values(item))
				]);
			}

			return obj;
		});
	expect(result).toMatchSnapshot();
});

omit;
