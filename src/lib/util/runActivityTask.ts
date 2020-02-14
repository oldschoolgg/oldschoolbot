import { Client } from 'discord.js';

import { MinionActivityTask, MinionActivityTaskData } from '../types/minions';

export default function runActivityTask(
	client: Client,
	taskName: MinionActivityTask,
	data: MinionActivityTaskData
) {
	const task = client.tasks.get(taskName);

	if (!task) {
		throw `Missing essential task: ${taskName}.`;
	}

	return (task.run(data) as Promise<any>).catch(console.error);
}
