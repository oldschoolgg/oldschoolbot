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
			categoryFlags: ['minion'],
			examples: ['+tearsofguthix'],
			aliases: ['tog'],
			description:
				'Allows you to tell Juna a story and drink from the Tears of Guthix for some XP in your lowest xp skill.'
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
				`**${Emoji.Snake} Juna says...** You may drink from the Tears of Guthix in ${duration}.`
			);
		}

		// 43 QP for the quest
		const userQP = msg.author.settings.get(UserSettings.QP);
		if (userQP < 43) {
			return msg.channel.send(
				`**${Emoji.Snake} Juna says...** You may drink from the Tears of Guthix when you have a story to tell me |43+ QP|.`
			);
		}

		let missingIronmanSkills = false;
		// Extra requirements if Ironman
		if (msg.author.isIronman) {
			let skillsMatch = 0;
			Object.entries(ironmanExtraReqs).forEach(([skill, level]) => {
				if (msg.author.skillLevel(skill as SkillsEnum) >= level) skillsMatch += 1;
			});
			if (skillsMatch === 0) {
				missingIronmanSkills = true;
			}
		}

		const missingIronmanSkillMessage = `As an Ironman, you also need one of the following requirements:${formatSkillRequirements(
			ironmanExtraReqs,
			true
		)}`;
		// Skills required for quest
		if (!msg.author.hasSkillReqs(skillReqs)[0]) {
			const missingSkillsMessage = objectEntries(skillReqs)
				.map(s => {
					return msg.author.skillLevel(s[0]) < s[1]
						? formatSkillRequirements({ [s[0]]: s[1] }, true)
						: undefined;
				})
				.filter(notEmpty)
				.join(', ');

			return msg.channel.send(
				`**${Emoji.Snake} Juna says...** I'm afraid you don't have any stories I'd like to hear. You need the following requirements: ${missingSkillsMessage}. ${
					missingIronmanSkills ? missingIronmanSkillMessage : ''
				}`
			);
		} else if (missingIronmanSkills) {
			return msg.channel.send(
				`**${Emoji.Snake} Juna says...** I'm afraid you don't have any stories I'd like to hear. ${missingIronmanSkillMessage}`
			);
		}

		let duration = Time.Minute * 2;
		duration += Time.Second * 0.6 * userQP;
		if (duration > Time.Minute * 30) duration = Time.Minute * 30;

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
			} is now off to tell Juna a story and drink from the Tears of Guthix, their trip will take ${formatDuration(
				duration
			)}.`
		);
	}
}
