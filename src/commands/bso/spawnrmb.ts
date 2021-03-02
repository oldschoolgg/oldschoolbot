import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Six,
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== '342983479501389826') {
			return msg.send(`You can only do this in the Oldschool.gg server.`);
		}

		if (msg.author.settings.get(UserSettings.HasSpawnedRMB)) {
			return msg.send(`You already spawned a Royal mystery box.`);
		}

		await msg.author.settings.update(UserSettings.HasSpawnedRMB, true);

		await msg.author.addItemsToBank(new Bank({ 'Royal mystery box': 1 }), true);
		return msg.send(`You received 1x Royal mystery box.`);
	}
}
