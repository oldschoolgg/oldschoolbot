import { Time, calcWhatPercent, randInt, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { getPOHObject } from '../../../lib/poh';
import { getMinigameScore } from '../../../lib/settings/minigames';
import type { GnomeRestaurantActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../mahojiSettings';
import { getPOH } from './pohCommand';

export async function gnomeRestaurantCommand(user: MUser, channelID: string) {
	let deliveryLength = Time.Minute * 7;

	const itemsToRemove = new Bank();
	const gp = user.GP;
	if (gp < 5000) {
		return 'You need at least 5k GP to work at the Gnome Restaurant.';
	}
	itemsToRemove.add('Coins', 5000);

	const boosts = [];

	const score = await getMinigameScore(user.id, 'gnome_restaurant');
	const scoreBoost = Math.min(100, calcWhatPercent(score, 100)) / 5;
	if (scoreBoost > 1) {
		deliveryLength = reduceNumByPercent(deliveryLength, scoreBoost);
		boosts.push(`${scoreBoost}% boost for experience in the minigame`);
	}

	if (userHasGracefulEquipped(user)) {
		deliveryLength = reduceNumByPercent(deliveryLength, 25);
		boosts.push('25% for Graceful');
	}

	if (user.skillLevel(SkillsEnum.Magic) >= 66) {
		deliveryLength = reduceNumByPercent(deliveryLength, 25);
		boosts.push('25% for 66 Magic (teleports)');
	}

	const poh = await getPOH(user.id);
	const hasOrnateJewelleryBox = poh.jewellery_box === getPOHObject('Ornate jewellery box').id;
	const hasJewelleryBox = poh.jewellery_box !== null;
	const { bank } = user;
	switch (randInt(1, 3)) {
		case 1: {
			if (user.hasEquippedOrInBank('Amulet of eternal glory')) {
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Amulet of eternal glory');
			} else if (hasOrnateJewelleryBox) {
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Ornate Jewellery Box');
			} else if (bank.has('Amulet of glory(6)')) {
				itemsToRemove.add('Amulet of glory(6)');
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Amulet of glory(6)');
			}
			break;
		}
		case 2: {
			if (hasJewelleryBox) {
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Jewellery Box');
			} else if (bank.has('Ring of dueling(8)')) {
				itemsToRemove.add('Ring of dueling(8)');
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Ring of dueling(8)');
			}
			break;
		}
		case 3: {
			if (hasJewelleryBox) {
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Jewellery Box');
			} else if (bank.has('Games necklace(8)')) {
				itemsToRemove.add('Games necklace(8)');
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% boost for Games necklace(8)');
			}
			break;
		}
	}

	const quantity = Math.floor(calcMaxTripLength(user, 'GnomeRestaurant') / deliveryLength);
	const duration = randomVariation(deliveryLength * quantity, 5);

	if (user.skillLevel(SkillsEnum.Magic) >= 66) {
		itemsToRemove.add('Law rune', Math.max(1, Math.floor(randInt(1, quantity * 1.5) / 2)));
	}

	if (!user.owns(itemsToRemove)) {
		return `You don't own the required items: ${itemsToRemove}.`;
	}

	await user.removeItemsFromBank(itemsToRemove);

	await updateBankSetting('gnome_res_cost', itemsToRemove);
	await addSubTaskToActivityTask<GnomeRestaurantActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'GnomeRestaurant',
		quantity,
		minigameID: 'gnome_restaurant',
		gloriesRemoved: itemsToRemove.amount('Amulet of glory(6)')
	});

	let str = `${user.minionName} is now working at the Gnome Restaurant for ${formatDuration(
		duration
	)}. Removed ${itemsToRemove} from your bank.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return str;
}
