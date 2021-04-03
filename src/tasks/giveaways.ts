import { Task } from 'klasa';
import { createQueryBuilder } from 'typeorm';

import { GiveawayTable } from '../lib/typeorm/GiveawayTable.entity';

export default class extends Task {
	async init() {
		if (this.client.giveawayTicker) {
			clearTimeout(this.client.giveawayTicker);
		}
		const ticker = async () => {
			try {
				const query = createQueryBuilder(GiveawayTable)
					.select()
					.where('completed = false')
					.andWhere(`finish_date < now()`);
				const result = await query.getMany();
				await Promise.all(result.map(t => t.complete()));
			} catch (err) {
				console.error(err);
			} finally {
				this.client.giveawayTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
