import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { championScrolls } from '../../lib/collectionLog';
import { Activity, Time } from '../../lib/constants';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { randomVariation } from '../../lib/util/randomVariation';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description:
				'Sends your minion to do the Champions Challenge, if you have all the champion scrolls',
			examples: ['+cc'],
			aliases: ['cc']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const bank = msg.author.bank();
		if (!bank.has(championScrolls)) {
			return msg.send(
				`You don't have a set of Champion Scrolls to do the Champion's Challenge! You need 1 of each.`
			);
		}
		for (const id of championScrolls) bank.remove(id);
		await msg.author.settings.update(UserSettings.Bank, bank.bank);
		await addSubTaskToActivityTask<MinigameActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration: randomVariation(Time.Minute * 20, 5),
			type: Activity.ChampionsChallenge,
			minigameID: MinigameIDsEnum.ChampionsChallenge
		});

		return msg.send(
			`${msg.author.minionName} is now doing the Champion's Challenge! Removed 1x of every Champion scroll from your bank.`
		);
	}
}
