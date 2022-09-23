import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { Events } from '../../../lib/constants';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/minigames';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { rewardsGuardianTable } from './../../../lib/simulation/rewardsGuardian';
import { GuardiansOfTheRiftActivityTaskOptions } from './../../../lib/types/minions';

export const guardiansOfTheRiftTask: MinionTask = {
	type: 'GuardiansOfTheRift',
	async run(data: GuardiansOfTheRiftActivityTaskOptions) {
		const { channelID, userID, quantity, duration, minedEseences, barrierAndGuardian, rolls } = data;
		const user = await mUserFetch(userID);
		const previousScore = (await getMinigameEntity(user.id)).guardians_of_the_rift;
		const { newScore } = await incrementMinigameScore(userID, 'guardians_of_the_rift', quantity);
		const kcForPet = randInt(previousScore, newScore);

		const miningXP = quantity * 5 * minedEseences;
		const craftingXP = quantity * 80 * barrierAndGuardian;
		const rcXP =
			quantity * (45 * user.skillLevel(SkillsEnum.Runecraft) + 400 * barrierAndGuardian + 10 * minedEseences);

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

		let loot = new Bank();

		for (let i = 0; i < quantity * rolls; i++) {
			loot.add(rewardsGuardianTable.roll());
		}

		let str = `<@${userID}>, ${
			user.minionName
		} finished ${quantity}x Guardians Of The Rift runs and looted the Rewards Guardian ${
			quantity * rolls
		}x times. ${xpResRunecraft} ${xpResCrafting} ${xpResMining}`;

		if (loot.amount('Abyssal Protector') > 0) {
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

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity * rolls}x Rewards Guardian rolls`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { gotr: { start: { combinationRunes: true } } }, true],
			image.file.attachment,
			data,
			null
		);
	}
};
