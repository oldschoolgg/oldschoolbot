import { objectEntries, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { plunderBoosts, plunderRooms } from '../../lib/minions/data/plunder';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { PlunderActivityTaskOptions } from './../../lib/types/minions';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			categoryFlags: ['minion', 'skilling', 'minigame'],
			description: 'Sends your minion to complete the Pyramid Plunder.',
			examples: ['+plunder']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const thievingLevel = msg.author.skillLevel(SkillsEnum.Thieving);
		const minLevel = plunderRooms[0].thievingLevel;
		if (thievingLevel < minLevel) {
			return msg.channel.send(`You need atleast level ${minLevel} Thieving to do the Pyramid Plunder.`);
		}

		const completableRooms = plunderRooms.filter(room => thievingLevel >= room.thievingLevel);

		let plunderTime = Time.Minute * 5.75;

		const boosts = [];

		if (msg.author.hasGlobetrotterEquipped()) {
			plunderTime *= 0.925;
			boosts.push('7.5% faster time for having the Globetrotter Outfit equipped');
		} else if (!msg.author.hasGracefulEquipped()) {
			plunderTime *= 1.075;
			boosts.push('-7.5% time penalty for not having graceful equipped');
		}

		// Every 1h becomes 1% faster to a cap of 10%
		const percentFaster = Math.min(
			Math.floor((await msg.author.getMinigameScore('PyramidPlunder')) / (Time.Hour / plunderTime)),
			10
		);

		boosts.push(`${percentFaster.toFixed(1)}% for minion learning`);

		plunderTime = reduceNumByPercent(plunderTime, percentFaster);

		for (const [id, percent] of objectEntries(plunderBoosts)) {
			if (msg.author.hasItemEquippedOrInBank(Number(id))) {
				boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
				plunderTime = reduceNumByPercent(plunderTime, percent);
			}
		}
		const maxQuantity = Math.floor(msg.author.maxTripLength(Activity.Plunder) / plunderTime);
		const tripLength = maxQuantity * plunderTime;

		await addSubTaskToActivityTask<PlunderActivityTaskOptions>({
			rooms: completableRooms.map(room => room.number),
			quantity: maxQuantity,
			userID: msg.author.id,
			duration: tripLength,
			type: Activity.Plunder,
			channelID: msg.channel.id,
			minigameID: 'PyramidPlunder'
		});

		let str = `${
			msg.author.minionName
		} is now doing Pyramid Plunder ${maxQuantity} times, each cycle they are looting the last two rooms ${
			completableRooms.length < 2 ? 1 : completableRooms[completableRooms.length - 2].number
		} and ${completableRooms[completableRooms.length - 1].number}, the trip will take ${formatDuration(
			tripLength
		)}, with each cycle taking ${formatDuration(plunderTime)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(str);
	}
}
