import { Task } from 'klasa';
import { UserSettings } from '../../lib/UserSettings';

export default class extends Task {
	async run() {
		for (const user of this.client.users.values()) {
			if (user.settings.get(UserSettings.Minion.HasBought)) {
				user.settings.reset(UserSettings.Minion.DailyDuration);
			}
		}
	}
}
