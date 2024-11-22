import type { MonsterKillOptions } from '../../../meta/types';
import type Bank from '../../../structures/Bank';
import Monster from '../../../structures/Monster';
import { TheLeviathan } from './TheLeviathan';

class AwakenedTheLeviathanSingleton extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		return TheLeviathan.kill(quantity, { ...options, isAwakened: true });
	}
}

export const AwakenedTheLeviathan = new AwakenedTheLeviathanSingleton({
	id: 12_215,
	name: 'The Leviathan (Awakened)',
	aliases: ['the leviathan (awakened)']
});
