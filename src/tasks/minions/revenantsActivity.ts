import type { Prisma } from '@prisma/client';
import { deepClone, roll } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { trackLoot } from '../../lib/lootTrack';
import { revenantMonsters } from '../../lib/minions/data/killableMonsters/revs';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { SkillsEnum } from '../../lib/skilling/types';
import { Gear } from '../../lib/structures/Gear';
import type { RevenantOptions } from '../../lib/types/minions';
import { hasSkillReqs } from '../../lib/util';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';

export const revenantsTask: MinionTask = {
	type: 'Revenants',
	async run(data: RevenantOptions) {
		const { monsterID, userID, channelID, quantity, died, skulled, duration } = data;
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
			// Track items lost
			await trackLoot({
				totalCost: calc.lostItems,
				id: monster.name,
				type: 'Monster',
				changeType: 'cost',
				users: [
					{
						id: user.id,
						cost: calc.lostItems
					}
				]
			});
			// Track loot (For duration)
			await trackLoot({
				totalLoot: new Bank(),
				id: monster.name,
				type: 'Monster',
				changeType: 'loot',
				duration,
				kc: quantity,
				users: [
					{
						id: user.id,
						loot: new Bank(),
						duration
					}
				]
			});

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
				image,
				data,
				null
			);
			return;
		}

		const { newKC } = await user.incrementKC(monsterID, quantity);

		// Add slayer
		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask.monster_id === Monsters.RevenantImp.id

		console.log(isOnTask);

		const loot = monster.table.kill(quantity, { onSlayerTask: isOnTask });
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}.` +
			` Your ${monster.name} KC is now ${newKC}.\n`;

		announceLoot({
			user,
			monsterID: monster.id,
			loot,
			notifyDrops: monster.notifyDrops
		});

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			itemsToAdd: loot,
			collectionLog: true
		});

		await trackLoot({
			totalLoot: itemsAdded,
			id: monster.name,
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot: itemsAdded,
					duration
				}
			]
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${monster.name} (${skulled ? 'skulled' : 'unskulled'}):`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
