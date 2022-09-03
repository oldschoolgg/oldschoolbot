import { Task } from 'klasa';

import { prisma } from '../lib/settings/prisma';
import { handleGiveawayCompletion } from '../lib/util/giveaway';
import { logError } from '../lib/util/logError';

export default class extends Task {
	async init() {
		if (globalClient.giveawayTicker) {
			clearTimeout(globalClient.giveawayTicker);
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

				await Promise.all(result.map(t => handleGiveawayCompletion(t)));
			} catch (err) {
				logError(err);
			} finally {
				globalClient.giveawayTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
