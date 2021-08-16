import { activity } from '@prisma/client';
import { Task } from 'klasa';

import { production } from '../config';
import { completeActivity, prisma } from '../lib/settings/prisma';

export default class extends Task {
	async init() {
		if (this.client.minionTicker) {
			clearTimeout(this.client.minionTicker);
		}
		const ticker = async () => {
			try {
				const activities: activity[] = await prisma.activity.findMany({
					where: {
						completed: false,
						finish_date: {
							gt: production ? '1' : 'now()'
						}
					}
				});

				await Promise.all(activities.map(completeActivity));
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
