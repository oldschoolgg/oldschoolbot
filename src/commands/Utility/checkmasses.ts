import { CommandStore, KlasaMessage } from 'klasa';

import { convertStoredActivityToFlatActivity, prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, isGroupActivity, isRaidsActivity } from '../../lib/util';

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
		const channelIDs = msg.guild.channels.cache.filter(c => c.type === 'text').map(c => c.id);

		const masses = (
			await prisma.activity.findMany({
				where: {
					completed: false,
					group_activity: true,
					channel_id: { in: channelIDs }
				},
				orderBy: {
					finish_date: 'asc'
				}
			})
		)
			.map(convertStoredActivityToFlatActivity)
			.filter(m => isRaidsActivity(m) || isGroupActivity(m));

		if (masses.length === 0) {
			return msg.channel.send('There are no active masses in this server.');
		}
		const now = Date.now();
		const massStr = masses
			.map(m => {
				if (isGroupActivity(m)) {
					return `${m.type}${isRaidsActivity(m) && m.challengeMode ? ' CM' : ''}: ${
						m.users.length
					} users returning to <#${m.channelID}> in ${formatDuration(m.finishDate - now)}`;
				}
			})
			.join('\n');
		return msg.channel.send(`**Masses in this server:**
${massStr}`);
	}
}
