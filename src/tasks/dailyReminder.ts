import { Task } from 'klasa';

import { PerkTier, Time } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { noOp } from '../lib/util';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Task {
	async run() {
		const currentDate = Date.now();

		for (const user of this.client.users.values()) {
			if (getUsersPerkTier(user) < PerkTier.Two) continue;
			const lastVoteDate = user.settings.get(UserSettings.LastDailyTimestamp);
			if (lastVoteDate === -1) continue;

			const difference = currentDate - lastVoteDate;
			if (difference >= Time.Hour * 4) {
				await user.settings.update(UserSettings.LastDailyTimestamp, -1);
				await user.send(`Your daily is ready!`).catch(noOp);
			}
		}
	}
}
