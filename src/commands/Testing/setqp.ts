import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util/util';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<amount:int{1,284}>',
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [qp]: [number]) {
		await msg.author.settings.update(UserSettings.QP, qp);
		return msg.channel.send(`Your QP is now ${toKMB(qp)}`);
	}
}
