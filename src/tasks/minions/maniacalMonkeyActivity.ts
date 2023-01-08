import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { resolveAttackStyles } from '../../lib/minions/functions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { ManiacalMonkeyTable } from './../../lib/simulation/maniacalMonkey';
import { ManiacalMonkeyTaskOptions } from './../../lib/types/minions';

export const maniacalMonkeyID = 6803;

export const maniacalMonkeyTask: MinionTask = {
	type: 'ManiacalMonkey',
	async run(data: ManiacalMonkeyTaskOptions) {
		const { userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const [, , attackStyles] = resolveAttackStyles(user, { monsterID: maniacalMonkeyID });

		const manicalMonkeyHP = 65;
		const totalXP = manicalMonkeyHP * 4 * quantity;
		const xpPerSkill = totalXP / attackStyles.length;

		let res: string[] = [];

		for (const style of attackStyles) {
			res.push(
				await user.addXP({
					skillName: style,
					amount: Math.floor(xpPerSkill),
					duration
				})
			);
		}

		res.push(
			await user.addXP({
				skillName: SkillsEnum.Hitpoints,
				amount: Math.floor(manicalMonkeyHP * quantity * 1.33),
				duration
			})
		);

		let loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(ManiacalMonkeyTable.roll());
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${
			user.minionName
		} finished killing ${quantity} Maniacal monkey. Your Maniacal monkey KC is now ${
			user.getKC(maniacalMonkeyID) + quantity
		}\n**XP Gains:** ${res.join(' ')}.`;

		await user.incrementKC(maniacalMonkeyID, quantity);

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Maniacal Monkey`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
