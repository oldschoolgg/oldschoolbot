import { Bank, Items } from 'oldschooljs';

import { parseStringBank } from '@/lib/util/parseStringBank.js';
import { spawnPresets } from '@/mahoji/lib/testPotato/presets.js';

interface TestPotatoSpawnOptions {
	preset?: string;
	collectionlog?: boolean;
	item?: string;
	items?: string;
}

export async function handleTestPotatoSpawn(user: MUser, options: TestPotatoSpawnOptions) {
	const { preset, collectionlog, item, items } = options;
	const bankToGive = new Bank();
	if (preset) {
		const actualPreset = spawnPresets.find(i => i[0] === preset);
		if (!actualPreset) return 'Invalid preset';
		let b = actualPreset[1];
		if (actualPreset[0] === 'random') {
			b = new Bank();
			for (let i = 0; i < 1000; i++) {
				b.add(Items.random().id);
			}
		}
		bankToGive.add(b);
	}
	if (item) {
		try {
			bankToGive.add(Items.getOrThrow(item).id);
		} catch (err) {
			return err as string;
		}
	}
	if (items) {
		for (const [i, qty] of parseStringBank(items, undefined, true)) {
			bankToGive.add(i.id, qty || 1);
		}
	}

	await user.addItemsToBank({ items: bankToGive, collectionLog: Boolean(collectionlog) });
	return `Spawned: ${bankToGive.toString().slice(0, 1800)}.`;
}
