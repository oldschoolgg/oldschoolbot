import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { ChampionScrolls } from '../../lib/data/CollectionsExport';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { randomVariation } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'Sends your minion to do the Champions Challenge, if you have all the champion scrolls',
			examples: ['+cc'],
			aliases: ['cc']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const bank = msg.author.bank();
		if (!bank.has(ChampionScrolls)) {
			return msg.channel.send(
				"You don't have a set of Champion Scrolls to do the Champion's Challenge! You need 1 of each."
			);
		}
		for (const id of ChampionScrolls) bank.remove(id);
		await msg.author.settings.update(UserSettings.Bank, bank.bank);
		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration: randomVariation(Time.Minute * 20, 5),
			type: Activity.ChampionsChallenge,
			minigameID: 'ChampionsChallenge'
		});

		return msg.channel.send(
			`${msg.author.minionName} is now doing the Champion's Challenge! Removed 1x of every Champion scroll from your bank.`
		);
	}
}
