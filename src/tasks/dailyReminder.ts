import { Task } from 'klasa';

import { client } from '../index';
import { PerkTier, Time } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { noOp } from '../lib/util';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Task {
	async init() {
		if (this.client.dailyReminderTicker) {
			clearInterval(this.client.dailyReminderTicker);
		}
		this.client.dailyReminderTicker = setInterval(this.dailyReminderTick.bind(this), Time.Second * 60);
	}

	async run() {
		this.dailyReminderTick();
	}

	async dailyReminderTick() {
		const currentDate = Date.now();

		const result = await client.query<{ id: string }[]>('SELECT id FROM users;');

		if (result.length === 0) return null;
		for (const userID of result.values()) {
			const user = await client.users.fetch(userID.id);
			if (getUsersPerkTier(user) < PerkTier.Two) continue;
			const lastVoteDate = user.settings.get(UserSettings.LastDailyTimestamp);
			if (lastVoteDate === -1) continue;

			const difference = currentDate - lastVoteDate;
			if (difference >= Time.Hour * 12) {
				await user.settings.update(UserSettings.LastDailyTimestamp, -1);
				await user.send('Your daily is ready!').catch(noOp);
			}
		}
	}
}
