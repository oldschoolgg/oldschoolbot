import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(`**Important:** Igne is now in the \`/k\` slash command, just search for Igne! 
\`/k name:Ignecarus (Solo)\` - Soloing
\`/k name:Ignecarus (Mass)\` - Massing
`);
	}
}
