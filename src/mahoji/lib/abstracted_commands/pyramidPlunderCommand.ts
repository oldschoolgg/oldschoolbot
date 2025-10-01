import { formatDuration, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';

import { plunderBoosts, plunderRooms } from '@/lib/minions/data/plunder.js';
import type { PlunderActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { userHasGracefulEquipped } from '@/mahoji/mahojiSettings.js';

export async function pyramidPlunderCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	const skills = user.skillsAsLevels;
	const thievingLevel = skills.thieving;
	const minLevel = plunderRooms[0].thievingLevel;
	if (thievingLevel < minLevel) {
		return `You need at least level ${minLevel} Thieving to do the Pyramid Plunder.`;
	}

	const completableRooms = plunderRooms.filter(room => thievingLevel >= room.thievingLevel);

	let plunderTime = Time.Minute * 5.75;

	const boosts = [];

	if (!userHasGracefulEquipped(user)) {
		plunderTime *= 1.075;
		boosts.push('-7.5% time penalty for not having graceful equipped');
	}

	// Every 1h becomes 1% faster to a cap of 10%
	const percentFaster = Math.min(
		Math.floor((await user.fetchMinigameScore('pyramid_plunder')) / (Time.Hour / plunderTime)),
		10
	);

	boosts.push(`${percentFaster.toFixed(1)}% for minion learning`);

	plunderTime = reduceNumByPercent(plunderTime, percentFaster);

	for (const [item, percent] of plunderBoosts.items()) {
		if (user.hasEquippedOrInBank(item.id)) {
			boosts.push(`${percent}% for ${item.name}`);
			plunderTime = reduceNumByPercent(plunderTime, percent);
		}
	}
	const maxQuantity = Math.floor(calcMaxTripLength(user, 'Plunder') / plunderTime);
	const tripLength = maxQuantity * plunderTime;

	await addSubTaskToActivityTask<PlunderActivityTaskOptions>({
		rooms: completableRooms.map(room => room.number),
		quantity: maxQuantity,
		userID: user.id,
		duration: tripLength,
		type: 'Plunder',
		channelID: channelID.toString(),
		minigameID: 'pyramid_plunder'
	});

	let str = `${
		user.minionName
	} is now doing Pyramid Plunder ${maxQuantity} times, each cycle they are looting the last two rooms ${
		completableRooms.length < 2 ? 1 : completableRooms[completableRooms.length - 2].number
	} and ${completableRooms[completableRooms.length - 1].number}, the trip will take ${formatDuration(
		tripLength
	)}, with each cycle taking ${formatDuration(plunderTime)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
