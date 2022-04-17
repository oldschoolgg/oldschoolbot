import { deepClone, roll } from 'e';
import { Task } from 'klasa';

import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { revenantMonsters } from '../../lib/minions/data/killableMonsters/revs';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { runCommand } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { filterLootReplace } from '../../lib/slayer/slayerUtil';
import { Gear } from '../../lib/structures/Gear';
import { RevenantOptions } from '../../lib/types/minions';
import { updateBankSetting } from '../../lib/util';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: RevenantOptions) {
		const { monsterID, userID, channelID, quantity, died, skulled } = data;
		const monster = revenantMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.fetchUser(userID);
		if (died) {
			// 1 in 20 to get smited without prayer potions and 1 in 300 if the user has prayer potions
			const hasPrayerLevel = user.hasSkillReqs({ [SkillsEnum.Prayer]: 25 })[0];
			const protectItem = roll(data.usingPrayerPots ? 300 : 20) ? false : hasPrayerLevel;
			const userGear = { ...deepClone(user.settings.get(UserSettings.Gear.Wildy)!) };

			const calc = calculateGearLostOnDeathWilderness({
				gear: userGear,
				smited: hasPrayerLevel && !protectItem,
				protectItem: hasPrayerLevel,
				after20wilderness: true,
				skulled
			});

			const image = await generateGearImage(this.client, user, new Gear(calc.newGear), 'wildy', null);
			await user.settings.update(UserSettings.Gear.Wildy, calc.newGear);

			updateBankSetting(this.client, ClientSettings.EconomyStats.RevsCost, calc.lostItems);

			handleTripFinish(
				this.client,
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
					user.log(`continued trip of killing ${monster.name}`);
					return runCommand({
						message: res,
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

		await user.incrementMonsterScore(monsterID, quantity);

		const loot = monster.table.kill(quantity, { skulled });
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n`;

		announceLoot({ user, monsterID: monster.id, loot, notifyDrops: monster.notifyDrops });

		const { clLoot } = filterLootReplace(user.allItemsOwned(), loot);

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: false });
		await user.addItemsToCollectionLog({ items: clLoot });

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${monster.name} (${skulled ? 'skulled' : 'unskulled'}):`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return runCommand({
					message: res,
					commandName: 'k',
					args: {
						name: monster.name
					},
					isContinue: true
				});
			},
			image!,
			data,
			itemsAdded
		);
	}
}
