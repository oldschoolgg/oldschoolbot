import { deepClone, roll } from 'e';
import { Task } from 'klasa';

import { revenantMonsters } from '../../commands/Minion/revs';
import { GearSetupTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
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
		const { monsterID, userID, channelID, quantity, duration, died, skulled, combatType } = data;
		const monster = revenantMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		if (died) {
			// 1 in 50 to get smited
			const hasPrayerLevel = user.hasSkillReqs({ [SkillsEnum.Prayer]: 25 })[0];
			const protectItem = roll(50) ? false : hasPrayerLevel;

			const calc = calculateGearLostOnDeathWilderness({
				gear: deepClone(user.settings.get(UserSettings.Gear.Wildy)!),
				smited: hasPrayerLevel && !protectItem,
				protectItem: hasPrayerLevel,
				after20wilderness: true,
				skulled
			});

			if (!calc) return;

			const image = await generateGearImage(
				this.client,
				user,
				new Gear(calc.newGear),
				GearSetupTypes.Wildy,
				null
			);
			await user.settings.update(UserSettings.Gear.Wildy, calc.newGear);

			updateBankSetting(this.client, ClientSettings.EconomyStats.RevsCost, calc.lostItems);

			handleTripFinish(
				this.client,
				user,
				channelID,
				`${
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
					return this.client.commands.get('revs')!.run(res, [combatType, monster.name]);
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
		str += await addMonsterXP(user, {
			monsterID,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null,
			minimal: true
		});

		announceLoot(this.client, user, monster, loot.bank);

		const { clLoot } = filterLootReplace(user.allItemsOwned(), loot);

		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, false);
		await user.addItemsToCollectionLog(clLoot.bank);

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
				const flags: Record<string, string> = skulled === null ? {} : { skull: 'skull' };
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (!res.prompter) res.prompter = {};
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				res.prompter.flags = flags;

				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('revs')!.run(res, [combatType, monster.name]);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
