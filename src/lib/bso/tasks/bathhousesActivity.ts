import type { BathhouseTaskOptions } from '@/lib/bso/bsoTypes.js';
import { calculateBathouseResult } from '@/lib/bso/minigames/baxtorianBathhouses.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { uniqueArr } from '@oldschoolgg/toolkit';
import { userMention } from 'discord.js';
import { resolveItems } from 'oldschooljs';

import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const bathhouseTask: MinionTask = {
	type: 'BaxtorianBathhouses',
	async run(data: BathhouseTaskOptions, { user, handleTripFinish }) {
		const { userID, channelID, quantity, duration } = data;
		const { cl } = user;
		const { loot, herbXP, firemakingXP, tier, speciesServed, gaveExtraTips } = calculateBathouseResult(data);
		await user.incrementMinigameScore('bax_baths', quantity);

		const uniques = resolveItems(['Inferno adze', 'Flame gloves', 'Ring of fire']);
		let uniqueChance = Math.floor(50 * tier.uniqueMultiplier);
		const uniquesNotReceived = uniques.filter(i => !cl.has(i));
		if (uniquesNotReceived.length === 0) uniqueChance *= 1.5;
		const uniquesCanReceive = uniquesNotReceived.length === 0 ? uniques : uniquesNotReceived;
		const petChance = Math.floor(1000 * tier.uniqueMultiplier);
		for (let i = 0; i < quantity; i++) {
			if (roll(uniqueChance)) {
				loot.add(randArrItem(uniquesCanReceive));
			}
			if (roll(petChance)) {
				loot.add('Phoenix eggling');
			}
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		let xpStr = await user.addXP({ skillName: 'herblore', amount: herbXP, duration });
		xpStr += '\n';
		xpStr += await user.addXP({
			skillName: 'firemaking',
			amount: firemakingXP,
			duration
		});

		const uniqSpecies = uniqueArr(speciesServed);
		await ClientSettings.updateBankSetting('bb_loot', loot);

		const bankImage = await makeBankImage({
			bank: itemsAdded,
			title: 'Baxtorian Bathhouses Loot',
			user,
			previousCL
		});

		return handleTripFinish(
			user,
			channelID,
			`${userMention(userID)}, ${user.minionName} finished running ${quantity}x ${tier.name} baths for ${
				uniqSpecies.length
			} species (${uniqSpecies.map(i => i.name).join(', ')}) at the Baxtorian Bathhouses.${
				gaveExtraTips
					? `\nYou got extra tips from ${gaveExtraTips.name} for using their preferred water mixture.`
					: ''
			}
${xpStr}`,
			bankImage.file.attachment,
			data,
			loot
		);
	}
};
