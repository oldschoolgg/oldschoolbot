import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank, Misc } from 'oldschooljs';

import { Events, ZALCANO_ID } from '../../../lib/constants';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ZalcanoActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ZalcanoActivityTaskOptions) {
		const { channelID, quantity, duration, userID, performance, isMVP } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMonsterScore(ZALCANO_ID, quantity);

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

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: miningXP,
			duration
		});
		xpRes += await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: smithingXP
		});
		xpRes += await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: runecraftXP
		});

		const kc = user.getKC(ZALCANO_ID);

		if (loot.amount('Smolcano') > 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received **Smolcano**, their Zalcano KC is ${randInt(
					kc || 1,
					(kc || 1) + quantity
				)}!`
			);
		}

		await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity}x Zalcano`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${
				user.minionName
			} finished killing ${quantity}x Zalcano. Your Zalcano KC is now ${
				kc + quantity
			}. ${xpRes}`,
			res => {
				user.log(`continued zalcano`);
				return this.client.commands.get('zalcano')!.run(res, []);
			},
			image!,
			data,
			loot.bank
		);
	}
}
