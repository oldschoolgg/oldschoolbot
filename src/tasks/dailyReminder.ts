import { Time } from 'e';
import { Task } from 'klasa';

import { production } from '../config';
import { client } from '../index';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { noOp } from '../lib/util';

const dailyInterval = 4 * Time.Hour;
const dailyTickInterval = Time.Second * 60;

export default class extends Task {
	async init() {
		if (!production) return;
		if (this.client.dailyReminderTicker) {
			clearInterval(this.client.dailyReminderTicker);
		}
		this.client.dailyReminderTicker = setInterval(this.dailyReminderTick.bind(this), dailyTickInterval);
	}

	async run() {
		this.dailyReminderTick();
	}

	async dailyReminderTick() {
		const currentDate = Date.now();

		const dailyReady = currentDate - dailyInterval;
		const result = await client.query<{ id: string }[]>(
			`SELECT id FROM users WHERE bitfield && '{2,3,4,5,6}'::int[] AND "lastDailyTimestamp" != -1 AND "lastDailyTimestamp" < ${dailyReady};`
		);

		for (const row of result.values()) {
			const user = await client.users.fetch(row.id);

			await user.settings.update(UserSettings.LastDailyTimestamp, -1);
			await user.send('Your daily is ready!').catch(noOp);
		}
	}
}
