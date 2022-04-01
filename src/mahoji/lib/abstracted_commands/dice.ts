import { KlasaUser } from 'klasa';
import { Util } from 'oldschooljs';

import { client } from '../../..';
import { Emoji } from '../../../lib/constants';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { rand, updateGPTrackSetting } from '../../../lib/util';


export async function diceCommand(KlasaUser: KlasaUser, amount?: number) {
	const roll = rand(1, 100);

	if (!amount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}
	if (KlasaUser.isIronman) return "You're an ironman and you cant play dice.";

	if (amount > 500_000_000) {
		return 'You can only dice up to 500m at a time!';
	}

	if (amount < 1_000_000) {
		return 'You have to dice atleast 1,000,000.';
	}

	await KlasaUser.settings.sync(true);
	const gp = KlasaUser.settings.get(UserSettings.GP);
	if (amount > gp) return "You don't have enough GP.";
	const won = roll >= 55;
	let amountToAdd = won ? amount : -amount;

	await KlasaUser.addGP(amountToAdd);
	await updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceDice, amountToAdd);
	await updateGPTrackSetting(KlasaUser, UserSettings.GPDice, amountToAdd);

	if (won) {
		const wins = KlasaUser.settings.get(UserSettings.Stats.DiceWins);
		KlasaUser.settings.update(UserSettings.Stats.DiceWins, wins + 1);
	} else {
		const losses = KlasaUser.settings.get(UserSettings.Stats.DiceLosses);
		KlasaUser.settings.update(UserSettings.Stats.DiceLosses, losses + 1);
	}

	return `${KlasaUser.username} rolled **${roll}** on the percentile dice, and you ${
		won ? 'won' : 'lost'
	} ${Util.toKMB(amountToAdd)} GP. ${roll === 73 ? Emoji.Bpaptu : ''}`;
}
