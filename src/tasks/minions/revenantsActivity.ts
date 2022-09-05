import { Prisma } from '@prisma/client';
import { deepClone, roll } from 'e';
import { Bank } from 'oldschooljs';

import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { revenantMonsters } from '../../lib/minions/data/killableMonsters/revs';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { runCommand } from '../../lib/settings/settings';
import { SkillsEnum } from '../../lib/skilling/types';
import { filterLootReplace } from '../../lib/slayer/slayerUtil';
import { Gear } from '../../lib/structures/Gear';
import { RevenantOptions } from '../../lib/types/minions';
import { hasSkillReqs } from '../../lib/util';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { updateBankSetting } from '../../mahoji/mahojiSettings';

export const revenantsTask: MinionTask = {
	type: 'Revenants',
	async run(data: RevenantOptions) {
		const { monsterID, userID, channelID, quantity, died, skulled } = data;
		const monster = revenantMonsters.find(mon => mon.id === monsterID)!;
		const user = await mUserFetch(userID);
		if (died) {
			// 1 in 20 to get smited without prayer potions and 1 in 300 if the user has prayer potions
			const hasPrayerLevel = hasSkillReqs(user, { [SkillsEnum.Prayer]: 25 })[0];
			const protectItem = roll(data.usingPrayerPots ? 300 : 20) ? false : hasPrayerLevel;
			const userGear = { ...deepClone(user.gear.wildy.raw()) };

			const calc = calculateGearLostOnDeathWilderness({
				gear: userGear,
				smited: hasPrayerLevel && !protectItem,
				protectItem: hasPrayerLevel,
				after20wilderness: true,
				skulled
			});

			const image = await generateGearImage(user, new Gear(calc.newGear), 'wildy', null);
			await user.update({
				gear_wildy: calc.newGear as Prisma.InputJsonObject
			});

			updateBankSetting('revs_cost', calc.lostItems);

			handleTripFinish(
				user,
				channelID,
				`${user} ${
					hasPrayerLevel && !protectItem
						? `Oh no! While running for your life, you panicked, got smited ${
								skulled ? 'and lost everything!' : "and couldn't protect a 4th item."
						  }`
						: ''
				} You died, you lost all your loot, and these equipped items: ${
					calc.lostItems
				}.\nHere is what you saved:`,
				res => {
					return runCommand({
						...res,
						commandName: 'k',
						args: {
							name: monster.name
						},
						isContinue: true
					});
				},
				image,
				data,
				null
			);
			return;
		}

		await user.incrementKC(monsterID, quantity);

		const loot = monster.table.kill(quantity, { skulled });
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n`;

		announceLoot({
			user: await mUserFetch(user.id),
			monsterID: monster.id,
			loot,
			notifyDrops: monster.notifyDrops
		});

		const { clLoot } = filterLootReplace(user.allItemsOwned(), loot);

		await user.update({
			collectionLogBank: new Bank(user.cl).add(clLoot).bank
		});
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			itemsToAdd: loot,
			collectionLog: false
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${monster.name} (${skulled ? 'skulled' : 'unskulled'}):`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			str,
			res => {
				return runCommand({
					...res,
					commandName: 'k',
					args: {
						name: monster.name
					},
					isContinue: true
				});
			},
			image.file.buffer,
			data,
			itemsAdded
		);
	}
};
