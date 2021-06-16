import { Task } from 'klasa';
import { createQueryBuilder } from 'typeorm';

import { ActivityTable } from '../lib/typeorm/ActivityTable.entity';

export default class extends Task {
	async init() {
		if (this.client.minionTicker) {
			clearTimeout(this.client.minionTicker);
		}
		const ticker = async () => {
			try {
				const query = createQueryBuilder(ActivityTable)
					.select()
					.where('completed = false')
					.andWhere('finish_date < now()');

				const result = await query.getMany();
				console.log(`${result.length} tasks are ready to complete.`);
				for (const task of result) {
					console.log(`${task.userID}[${task.type}] trip is running`);
					await task.complete();
					console.log('Task complete');
				}
			} catch (err) {
				console.error(err);
			} finally {
				this.client.minionTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
