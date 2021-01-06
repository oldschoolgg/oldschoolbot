import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { Events, Time } from '../../../lib/constants';
import { hasGearEquipped } from '../../../lib/gear/functions/hasGearEquipped';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import {
	calcBabyChinchompaChance,
	calcLootXPHunting,
	generateHerbiTable
} from '../../../lib/skilling/functions/calcsHunter';
import Hunter from '../../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../../lib/skilling/types';
import { HunterActivityTaskOptions } from '../../../lib/types/minions';
import { bankHasItem, rand, roll, stringMatches } from '../../../lib/util';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { PeakTier } from './../../WildernessPeakInterval';

export default class extends Task {
	async run(data: HunterActivityTaskOptions) {
		const {
			creatureName,
			quantity,
			userID,
			channelID,
			usingHuntPotion,
			wildyPeak,
			duration
		} = data;
		const user = await this.client.users.fetch(userID);
		const userBank = user.settings.get(UserSettings.Bank);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Hunter);
		let gotPked = false;
		let died = false;
		let diedStr = '';
		let pkStr = '';
		let pkedQuantity = 0;

		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias =>
					stringMatches(alias, creatureName) ||
					stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature) return;

		let [successfulQuantity, xpReceived] = calcLootXPHunting(
			Math.min(Math.floor(currentLevel + (usingHuntPotion ? 2 : 0)), 99),
			creature,
			quantity
		);

		if (creature.wildy) {
			let riskPkChance =
				(creature.name === 'Black chinchompa' ? 100 : 200) +
				(wildyPeak?.peakTier === PeakTier.High
					? -30
					: wildyPeak?.peakTier === PeakTier.Medium
					? -10
					: wildyPeak?.peakTier === PeakTier.Low
					? 50
					: 0);
			let riskDeathChance = 20;
			// The more experienced the less chance of death.
			riskDeathChance += Math.min(
				Math.floor(
					user.settings.get(UserSettings.CreatureScores)[creature.name] ?? 1 / 100
				),
				200
			);
			riskDeathChance +=
				(hasGearEquipped(user.settings.get(UserSettings.Gear.Misc), {
					body: [itemID("Karil's leathertop")]
				})
					? 15
					: 0) +
				(hasGearEquipped(user.settings.get(UserSettings.Gear.Misc), {
					legs: [itemID("Karil's leatherskirt")]
				})
					? 15
					: 0);

			for (let i = 0; i < duration / Time.Minute; i++) {
				if (roll(riskPkChance)) {
					gotPked = true;
					break;
				}
			}
			if (gotPked && roll(riskDeathChance)) {
				died = true;
				if (
					bankHasItem(userBank, itemID('Saradomin brew(4)'), 10) &&
					bankHasItem(userBank, itemID('Super restore(4)'), 5)
				) {
					user.removeItemFromBank(itemID('Saradomin brew(4)'), rand(1, 10));
					user.removeItemFromBank(itemID('Super restore(4)'), rand(1, 5));
				}
				const newGear = { ...user.settings.get(UserSettings.Gear.Misc) };
				newGear[EquipmentSlot.Body] = null;
				newGear[EquipmentSlot.Legs] = null;
				await user.settings.update(UserSettings.Gear.Misc, newGear);
				pkedQuantity *= 0.5;
				diedStr = `Your minion got killed during the activity and lost some gear, catch quantity, saradomin brew and Super restore.`;
			}
			if (gotPked && !died) {
				if (
					bankHasItem(userBank, itemID('Saradomin brew(4)'), 15) &&
					bankHasItem(userBank, itemID('Super restore(4)'), 5)
				) {
					user.removeItemFromBank(itemID('Saradomin brew(4)'), rand(1, 15));
					user.removeItemFromBank(itemID('Super restore(4)'), rand(1, 5));
					pkStr = `Your minion got attacked during the activity, escaped and lost some catch quantity, saradomin brew and super restore.`;
					pkedQuantity *= 0.1;
				}
			}
		}

		let babyChinChance = 0;
		if (creature.name.toLowerCase().includes('chinchompa')) {
			babyChinChance = calcBabyChinchompaChance(currentLevel, creature);
		}

		let creatureTable = creature.table;
		let magicSecStr = '';
		if (creature.name === 'Herbiboar') {
			creatureTable = generateHerbiTable(
				user.skillLevel(SkillsEnum.Herblore),
				creature,
				user.hasItemEquippedOrInBank(Number(itemID('Magic secateurs')))
			);
			if (user.hasItemEquippedOrInBank(Number(itemID('Magic secateurs')))) {
				magicSecStr = ` Extra herbs for Magic secateurs`;
			}
		}
		const loot = new Bank();
		for (let i = 0; i < successfulQuantity - pkedQuantity; i++) {
			loot.add(creatureTable.roll());
			if (roll(babyChinChance) && creature.name.toLowerCase().includes('chinchompa')) {
				loot.add(itemID('Baby chinchompa'));
			}
		}

		await user.incrementCreatureScore(creature.id, successfulQuantity);
		await user.addItemsToBank(loot.values(), true);
		await user.addXP(SkillsEnum.Hunter, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Hunter);

		const xpHr = `${Math.round(((xpReceived / (duration / Time.Minute)) * 60)).toLocaleString()} XP/Hr`;

		let str = `${user}, ${user.minionName} finished hunting ${
			creature.name
		} ${quantity}x times, due to clever creatures you missed out on ${
			quantity - successfulQuantity
		}x catches, you also received ${xpReceived.toLocaleString()} XP (${xpHr}).`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Hunter level is now ${newLevel}!`;
		}

		createReadableItemListFromBank;
		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			loot.values()
		)}.${magicSecStr.length > 1 ? magicSecStr : ''}`;

		if (gotPked && !died) {
			str += `\n${pkStr}`;
		}

		if (died) {
			str += `\n${diedStr}`;
		}

		if (loot.amount('Baby chinchompa') > 0 || loot.amount('Herbi') > 0) {
			str += `\n\n**You have a funny feeling like you're being followed....**`;
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${user.minionName}, just received a ${
					loot.amount('Baby chinchompa') > 0
						? `**Baby chinchompa** <:Baby_chinchompa_red:324127375539306497>`
						: `**Herbi** <:Herbi:357773175318249472>`
				} while hunting a ${creature.name}, their Hunter level is ${currentLevel}!`
			);
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${creatureName}[${creatureName}]`);
				return this.client.commands.get('hunt')!.run(res, [quantity, creatureName]);
			},
			undefined,
			data
		);
	}
}
