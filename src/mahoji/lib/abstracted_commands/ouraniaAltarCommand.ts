import { increaseNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import Runecraft from '../../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../../lib/skilling/types';
import { OuraniaAltarOptions } from '../../../lib/types/minions';
import { formatDuration, itemID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { userHasGracefulEquipped } from '../../mahojiSettings';

const gracefulPenalty = 20;

export async function ouraniaAltarStartCommand(
	user: MUser,
	channelID: string,
	usestams?: boolean,
	daeyalt_essence?: boolean
) {
	let timePerTrip = Time.Minute * 2;
	let stamina = usestams || false;
	let daeyalt = daeyalt_essence || false;

	const { bank } = user;
	let removeBank = new Bank();
	const userBank = user.bank;
	const boosts = [];

	let inventorySize = 28;
	// For each pouch the user has, increase their inventory size.
	for (const pouch of Runecraft.pouches) {
		if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) continue;
		if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
		if (bank.has(pouch.id) && pouch.id === itemID('Colossal pouch')) break;
	}

	if (inventorySize > 28) boosts.push(`+${inventorySize - 28} inv spaces from pouches`);

	if (!userHasGracefulEquipped(user)) {
		boosts.push(`${gracefulPenalty}% slower for no Graceful`);
		timePerTrip = increaseNumByPercent(timePerTrip, gracefulPenalty);
	}

	if (
		user.skillLevel(SkillsEnum.Runecraft) >= 99 &&
		user.hasEquippedOrInBank('Runecraft cape') &&
		inventorySize > 28
	) {
		timePerTrip *= 0.97;
		boosts.push('3% for Runecraft cape');
	}

	if (stamina) timePerTrip *= 0.8;

	const maxTripLength = calcMaxTripLength(user, 'OuraniaAltar');

	const quantity = Math.floor(maxTripLength / timePerTrip);
	const duration = quantity * timePerTrip;

	if (stamina) {
		let staminaPotionQuantity = Math.round(duration / (9 * Time.Minute));

		if (userBank.amount('Stamina potion(4)') < staminaPotionQuantity) {
			return `You need ${staminaPotionQuantity}x Stamina potion(4) to hunt for the whole trip, try a lower quantity or make/buy more potions.`;
		}
		removeBank.add('Stamina potion(4)', staminaPotionQuantity);
		boosts.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
		timePerTrip *= 0.8;
	}

	await addSubTaskToActivityTask<OuraniaAltarOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'OuraniaAltar',
		channelID: channelID.toString(),
		stamina,
		daeyalt
	});

	return `${user.minionName} is now doing ${quantity}x games of Guardians Of The Rift! It will take ${formatDuration(
		duration
	)} to finish. ${boosts.length > 0 ? `\n**Boosts:** ${boosts.join(', ')}.` : ''}`;
}
