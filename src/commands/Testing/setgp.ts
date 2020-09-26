import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util/util';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<amount:int{1,1000000000}>'
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [gp]: [number]) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}

		await msg.author.settings.update(UserSettings.GP, gp);
		return msg.send(`Your cash stack is now ${toKMB(gp)}`);
	}
}
