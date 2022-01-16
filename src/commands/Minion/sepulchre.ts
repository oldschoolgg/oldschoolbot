import { objectEntries, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { sepulchreBoosts, sepulchreFloors } from '../../lib/minions/data/sepulchre';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { SepulchreActivityTaskOptions } from '../../lib/types/minions';
import { addArrayOfNumbers, formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { SkillsEnum } from './../../lib/skilling/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			categoryFlags: ['minion', 'skilling', 'minigame'],
			description: 'Sends your minion to complete the Hallowed Sepulchre.',
			examples: ['+sepulchre']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const agilityLevel = msg.author.skillLevel(SkillsEnum.Agility);
		const minLevel = sepulchreFloors[0].agilityLevel;
		if (agilityLevel < minLevel) {
			return msg.channel.send(`You need atleast level ${minLevel} Agility to do the Hallowed Sepulchre.`);
		}

		if (!msg.author.hasGracefulEquipped()) {
			return msg.channel.send('You need Graceful equipped in your Skilling setup to do the Hallowed Sepulchre.');
		}

		const completableFloors = sepulchreFloors.filter(floor => agilityLevel >= floor.agilityLevel);
		let lapLength = addArrayOfNumbers(completableFloors.map(floor => floor.time));

		const boosts = [];

		// Every 1h becomes 1% faster to a cap of 10%
		const percentReduced = Math.min(
			Math.floor((await msg.author.getMinigameScore('sepulchre')) / (Time.Hour / lapLength)),
			10
		);

		boosts.push(`${percentReduced.toFixed(1)}% for minion learning`);

		lapLength = reduceNumByPercent(lapLength, percentReduced);

		for (const [id, percent] of objectEntries(sepulchreBoosts)) {
			if (msg.author.hasItemEquippedOrInBank(Number(id))) {
				boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
				lapLength = reduceNumByPercent(lapLength, percent);
			}
		}
		const maxLaps = Math.floor(msg.author.maxTripLength('Sepulchre') / lapLength);
		const tripLength = maxLaps * lapLength;

		await addSubTaskToActivityTask<SepulchreActivityTaskOptions>({
			floors: completableFloors.map(fl => fl.number),
			quantity: maxLaps,
			userID: msg.author.id,
			duration: tripLength,
			type: 'Sepulchre',
			channelID: msg.channel.id,
			minigameID: 'sepulchre'
		});

		let str = `${
			msg.author.minionName
		} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
			completableFloors[0].number
		}-${completableFloors[completableFloors.length - 1].number}, the trip will take ${formatDuration(
			tripLength
		)}, with each lap taking ${formatDuration(lapLength)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(str);
	}
}
