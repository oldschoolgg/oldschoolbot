import { MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';

import { roll } from '@oldschoolgg/rng';
import { increaseNumByPercent, Time } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import { bloodEssence, raimentBonus } from '@/lib/skilling/functions/calcsRunecrafting.js';
import Runecraft from '@/lib/skilling/skills/runecraft.js';
import type { RunecraftActivityTaskOptions } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';
import { calcMaxRCQuantity } from '@/mahoji/mahojiSettings.js';

export const runecraftTask: MinionTask = {
	type: 'Runecraft',
	async run(data: RunecraftActivityTaskOptions, { user, handleTripFinish }) {
		const { runeID, essenceQuantity, channelID, imbueCasts, duration, daeyaltEssence, useExtracts } = data;

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID)!;

		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		let runeQuantity = essenceQuantity * quantityPerEssence;
		let bonusQuantity = 0;
		if (rune.name === 'Elder rune') {
			runeQuantity = Math.max(1, Math.floor(runeQuantity / 3));
		}

		let runeXP = rune.xp;

		if (daeyaltEssence) {
			runeXP = rune.xp * 1.5;
		}

		let xpReceived = essenceQuantity * runeXP;

		const hasMaster = user.hasEquippedOrInBank(
			[
				'Master runecrafter hat',
				'Master runecrafter robe',
				'Master runecrafter skirt',
				'Master runecrafter boots'
			],
			'every'
		);
		if (hasMaster) {
			xpReceived = increaseNumByPercent(xpReceived, 10);
		}
		const magicXpReceived = imbueCasts * 86;

		let xpRes = `\n${await user.addXP({
			skillName: 'runecraft',
			amount: xpReceived,
			duration
		})}`;
		if (magicXpReceived > 0) {
			xpRes += `\n${await user.addXP({ skillName: 'magic', amount: magicXpReceived, duration })}`;
		}

		let str = `${user}, ${user.minionName} finished crafting ${runeQuantity} ${rune.name}. ${xpRes}`;
		if (hasMaster) {
			str += 'You received 10% bonus XP from your Master runecrafter outfit.';
		}

		const raimentQuantity = raimentBonus(user, runeQuantity);
		runeQuantity += raimentQuantity;
		bonusQuantity += raimentQuantity;

		let bonusBlood = 0;
		if (runeID === EItem.BLOOD_RUNE) {
			bonusBlood = await bloodEssence(user, essenceQuantity);
			runeQuantity += bonusBlood;
		}

		let extractBonus = 0;
		if (useExtracts) {
			const f2pRunes = new Set(['Air rune', 'Mind rune', 'Water rune', 'Earth rune', 'Fire rune', 'Body rune']);
			extractBonus = f2pRunes.has(rune.name) ? 250 * essenceQuantity : 60 * essenceQuantity;
			runeQuantity += extractBonus;
		}

		const loot = new Bank({
			[rune.id]: runeQuantity
		});

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			const droprate = clAdjustedDroprate(user, 'Obis', Math.floor(5000 / minutes), 1.5);
			if (roll(droprate)) {
				str +=
					'\n**<:obis:787028036792614974> An enchantment guardian takes note of your prowess in runecrafting and elects to join you.**';
				loot.add('Obis');
			}
		}

		const { petDropRate } = skillingPetDropRate(user, 'runecraft', 1_795_758);
		if (roll(petDropRate / essenceQuantity)) {
			loot.add('Rift guardian');
		}

		if (daeyaltEssence) {
			str += '\nYou are gaining 50% more Runecrafting XP due to using Daeyalt Essence.';
		}

		str += `\n\nYou received: ${loot}.`;

		if (bonusQuantity > 0) {
			str += ` **\nRaiments of the eye bonus:** ${bonusQuantity.toLocaleString()}`;
		}

		if (bonusBlood > 0) {
			str += ` **\nBlood essence bonus:** ${bonusBlood.toLocaleString()}`;
		}

		if (useExtracts) {
			str += ` **\nExtract bonus:** ${extractBonus!.toLocaleString()}`;
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
