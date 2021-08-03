import { Task } from 'klasa';
import { FindConditions, LessThan } from 'typeorm';

import { production } from '../config';
import { TameActivityTable } from '../lib/typeorm/TameActivityTable.entity';

export default class extends Task {
	async init() {
		if (this.client.tameTicker) {
			clearTimeout(this.client.tameTicker);
		}
		const ticker = async () => {
			try {
				let opts: FindConditions<TameActivityTable> = {
					completed: false
				};
				if (production) {
					opts.finishDate = LessThan('now()');
				}
				const tameTasks = await TameActivityTable.find({
					where: opts,
					relations: ['tame']
				});

				await Promise.all(tameTasks.map(r => r.complete()));
			} catch (err) {
				console.error(err);
			} finally {
				this.client.tameTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
