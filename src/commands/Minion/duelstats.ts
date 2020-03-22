import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/UserSettings';
import { Emoji } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5
		});
	}

	async run(msg: KlasaMessage) {
		const duelWins = msg.author.settings.get(UserSettings.Stats.DuelWins);
		const duelLosses = msg.author.settings.get(UserSettings.Stats.DuelLosses);
		return msg.send(
			`${msg.author}, you currently have ${duelWins} dueling wins, and ${duelLosses} losses ${Emoji.PeepoNoob}`
		);
	}
}
