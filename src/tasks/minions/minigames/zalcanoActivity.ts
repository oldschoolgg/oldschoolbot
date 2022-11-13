import { randInt } from 'e';
import { Bank, Misc } from 'oldschooljs';

import { Events, ZALCANO_ID } from '../../../lib/constants';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ZalcanoActivityTaskOptions } from '../../../lib/types/minions';
import { ashSanctifierEffect } from '../../../lib/util/ashSanctifier';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export const zalcanoTask: MinionTask = {
	type: 'Zalcano',
	async run(data: ZalcanoActivityTaskOptions) {
		const { channelID, quantity, duration, userID, performance, isMVP } = data;
		const user = await mUserFetch(userID);
		const kc = user.getKC(ZALCANO_ID);
		await user.incrementKC(ZALCANO_ID, quantity);

		const loot = new Bank();

		let runecraftXP = 0;
		let smithingXP = 0;
		let miningXP = 0;

		for (let i = 0; i < quantity; i++) {
			loot.add(
				Misc.Zalcano.kill({
					team: [{ isMVP, performancePercentage: performance, id: '1' }]
				})['1']
			);
			runecraftXP += randInt(100, 170);
			smithingXP += randInt(250, 350);
			miningXP += randInt(1100, 1400);
		}

		const xpRes: string[] = [];
		xpRes.push(
			await user.addXP({
				skillName: SkillsEnum.Mining,
				amount: miningXP,
				duration
			})
		);

		xpRes.push(await user.addXP({ skillName: SkillsEnum.Smithing, amount: smithingXP }));
		xpRes.push(await user.addXP({ skillName: SkillsEnum.Runecraft, amount: runecraftXP }));

		await ashSanctifierEffect(user, loot, duration, xpRes);

		if (loot.amount('Smolcano') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.usernameOrMention}'s** minion, ${
					user.minionName
				}, just received **Smolcano**, their Zalcano KC is ${randInt(kc || 1, (kc || 1) + quantity)}!`
			);
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Zalcano`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished killing ${quantity}x Zalcano. Your Zalcano KC is now ${
				kc + quantity
			}.\n\n **XP Gains:** ${xpRes.join(', ')}\n`,
			image.file.attachment,
			data,
			itemsAdded
		);
	}
};
