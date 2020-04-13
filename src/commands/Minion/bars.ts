import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		/**
		 * THIS IS A TEMPORARY COMMAND TO HELP TESTING.
		 */
		msg.author.settings.update('GP', 50000000);
		msg.author.addItemsToBank({
			[itemID('Pure essence')]: 1000,
			2349: 100000,
			2351: 100000,
			2353: 100000,
			2355: 100000,
			2357: 100000,
			2359: 100000,
			2361: 100000,
			2363: 100000
		});
		if (msg.author.settings.get(UserSettings.Skills.Smithing) < 20_000_000)
			msg.author.addXP(SkillsEnum.Smithing, 1_000_000);
		return msg.send(`Gave 100000 of each bar and 1m smithing xp`);
	}
}
