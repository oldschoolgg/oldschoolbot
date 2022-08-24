import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { Eatables } from '../../../lib/data/eatables';
import { warmGear } from '../../../lib/data/filterables';
import { MUser } from '../../../lib/MUser';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../mahojiSettings';

export async function wintertodtCommand(user: MUser, channelID: bigint) {
	const fmLevel = user.skillLevel(SkillsEnum.Firemaking);
	const wcLevel = user.skillLevel(SkillsEnum.Woodcutting);
	if (fmLevel < 50) {
		return 'You need 50 Firemaking to have a chance at defeating the Wintertodt.';
	}

	const messages = [];

	let durationPerTodt = Time.Minute * 7.3;

	// Up to a 10% boost for 99 WC
	const wcBoost = (wcLevel + 1) / 10;
	if (wcBoost > 1) messages.push(`${wcBoost.toFixed(2)}% boost for Woodcutting level`);
	durationPerTodt = reduceNumByPercent(durationPerTodt, wcBoost);

	const baseHealAmountNeeded = 20 * 8;
	let healAmountNeeded = baseHealAmountNeeded;
	let warmGearAmount = 0;

	for (const piece of warmGear) {
		if (user.gear.skilling.hasEquipped([piece])) {
			warmGearAmount++;
		}
		if (warmGearAmount >= 4) break;
	}

	healAmountNeeded -= warmGearAmount * 15;
	durationPerTodt = reduceNumByPercent(durationPerTodt, 5 * warmGearAmount);

	if (healAmountNeeded !== baseHealAmountNeeded) {
		messages.push(
			`${calcWhatPercent(
				baseHealAmountNeeded - healAmountNeeded,
				baseHealAmountNeeded
			)}% less food for wearing warm gear`
		);
	}

	const quantity = Math.floor(calcMaxTripLength(user, 'Wintertodt') / durationPerTodt);

	for (const food of Eatables) {
		const healAmount = typeof food.healAmount === 'number' ? food.healAmount : food.healAmount(user);
		const amountNeeded = Math.ceil(healAmountNeeded / healAmount) * quantity;
		if (user.bank.amount(food.id) < amountNeeded) {
			if (Eatables.indexOf(food) === Eatables.length - 1) {
				return `You don't have enough food to do Wintertodt! You can use these food items: ${Eatables.map(
					i => i.name
				).join(', ')}.`;
			}
			continue;
		}

		messages.push(`Removed ${amountNeeded}x ${food.name}'s from your bank`);
		await user.removeItemsFromBank(new Bank().add(food.id, amountNeeded));

		// Track this food cost in Economy Stats
		await updateBankSetting('economyStats_wintertodtCost', new Bank().add(food.id, amountNeeded));

		break;
	}

	const duration = durationPerTodt * quantity;

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		minigameID: 'wintertodt',
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Wintertodt'
	});

	return `${user.minionName} is now off to kill Wintertodt ${quantity}x times, their trip will take ${formatDuration(
		durationPerTodt * quantity
	)}. (${formatDuration(durationPerTodt)} per todt)\n\n${messages.join(', ')}.`;
}
