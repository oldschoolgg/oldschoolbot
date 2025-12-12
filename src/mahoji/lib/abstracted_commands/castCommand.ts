import { formatDuration, reduceNumByPercent, stringMatches, Time } from '@oldschoolgg/toolkit';

import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import type { CastingActivityTaskOptions } from '@/lib/types/minions.js';
import { determineRunes } from '@/lib/util/determineRunes.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

export async function castCommand(channelId: string, user: MUser, name: string, quantity: number | undefined) {
	const spell = Castables.find(spell => stringMatches(spell.id.toString(), name) || stringMatches(spell.name, name));
	const boosts = [];
	const missedBoosts = [];

	if (!spell) {
		return `That is not a valid spell to cast, the spells you can cast are: ${Castables.map(i => i.name).join(
			', '
		)}.`;
	}

	if (user.skillsAsLevels.magic < spell.level) {
		return `${user.minionName} needs ${spell.level} Magic to cast ${spell.name}.`;
	}

	if (spell.craftLevel && user.skillsAsLevels.crafting < spell.craftLevel) {
		return `${user.minionName} needs ${spell.craftLevel} Crafting to cast ${spell.name}.`;
	}

	if (spell.qpRequired && user.QP < spell.qpRequired) {
		return `${user.minionName} needs ${spell.qpRequired} QP to cast ${spell.name}.`;
	}

	const userBank = user.bank;

	let castTimeMilliSeconds = spell.ticks * Time.Second * 0.6 + Time.Second / 4;

	if (spell.travelTime) {
		let { travelTime } = spell;
		if (user.hasGracefulEquipped()) {
			travelTime = reduceNumByPercent(travelTime, 20); // 20% boost for having graceful
			boosts.push('20% for Graceful outfit');
		} else {
			missedBoosts.push('20% for Graceful outfit');
		}

		if (spell.agilityBoost) {
			const boostLevels = spell.agilityBoost.map(boost => boost[0]);
			const boostPercentages = spell.agilityBoost.map(boost => boost[1]);

			const availableBoost = boostLevels.find(boost => user.skillsAsLevels.agility >= boost);
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

	const maxTripLength = await user.calcMaxTripLength('Casting');

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
	await ClientSettings.updateBankSetting('magic_cost_bank', cost);

	await ActivityManager.startTrip<CastingActivityTaskOptions>({
		spellID: spell.id,
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'Casting'
	});

	const magicXpHr = `${Math.round(
		((spell.xp * quantity) / (duration / Time.Minute)) * 60
	).toLocaleString()} Magic XP/Hr`;

	let response = `${user.minionName} is now casting ${quantity}x ${spell.name}, it'll take around ${await formatTripDuration(
		user,
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
