import { Task } from 'klasa';

import { prisma } from '../lib/settings/prisma';
import { runTameTask } from '../lib/tames';

export default class extends Task {
	async init() {
		if (this.client.tameTicker) {
			clearTimeout(this.client.tameTicker);
		}
		const ticker = async () => {
			try {
				const tameTasks = await prisma.tameActivity.findMany({
					where: {
						finish_date: {
							lt: new Date()
						},
						completed: false
					},
					include: {
						tame: true
					}
				});

				await prisma.tameActivity.updateMany({
					where: {
						id: {
							in: tameTasks.map(i => i.id)
						}
					},
					data: {
						completed: true
					}
				});

				for (const task of tameTasks) {
					runTameTask(task, task.tame);
				}
			} catch (err) {
				console.error(err);
			} finally {
				this.client.tameTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
