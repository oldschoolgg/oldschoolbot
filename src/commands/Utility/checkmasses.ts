import { Activity } from '@prisma/client';
import { CommandStore, KlasaMessage } from 'klasa';

import { convertStoredActivityToFlatActivity, prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, isGroupActivity, isRaidsActivity, isTobActivity } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			runIn: ['text'],
			description: 'Shows the masses running in the server.',
			examples: ['+checkmasses']
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild) return null;
		const channelIDs = msg.guild.channels.cache.filter(c => c.type === 'text').map(c => BigInt(c.id));

		const masses = (
			(await prisma.$queryRawUnsafe(`
select id, user_id::text, start_date, finish_date, duration, completed, group_activity, type, channel_id::text, data,
	extract (epoch from finish_date) * 1000 + (coalesce((data->>'fakeDuration')::int, 0) -
		(case when (data->>'fakeDuration')::int is null then 0 else duration end)) as fake_end
from activity
where 
    completed = false 
	and group_activity = true
	and channel_id IN (${channelIDs.join(',')})
order by fake_end`)) as Activity[]
		)
			.map(convertStoredActivityToFlatActivity)
			.filter(m => (isRaidsActivity(m) || isGroupActivity(m) || isTobActivity(m)) && m.users.length > 1);

		if (masses.length === 0) {
			return msg.channel.send('There are no active masses in this server.');
		}
		const now = Date.now();
		const massStr = masses
			.map(m => {
				const remainingTime = isTobActivity(m)
					? m.finishDate - m.duration + m.fakeDuration - now
					: m.finishDate - now;
				if (isGroupActivity(m)) {
					return `${m.type}${isRaidsActivity(m) && m.challengeMode ? ' CM' : ''}: ${
						m.users.length
					} users returning to <#${m.channelID}> in ${formatDuration(remainingTime)}`;
				}
			})
			.join('\n');
		return msg.channel.send(`**Masses in this server:**
${massStr}`);
	}
}
