import { percentChance } from 'e';
import { Task } from 'klasa';

import { Activity } from '../lib/constants';
import { ActivityTable } from '../lib/typeorm/ActivityTable.entity';
import { RevenantOptions } from '../lib/types/minions';

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
				for (const trip of revenantTrips) {
					const data = trip.data as RevenantOptions;
					if (data.rolledForDeath) continue;
					// dont roll for death within first 30% of trip
					if (!percentChance(20)) continue;
					if (percentChance(data.deathChance)) {
						trip.data = { ...trip.data, rolledForDeath: true, died: true };
						await trip.save();
						await trip.complete();
					} else {
						trip.data = { ...trip.data, rolledForDeath: true, died: false };
						await trip.save();
					}
				}
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
