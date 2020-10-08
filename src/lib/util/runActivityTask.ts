import { Client } from 'discord.js';

import { ActivityTaskOptions, MinionActivityTask } from '../types/minions';

export default function runActivityTask(
	client: Client,
	taskName: MinionActivityTask,
	data: ActivityTaskOptions
) {
	const task = client.tasks.get(taskName);

	if (!task) {
		throw `Missing essential task: ${taskName}.`;
	}

	return (task.run(data) as Promise<any>).catch(console.error);
}
