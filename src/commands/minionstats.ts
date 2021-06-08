import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../lib/constants';
import { BotCommand } from '../lib/structures/BotCommand';
import { formatDuration } from '../lib/util';

const totalActivitiesQuery = (id: string) => `SELECT count(id)
FROM activity
WHERE user_id = '${id}';`;

const firstActivityQuery = (id: string) => `SELECT id, start_date, type
FROM activity
WHERE user_id = '${id}'
ORDER BY id ASC
LIMIT 1;`;

const countsPerActivityQuery = (id: string) => `
SELECT type, count(type) as qty
FROM activity
WHERE user_id = '${id}'
GROUP BY type
ORDER BY qty DESC
LIMIT 15;`;

const totalDurationQuery = (id: string) => `
SELECT sum(duration)
FROM activity
WHERE user_id = '${id}';`;

function dateDiff(first: number, second: number) {
	return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows statistics about your minions activities.',
			examples: ['+minionstats'],
			categoryFlags: ['minion', 'utility'],
			perkTier: PerkTier.Four
		});
	}

	async run(msg: KlasaMessage) {
		const { id } = msg.author;
		const [
			[totalActivities],
			[firstActivity],
			countsPerActivity,
			[_totalDuration]
		] = (await Promise.all([
			this.client.query(totalActivitiesQuery(id)),
			this.client.query(firstActivityQuery(id)),
			this.client.query(countsPerActivityQuery(id)),
			this.client.query(totalDurationQuery(id))
		])) as any[];

		const totalDuration = Number(_totalDuration.sum);
		const firstActivityDate = new Date(firstActivity.start_date);

		const diff = dateDiff(firstActivityDate.getTime(), Date.now());
		const perDay = totalDuration / diff;

		return msg.channel.send(`Stats
**Total Activities:** ${totalActivities.count}
**Common Activities:** ${countsPerActivity
			.slice(0, 3)
			.map((i: any) => `${i.qty}x ${i.type}`)
			.join(', ')}
**Total Minion Activity:** ${formatDuration(totalDuration)}
**First Activity:** ${firstActivity.type} ${firstActivityDate.toLocaleDateString('en-CA')}
**Average Per Day:** ${formatDuration(perDay)}
`);
	}
}
