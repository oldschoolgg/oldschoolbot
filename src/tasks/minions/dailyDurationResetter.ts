import { Task, TaskStore } from 'klasa';
import { UserSettings } from '../../lib/UserSettings';

export default class extends Task {
	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory, { enabled: false });
	}

	async run() {
		for (const user of this.client.users.values()) {
			if (user.settings.get(UserSettings.Minion.HasBought)) {
				user.settings.reset(UserSettings.Minion.DailyDuration);
			}
		}
	}
}
