import { Task } from 'klasa';
import { BathhouseTaskOptions, baxtorianBathhousesActivity } from '../../../lib/baxtorianBathhouses';

export default class extends Task {
	async run(data: BathhouseTaskOptions) {
		baxtorianBathhousesActivity(data)
	}
}
