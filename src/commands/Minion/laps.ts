import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, formatDuration, rand } from '../../lib/util';
import Agility from '../../lib/skilling/skills/agility';
import { Activity, Tasks, Time } from '../../lib/constants';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { SkillsEnum } from '../../lib/skilling/types';
import { requiresMinion, minionNotBusy } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!quantity) {
			const entries = Object.entries(
				msg.author.settings.get(UserSettings.LapsScores)
			).map(arr => [parseInt(arr[0]), arr[1]]);
			if (entries.length === 0) {
				throw `You haven't done any laps yet! Sad.`;
			}
			const data = entries.map(
				([id, qty]) => `${Agility.Courses.find(c => c.id === id)!.name}: ${qty}`
			);
			return msg.send(data.join('\n'));
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const course = Agility.Courses.find(course =>
			course.aliases.some(alias => stringMatches(alias, name))
		);

		if (!course) {
			throw `Thats not a valid course. Valid courses are ${Agility.Courses.map(
				course => course.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) < course.level) {
			throw `${msg.author.minionName} needs ${course.level} agility to train at ${course.name}.`;
		}

		if (course.qpRequired && msg.author.settings.get(UserSettings.QP) < course.qpRequired) {
			throw `You need atleast ${course.qpRequired} Quest Points to do this course.`;
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
