import { Task } from 'klasa';

import { Activity, Tasks } from '../../lib/constants';
import { MonsterKillingTickerTaskData } from '../../lib/types/minions';
import removeSubTasksFromActivityTask from '../../lib/util/removeSubTasksFromActivityTask';
import runActivityTask from '../../lib/util/runActivityTask';

export default class extends Task {
	async run(data: MonsterKillingTickerTaskData) {
		const now = Date.now();
		const tasksThatWereFinished: number[] = [];

		for (const monsterKillingTaskData of data.subTasks) {
			// If the current task being checked finishes past now, break.
			if (monsterKillingTaskData.finishDate > now) break;

			runActivityTask(
				this.client,
				monsterKillingTaskData.type === Activity.MonsterKilling
					? Tasks.MonsterActivity
					: Tasks.GroupMonsterActivity,
				monsterKillingTaskData
			);

			tasksThatWereFinished.push(monsterKillingTaskData.id);
		}

		if (tasksThatWereFinished.length === 0) return;

		await removeSubTasksFromActivityTask(
			this.client,
			Tasks.MonsterKillingTicker,
			tasksThatWereFinished
		);
	}
}
