import { Time } from 'e';
import { Task } from 'klasa';
import { createQueryBuilder } from 'typeorm';

import { production } from '../config';
import { ActivityTable } from '../lib/typeorm/ActivityTable.entity';
import { GiveawayTable } from '../lib/typeorm/GiveawayTable.entity';

export default class extends Task {
	async init() {
		if (this.client.analyticsInterval) {
			clearInterval(this.client.analyticsInterval);
		}
		this.client.analyticsInterval = setInterval(
			this.analyticsTick.bind(this),
			Time.Minute * 20
		);

		if (this.client.minionTicker) {
			clearTimeout(this.client.minionTicker);
		}
		const ticker = async () => {
			try {
				const query = createQueryBuilder(GiveawayTable).select().where('completed = false');
				if (production) {
					query.andWhere(`finish_date < now()`);
				}
				const result = await query.getMany();
				await Promise.all(result.map(t => t.complete()));
			} catch (err) {
				console.error(err);
			} finally {
				this.client.minionTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}
}
