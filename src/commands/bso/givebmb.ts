import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { sendToChannelID } from '../../lib/util/webhook';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<user:user>'
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		if (
			msg.author.id !== '157797566833098752' &&
			!msg.author.settings.get(UserSettings.BitField).includes(BitField.isModerator)
		) {
			return;
		}

		await user.addItemsToBank(new Bank({ 'Beach mystery box': 1 }), true);
		user.send(`You were given 1x Beach mystery box.`);
		sendToChannelID(this.client, '665678499578904596', {
			content: `${msg.author.username} gave a bmb to ${user.id}`
		});
		return msg.react(Emoji.Tick);
	}
}
