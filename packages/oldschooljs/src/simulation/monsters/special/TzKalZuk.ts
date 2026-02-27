import { roll } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import { Monster, type MonsterKillOptions } from '@/structures/Monster.js';

export class TzKalZukClass extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add('Tokkul', 16_440);
			loot.add('Infernal cape');
			if (roll(options.onSlayerTask ? 75 : 100)) {
				loot.add('Jal-nib-rek');
			}
		}

		return loot;
	}
}

export const TzKalZuk: TzKalZukClass = new TzKalZukClass({
	id: 7706,
	name: 'TzKal-Zuk',
	aliases: ['tzkal-zuk', 'zuk', 'inferno']
});
