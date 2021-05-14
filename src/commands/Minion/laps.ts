import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time, xpBoost } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to do laps of an agility course.',
			examples: ['+laps gnome', '+laps 5 draynor'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const course = Agility.Courses.find(course =>
			course.aliases.some(alias => stringMatches(alias, name))
		);

		if (!course) {
			return msg.send(
				`Thats not a valid course. Valid courses are ${Agility.Courses.map(
					course => course.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) < course.level) {
			return msg.send(
				`${msg.author.minionName} needs ${course.level} agility to train at ${course.name}.`
			);
		}

		if (course.qpRequired && msg.author.settings.get(UserSettings.QP) < course.qpRequired) {
			return msg.send(
				`You need atleast ${course.qpRequired} Quest Points to do this course.`
			);
		}

		const maxTripLength = 200984200 

		// If no quantity provided, set it to the max.
		const timePerLap = course.lapTime * Time.Second;
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timePerLap);
		}
		const duration = quantity * timePerLap * xpBoost;

		console.log(maxTripLength, duration);
		
		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${
					course.name
				} laps you can do is ${Math.floor(maxTripLength / timePerLap)}.`
			);
		}

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>(this.client, {
			courseID: course.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Agility
		});

		const response = `${msg.author.minionName} is now doing ${quantity}x ${
			course.name
		} laps, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
