import { KlasaMessage } from 'klasa';

import { prisma } from '../../settings/prisma';
import { formatDuration } from '../../util';

export async function pastActivities(msg: KlasaMessage) {
	const res = await prisma.activity.findMany({
		where: {
			user_id: BigInt(msg.author.id)
		},
		orderBy: {
			id: 'desc'
		},
		take: 10
	});

	return msg.channel.send(
		`**Your last 10 activities:**\n
${res
	.slice(0, 10)
	.map((i, ind) => `${ind + 1}. **${i.type}** trip for **${formatDuration(i.duration)}**`)
	.join('\n')}`
	);
}
