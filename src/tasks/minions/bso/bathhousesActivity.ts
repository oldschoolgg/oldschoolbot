import { BathhouseTaskOptions, baxtorianBathhousesActivity } from '../../../lib/baxtorianBathhouses';

export const bathhouseTask: MinionTask = {
	type: 'BaxtorianBathhouses',
	async run(data: BathhouseTaskOptions) {
		baxtorianBathhousesActivity(data);
	}
};
