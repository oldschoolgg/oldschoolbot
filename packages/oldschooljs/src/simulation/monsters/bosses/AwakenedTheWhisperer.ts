import type { MonsterKillOptions } from '../../../meta/types';
import type Bank from '../../../structures/Bank';
import Monster from '../../../structures/Monster';
import { TheWhisperer } from './TheWhisperer';

class AwakenedTheWhispererSingleton extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		return TheWhisperer.kill(quantity, { ...options, isAwakened: true });
	}
}

export const AwakenedTheWhisperer = new AwakenedTheWhispererSingleton({
	id: 12_205,
	name: 'The Whisperer (Awakened)',
	aliases: ['awakened whisperer', 'the whisperer (awakened)']
});
