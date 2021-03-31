import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GauntletOptions } from '../../lib/types/minions';
import {
	formatDuration,
	formatSkillRequirements,
	skillsMeetRequirements,
	toTitleCase
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const baseRequirements = {
	cooking: 70,
	farming: 70,
	fishing: 70,
	mining: 70,
	woodcutting: 70,
	agility: 70,
	smithing: 70,
	herblore: 70,
	construction: 70,
	hunter: 70
};

const standardRequirements = {
	...baseRequirements,
	attack: 80,
	strength: 80,
	defence: 80,
	magic: 80,
	ranged: 80,
	prayer: 77
};

const corruptedRequirements = {
	...baseRequirements,
	attack: 90,
	strength: 90,
	defence: 90,
	magic: 90,
	ranged: 90,
	prayer: 77,
	// Skilling
	cooking: 80,
	farming: 80,
	fishing: 80,
	mining: 80,
	woodcutting: 80
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			oneAtTime: true,
			usage: '<corrupted|normal> [quantity:int{1,100}]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [type, quantity]: ['corrupted' | 'normal', number | undefined]) {
		if (msg.author.settings.get(UserSettings.QP) < 200) {
			return msg.send(`You need atleast 200 QP to do the Gauntlet.`);
		}
		const readableName = `${toTitleCase(type)} Gauntlet`;
		const requiredSkills = type === 'corrupted' ? corruptedRequirements : standardRequirements;

		if (!skillsMeetRequirements(msg.author.rawSkills, requiredSkills)) {
			return msg.send(
				`You don't have the required stats to do the ${readableName}, you need: ${formatSkillRequirements(
					requiredSkills
				)}.`
			);
		}

		const [corruptedKC, normalKC] = await Promise.all([
			msg.author.getMinigameScore('CorruptedGauntlet'),
			msg.author.getMinigameScore('Gauntlet')
		]);

		if (type === 'corrupted' && normalKC < 50) {
			return msg.send(
				`You can't attempt the Corrupted Gauntlet, you have less than 50 normal Gauntlets completed - you would not stand a chance in the Corrupted Gauntlet!`
			);
		}

		let baseLength = type === 'corrupted' ? Time.Minute * 10 : Time.Minute * 15;

		const boosts = [];

		const scoreBoost =
			Math.min(100, calcWhatPercent(type === 'corrupted' ? corruptedKC : normalKC, 100)) / 5;
		if (scoreBoost > 1) {
			baseLength = reduceNumByPercent(baseLength, scoreBoost);
			boosts.push(`${scoreBoost}% boost for experience in the minigame`);
		}

		let gauntletLength = baseLength;
		if (type === 'corrupted') gauntletLength *= 2;

		const maxTripLength = msg.author.maxTripLength(Activity.Gauntlet);

		if (!quantity) {
			quantity = Math.floor(maxTripLength / gauntletLength);
		}
		const duration = quantity * gauntletLength;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${readableName} you can do is ${Math.floor(
					maxTripLength / gauntletLength
				)}.`
			);
		}

		await addSubTaskToActivityTask<GauntletOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Gauntlet,
			corrupted: type === 'corrupted'
		});

		const boostsStr = boosts.length > 0 ? `**Boosts:** ${boosts.join('\n')}` : '';

		return msg.send(`${
			msg.author.minionName
		} is now doing ${quantity}x ${readableName}. The trip will take ${formatDuration(duration)}.
${boostsStr}
`);
	}
}
