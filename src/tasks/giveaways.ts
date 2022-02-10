import { Task } from 'klasa';

import { prisma } from '../lib/settings/prisma';
import { handleGiveawayCompletion } from '../lib/util/giveaway';
import { logError } from '../lib/util/logError';

export default class extends Task {
	async init() {
		if (this.client.giveawayTicker) {
			clearTimeout(this.client.giveawayTicker);
		}
		const ticker = async () => {
			try {
				const result = await prisma.giveaway.findMany({
					where: {
						completed: false,
						finish_date: {
							lt: new Date()
						}
					}
				});

				await Promise.all(result.map(t => handleGiveawayCompletion(this.client, t)));
			} catch (err) {
				logError(err);
			} finally {
				this.client.giveawayTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
