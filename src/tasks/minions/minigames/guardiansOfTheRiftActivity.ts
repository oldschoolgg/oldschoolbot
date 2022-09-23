import { randArrItem, randInt } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { Events } from '../../../lib/constants';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/minigames';
import Runecraft from '../../../lib/skilling/skills/runecraft';
import { itemID, stringMatches } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { calcMaxRCQuantity } from '../../../mahoji/mahojiSettings';
import { rewardsGuardianTable } from './../../../lib/simulation/rewardsGuardian';
import { GuardiansOfTheRiftActivityTaskOptions } from './../../../lib/types/minions';

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
			quantity * (45 * user.skillLevel(SkillsEnum.Runecraft) + 350 * barrierAndGuardian + 10 * minedFragments);

		const [xpResRunecraft, xpResCrafting, xpResMining] = await Promise.all([
			user.addXP({
				skillName: SkillsEnum.Runecraft,
				amount: rcXP,
				duration
			}),
			user.addXP({
				skillName: SkillsEnum.Crafting,
				amount: craftingXP,
				duration
			}),
			user.addXP({
				skillName: SkillsEnum.Mining,
				amount: miningXP,
				duration
			})
		]);

		let runesLoot = new Bank();
		let inventorySize = 28;
		const { bank } = user;
		// For each pouch the user has, increase their inventory size.
		for (const pouch of Runecraft.pouches) {
			if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) continue;
			if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
			if (bank.has(pouch.id) && pouch.id === itemID('Colossal pouch')) break;
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
			runesLoot.add(quantityPerEssence * inventorySize);
		}

		let rewardsGuardianLoot = new Bank();
		for (let i = 0; i < quantity * rolls; i++) {
			rewardsGuardianLoot.add(rewardsGuardianTable.roll());
		}

		const totalLoot = new Bank(rewardsGuardianLoot);
		totalLoot.add(runesLoot);

		const { previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: totalLoot
		});

		const image = await makeBankImage({
			bank: rewardsGuardianLoot,
			title: `Loot From ${quantity * rolls}x Rewards Guardian rolls`,
			user,
			previousCL
		});

		let str = `<@${userID}>, ${
			user.minionName
		} finished ${quantity}x Guardians Of The Rift runs and looted the Rewards Guardian ${
			quantity * rolls
		}x times, also recieved: ${runesLoot}. ${xpResRunecraft} ${xpResCrafting} ${xpResMining}`;

		if (rewardsGuardianLoot.amount('Abyssal Protector') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.usernameOrMention}'s** minion, ${
					user.minionName
				}, just received a Abyssal Protector while doing the Guardians of the Rift minigame at level ${user.skillLevel(
					SkillsEnum.Runecraft
				)} Runecrafting and on run ${formatOrdinal(kcForPet)}!`
			);
		}

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { gotr: { start: {}, combinationRunes } }, true],
			image.file.attachment,
			data,
			null
		);
	}
};
