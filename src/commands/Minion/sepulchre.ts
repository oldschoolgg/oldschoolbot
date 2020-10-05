import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { sepulchreFloors } from '../../lib/minions/data/sepulchre';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SepulchreActivityTaskOptions } from '../../lib/types/minions';
import { addArrayOfNumbers, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { SkillsEnum } from './../../lib/skilling/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const agilityLevel = msg.author.skillLevel(SkillsEnum.Agility);
		const minLevel = sepulchreFloors[0].agilityLevel;
		if (agilityLevel < minLevel) {
			return msg.send(
				`You need atleast level ${minLevel} Agility to do the Hallowed Sepulchre.`
			);
		}

		const completableFloors = sepulchreFloors.filter(
			floor => agilityLevel >= floor.agilityLevel
		);
		const lapLength = addArrayOfNumbers(completableFloors.map(floor => floor.time));
		const maxLaps = Math.floor(msg.author.maxTripLength / lapLength);
		const tripLength = maxLaps * lapLength;

		await addSubTaskToActivityTask<SepulchreActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				floors: completableFloors.map(fl => fl.number),
				quantity: maxLaps,
				userID: msg.author.id,
				duration: tripLength,
				type: Activity.Sepulchre,
				channelID: msg.channel.id
			}
		);

		return msg.send(
			`You can complete floors[${completableFloors
				.map(fl => fl.number)
				.join(', ')}], each lap takes ${formatDuration(
				lapLength
			)}, you can do a maximum of ${maxLaps} laps in your limit of ${formatDuration(
				msg.author.maxTripLength
			)}, so the whole trip will take ${formatDuration(tripLength)}`
		);
	}
}
