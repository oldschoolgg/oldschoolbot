import { Time, calcWhatPercent, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Emoji, Events } from '../../../lib/constants';
import { KaramjaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { randomVariation, roll, skillingPetDropRate, toKMB } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const agilityArenaTask: MinionTask = {
	type: 'AgilityArena',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, duration, userID } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);
		const [hasKaramjaMed] = await userhasDiaryTier(user, KaramjaDiary.medium);
		const xpPerTicket = hasKaramjaMed ? 379.5 : 345;

		// You get 1 ticket per minute at best without diary
		const timePerTicket = Time.Minute;
		let ticketsReceived = Math.floor(duration / timePerTicket);

		// Approximately 25k xp/hr (416xp per min) from the obstacles
		let agilityXP = randomVariation((duration / Time.Minute) * 416, 1);
		agilityXP = reduceNumByPercent(agilityXP, 100 - calcWhatPercent(currentLevel, 99));

		// 10% bonus tickets for karamja elite
		let bonusTickets = 0;
		const [hasKaramjaElite] = await userhasDiaryTier(user, KaramjaDiary.elite);
		if (hasKaramjaElite) {
			for (let i = 0; i < ticketsReceived; i++) {
				if (roll(10)) bonusTickets++;
			}
		}
		ticketsReceived += bonusTickets;

		// Increment agility_arena minigame score
		await incrementMinigameScore(user.id, 'agility_arena', ticketsReceived);

		// give user xp and generate message
		const xpRes = await user.addXP({ skillName: SkillsEnum.Agility, amount: agilityXP, duration: data.duration });
		let str = `${user}, ${user.minionName} finished doing the Brimhaven Agility Arena for ${formatDuration(
			duration
		)}, ${xpRes}.`;

		// Effective xp rate message
		const xpFromTickets = ticketsReceived * xpPerTicket;
		const xpFromTrip = xpFromTickets + agilityXP;
		str += ` After redeeming your Agility arena tickets your effective xp rate is: ${toKMB(
			(xpFromTrip / (duration / Time.Minute)) * 60
		).toLocaleString()}/Hr.`;

		// Roll for pet
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Agility, 26_404);
		for (let i = 0; i < ticketsReceived; i++) {
			if (roll(petDropRate)) {
				user.addItemsToBank({
					items: new Bank().add('Giant Squirrel'),
					collectionLog: true
				});
				str += "**\n\nYou have a funny feeling you're being followed...**";
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Agility} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Giant squirrel while running at the Agility Arena at level ${currentLevel} Agility!`
				);
			}
		}

		// Give the user their tickets and vouchers
		await user.addItemsToBank({
			items: new Bank().add('Agility arena ticket', ticketsReceived).add('Brimhaven voucher', ticketsReceived),
			collectionLog: true
		});

		// Loot message
		str += `\n\n**Loot:** ${ticketsReceived}x Agility arena tickets, ${ticketsReceived}x Brimhaven vouchers.`;
		if (bonusTickets > 0) {
			str += `You received ${bonusTickets} bonus tickets for the Karamja Elite Diary.`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
