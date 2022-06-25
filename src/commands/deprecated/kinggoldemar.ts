import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['kg']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.send(`**Important:** King Goldemar is now in the \`/k\` slash command, just search for it! 
\`/k name:King Goldemar (Solo)\` - Soloing
\`/k name:King Goldemar (Mass)\` - Massing
`);
	}
}
