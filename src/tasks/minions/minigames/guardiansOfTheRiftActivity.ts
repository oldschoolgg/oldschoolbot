import { Events, formatOrdinal, stringMatches } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { rewardsGuardianTable } from '@/lib/simulation/rewardsGuardian.js';
import { bloodEssence } from '@/lib/skilling/functions/calcsRunecrafting.js';
import Runecraft from '@/lib/skilling/skills/runecraft.js';
import type { GuardiansOfTheRiftActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { calcMaxRCQuantity } from '@/mahoji/mahojiSettings.js';

const catalyticRunesArray: string[] = [
	'Mind rune',
	'Body rune',
	'Cosmic rune',
	'Chaos rune',
	'Nature rune',
	'Law rune',
	'Death rune',
	'Blood rune'
];
const elementalRunesArray: string[] = ['Air rune', 'Water rune', 'Earth rune', 'Fire rune'];
const combinationalRunesArray: string[] = [
	'Mist rune',
	'Dust rune',
	'Mud rune',
	'Smoke rune',
	'Steam rune',
	'Lava rune'
];

export const guardiansOfTheRiftTask: MinionTask = {
	type: 'GuardiansOfTheRift',
	async run(data: GuardiansOfTheRiftActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration, minedFragments, barrierAndGuardian, rolls, combinationRunes } = data;
		const previousScore = await user.fetchMinigameScore('guardians_of_the_rift');
		const { newScore } = await user.incrementMinigameScore('guardians_of_the_rift', quantity);
		const kcForPet = rng.randInt(previousScore, newScore);

		const miningXP = quantity * 5 * minedFragments;
		const craftingXP = quantity * 80 * barrierAndGuardian;
		const rcLevel = user.skillsAsLevels.runecraft;
		const rcXP =
			quantity * (45 * rcLevel + 300 * barrierAndGuardian + 17 * minedFragments) * Math.min(rcLevel / 99, 1);

		const [xpResRunecraft, xpResCrafting, xpResMining] = await Promise.all([
			user.addXP({
				skillName: 'runecraft',
				amount: Math.floor(rcXP),
				duration,
				source: 'GuardiansOfTheRift'
			}),
			user.addXP({
				skillName: 'crafting',
				amount: Math.floor(craftingXP),
				duration,
				source: 'GuardiansOfTheRift'
			}),
			user.addXP({
				skillName: 'mining',
				amount: Math.floor(miningXP),
				duration,
				source: 'GuardiansOfTheRift'
			})
		]);

		const runesLoot = new Bank();
		let inventorySize = 28;
		const { bank } = user;
		// For each pouch the user has, increase their inventory size.
		for (const pouch of Runecraft.pouches) {
			if (rcLevel < pouch.level) continue;
			if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
			if (bank.has(pouch.id) && pouch.id === EItem.COLOSSAL_POUCH) break;
		}

		// If they have the entire Raiments of the Eye outfit, give an extra 20% quantity bonus (NO bonus XP)
		let setBonus = 1;
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Runecraft.raimentsOfTheEyeItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			setBonus += 60 / 100;
		} else {
			// For each Raiments of the Eye item, check if they have it, give its' quantity boost if so (NO bonus XP).
			for (const [itemID, bonus] of Object.entries(Runecraft.raimentsOfTheEyeItems)) {
				if (user.gear.skilling.hasEquipped([Number.parseInt(itemID)], false)) {
					setBonus += bonus / 100;
				}
			}
		}

		for (let i = 0; i < quantity * 10; i++) {
			let rune = '';
			const isElemental = i % 2 === 0;
			if (isElemental) {
				if (combinationRunes) {
					rune = rng.pick(combinationalRunesArray);
				} else {
					rune = rng.pick(elementalRunesArray);
				}
			} else {
				rune = rng.pick(catalyticRunesArray);
			}
			const runeObj = Runecraft.Runes.find(
				_rune => stringMatches(_rune.name, rune) || stringMatches(_rune.name.split(' ')[0], rune)
			);
			if (!runeObj) {
				continue;
			}
			const quantityPerEssence = calcMaxRCQuantity(runeObj, user);
			runesLoot.add(rune, Math.floor(quantityPerEssence * inventorySize * setBonus));
		}

		const rewardsGuardianLoot = new Bank();
		let rewardsQty = 0;
		for (let i = 0; i < quantity; i++) {
			rewardsQty += rng.randInt(rolls - 1, rolls);
		}
		rewardsGuardianLoot.add(rewardsGuardianTable.roll(rewardsQty));

		await user.statsUpdate({
			gotr_rift_searches: {
				increment: rewardsQty
			}
		});

		const totalLoot = new Bank();
		totalLoot.add(rewardsGuardianLoot);
		const bonusBloods = await bloodEssence(user, runesLoot.amount('Blood rune'));
		runesLoot.add('Blood rune', bonusBloods);
		totalLoot.add(runesLoot);

		const { previousCL } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: totalLoot
		});

		const image = await makeBankImage({
			bank: rewardsGuardianLoot,
			title: `Loot From ${rewardsQty}x Rewards Guardian rolls`,
			user,
			previousCL
		});

		let str = `<@${user.id}>, ${
			user.minionName
		} finished ${quantity}x Guardians Of The Rift runs and looted the Rewards Guardian ${rewardsQty}x times, also received: ${runesLoot}${
			setBonus - 1 > 0
				? ` ${Math.floor((setBonus - 1) * 100)}% Quantity bonus for Raiments Of The Eye Set Items`
				: ''
		}. ${xpResRunecraft} ${xpResCrafting} ${xpResMining}`;
		if (bonusBloods > 0) {
			str += `\n\n**Blood essence used:** ${bonusBloods.toLocaleString()}`;
		}
		if (rewardsGuardianLoot.amount('Abyssal Protector') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Abyssal Protector while doing the Guardians of the Rift minigame at level ${rcLevel} Runecrafting and on run ${formatOrdinal(kcForPet)}!`
			);
		}

		await ClientSettings.updateBankSetting('gotr_loot', totalLoot);
		await trackLoot({
			id: 'guardians_of_the_rift',
			type: 'Minigame',
			duration,
			kc: quantity,
			totalLoot,
			changeType: 'loot',
			users: [
				{
					id: user.id,
					loot: totalLoot,
					duration
				}
			]
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data });
	}
};
