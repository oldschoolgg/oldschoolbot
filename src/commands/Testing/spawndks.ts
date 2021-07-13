import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (production) {
			return msg.channel.send("Nice try. You shouldn't see this.");
		}
		const dksBank = new Bank();
		dksBank
			.add("Guthan's warspear")
			.add("Guthan's chainskirt")
			.add("Guthan's platebody")
			.add("Guthan's helm")
			.add("Torag's platebody")
			.add("Torag's platelegs")
			.add("Karil's leatherskirt")
			.add("Karil's leathertop");
		if (msg.flagArgs.max) {
			dksBank
				.add('Armadyl chestplate')
				.add('Armadyl chainskirt')
				.add('Bandos tassets')
				.add('Bandos chestplate')
				.add('Dragon claws')
				.add('Saradomin godsword')
				.add('Harmonised nightmare staff')
				.add('Occult necklace');
		}

		await msg.author.addItemsToBank(dksBank.bank);
		return msg.channel.send(`Gave you gear for Dagannoth Kings.${msg.flagArgs.max ? ' Including max boosts' : ''}`);
	}
}
