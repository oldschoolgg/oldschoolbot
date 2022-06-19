import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel
			.send(`**Important:** Nightmare is now in the \`/k\` slash command, and it can now be killed with a 'NPC team', so you don't need to gather a team of real people.
\`/k name:Solo Nightmare\` - Soloing nightmare
\`/k name:Mass Nightmare\` - Massing nightmare (with a NPC team)
\`/k name:Phosanis Nightmare\` - Phosanis nightmare
`);
	}
}
