import type { Bank } from '@/structures/Bank.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { Monster } from '@/structures/Monster.js';
import { DukeSucellus } from './DukeSucellus.js';

class AwakenedDukeSucellusSingleton extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		return DukeSucellus.kill(quantity, { ...options, isAwakened: true });
	}
}

export const AwakenedDukeSucellus = new AwakenedDukeSucellusSingleton({
	id: 12_192,
	name: 'Duke Sucellus (Awakened)',
	aliases: ['duke sucellus (awakened)']
});
