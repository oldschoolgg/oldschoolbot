import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { Castables } from '../../../lib/skilling/skills/magic/castables';
import { CastingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';

export async function castCommand(channelID: bigint, user: KlasaUser, name: string, quantity: number | undefined) {
	const spell = Castables.find(spell => stringMatches(spell.name, name));

	if (!spell) {
		return `That is not a valid spell to cast, the spells you can cast are: ${Castables.map(i => i.name).join(
			', '
		)}.`;
	}

	if (user.skillLevel(SkillsEnum.Magic) < spell.level) {
		return `${user.minionName} needs ${spell.level} Magic to cast ${spell.name}.`;
	}

	if (spell.craftLevel && user.skillLevel(SkillsEnum.Crafting) < spell.craftLevel) {
		return `${user.minionName} needs ${spell.craftLevel} Crafting to cast ${spell.name}.`;
	}

	if (spell.qpRequired && user.settings.get(UserSettings.QP) < spell.qpRequired) {
		return `${user.minionName} needs ${spell.qpRequired} QP to cast ${spell.name}.`;
	}

	await user.settings.sync(true);
	const userBank = user.bank();

	let timeToEnchantTen = spell.ticks * Time.Second * 0.6 + Time.Second / 4;

	const maxTripLength = calcMaxTripLength(user, 'Casting');

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timeToEnchantTen);
		const spellRunes = determineRunes(user, spell.input.clone());
		const max = userBank.fits(spellRunes);
		if (max < quantity && max !== 0) quantity = max;
	}

	const duration = quantity * timeToEnchantTen;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${spell.name}s you can cast is ${Math.floor(
			maxTripLength / timeToEnchantTen
		)}.`;
	}
	const cost = determineRunes(user, spell.input.clone().multiply(quantity));
	if (!userBank.has(cost.bank)) {
		return `You don't have the materials needed to cast ${quantity}x ${spell.name}, you need ${
			spell.input
		}, you're missing **${cost.clone().remove(userBank)}** (Cost: ${cost}).`;
	}

	const userGP = user.settings.get(UserSettings.GP);

	let gpCost = 0;
	if (spell.gpCost) {
		gpCost = spell.gpCost * quantity;
		if (gpCost > userGP) {
			return `You need ${gpCost} GP to create ${quantity} planks.`;
		}
		await user.removeItemsFromBank(new Bank().add('Coins', gpCost));
	}

	await user.removeItemsFromBank(cost.bank);
	await updateBankSetting(globalClient, ClientSettings.EconomyStats.MagicCostBank, cost);

	await addSubTaskToActivityTask<CastingActivityTaskOptions>({
		spellID: spell.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Casting'
	});

	const magicXpHr = `${Math.round(
		((spell.xp * quantity) / (duration / Time.Minute)) * 60
	).toLocaleString()} Magic XP/Hr`;

	let craftXpHr = '';
	if (spell.craftXp) {
		craftXpHr = `and** ${Math.round(
			((spell.craftXp * quantity) / (duration / Time.Minute)) * 60
		).toLocaleString()} Crafting XP/Hr**`;
	}

	let prayerXpHr = '';
	if (spell.prayerXp) {
		prayerXpHr = `and** ${Math.round(
			((spell.prayerXp * quantity) / (duration / Time.Minute)) * 60
		).toLocaleString()} Prayer XP/Hr**`;
	}

	return `${user.minionName} is now casting ${quantity}x ${spell.name}, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${cost}${
		spell.gpCost ? ` and ${gpCost} Coins` : ''
	} from your bank. **${magicXpHr}** ${craftXpHr}${prayerXpHr}`;
}
