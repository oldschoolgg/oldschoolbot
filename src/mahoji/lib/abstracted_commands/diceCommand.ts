import { KlasaUser } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { percentChance, rand } from '../../../lib/util';
import { mahojiParseNumber, updateGPTrackSetting } from '../../mahojiSettings';

export async function diceCommand(klasaUser: KlasaUser, diceamount?: string) {
	const roll = rand(1, 100);
	const amount = mahojiParseNumber({ input: diceamount, min: 1, max: 500_000_000_000 });

	if (!diceamount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}

	if (!amount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}
	if (klasaUser.isIronman) return "You're an ironman and you cant play dice.";

	if (amount > 10_000_000_000) {
		return 'You can only dice up to 10b at a time!';
	}

	if (amount < 1_000_000) {
		return 'You have to dice atleast 1,000,000.';
	}

	await klasaUser.settings.sync(true);
	const gp = klasaUser.settings.get(UserSettings.GP);
	if (amount > gp) return "You don't have enough GP.";
	const won = roll >= 55;
	let amountToAdd = won ? amount : -amount;

	await updateGPTrackSetting('gp_dice', amountToAdd);
	await updateGPTrackSetting('gp_dice', amountToAdd, klasaUser);

	if (won) {
		const wins = klasaUser.settings.get(UserSettings.Stats.DiceWins);
		await klasaUser.settings.update(UserSettings.Stats.DiceWins, wins + 1);
		await klasaUser.addItemsToBank({ items: new Bank().add('Coins', amount) });
	} else {
		const losses = klasaUser.settings.get(UserSettings.Stats.DiceLosses);
		klasaUser.settings.update(UserSettings.Stats.DiceLosses, losses + 1);
		await klasaUser.removeItemsFromBank(new Bank().add('Coins', amount));
	}

	if (amount >= 100_000_000 && won && percentChance(3)) {
		await klasaUser.addItemsToBank({ items: new Bank().add('Gamblers bag'), collectionLog: true });
		return `${klasaUser.username} rolled **${roll}** on the percentile dice, and you won ${Util.toKMB(
			amountToAdd
		)} GP.\n\nYou received a **Gamblers Bag**.`;
	}

	return `${klasaUser.username} rolled **${roll}** on the percentile dice, and you ${
		won ? 'won' : 'lost'
	} ${Util.toKMB(amountToAdd)} GP. ${roll === 73 ? Emoji.Bpaptu : ''}`;
}
