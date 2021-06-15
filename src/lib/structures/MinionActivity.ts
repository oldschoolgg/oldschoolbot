import { reduceNumByPercent } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';

import { ActivityTaskData, ActivityTaskOptions } from '../types/minions';
import { formatDuration } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';

interface MinionActivityOptions {
	data: ActivityTaskData;
	message: KlasaMessage;
	str: string;
}

export class MinionActivity {
	boosts: string[] = [];
	data: ActivityTaskOptions;
	message: KlasaMessage;
	user: KlasaUser;
	str: string;

	constructor(options: MinionActivityOptions) {
		this.data = { ...options.data };
		this.message = options.message;
		this.user = options.message.author;
		this.str = options.str.replaceAll('{name}', this.user.minionName);
	}

	boost(name: string, percent: number) {
		this.data.duration = reduceNumByPercent(this.data.duration, percent);
		this.boosts.push(`${percent}% for ${name}`);
	}

	async start() {
		await addSubTaskToActivityTask(this.data);
		return `${this.str}. This trip will take ${formatDuration(this.data.duration)} to finish.`;
	}
}
