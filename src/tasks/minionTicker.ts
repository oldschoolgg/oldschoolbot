import { Activity } from '@prisma/client';
import { Task } from 'klasa';

import { production } from '../config';
import { completeActivity, prisma } from '../lib/settings/prisma';
import { logError } from '../lib/util/logError';

export default class extends Task {
	async init() {
		if (this.client.minionTicker) {
			clearTimeout(this.client.minionTicker);
		}
		const ticker = async () => {
			try {
				const activities: Activity[] = await prisma.activity.findMany({
					where: {
						completed: false,
						finish_date: production
							? {
									lt: new Date()
							  }
							: undefined
					}
				});

				await prisma.activity.updateMany({
					where: {
						id: {
							in: activities.map(i => i.id)
						}
					},
					data: {
						completed: true
					}
				});

				await Promise.all(activities.map(completeActivity));
			} catch (err) {
				logError(err);
			} finally {
				this.client.minionTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
