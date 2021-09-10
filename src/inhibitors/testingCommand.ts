import { Command, Inhibitor, KlasaMessage } from 'klasa';

import { BotID } from '../lib/constants';

export default class extends Inhibitor {
	public async run(_msg: KlasaMessage, command: Command) {
		if (command.testingCommand || command.category === 'Testing') {
			if (this.client.production || !this.client.user || this.client.user.id === BotID) {
				return true;
			}
		}
	}
}
