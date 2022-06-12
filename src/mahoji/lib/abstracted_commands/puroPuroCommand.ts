import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { Skills } from '../../../lib/types';
import { PuroPuroActivityTaskOptions } from '../../../lib/types/minions';
import { bankHasItem, formatDuration, itemID, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { minionName } from '../../../lib/util/minionUtils';

interface implingName {
	name: string;
	hunterLevel: number;
	spell: boolean;
}

const puroPuroSkillRequirements: Skills = {
	crafting: 31,
	woodcutting: 36,
	hunter: 17
};

const darkLureSkillRequirements: Skills = {
	magic: 50,
	agility: 54,
	thieving: 52,
	woodcutting: 52,
	herblore: 50,
	mining: 42,
	crafting: 38,
	hunter: 12,
	strength: 16
};

const puroOptions: implingName[] = [
	{
		name: 'All Implings',
		hunterLevel: 17,
		spell: true
	},
	{
		name: 'Dragon Implings',
		hunterLevel: 83,
		spell: true
	},
	{
		name: 'Eclectic Implings',
		hunterLevel: 50,
		spell: false
	},
	{
		name: 'Essence Implings',
		hunterLevel: 42,
		spell: false
	},
	{
		name: 'Earth Implings',
		hunterLevel: 36,
		spell: false
	},
	{
		name: 'Gourmet Implings',
		hunterLevel: 28,
		spell: false
	},
	{
		name: 'Young Implings',
		hunterLevel: 22,
		spell: false
	},
	{
		name: 'Baby Implings',
		hunterLevel: 17,
		spell: false
	}
];

export default puroOptions;

export async function puroPuroStartCommand(
	user: KlasaUser,
	channelID: bigint,
	impling: string,
	darkLure: boolean | undefined
) {
	const timePerGame = Time.Minute * 10;
	const maxTripLength = calcMaxTripLength(user, 'PuroPuro');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;
	const hunterLevel = user.skillLevel(SkillsEnum.Hunter);
	const [hasSkillReqs, reason] = user.hasSkillReqs(puroPuroSkillRequirements);
	const [hasDarkLureSkillReqs, lureReason] = user.hasSkillReqs(darkLureSkillRequirements);
	const bank = user.settings.get(UserSettings.Bank);

	if (!hasSkillReqs) {
		return `To hunt in Puro-Puro, you need: ${reason}.`;
	}

	if (user.settings.get(UserSettings.QP) < 3) {
		return 'To hunt in Puro-Puro, you need 3 QP.';
	}

	const impToHunt = puroOptions.find(
		i => stringMatches(i.name, impling) || stringMatches(i.name.split(' ')[0], impling)
	);

	if (!impToHunt) {
		return 'Error selecting impling, please try again.';
	}

	if (hunterLevel < impToHunt.hunterLevel) {
		return `${minionName(user)} needs atleast level ${impToHunt.hunterLevel} hunter to hunt ${
			impToHunt.name
		} in Puro-Puro.`;
	}

	if (!darkLure || (darkLure && !impToHunt.spell)) {
		darkLure = false;
	}

	if (darkLure) {
		if (user.settings.get(UserSettings.QP) < 9) {
			return 'To use Dark Lure, you need 9 QP.';
		}

		if (!hasDarkLureSkillReqs) {
			return `To use Dark Lure, you need: ${lureReason}.`;
		}

		const currentUserFavour = user.settings.get(UserSettings.KourendFavour);
		for (const [key, value] of Object.entries(currentUserFavour)) {
			if (value < 100) {
				return `You don't have the required amount of Favour to cast Dark Lure.\n\nRequired: 100% ${key} Favour.`;
			}
		}

		const natureRuneID = itemID('Nature rune');
		const deathRuneID = itemID('Death rune');
		if (impToHunt.name === 'Dragon Implings') {
			if (!bankHasItem(bank, natureRuneID, 100) || !bankHasItem(bank, deathRuneID, 100)) {
				return "You don't have enough Nature and Death runes to start this trip, you need at least 100 of each.";
			}
		} else if (!bankHasItem(bank, natureRuneID, 300) || !bankHasItem(bank, deathRuneID, 300)) {
			return "You don't have enough Nature and Death runes to start this trip, you need at least 300 of each.";
		}
	}

	await addSubTaskToActivityTask<PuroPuroActivityTaskOptions>({
		impling: impToHunt.name,
		quantity,
		userID: user.id,
		duration,
		darkLure,
		type: 'PuroPuro',
		channelID: channelID.toString(),
		minigameID: 'puro_puro'
	});

	let str = `${minionName(user)} is now hunting ${impToHunt.name} in Puro-Puro! It will take ${formatDuration(
		duration
	)} to finish.`;

	if (!user.hasGracefulEquipped() && impToHunt.name !== 'Dragon Implings')
		str += '\n20% less implings due to having no Graceful equipped.';

	if (!impToHunt.spell) {
		str += `\n**Note:** You can't use Dark Lure when hunting ${impToHunt.name} as you are camping their spawn.`;
	}

	return str;
}
