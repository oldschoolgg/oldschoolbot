import { reduceNumByPercent } from 'e';

import { ActivityTaskOptions } from '../types/minions';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';

export class MinionActivity {
	boosts: string[] = [];
	message: string | null = null;
	data: ActivityTaskOptions;

	constructor(data: ActivityTaskOptions) {
		this.data = { ...data };
	}

	boost(name: string, percent: number) {
		this.data.duration = reduceNumByPercent(this.data.duration, percent);
		this.boosts.push(`${percent}% for ${name}`);
	}

	async start() {
		await addSubTaskToActivityTask(this.data);
	}
}
