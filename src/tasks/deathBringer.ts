import { Task } from 'klasa';

import { Activity } from '../lib/constants';
import { ActivityTable } from '../lib/typeorm/ActivityTable.entity';

declare module 'klasa' {
	export interface KlasaClient {
		deathTicker: NodeJS.Timer;
	}
}

export default class extends Task {
	async init() {
		if (this.client.deathTicker) {
			clearTimeout(this.client.deathTicker);
		}
		const ticker = async () => {
			try {
				const revenantTrips = await ActivityTable.find({
					where: {
						completed: false,
						type: Activity.Revenants
					}
				});
				console.log(revenantTrips);
			} catch (err) {
				console.error(err);
			} finally {
				this.client.deathTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
