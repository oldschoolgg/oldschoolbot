import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { Skills } from '../../../lib/types';
import { PuroPuroActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemID, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { minionName } from '../../../lib/util/minionUtils';

interface PuroImpling {
	name: string;
	hunterLevel: number;
	spell: boolean;
	item: Item | null;
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

export const puroOptions: PuroImpling[] = [
	{
		name: 'All Implings',
		hunterLevel: 17,
		spell: true,
		item: null
	},
	{
		name: 'Dragon Implings',
		hunterLevel: 83,
		spell: true,
		item: getOSItem('Dragon impling jar')
	},
	{
		name: 'Eclectic Implings',
		hunterLevel: 50,
		spell: false,
		item: getOSItem('Eclectic impling jar')
	},
	{
		name: 'Essence Implings',
		hunterLevel: 42,
		spell: false,
		item: getOSItem('Essence impling jar')
	},
	{
		name: 'Earth Implings',
		hunterLevel: 36,
		spell: false,
		item: getOSItem('Earth impling jar')
	},
	{
		name: 'Gourmet Implings',
		hunterLevel: 28,
		spell: false,
		item: getOSItem('Gourmet impling jar')
	},
	{
		name: 'Young Implings',
		hunterLevel: 22,
		spell: false,
		item: getOSItem('Young impling jar')
	},
	{
		name: 'Baby Implings',
		hunterLevel: 17,
		spell: false,
		item: getOSItem('Baby impling jar')
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
			if (user.bank().amount(natureRuneID) < 100 || user.bank().amount(deathRuneID) < 100) {
				return "You don't have enough Nature and Death runes to start this trip, you need at least 100 of each.";
			}
		} else if (user.bank().amount(natureRuneID) < 300 || user.bank().amount(deathRuneID) < 300) {
			return "You don't have enough Nature and Death runes to start this trip, you need at least 300 of each.";
		}
	}

	await addSubTaskToActivityTask<PuroPuroActivityTaskOptions>({
		implingID: impToHunt.item?.id ?? null,
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
