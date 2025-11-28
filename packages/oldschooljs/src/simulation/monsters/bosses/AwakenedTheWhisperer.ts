import type { Bank } from '@/structures/Bank.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { Monster } from '@/structures/Monster.js';
import { TheWhisperer } from './TheWhisperer.js';

class AwakenedTheWhispererSingleton extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		return TheWhisperer.kill(quantity, { ...options, isAwakened: true });
	}
}

export const AwakenedTheWhisperer: AwakenedTheWhispererSingleton = new AwakenedTheWhispererSingleton({
	id: 12_205,
	name: 'The Whisperer (Awakened)',
	aliases: ['awakened whisperer', 'the whisperer (awakened)']
});
