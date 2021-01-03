import { Task } from 'klasa';

import {
	determineXPFromTickets,
	hasKaramjaEliteDiary
} from '../../../commands/Minion/agilityarena';
import { Time } from '../../../lib/constants';
import { roll } from '../../../lib/data/monsters/raids';
import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import { AgilityArenaActivityTaskOptions } from '../../../lib/types/minions';
import { calcWhatPercent, formatDuration, itemID, reduceNumByPercent } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { randomVariation } from '../../../lib/util/randomVariation';

export default class extends Task {
	async run(data: AgilityArenaActivityTaskOptions) {
		const { channelID, duration, userID } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		// You get 1 ticket per minute at best without diary
		let timePerTicket = Time.Minute;
		let ticketsReceived = Math.floor(duration / timePerTicket);

		// Approximately 25k xp/hr (416xp per min) from the obstacles
		let agilityXP = randomVariation((duration / Time.Minute) * 416, 1);
		agilityXP = reduceNumByPercent(agilityXP, 100 - calcWhatPercent(currentLevel, 99));

		// 10% bonus tickets for karamja med
		let bonusTickets = 0;
		if (hasKaramjaEliteDiary(user)) {
			for (let i = 0; i < ticketsReceived; i++) {
				if (roll(10)) bonusTickets++;
			}
		}
		ticketsReceived += bonusTickets;

		user.incrementMinigameScore(MinigameIDsEnum.AgilityArena, ticketsReceived);

		await user.addXP(SkillsEnum.Agility, agilityXP);
		const nextLevel = user.skillLevel(SkillsEnum.Agility);

		let str = `${user}, ${
			user.minionName
		} finished doing the Brimhaven Agility Arena for ${formatDuration(
			duration
		)}, you received ${Math.floor(
			agilityXP
		).toLocaleString()} Agility XP and ${ticketsReceived} Agility arena tickets.`;

		if (nextLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Agility level is now ${nextLevel}!`;
		}

		if (bonusTickets > 0) {
			str += `\nYou received ${bonusTickets} bonus tickets for the Karamja Medium Diary.`;
		}

		let xpFromTickets = determineXPFromTickets(ticketsReceived, user);
		const xpFromTrip = xpFromTickets + agilityXP;
		str += `\n${(
			(xpFromTrip / (duration / Time.Minute)) *
			60
		).toLocaleString()} XP/Hr (after redeeming tickets at 1000 qty)`;
		await user.addItemsToBank({ [itemID('Agility arena ticket')]: ticketsReceived }, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of agility arena`);
				return this.client.commands.get('agilityarena')!.run(res, []);
			},
			data
		);
	}
}
