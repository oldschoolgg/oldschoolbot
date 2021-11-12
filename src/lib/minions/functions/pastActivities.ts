import { KlasaMessage } from 'klasa';

import { ActivityTable } from '../../typeorm/ActivityTable.entity';
import { formatDuration } from '../../util';

export async function pastActivities(msg: KlasaMessage) {
	const res = await ActivityTable.find({
		where: {
			userID: msg.author.id
		},
		order: {
			id: 'DESC'
		}
	});

	return msg.channel.send(
		`**Your last 10 activities:**\n
${res
	.slice(0, 10)
	.map((i, ind) => `${ind + 1}. **${i.type}** trip for **${formatDuration(i.duration)}**`)
	.join('\n')}`
	);
}
