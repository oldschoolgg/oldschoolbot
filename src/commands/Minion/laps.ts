import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, formatDuration, rand } from '../../lib/util';
import Agility from '../../lib/skills/agility';
import { SkillsEnum } from '../../lib/types';
import { Activity, Tasks, Time } from '../../lib/constants';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const course = Agility.Courses.find(
			course =>
				stringMatches(course.name, name) || stringMatches(course.name.split(' ')[0], name)
		);

		if (!course) {
			throw `Thats not a valid course. Valid courses are ${Agility.Courses.map(
				course => course.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) < course.level) {
			throw `${msg.author.minionName} needs ${course.level} agility to train at ${course.name}'s course.`;
		}

		// If no quantity provided, set it to the max.
		const timePerLap = course.lapTime * Time.Second;
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timePerLap);
		}
		const duration = quantity * timePerLap;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
			course.name
			} laps you can do is ${Math.floor(msg.author.maxTripLength / timePerLap)}.`;
		}

		const data: AgilityActivityTaskOptions = {
			courseID: course.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Agility,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		const response = `${msg.author.minionName} is now doing ${quantity}x ${
			course.name
			} laps, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
