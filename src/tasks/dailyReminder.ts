import { noOp, Time } from 'e';
import { Task, TaskStore } from 'klasa';

import { production } from '../config';
import { prisma } from '../lib/settings/prisma';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { logError } from '../lib/util/logError';

declare module 'klasa' {
	interface KlasaClient {
		__dailyReminderInterval: NodeJS.Timeout;
	}
}

export default class extends Task {
	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	async init() {
		if (this.client.__dailyReminderInterval) {
			clearTimeout(this.client.__dailyReminderInterval);
		}
		const ticker = async () => {
			try {
				const result = await prisma.$queryRawUnsafe<{ id: string }[]>(
					'SELECT id FROM users WHERE bitfield && \'{2,3,4,5,6,7,8}\'::int[] AND "lastDailyTimestamp" != -1 AND to_timestamp("lastDailyTimestamp" / 1000) < now() - interval \'12 hours\';'
				);

				for (const row of result.values()) {
					if (!production) continue;
					const user = await globalClient.fetchUser(row.id);
					if (user.settings.get(UserSettings.LastDailyTimestamp) === -1) continue;

					try {
						await user.settings.update(UserSettings.LastDailyTimestamp, -1);
					} catch (e) {
						logError(e, {
							msg: 'Unable to update settings, syncing user first.',
							user_id: user.id,
							context: 'dailyReminder.ts'
						});
						await user.settings.sync(true);
						await user.settings.update(UserSettings.LastDailyTimestamp, -1);
					}
					await user.send('Your daily is ready!').catch(noOp);
				}
			} catch (err) {
				logError(err);
			} finally {
				this.client.__dailyReminderInterval = setTimeout(ticker, Number(Time.Minute));
			}
		};
		ticker();
	}

	async run() {}
}
