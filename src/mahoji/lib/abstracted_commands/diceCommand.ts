import { KlasaUser } from 'klasa';
import { Util } from 'oldschooljs';

import { client } from '../../..';
import { Emoji } from '../../../lib/constants';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { rand, updateGPTrackSetting } from '../../../lib/util';
import { mahojiParseNumber } from '../../mahojiSettings';

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

	if (amount > 500_000_000) {
		return 'You can only dice up to 500m at a time!';
	}

	if (amount < 1_000_000) {
		return 'You have to dice atleast 1,000,000.';
	}

	await klasaUser.settings.sync(true);
	const gp = klasaUser.settings.get(UserSettings.GP);
	if (amount > gp) return "You don't have enough GP.";
	const won = roll >= 55;
	let amountToAdd = won ? amount : -amount;

	await klasaUser.addGP(amountToAdd);
	await updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceDice, amountToAdd);
	await updateGPTrackSetting(klasaUser, UserSettings.GPDice, amountToAdd);

	if (won) {
		const wins = klasaUser.settings.get(UserSettings.Stats.DiceWins);
		klasaUser.settings.update(UserSettings.Stats.DiceWins, wins + 1);
	} else {
		const losses = klasaUser.settings.get(UserSettings.Stats.DiceLosses);
		klasaUser.settings.update(UserSettings.Stats.DiceLosses, losses + 1);
	}

	return `${klasaUser.username} rolled **${roll}** on the percentile dice, and you ${
		won ? 'won' : 'lost'
	} ${Util.toKMB(amountToAdd)} GP. ${roll === 73 ? Emoji.Bpaptu : ''}`;
}
