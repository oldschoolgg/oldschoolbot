import { baxtorianBathhousesActivity } from '@/lib/bso/baxtorianBathhouses.js';

import type { BathhouseTaskOptions } from '@/lib/types/minions.js';

export const bathhouseTask: MinionTask = {
	type: 'BaxtorianBathhouses',
	async run(data: BathhouseTaskOptions) {
		baxtorianBathhousesActivity(data);
	}
};
