import { randomVariation, roll } from '@oldschoolgg/rng';
import { calcWhatPercent, Emoji, Events, formatDuration, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';

export const agilityArenaTask: MinionTask = {
	type: 'AgilityArena',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { channelId, duration } = data;

		const currentLevel = user.skillsAsLevels.agility;
		const hasKaramjaMed = user.hasDiary('karamja.medium');
		const xpPerTicket = hasKaramjaMed ? 379.5 : 345;

		// You get 1 ticket per minute at best without diary
		const timePerTicket = Time.Minute;
		let ticketsReceived = Math.floor(duration / timePerTicket);

		// Approximately 25k xp/hr (416xp per min) from the obstacles
		let agilityXP = randomVariation((duration / Time.Minute) * 416, 1);
		agilityXP = reduceNumByPercent(agilityXP, 100 - calcWhatPercent(currentLevel, 99));

		// 10% bonus tickets for karamja elite
		let bonusTickets = 0;
		const hasKaramjaElite = user.hasDiary('karamja.elite');
		if (hasKaramjaElite) {
			for (let i = 0; i < ticketsReceived; i++) {
				if (roll(10)) bonusTickets++;
			}
		}
		ticketsReceived += bonusTickets;

		// Increment agility_arena minigame score
		await user.incrementMinigameScore('agility_arena', ticketsReceived);

		// give user xp and generate message
		const xpRes = await user.addXP({ skillName: 'agility', amount: agilityXP, duration: data.duration });
		let str = `${user}, ${user.minionName} finished doing the Brimhaven Agility Arena for ${formatDuration(
			duration
		)}, ${xpRes}.`;

		// Effective xp rate message
		const xpFromTickets = ticketsReceived * xpPerTicket;
		const xpFromTrip = xpFromTickets + agilityXP;
		str += ` After redeeming your Agility arena tickets your effective xp rate is: ${toKMB(
			(xpFromTrip / (duration / Time.Minute)) * 60
		).toLocaleString()}/Hr.`;

		const itemsToAdd = new Bank()
			.add('Agility arena ticket', ticketsReceived)
			.add('Brimhaven voucher', ticketsReceived);

		// Roll for pet
		const { petDropRate } = skillingPetDropRate(user, 'agility', 26_404);
		for (let i = 0; i < ticketsReceived; i++) {
			if (roll(petDropRate)) {
				itemsToAdd.add('Giant Squirrel');
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Agility} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Giant squirrel while running at the Agility Arena at level ${currentLevel} Agility!`
				);
			}
		}

		await user.transactItems({
			itemsToAdd,
			collectionLog: true
		});

		// Loot message
		str += `\n\n**Loot:** ${itemsToAdd}.`;
		if (bonusTickets > 0) {
			str += `You received ${bonusTickets} bonus tickets for the Karamja Elite Diary.`;
		}

		handleTripFinish({ user, channelId, message: str, data });
	}
};
