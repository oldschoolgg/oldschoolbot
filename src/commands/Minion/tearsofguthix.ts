import { notEmpty, objectEntries, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { TearsOfGuthixActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const skillReqs = {
	[SkillsEnum.Firemaking]: 49,
	[SkillsEnum.Crafting]: 20,
	[SkillsEnum.Mining]: 20
};
const ironmanExtraReqs = {
	[SkillsEnum.Smithing]: 49,
	[SkillsEnum.Thieving]: 36,
	[SkillsEnum.Slayer]: 35
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			categoryFlags: ['minion'],
			examples: ['+tearsofguthix'],
			aliases: ['tog'],
			description:
				'Allows you to visit Juna and drink from the Tears of Guthix for some XP in your lowest xp skill.'
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {

		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		const lastPlayedDate = msg.author.settings.get(UserSettings.LastTearsOfGuthixTimestamp);
		const difference = currentDate - lastPlayedDate;

		// If they have already claimed a ToG in the past 7days
		if (difference < Time.Day * 7) {
			const duration = formatDuration(Date.now() - (lastPlayedDate + Time.Day * 7));
			return msg.channel.send(
				`**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix in ${duration}.`
			);
		}

		// 43 QP for the quest
		if (msg.author.settings.get(UserSettings.QP) < 43) {
			return msg.channel.send(
				`**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix when you have 43+ QP.`
			);
		}

		// Skills required for quest
		if (!msg.author.hasSkillReqs(skillReqs)[0]) {
			return msg.channel.send(
				`You are not skilled enough to participate in Tears of Guthix. You need the following requirements: ${objectEntries(
					skillReqs
				)
					.map(s => {
						return msg.author.skillLevel(s[0]) < s[1]
							? formatSkillRequirements({ [s[0]]: s[1] }, true)
							: undefined;
					})
					.filter(notEmpty)
					.join(', ')}`
			);
		}

		// Extra requirements if Ironman
		if (msg.author.isIronman) {
			let skillsMatch = 0;
			Object.entries(ironmanExtraReqs).forEach(([skill, level]) => {
				if (msg.author.skillLevel(skill as SkillsEnum) >= level) skillsMatch += 1;
			});
			if (skillsMatch === 0) {
				return msg.channel.send(
					`You are not skilled enough to participate in Tears of Guthix. As an Ironman, you need one of the following requirements:${formatSkillRequirements(
						ironmanExtraReqs,
						true
					)}`
				);
			}
		}

		const duration = Time.Minute * 8;
		await addSubTaskToActivityTask<TearsOfGuthixActivityTaskOptions>({
			minigameID: 'tears_of_guthix',
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration,
			type: 'TearsOfGuthix'
		});

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now off to visit Juna and drink from the Tears of Guthix, their trip will take ${formatDuration(
				duration
			)}.`
		);
	}
}
