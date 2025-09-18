import type { MonsterKillOptions } from '@/structures/Monster.js';
import type {Bank} from '@/structures/Bank.js';
import {Monster } from '@/structures/Monster.js';
import { Vardorvis } from './Vardorvis.js';

class AwakenedVardorvisSingleton extends Monster {
	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		return Vardorvis.kill(quantity, { ...options, isAwakened: true });
	}
}

export const AwakenedVardorvis = new AwakenedVardorvisSingleton({
	id: 12_224,
	name: 'Vardorvis (Awakened)',
	aliases: ['vardorvis (awakened)']
});
