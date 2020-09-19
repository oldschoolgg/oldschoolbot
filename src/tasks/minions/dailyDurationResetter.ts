import { Gateway, Stopwatch, Task } from 'klasa';

import { Events } from '../../lib/constants';

export default class extends Task {
	async run() {
		const timer = new Stopwatch();

		// Set "minion.dailyDuration" of all users where it is > 0.
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const res = await this.client.providers.default.runAll(
			`UPDATE users SET "minion.dailyDuration" = 0 WHERE "minion.dailyDuration" > 0 RETURNING id;`
		);

		const updatedIDs = res.map((user: any) => user.id);

		// Of all the users we reset to 0, sync their settings.
		for (const id of updatedIDs) {
			(this.client.gateways.get('users') as Gateway)!.get(id)?.sync(true);
		}

		this.client.emit(
			Events.Log,
			`Cleared durations of ${updatedIDs.length} users in ${timer.stop()}.`
		);
	}
}
