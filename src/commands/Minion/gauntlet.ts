import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { gauntlet } from '../../lib/simulation/gauntlet';
import { BotCommand } from '../../lib/structures/BotCommand';
import { skillsMeetRequirements } from '../../lib/util';

const standardRequirements = {
	attack: 80,
	strength: 80,
	defence: 80,
	magic: 80,
	ranged: 80,
	prayer: 77,
	// Skilling
	cooking: 70,
	farming: 70,
	fishing: 70,
	mining: 70,
	woodcutting: 70
};

const corruptedRequirements = {
	attack: 90,
	strength: 90,
	defence: 90,
	magic: 90,
	ranged: 90,
	prayer: 77,
	// Skilling
	cooking: 80,
	farming: 80,
	fishing: 80,
	mining: 80,
	woodcutting: 80
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			oneAtTime: true,
			usage: '<corrupted|normal> [quantity:number]'
		});
	}

	async run(msg: KlasaMessage, [type, qty]: ['corrupted' | 'normal', number | undefined]) {
		if (msg.author.settings.get(UserSettings.QP) < 200) {
			return msg.send(`You need atleast 200 QP to do the Gauntlet.`);
		}

		const requiredSkills = type === 'corrupted' ? corruptedRequirements : standardRequirements;

		if (skillsMeetRequirements(msg.author.rawSkills, requiredSkills)) {
			return msg.send(`You need some stats for this bruv: ${requiredSkills}`);
		}

		const loot = new Bank();
		for (let i = 0; i < 10_000; i++) {
			loot.add(gauntlet({ died: false, type: 'normal' }));
		}
		return msg.channel.sendBankImage({ bank: loot.bank });
	}
}
