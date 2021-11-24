import { CommandStore, KlasaMessage } from 'klasa';

import { convertStoredActivityToFlatActivity, prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration } from '../../lib/util';

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

		let masses: any[] = (
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
		).map(convertStoredActivityToFlatActivity);

		masses = masses.filter(m => m.users.length > 1);

		if (masses.length === 0) {
			return msg.channel.send('There are no active masses in this server.');
		}
		const now = Date.now();
		const massStr = masses
			.map(m => {
				console.log(m);
				console.log(m.finish_date);
				return `${m.type}${m.challengeMode ? ' CM' : ''}: ${m.users.length} users returning to <#${
					m.channelID
				}> in ${formatDuration(m.finishDate - now)}`;
			})
			.join('\n');
		return msg.channel.send(`**Masses in this server:**
${massStr}`);
	}
}
