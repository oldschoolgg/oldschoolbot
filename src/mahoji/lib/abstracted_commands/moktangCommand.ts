import { spoiler } from '@discordjs/builders';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { dwarvenOutfit } from '../../../lib/data/CollectionsExport';

import { SkillsEnum } from '../../../lib/skilling/types';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import type { MoktangTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import resolveItems from '../../../lib/util/resolveItems';

const requiredPickaxes = resolveItems(['Crystal pickaxe', 'Volcanic pickaxe', 'Dwarven pickaxe', 'Dragon pickaxe']);

export async function moktangCommand(user: MUser, channelID: string, inputQuantity: number | undefined) {
	const timeToKill = new PercentCounter(Time.Minute * 15, 'time');
	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	if (miningLevel < 105) return 'You need 105 Mining to fight Moktang.';
	if (!user.hasEquipped(requiredPickaxes, false)) {
		return `You need to have one of these pickaxes equipped to fight Moktang: ${requiredPickaxes
			.map(itemNameFromID)
			.join(', ')}.`;
	}
	const totemsOwned = user.bank.amount('Moktang totem');
	if (totemsOwned === 0) return "You don't have any Moktang totems, you cannot summon the boss!";

	const miningLevelBoost = miningLevel - 84;
	timeToKill.add(true, 0 - miningLevelBoost, 'Mining level');
	timeToKill.add(user.hasEquipped('Volcanic pickaxe'), -5, 'Volcanic pickaxe');
	timeToKill.add(
		user.hasEquipped('Offhand volcanic pickaxe') && user.skillLevel(SkillsEnum.Strength) >= 100,
		-3,
		'Offhand volcanic pickaxe'
	);
	timeToKill.add(user.hasEquipped('Mining master cape'), -5, 'Mining mastery');

	const maxCanDo = Math.floor(calcMaxTripLength(user, 'Moktang') / timeToKill.value);
	const quantity = Math.max(1, Math.min(totemsOwned, maxCanDo, inputQuantity ?? maxCanDo));
	const duration = timeToKill.value * quantity;

	let brewsRequiredPerKill = 5;
	const hasDwarven = user.hasEquipped(dwarvenOutfit, true);
	if (hasDwarven) brewsRequiredPerKill -= 2;
	const totalBrewsRequired = brewsRequiredPerKill * quantity;
	const restoresNeeded = Math.max(1, Math.floor(totalBrewsRequired / 3));
	const cost = new Bank().add('Heat res. brew', totalBrewsRequired).add('Heat res. restore', restoresNeeded);
	cost.add('Moktang totem', quantity);

	if (!user.owns(cost)) {
		return `You don't have the required items to fight Moktang: ${cost}.${
			!hasDwarven ? ' Tip: Dwarven armor reduces the amount of brews needed.' : ''
		}`;
	}

	await user.removeItemsFromBank(cost);

	await addSubTaskToActivityTask<MoktangTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		qty: quantity,
		duration,
		type: 'Moktang'
	});

	return `${user.minionName} is now off to kill Moktang ${quantity}x times, their trip will take ${formatDuration(
		duration
	)}. Removed ${cost}.
**Boosts:** ${timeToKill.messages.join(', ')} ${
		timeToKill.missed.length > 0 ? spoiler(timeToKill.missed.join(', ')) : ''
	}`;
}
