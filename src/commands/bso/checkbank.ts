import { KlasaMessage } from 'klasa';
import { Items } from 'oldschooljs';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		const bank = msg.author.settings.get(UserSettings.Bank);

		const broken = [];
		for (const id of Object.keys(bank).map(key => parseInt(key))) {
			const item = Items.get(id);
			if (!item) {
				broken.push(id);
			}
		}
		return msg.send(
			`You have ${
				broken.length
			} broken items. Check here to potentially see what they are: <https://chisel.weirdgloop.org/moid/item_id.html#${broken.join(
				',`'
			)}>`
		);
	}
}
