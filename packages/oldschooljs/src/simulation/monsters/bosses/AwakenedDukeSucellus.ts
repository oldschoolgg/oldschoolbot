import type { MonsterKillOptions } from '../../../meta/types';
import type Bank from '../../../structures/Bank';
import Monster from '../../../structures/Monster';
import { DukeSucellus } from './DukeSucellus';

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
