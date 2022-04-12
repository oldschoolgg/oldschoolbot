import { calcWhatPercent, randInt, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { client } from '../../..';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { GnomeRestaurantActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, randomVariation, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function gnomeRestaurantCommand(user: KlasaUser, channelID: bigint) {
	let deliveryLength = Time.Minute * 7;

	const itemsToRemove = new Bank();
	const gp = user.settings.get(UserSettings.GP);
	if (gp < 5000) {
		return 'You need atleast 5k GP to work at the Gnome Restaurant.';
	}
	itemsToRemove.add('Coins', 5000);

	const boosts = [];

	const score = await user.getMinigameScore('gnome_restaurant');
	const scoreBoost = Math.min(100, calcWhatPercent(score, 100)) / 5;
	if (scoreBoost > 1) {
		deliveryLength = reduceNumByPercent(deliveryLength, scoreBoost);
		boosts.push(`${scoreBoost}% boost for experience in the minigame`);
	}

	if (user.hasGracefulEquipped()) {
		deliveryLength = reduceNumByPercent(deliveryLength, 25);
		boosts.push('25% for Graceful');
	}

	if (user.skillLevel(SkillsEnum.Magic) >= 66) {
		deliveryLength = reduceNumByPercent(deliveryLength, 25);
		boosts.push('25% for 66 Magic (teleports)');
	}

	const bank = user.bank();
	switch (randInt(1, 3)) {
		case 1: {
			if (user.hasItemEquippedOrInBank('Amulet of eternal glory')) {
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Amulet of eternal glory');
			} else if (bank.has('Amulet of glory(6)')) {
				itemsToRemove.add('Amulet of glory(6)');
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Amulet of glory(6)');
			}
			break;
		}
		case 2: {
			if (bank.has('Ring of dueling(8)')) {
				itemsToRemove.add('Ring of dueling(8)');
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% for Ring of dueling(8)');
			}
			break;
		}
		case 3: {
			if (bank.has('Games necklace(8)')) {
				itemsToRemove.add('Games necklace(8)');
				deliveryLength = reduceNumByPercent(deliveryLength, 20);
				boosts.push('20% boost for Games necklace(8)');
			}
			break;
		}
	}

	const quantity = Math.floor(user.maxTripLength('GnomeRestaurant') / deliveryLength);
	const duration = randomVariation(deliveryLength * quantity, 5);

	if (user.skillLevel(SkillsEnum.Magic) >= 66) {
		itemsToRemove.add('Law rune', Math.max(1, Math.floor(randInt(1, quantity * 1.5) / 2)));
	}

	if (!user.owns(itemsToRemove)) {
		return `You don't own the required items: ${itemsToRemove}.`;
	}

	await user.removeItemsFromBank(itemsToRemove.bank);

	await updateBankSetting(client, ClientSettings.EconomyStats.GnomeRestaurantCostBank, itemsToRemove);
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
