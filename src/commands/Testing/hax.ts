import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatables } from '../../lib/data/eatables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
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
		const paths = Object.values(Skills).map(sk => `skills.${sk.id}`);

		msg.author.settings.update(paths.map(path => [path, 14_000_000]));
		msg.author.settings.update(UserSettings.GP, 1_000_000_000);
		msg.author.settings.update(UserSettings.QP, 250);
		const loot: Record<string, number> = Object.fromEntries(
			Eatables.map(({ id }) => [id, 1000])
		);
		const bank = new Bank(loot);
		bank.add('Zamorakian spear');
		bank.add('Dragon warhammer');
		bank.add('Bandos godsword');
		bank.add('copper ore',10000);
		bank.add('tin ore',10000);
		bank.add('silver ore',10000);
		bank.add('iron ore',10000);
		bank.add('coal',60000);
		bank.add('gold ore',10000);
		bank.add('mithril ore',10000);
		bank.add('adamantite ore',10000);
		bank.add('runite ore',10000);
		bank.add('Goldsmith gauntlets');
		const poh = await msg.author.getPOH();
		poh.pool = 29241;
		await poh.save();
		msg.author.addItemsToBank(bank.bank);
		return msg.send(
			`Gave you 99 in all skills, 1b GP, 250 QP, and 1k of all eatable foods. **Gave your POH an ornate rejuve pool**`
		);
	}
}
