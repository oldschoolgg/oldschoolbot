import type { MonsterKillOptions } from '@/structures/Monster.js';
import type {Bank} from '@/structures/Bank.js';
import {Monster } from '@/structures/Monster.js';
import { TheLeviathan } from './TheLeviathan.js';

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
