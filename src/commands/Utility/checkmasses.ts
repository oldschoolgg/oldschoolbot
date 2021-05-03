import { CommandStore, KlasaMessage } from 'klasa';
import { getConnection } from 'typeorm';

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
		const channelIDs = msg.guild.channels.filter(c => c.type === 'text').map(c => c.id);

		const masses: any[] = await getConnection().query(
			`
SELECT *
FROM activity
WHERE
completed = false AND 
group_activity = true AND
channel_id = ANY($1);
`,
			[channelIDs]
		);

		if (masses.length === 0) {
			return msg.channel.send(`There are no active masses in this server.`);
		}
		const now = Date.now();
		const massStr = masses
			.map(
				m =>
					`${m.type}: ${m.data.users.length} users returning to <#${
						m.channel_id
					}> in ${formatDuration(m.finish_date.getTime() - now)}`
			)
			.join('\n');
		return msg.channel.send(`**Masses in this server:**
${massStr}`);
	}
}
