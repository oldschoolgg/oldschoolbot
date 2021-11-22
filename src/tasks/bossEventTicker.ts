import { Task } from 'klasa';

import { production } from '../config';
import { bossEvents, startBossEvent } from '../lib/bossEvents';
import { prisma } from '../lib/settings/prisma';
import { BossEvent } from '.prisma/client';

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
				const events: BossEvent[] = await prisma.bossEvent.findMany({
					where: {
						completed: false,
						start_date: production
							? {
									lt: new Date()
							  }
							: undefined
					}
				});

				await prisma.bossEvent.updateMany({
					where: {
						id: {
							in: events.map(i => i.id)
						}
					},
					data: {
						completed: true
					}
				});

				for (const act of events) {
					try {
						startBossEvent({
							boss: bossEvents.find(b => b.id === act.boss_id)!,
							client: this.client,
							id: act.id
						});
					} catch (err: unknown) {
						this.client.wtf(err as Error);
					}
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
