import { objectEntries, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { sepulchreBoosts, sepulchreFloors } from '../../lib/minions/data/sepulchre';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SepulchreActivityTaskOptions } from '../../lib/types/minions';
import { addArrayOfNumbers, formatDuration, itemNameFromID } from '../../lib/util';
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

		if (!hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			return msg.send(
				`You need Graceful equipped in your Skilling setup to do the Hallowed Sepulchre.`
			);
		}

		const completableFloors = sepulchreFloors.filter(
			floor => agilityLevel >= floor.agilityLevel
		);
		let lapLength = addArrayOfNumbers(completableFloors.map(floor => floor.time));

		const boosts = [];
		for (const [id, percent] of objectEntries(sepulchreBoosts)) {
			if (await msg.author.hasItem(Number(id))) {
				boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
				lapLength = reduceNumByPercent(lapLength, percent);
			}
		}
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

		let str = `${
			msg.author.minionName
		} is now doing ${maxLaps} laps of the Sepulchre, in each lap they are doing floors ${
			completableFloors[0].number
		}-${
			completableFloors[completableFloors.length - 1].number
		}, the trip will take ${formatDuration(tripLength)}, with each lap taking ${formatDuration(
			lapLength
		)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(str);
	}
}
