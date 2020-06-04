import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] [courseName:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name]: [number, string]) {
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

		// If no quantity provided, set it to the max.
		const timePerLap = course.lapTime * Time.Second;
		quantity = checkActivityQuantity(msg.author, quantity, timePerLap);
		const duration = quantity * timePerLap;

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				courseID: course.name,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Agility
			}
		);

		const response = `${msg.author.minionName} is now doing ${quantity}x ${
			course.name
		} laps, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
