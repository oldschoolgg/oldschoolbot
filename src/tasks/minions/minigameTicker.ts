import { Task } from 'klasa';

import { Tasks } from '../../lib/constants';
import { MinigameTickerTaskData } from '../../lib/types/minions';
import removeSubTasksFromActivityTask from '../../lib/util/removeSubTasksFromActivityTask';
import runActivityTask from '../../lib/util/runActivityTask';

export default class extends Task {
	async run(data: MinigameTickerTaskData) {
		const now = Date.now();
		const tasksThatWereFinished: number[] = [];

		for (const minigameTaskData of data.subTasks) {
			// If the current task being checked finishes past now, break.
			if (minigameTaskData.finishDate > now) break;

			await runActivityTask(this.client, Tasks.RaidsActivity, minigameTaskData);

			tasksThatWereFinished.push(minigameTaskData.id);
		}

		if (tasksThatWereFinished.length === 0) return;

		await removeSubTasksFromActivityTask(
			this.client,
			Tasks.MinigameTicker,
			tasksThatWereFinished
		);
	}
}
