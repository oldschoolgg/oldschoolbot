import { baxtorianBathhousesActivity } from '../../../lib/baxtorianBathhouses';
import type { BathhouseTaskOptions } from '../../../lib/types/minions';

export const bathhouseTask: MinionTask = {
	type: 'BaxtorianBathhouses',
	async run(data: BathhouseTaskOptions) {
		baxtorianBathhousesActivity(data);
	}
};
