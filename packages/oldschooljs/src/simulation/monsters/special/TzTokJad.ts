import { roll } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { Monster } from '@/structures/Monster.js';

export class TzTokJadClass extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add('Tokkul', 8032);
			loot.add('Fire cape');
			if (roll(options.onSlayerTask ? 100 : 200)) {
				loot.add('Tzrek-jad');
			}
		}

		return loot;
	}
}

export const TzTokJad: TzTokJadClass = new TzTokJadClass({
	id: 3127,
	name: 'TzTok-Jad',
	aliases: ['tztok-jad', 'jad', 'tztok jad']
});
