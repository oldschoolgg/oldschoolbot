import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../lib/settings/types/UserSettings';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	public async run(msg: KlasaMessage, command: Command) {
		if (!command.bitfieldsRequired) return;

		const usersBitfields = msg.author.settings.get(UserSettings.BitField);
		if (command.bitfieldsRequired.some(bit => !usersBitfields.includes(bit))) {
			msg.send(`You don't have the required permissions to use this command.`);
			return true;
		}

		return false;
	}
}
