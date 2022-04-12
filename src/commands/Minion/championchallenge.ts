import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { championScrolls } from '../../lib/data/CollectionsExport';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { randomVariation } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
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
		if (!bank.has(championScrolls)) {
			return msg.channel.send(
				"You don't have a set of Champion Scrolls to do the Champion's Challenge! You need 1 of each."
			);
		}

		const cost = new Bank();
		for (const id of championScrolls) cost.add(id);
		await msg.author.removeItemsFromBank(cost);

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration: randomVariation(Time.Minute * 20, 5),
			type: 'ChampionsChallenge',
			minigameID: 'champions_challenge'
		});

		return msg.channel.send(
			`${msg.author.minionName} is now doing the Champion's Challenge! Removed 1x of every Champion scroll from your bank.`
		);
	}
}
