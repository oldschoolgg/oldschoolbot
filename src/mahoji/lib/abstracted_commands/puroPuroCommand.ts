import { Time } from 'e';

import type { Item } from 'oldschooljs';
import type { Skills } from '../../../lib/types';
import type { PuroPuroActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, hasSkillReqs, itemID, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { userHasGracefulEquipped } from '../../mahojiSettings';

interface PuroImpling {
	name: string;
	hunterLevel: number;
	spell: boolean;
	item: Item | null;
	tier?: number;
}

const puroPuroSkillRequirements: Skills = { crafting: 31, woodcutting: 36, hunter: 17 };
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

const puroOptions: PuroImpling[] = [
	{ name: 'All Implings', hunterLevel: 17, spell: true, item: null, tier: 1 },
	{ name: 'High-tier Implings', hunterLevel: 58, spell: true, item: null, tier: 2 },
	{ name: 'Eclectic Implings', hunterLevel: 50, spell: false, item: getOSItem('Eclectic impling jar'), tier: 3 },
	{ name: 'Essence Implings', hunterLevel: 42, spell: false, item: getOSItem('Essence impling jar'), tier: 4 },
	{ name: 'Earth Implings', hunterLevel: 36, spell: false, item: getOSItem('Earth impling jar'), tier: 5 },
	{ name: 'Gourmet Implings', hunterLevel: 28, spell: false, item: getOSItem('Gourmet impling jar'), tier: 6 },
	{ name: 'Young Implings', hunterLevel: 22, spell: false, item: getOSItem('Young impling jar'), tier: 7 },
	{ name: 'Baby Implings', hunterLevel: 17, spell: false, item: getOSItem('Baby impling jar'), tier: 8 }
];

export default puroOptions;

export async function puroPuroStartCommand(
	user: MUser,
	channelID: string,
	impling: string | undefined,
	darkLure: boolean | undefined,
	implingTier: number | undefined
) {
	const timePerGame = Time.Minute * 10;
	const maxTripLength = calcMaxTripLength(user, 'PuroPuro');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;
	const skills = user.skillsAsLevels;
	const hunterLevel = skills.hunter;
	const [hasReqs, reason] = hasSkillReqs(user, puroPuroSkillRequirements);
	const [hasDarkLureSkillReqs, lureReason] = hasSkillReqs(user, darkLureSkillRequirements);
	if (!hasReqs) return `To hunt in Puro-Puro, you need: ${reason}.`;
	if (user.QP < 3) return 'To hunt in Puro-Puro, you need 3 QP.';
	let impToHunt: PuroImpling | undefined = undefined;
	if (impling) {
		impToHunt = puroOptions.find(i => stringMatches(i.name, impling));
	} else if (implingTier) {
		impToHunt = puroOptions.find(i => i.tier === implingTier);
	}
	if (!impToHunt) return 'Error selecting impling, please try again.';
	if (hunterLevel < impToHunt.hunterLevel)
		return `${user.minionName} needs at least level ${impToHunt.hunterLevel} hunter to hunt ${impToHunt.name} in Puro-Puro.`;
	if (!darkLure || (darkLure && !impToHunt.spell)) darkLure = false;
	if (darkLure) {
		if (user.QP < 9) return 'To use Dark Lure, you need 9 QP.';
		if (!hasDarkLureSkillReqs) return `To use Dark Lure, you need: ${lureReason}.`;
		const { bank } = user;
		const natureRuneID = itemID('Nature rune');
		const deathRuneID = itemID('Death rune');
		if (impToHunt.tier === 2) {
			if (bank.amount(natureRuneID) < 100 || bank.amount(deathRuneID) < 100)
				return "You don't have enough Nature and Death runes to start this trip, you need at least 100 of each.";
		} else if (bank.amount(natureRuneID) < 300 || bank.amount(deathRuneID) < 300) {
			return "You don't have enough Nature and Death runes to start this trip, you need at least 300 of each.";
		}
	}

	await addSubTaskToActivityTask<PuroPuroActivityTaskOptions>({
		implingTier: impToHunt.tier ?? null,
		quantity,
		userID: user.id,
		duration,
		darkLure,
		type: 'PuroPuro',
		channelID: channelID.toString(),
		minigameID: 'puro_puro'
	});

	let str = `${user.minionName} is now hunting ${impToHunt.name} in Puro-Puro! It will take ${formatDuration(
		duration
	)} to finish.`;

	if (!userHasGracefulEquipped(user) && impToHunt.name !== 'Dragon Implings')
		str += '\n20% less implings due to having no Graceful equipped.';

	if (!impToHunt.spell) {
		str += `\n**Note:** You can't use Dark Lure when hunting ${impToHunt.name} as you are camping their spawn.`;
	}

	return str;
}
