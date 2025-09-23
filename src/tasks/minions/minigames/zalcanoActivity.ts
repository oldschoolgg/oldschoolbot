import { Events } from '@oldschoolgg/toolkit/constants';
import { Bank, EMonster, Misc } from 'oldschooljs';

import { KourendKebosDiary, userhasDiaryTier } from '@/lib/diaries.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import type { ZalcanoActivityTaskOptions } from '@/lib/types/minions.js';
import { ashSanctifierEffect } from '@/lib/util/ashSanctifier.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { randInt } from '@/lib/util/rng.js';

export const zalcanoTask: MinionTask = {
	type: 'Zalcano',
	async run(data: ZalcanoActivityTaskOptions) {
		const { channelID, quantity, duration, userID, performance, isMVP } = data;
		const user = await mUserFetch(userID);
		const { newKC } = await user.incrementKC(EMonster.ZALCANO, quantity);
		const [hasKourendHard] = await userhasDiaryTier(user, KourendKebosDiary.hard);
		const [hasKourendElite] = await userhasDiaryTier(user, KourendKebosDiary.elite);
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
				duration,
				source: 'Zalcano'
			})
		);

		xpRes.push(
			await user.addXP({ skillName: SkillsEnum.Smithing, amount: smithingXP, duration, source: 'Zalcano' })
		);
		xpRes.push(
			await user.addXP({ skillName: SkillsEnum.Runecraft, amount: runecraftXP, duration, source: 'Zalcano' })
		);

		let str = `${user}, ${
			user.minionName
		} finished killing ${quantity}x Zalcano. Your Zalcano KC is now ${newKC}.\n\n **XP Gains:** ${xpRes.join(
			', '
		)}\n`;

		const updateBank = new UpdateBank();
		updateBank.itemLootBank.add(loot);
		if (hasKourendHard) {
			const result = ashSanctifierEffect({
				hasKourendElite,
				updateBank,
				gearBank: user.gearBank,
				bitfield: user.bitfield,
				duration
			});
			if (result) {
				str += result.message;
			}
		}

		if (loot.amount('Smolcano') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received **Smolcano**, their Zalcano KC is ${randInt(newKC - quantity, newKC)}!`
			);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: updateBank.itemLootBank
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Zalcano`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
