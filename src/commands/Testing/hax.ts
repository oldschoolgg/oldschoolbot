import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { MAX_QP } from '../../lib/constants';
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
		msg.author.settings.update(UserSettings.QP, MAX_QP);
		msg.author.settings.update(UserSettings.Slayer.SlayerPoints, 100_000);
		const loot: Record<string, number> = Object.fromEntries(Eatables.map(({ id }) => [id, 1000]));
		const bank = new Bank(loot);
		bank.add('Zamorakian spear');
		bank.add('Dragon warhammer');
		bank.add('Bandos godsword');
		const poh = await msg.author.getPOH();
		poh.pool = 29_241;
		await poh.save();
		msg.author.addItemsToBank(bank.bank);
		return msg.channel.send(
			`Gave you 99 in all skills, 1b GP, ${MAX_QP} QP, and 1k of all eatable foods. **Gave your POH an ornate rejuve pool**`
		);
	}
}
