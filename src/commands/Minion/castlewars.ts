import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { getMinigameEntity } from '../../lib/settings/settings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class CastleWarsCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to work at the Gnome Restaurant.',
			usage: '[play|buy] [name:str]',
			examples: ['+cw'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true,
			aliases: ['cw']
		});
	}

	async run(msg: KlasaMessage) {
		const bank = msg.author.bank();
		const kc = await getMinigameEntity(msg.author.id);
		return msg.send(`You have **${bank.amount('Castle wars ticket')}** Castle wars tickets.
You have played ${kc.CastleWars} Castle Wars games.`);
	}

	@requiresMinion
	@minionNotBusy
	async play(msg: KlasaMessage) {
		const gameLength = Time.Minute * 18;
		const quantity = Math.floor(msg.author.maxTripLength(Activity.CastleWars) / gameLength);
		const duration = quantity * gameLength;

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.CastleWars,
			quantity,
			minigameID: 'CastleWars'
		});

		return msg.send(
			`${
				msg.author.minionName
			} is now doing ${quantity} games of Castle Wars. The trip will take around ${formatDuration(
				duration
			)}.`
		);
	}
}
