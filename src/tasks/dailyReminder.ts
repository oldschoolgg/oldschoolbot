import { Task } from 'klasa';

import { client } from '../index';
import { Time } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { noOp } from '../lib/util';

const DailyInterval = 12 * 60 * 60;
const DailyTickInterval = Time.Second * 60;

export default class extends Task {
	async init() {
		if (this.client.dailyReminderTicker) {
			clearInterval(this.client.dailyReminderTicker);
		}
		this.client.dailyReminderTicker = setInterval(this.dailyReminderTick.bind(this), DailyTickInterval);
	}

	async run() {
		this.dailyReminderTick();
	}

	async dailyReminderTick() {
		const currentDate = Date.now();

		const dailyReady = currentDate - DailyInterval;
		const result = await client.query<{ id: string }[]>(
			`SELECT id FROM users WHERE bitfield && '{2,3,4,5,6}'::int[] AND "lastDailyTimestamp" != -1 AND "lastDailyTimestamp" < ${dailyReady};`
		);

		if (result.length === 0) return null;
		for (const userID of result.values()) {
			const user = await client.users.fetch(userID.id);

			await user.settings.update(UserSettings.LastDailyTimestamp, -1);
			await user.send('Your daily is ready!').catch(noOp);
		}
	}
}
