import { Time, calcWhatPercent, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { KaramjaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration, randomVariation, roll, skillingPetDropRate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { determineXPFromTickets } from '../../../mahoji/lib/abstracted_commands/agilityArenaCommand';

export const agilityArenaTask: MinionTask = {
	type: 'AgilityArena',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, duration, userID } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

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

		const flappyRes = await userHasFlappy({ user, duration });

		if (flappyRes.shouldGiveBoost) {
			ticketsReceived *= 2;
		}

		incrementMinigameScore(user.id, 'agility_arena', ticketsReceived);

		const xpRes = await user.addXP({ skillName: SkillsEnum.Agility, amount: agilityXP, duration: data.duration });

		let str = `${user}, ${user.minionName} finished doing the Brimhaven Agility Arena for ${formatDuration(
			duration
		)}, ${xpRes} and ${ticketsReceived} Agility arena tickets.${flappyRes.userMsg}`;

		// Roll for pet
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Agility, 26_404);
		for (let i = 0; i < ticketsReceived; i++) {
			if (roll(petDropRate)) {
				user.addItemsToBank({
					items: new Bank().add('Giant Squirrel'),
					collectionLog: true
				});
				str += "**\nYou have a funny feeling you're being followed...**";
			}
		}

		if (bonusTickets > 0) {
			str += `\nYou received ${bonusTickets} bonus tickets for the Karamja Elite Diary.`;
		}

		const xpFromTickets = determineXPFromTickets(ticketsReceived, user, hasKaramjaElite);
		const xpFromTrip = xpFromTickets + agilityXP;
		str += `\n${(
			(xpFromTrip / (duration / Time.Minute)) *
			60
		).toLocaleString()} XP/Hr (after redeeming tickets at 1000 qty)`;
		await user.addItemsToBank({
			items: new Bank().add('Agility arena ticket', ticketsReceived),
			collectionLog: true
		});

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
