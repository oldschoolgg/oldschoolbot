import { Task } from 'klasa';
import { Bank, MonsterKillOptions, Monsters } from 'oldschooljs';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import {
	calculateSlayerPoints,
	getSlayerMasterOSJSbyID,
	getUsersCurrentSlayerInfo
} from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { addBanks } from '../../lib/util';;
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		await user.incrementMonsterScore(monsterID, quantity);

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monsterID);
		const quantitySlayed = isOnTask
			? Math.min(usersTask.currentTask!.quantityRemaining, quantity)
			: null;
		const xpRes = await addMonsterXP(
			user,
			monsterID,
			quantity,
			duration,
			isOnTask,
			quantitySlayed
		);

		const mySlayerUnlocks = user.settings.get(UserSettings.Slayer.SlayerUnlocks);
		// TODO: Remove debug logging
		console.log(usersTask);
		const slayerMaster = isOnTask
			? getSlayerMasterOSJSbyID(usersTask.slayerMaster!.id)
			: undefined;
		// Check if superiors unlock is purchased
		const superiorsUnlocked = isOnTask
			? mySlayerUnlocks.includes(SlayerTaskUnlocksEnum.LikeABoss)
			: undefined;

		const superiorTable = superiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = monster.existsInCatacombs ?? undefined;

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTask,
			slayerMaster,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs
		};
		const loot = new Bank(monster.table.kill(quantity, killOptions));
		const superiorCount = loot.bank[420];
		announceLoot(this.client, user, monster, loot.bank);

		const superiorMessage = superiorCount ? `, including **${superiorCount} superiors**` : '';
		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}${superiorMessage}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n${xpRes}\n`;
		if (
			monster.id === Monsters.Unicorn.id &&
			user.hasItemEquippedAnywhere('Iron dagger') &&
			!user.hasItemEquippedOrInBank('Clue hunter cloak')
		) {
			loot.add('Clue hunter cloak');
			loot.add('Clue hunter boots');

			str += `\n\nWhile killing a Unicorn, you discover some strange clothing in the ground - you pick them up.`;
		}

		// TODO: Delete logging
		console.log({ isOnTask, usersTask, monsterID: monster.id });
		console.log({
			remaining: usersTask.currentTask?.quantityRemaining,
			slayed: quantitySlayed
		});
		if (isOnTask) {
			const quantityLeft = Math.max(
				0,
				usersTask.currentTask!.quantityRemaining - quantitySlayed!
			);

			const thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
				user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
				const points = calculateSlayerPoints(currentStreak, usersTask.slayerMaster!);
				const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
				await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);

				str += ` You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${newPoints}; return to a Slayer master.`;
			} else {
				str += `\nYou killed ${quantitySlayed}x of your ${
					usersTask.currentTask!.quantityRemaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}
			usersTask.currentTask!.quantityRemaining = quantityLeft;
			await usersTask.currentTask!.save();
		}

		// TODO: Refactor this into a 'lootFilter' function/class/something
		// Order: Fang, eye, heart.
		const numHydraEyes = loot.bank[itemID("Hydra's eye")];
		const numDarkTotemBases = loot.bank[itemID('Dark totem base')];
		const ringPieces = resolveItems([
			"Hydra's eye",
			"Hydra's fang",
			"Hydra's heart"
		]) as number[];
		const totemPieces = resolveItems([
			'Dark totem base',
			'Dark totem middle',
			'Dark totem top'
		]) as number[];
		loot.filter(l => {
			return l.id !== 420 && l.id !== itemID("Hydra's eye") && l.id !== itemID('Dark totem base');
		}, true);
		if (numDarkTotemBases) {
			for (let x = 0; x < numDarkTotemBases; x++) {
				const bank: number[] = [];
				const myBank = addBanks([user.allItemsOwned().bank, loot.bank]);
				for (const piece of totemPieces) {
					bank.push(myBank[piece] ?? 0);
				}
				const minBank = Math.min(...bank);
				for (let i = 0; i < bank.length; i++) {
					if (bank[i] === minBank) {
						loot.add(totemPieces[i]);
						break;
					}
				}
			}
		}
		if (numHydraEyes) {
			for (let x = 0; x < numHydraEyes; x++) {
				const bank: number[] = [];
				const myBank = addBanks([user.allItemsOwned().bank, loot.bank]);
				for (const piece of ringPieces) {
					bank.push(myBank[piece] ?? 0);
				}
				const minBank = Math.min(...bank);
				for (let i = 0; i < bank.length; i++) {
					if (bank[i] === minBank) {
						loot.add(ringPieces[i]);
						break;
					}
				}
			}
		}

		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${monster.name}:`,
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
				return this.client.commands.get('k')!.run(res, [quantity, monster.name]);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
