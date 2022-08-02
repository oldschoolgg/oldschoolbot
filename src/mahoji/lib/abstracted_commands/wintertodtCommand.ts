import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { bankHasItem } from 'oldschooljs/dist/util';

import { Eatables } from '../../../lib/data/eatables';
import { warmGear } from '../../../lib/data/filterables';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function wintertodtCommand(user: KlasaUser, channelID: bigint) {
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
		if (user.getGear('skilling').hasEquipped([piece])) {
			warmGearAmount++;
		}
		if (warmGearAmount >= 4) break;
	}

	healAmountNeeded -= warmGearAmount * 15;
	durationPerTodt = reduceNumByPercent(durationPerTodt, 5 * warmGearAmount);

	const boosts: string[] = [];

	if (user.hasItemEquippedAnywhere('Dwarven greataxe')) {
		durationPerTodt /= 2;
		boosts.push('2x faster for Dwarven greataxe.');
	}

	if (healAmountNeeded !== baseHealAmountNeeded) {
		messages.push(
			`${calcWhatPercent(
				baseHealAmountNeeded - healAmountNeeded,
				baseHealAmountNeeded
			)}% less food for wearing warm gear`
		);
	}

	const quantity = Math.floor(user.maxTripLength('Wintertodt') / durationPerTodt);

	const bank = user.settings.get(UserSettings.Bank);
	for (const food of Eatables) {
		const healAmount = typeof food.healAmount === 'number' ? food.healAmount : food.healAmount(user);
		const amountNeeded = Math.ceil(healAmountNeeded / healAmount) * quantity;
		if (!bankHasItem(bank, food.id, amountNeeded)) {
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
		await updateBankSetting(
			globalClient,
			ClientSettings.EconomyStats.WintertodtCost,
			new Bank().add(food.id, amountNeeded)
		);

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

	let str = `${
		user.minionName
	} is now off to kill Wintertodt ${quantity}x times, their trip will take ${formatDuration(
		durationPerTodt * quantity
	)}. (${formatDuration(durationPerTodt)} per todt)\n\n${messages.join(', ')}.`;

	if (boosts.length > 0) {
		str += `**Boosts:** ${boosts.join(', ')}`;
	}

	return str;
}
