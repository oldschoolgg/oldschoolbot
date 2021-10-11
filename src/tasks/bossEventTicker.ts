import { Task } from 'klasa';
import { createQueryBuilder } from 'typeorm';

import { bossEvents, startBossEvent } from '../lib/bossEvents';
import { BossEventTable } from '../lib/typeorm/BossEventTable.entity';

declare module 'klasa' {
	interface KlasaClient {
		__bossEventTicker: NodeJS.Timeout;
	}
}

export default class extends Task {
	async init() {
		if (this.client.__bossEventTicker) {
			clearTimeout(this.client.__bossEventTicker);
		}
		const ticker = async () => {
			try {
				const query = createQueryBuilder(BossEventTable)
					.select()
					.where('completed = false')
					.andWhere('start_date < now()');

				const result = await query.getMany();
				for (const act of result) {
					try {
						startBossEvent({
							boss: bossEvents.find(b => b.id === act.bossID)!,
							client: this.client,
							id: act.id
						});
					} catch (err: unknown) {
						this.client.wtf(err as Error);
					}
					act.completed = true;
					await act.save();
				}
			} catch (err) {
				console.error(err);
			} finally {
				this.client.__bossEventTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
