import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(`**Important:** Nex is now in the \`/k\` slash command, just search for Nex! 
\`/k name:Nex (Solo)\` - Soloing
\`/k name:Nex (Mass)\` - Massing
`);
	}
}
