import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { KaramjaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration, randomVariation, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { determineXPFromTickets } from '../../../mahoji/lib/abstracted_commands/agilityArenaCommand';
import { mahojiUsersSettingsFetch, mUserFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, duration, userID } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		// You get 1 ticket per minute at best without diary
		let timePerTicket = Time.Minute;
		let ticketsReceived = Math.floor(duration / timePerTicket);

		// Approximately 25k xp/hr (416xp per min) from the obstacles
		let agilityXP = randomVariation((duration / Time.Minute) * 416, 1);
		agilityXP = reduceNumByPercent(agilityXP, 100 - calcWhatPercent(currentLevel, 99));

		// 10% bonus tickets for karamja med
		let bonusTickets = 0;
		const [hasKaramjaElite] = await userhasDiaryTier(mahojiUser, KaramjaDiary.elite);
		if (hasKaramjaElite) {
			for (let i = 0; i < ticketsReceived; i++) {
				if (roll(10)) bonusTickets++;
			}
		}
		ticketsReceived += bonusTickets;

		await incrementMinigameScore(user.id, 'agility_arena', ticketsReceived);

		await user.addXP({ skillName: SkillsEnum.Agility, amount: agilityXP });
		const nextLevel = user.skillLevel(SkillsEnum.Agility);

		let str = `${user}, ${user.minionName} finished doing the Brimhaven Agility Arena for ${formatDuration(
			duration
		)}, you received ${Math.floor(
			agilityXP
		).toLocaleString()} Agility XP and ${ticketsReceived} Agility arena tickets.`;

		// Roll for pet
		for (let i = 0; i < ticketsReceived; i++) {
			if (roll(26_404 - user.skillLevel(SkillsEnum.Agility) * 25)) {
				user.addItemsToBank({
					items: new Bank().add('Giant Squirrel'),
					collectionLog: true
				});
				str += "**\nYou have a funny feeling you're being followed...**";
				this.client.emit(
					Events.ServerNotification,
					`${Emoji.Agility} **${user.username}'s** minion, ${user.minionName}, just received a Giant squirrel while running at the Agility Arena at level ${currentLevel} Agility!`
				);
			}
		}

		if (nextLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Agility level is now ${nextLevel}!`;
		}

		if (bonusTickets > 0) {
			str += `\nYou received ${bonusTickets} bonus tickets for the Karamja Medium Diary.`;
		}

		let xpFromTickets = determineXPFromTickets(ticketsReceived, user, hasKaramjaElite);
		const xpFromTrip = xpFromTickets + agilityXP;
		str += `\n${(
			(xpFromTrip / (duration / Time.Minute)) *
			60
		).toLocaleString()} XP/Hr (after redeeming tickets at 1000 qty)`;
		await user.addItemsToBank({
			items: new Bank().add('Agility arena ticket', ticketsReceived),
			collectionLog: true
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { agility_arena: { start: {} } }, true],
			undefined,
			data,
			null
		);
	}
}
