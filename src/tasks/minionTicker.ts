import { Task } from 'klasa';
import { createQueryBuilder } from 'typeorm';

import { production } from '../config';
import { ActivityTable } from '../lib/typeorm/ActivityTable.entity';

export default class extends Task {
	async init() {
		if (this.client.minionTicker) {
			clearTimeout(this.client.minionTicker);
		}
		const ticker = async () => {
			try {
				const query = createQueryBuilder(ActivityTable).select().where('completed = false');

				if (production) {
					query.andWhere('finish_date < now()');
				} else {
					query.andWhere("start_date + interval '10 seconds' < now()");
				}

				const result = await query.getMany();
				await Promise.all(result.map(r => r.complete()));
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
