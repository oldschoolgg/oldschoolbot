import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { Listeners } from '../../lib/PgBoss/PgBoss';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addNewJob from '../../lib/util/addNewJob';

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

		await addNewJob<AgilityActivityTaskOptions>(this.client, Listeners.SkillingEvent, {
			courseID: course.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Agility
		});
		msg.author.incrementMinionDailyDuration(duration);

		const response = `${msg.author.minionName} is now doing ${quantity}x ${
			course.name
		} laps, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
