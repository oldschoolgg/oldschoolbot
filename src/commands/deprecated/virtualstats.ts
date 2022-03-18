import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		return msg.channel.send(
			'You now use `/stats` command for this, just pick which account type you want and specify **virtual:true**: https://cdn.discordapp.com/attachments/357422607982919680/952782729454428190/Discord_9XRWEsa2rr.png'
		);
	}
}
