import { objectEntries, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { sepulchreBoosts, sepulchreFloors } from '../../lib/minions/data/sepulchre';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
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

		// Every 1h becomes 1% faster to a cap of 10%
		const percentReduced = Math.min(
			Math.floor(
				(await msg.author.getMinigameScore(MinigameIDsEnum.Sepulchre)) /
					(Time.Hour / lapLength)
			),
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
		const maxLaps = Math.floor(msg.author.maxTripLength / lapLength);
		const tripLength = maxLaps * lapLength;

		await addSubTaskToActivityTask<SepulchreActivityTaskOptions>(this.client, {
			floors: completableFloors.map(fl => fl.number),
			quantity: maxLaps,
			userID: msg.author.id,
			duration: tripLength,
			type: Activity.Sepulchre,
			channelID: msg.channel.id,
			minigameID: MinigameIDsEnum.Sepulchre
		});

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
