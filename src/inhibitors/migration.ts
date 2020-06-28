import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (!this.client.owners.has(msg.author)) {
			throw `Old School Bot is currently under maintenance while it's migrated to a new server. In the meantime, you can join discord.gg/ob ` +
				`for updates. The migration is expected to take from 30 minutes up to 2 hours.`;
		}
	}
}
