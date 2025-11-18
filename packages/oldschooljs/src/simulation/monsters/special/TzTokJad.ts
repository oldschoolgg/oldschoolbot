import { roll } from '@oldschoolgg/rng';

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

const TzTokJad = new TzTokJadClass({
	id: 3127,
	name: 'TzTok-Jad',
	aliases: ['tztok-jad', 'jad', 'tztok jad']
});

export default TzTokJad;
