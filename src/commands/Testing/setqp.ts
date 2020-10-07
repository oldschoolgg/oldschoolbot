import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { MAX_QP } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<qp:int{0,50000}>',
			cooldown: 1,
			oneAtTime: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [qp = 0]: [number]) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}

		if (qp > MAX_QP) qp = MAX_QP;
		await msg.author.settings.update(UserSettings.QP, qp);
		return msg.send(`You set yout quest points to ${qp}.`);
	}
}
