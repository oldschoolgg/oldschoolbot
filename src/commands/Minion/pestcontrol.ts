import { reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

let itemBoosts = [
	[getOSItem('Abyssal whip'), 10],
	[getOSItem('Barrows gloves'), 3],
	[getOSItem('Amulet of fury'), 3],
	[getOSItem('Fire cape'), 5]
] as const;

export type PestControlBoat = 'veteran' | 'intermediate' | 'novice';

function getBoatType(cbLevel: number): PestControlBoat {
	if (cbLevel >= 100) return 'veteran';
	if (cbLevel >= 70) return 'intermediate';
	return 'novice';
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to catch chompies.',
			examples: ['+chompyhunt', '+ch'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true,
			aliases: ['ch'],
			usage: '<quantity:int{1,10}>'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const { combatLevel } = msg.author;
		if (combatLevel < 40) {
			return msg.channel.send('You need a combat level of atleast 40 to do Pest Control.');
		}

		let quantity = 1;
		let gameLength = Time.Minute * 2;

		let boosts = [];
		const gear = msg.author.getGear('melee');
		for (const [item, percent] of itemBoosts) {
			if (gear.hasEquipped(item.name)) {
				gameLength = reduceNumByPercent(gameLength, percent);
				boosts.push(`${percent}% for ${item.name}`);
			}
		}

		let duration = quantity * gameLength;

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.PestControl,
			quantity,
			minigameID: 'PestControl'
		});

		let boat = getBoatType(combatLevel);

		let str = `${
			msg.author.minionName
		} is now doing ${quantity}x Pest Control games on the ${boat} boat. The trip will take ${formatDuration(
			duration
		)}.`;

		if (boosts.length > 0) {
			str += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(str);
	}
}
