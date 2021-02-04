import { CommandStore, KlasaMessage } from 'klasa';

import { fetchSponsors } from '../../lib/http/util';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, { permissionLevel: 10 });
	}

	async run(msg: KlasaMessage) {
		const sponsors = await fetchSponsors();
		return msg.channel.send(JSON.stringify(sponsors, null, 4), { split: true });
	}
}
