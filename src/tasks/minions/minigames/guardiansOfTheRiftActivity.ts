import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import { randArrItem, randInt } from 'e';
import { Bank, SkillsEnum } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/minigames';
import { bloodEssence } from '../../../lib/skilling/functions/calcsRunecrafting';
import Runecraft from '../../../lib/skilling/skills/runecraft';
import { itemID, stringMatches } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { calcMaxRCQuantity, userStatsUpdate } from '../../../mahoji/mahojiSettings';
import { rewardsGuardianTable } from './../../../lib/simulation/rewardsGuardian';
import type { GuardiansOfTheRiftActivityTaskOptions } from './../../../lib/types/minions';

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
	async run(data: GuardiansOfTheRiftActivityTaskOptions) {
		const { channelID, userID, quantity, duration, minedFragments, barrierAndGuardian, rolls, combinationRunes } =
			data;
		const user = await mUserFetch(userID);
		const previousScore = (await getMinigameEntity(user.id)).guardians_of_the_rift;
		const { newScore } = await incrementMinigameScore(userID, 'guardians_of_the_rift', quantity);
		const kcForPet = randInt(previousScore, newScore);

		const miningXP = quantity * 5 * minedFragments;
		const craftingXP = quantity * 80 * barrierAndGuardian;
		const rcXP =
			quantity *
			(45 * user.skillLevel(SkillsEnum.Runecraft) + 300 * barrierAndGuardian + 17 * minedFragments) *
			Math.min(user.skillLevel(SkillsEnum.Runecraft) / 99, 1);

		const [xpResRunecraft, xpResCrafting, xpResMining] = await Promise.all([
			user.addXP({
				skillName: SkillsEnum.Runecraft,
				amount: Math.floor(rcXP),
				duration,
				source: 'GuardiansOfTheRift'
			}),
			user.addXP({
				skillName: SkillsEnum.Crafting,
				amount: Math.floor(craftingXP),
				duration,
				source: 'GuardiansOfTheRift'
			}),
			user.addXP({
				skillName: SkillsEnum.Mining,
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
			if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) continue;
			if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
			if (bank.has(pouch.id) && pouch.id === itemID('Colossal pouch')) break;
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
					rune = randArrItem(combinationalRunesArray);
				} else {
					rune = randArrItem(elementalRunesArray);
				}
			} else {
				rune = randArrItem(catalyticRunesArray);
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
			rewardsQty += randInt(rolls - 1, rolls);
		}
		rewardsGuardianLoot.add(rewardsGuardianTable.roll(rewardsQty));

		await userStatsUpdate(
			user.id,
			{
				gotr_rift_searches: {
					increment: rewardsQty
				}
			},
			{}
		);

		const totalLoot = new Bank();
		totalLoot.add(rewardsGuardianLoot);
		const bonusBloods = await bloodEssence(user, runesLoot.amount('Blood rune'));
		runesLoot.add('Blood rune', bonusBloods);
		totalLoot.add(runesLoot);

		const { previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: totalLoot
		});

		const image = await makeBankImage({
			bank: rewardsGuardianLoot,
			title: `Loot From ${rewardsQty}x Rewards Guardian rolls`,
			user,
			previousCL
		});

		let str = `<@${userID}>, ${
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
			str += "\n\n**You have a funny feeling you're being followed...**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Abyssal Protector while doing the Guardians of the Rift minigame at level ${user.skillLevel(
					SkillsEnum.Runecraft
				)} Runecrafting and on run ${formatOrdinal(kcForPet)}!`
			);
		}

		updateBankSetting('gotr_loot', totalLoot);
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

		handleTripFinish(user, channelID, str, image.file.attachment, data, null);
	}
};
