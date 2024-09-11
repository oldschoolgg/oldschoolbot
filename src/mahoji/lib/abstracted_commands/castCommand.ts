import { Time, reduceNumByPercent } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { Castables } from '../../../lib/skilling/skills/magic/castables';
import type { CastingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function castCommand(channelID: string, user: MUser, name: string, quantity: number | undefined) {
	const spell = Castables.find(spell => stringMatches(spell.id.toString(), name) || stringMatches(spell.name, name));
	const boosts = [];
	const missedBoosts = [];

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

	if (spell.qpRequired && user.QP < spell.qpRequired) {
		return `${user.minionName} needs ${spell.qpRequired} QP to cast ${spell.name}.`;
	}

	const userBank = user.bank;

	let castTimeMilliSeconds = spell.ticks * Time.Second * 0.6 + Time.Second / 4;

	if (spell.travelTime) {
		let { travelTime } = spell;
		if (userHasGracefulEquipped(user)) {
			travelTime = reduceNumByPercent(travelTime, 20); // 20% boost for having graceful
			boosts.push('20% for Graceful outfit');
		} else {
			missedBoosts.push('20% for Graceful outfit');
		}

		if (spell.agilityBoost) {
			const boostLevels = spell.agilityBoost.map(boost => boost[0]);
			const boostPercentages = spell.agilityBoost.map(boost => boost[1]);

			const availableBoost = boostLevels.find(boost => user.skillLevel(SkillsEnum.Agility) >= boost);
			if (availableBoost) {
				const boostIndex = boostLevels.indexOf(availableBoost);

				travelTime = reduceNumByPercent(travelTime, boostPercentages[boostIndex]); // Apply an agility boost based on tier
				boosts.push(`${boostPercentages[boostIndex]}% for ${availableBoost}+ Agility`);

				if (boostIndex > 0) {
					missedBoosts.push(
						`${boostPercentages[boostIndex - 1]}% for ${boostLevels[boostIndex - 1]}+ Agility`
					);
				}
			} else {
				const worstBoost = spell.agilityBoost[spell.agilityBoost.length - 1];
				missedBoosts.push(`${worstBoost[1]}% for ${worstBoost[0]}+ Agility`);
			}
		}

		castTimeMilliSeconds += travelTime / 27; // One trip holds 27 casts, scale it down
	}

	const maxTripLength = calcMaxTripLength(user, 'Casting');

	if (!quantity) {
		quantity = Math.floor(maxTripLength / castTimeMilliSeconds);
		const spellRunes = determineRunes(user, spell.input.clone());
		const max = userBank.fits(spellRunes);
		if (max < quantity && max !== 0) quantity = max;
	}

	const duration = quantity * castTimeMilliSeconds;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${spell.name}s you can cast is ${Math.floor(
			maxTripLength / castTimeMilliSeconds
		)}.`;
	}
	const cost = determineRunes(user, spell.input.clone().multiply(quantity));
	if (!userBank.has(cost)) {
		return `You don't have the materials needed to cast ${quantity}x ${spell.name}, you need ${
			spell.input
		}, you're missing **${cost.clone().remove(userBank)}** (Cost: ${cost}).`;
	}

	const userGP = user.GP;

	let gpCost = 0;
	if (spell.gpCost) {
		gpCost = spell.gpCost * quantity;
		if (gpCost > userGP) {
			return `You need ${gpCost} GP to create ${quantity} planks.`;
		}
		cost.add('Coins', gpCost);
	}

	await user.removeItemsFromBank(cost);
	await updateBankSetting('magic_cost_bank', cost);

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

	let response = `${user.minionName} is now casting ${quantity}x ${spell.name}, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${cost}${spell.gpCost ? ` and ${gpCost} Coins` : ''} from your bank. **${magicXpHr}**`;

	if (spell.craftXp) {
		response += ` and** ${Math.round(
			((spell.craftXp * quantity) / (duration / Time.Minute)) * 60
		).toLocaleString()} Crafting XP/Hr**`;
	}

	if (spell.prayerXp) {
		response += ` and** ${Math.round(
			((spell.prayerXp * quantity) / (duration / Time.Minute)) * 60
		).toLocaleString()} Prayer XP/Hr**`;
	}

	if (boosts.length > 0) {
		response += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	if (missedBoosts.length > 0) {
		response += `\n**Missed boosts:** ${missedBoosts.join(', ')}.`;
	}

	return response;
}
