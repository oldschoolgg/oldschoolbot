import { Task } from 'klasa';

import { itemInventingActivity, ItemInventingOptions } from '../../../lib/invention/inventions';

export default class extends Task {
	async run(data: ItemInventingOptions) {
		itemInventingActivity(data);
	}
}
