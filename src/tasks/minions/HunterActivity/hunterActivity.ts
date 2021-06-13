import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { Events, Time } from '../../../lib/constants';
import { hasWildyHuntGearEquipped } from '../../../lib/gear/functions/hasWildyHuntGearEquipped';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import {
	calcBabyChinchompaChance,
	calcLootXPHunting,
	generateHerbiTable
} from '../../../lib/skilling/functions/calcsHunter';
import Hunter from '../../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../../lib/skilling/types';
import { HunterActivityTaskOptions } from '../../../lib/types/minions';
import { rand, roll, stringMatches, updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { BLACK_CHIN_ID, HERBIBOAR_ID } from './../../../lib/constants';
import { PeakTier } from './../../WildernessPeakInterval';

const riskDeathNumbers = [
	{
		peakTier: PeakTier.High,
		extraChance: -80
	},
	{
		peakTier: PeakTier.Medium,
		extraChance: -20
	},
	{
		peakTier: PeakTier.Low,
		extraChance: 80
	}
];

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
		const userBank = user.bank();
		const currentLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentHerbLevel = user.skillLevel(SkillsEnum.Herblore);
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
			let riskPkChance = creature.id === BLACK_CHIN_ID ? 100 : 200;
			riskPkChance +=
				riskDeathNumbers.find(_peaktier => _peaktier.peakTier === wildyPeak?.peakTier)
					?.extraChance ?? 0;
			let riskDeathChance = 20;
			// The more experienced the less chance of death.
			riskDeathChance += Math.min(
				Math.floor((user.getCreatureScore(creature) ?? 1) / 100),
				200
			);

			// Gives lower death chance depending on what the user got equipped in misc.
			const [, , score] = hasWildyHuntGearEquipped(user.getGear('misc'));
			riskDeathChance += score;
			for (let i = 0; i < duration / Time.Minute; i++) {
				if (roll(riskPkChance)) {
					gotPked = true;
					break;
				}
			}
			if (gotPked && roll(riskDeathChance)) {
				died = true;
				if (
					userBank.amount(itemID('Saradomin brew(4)')) >= 10 &&
					userBank.amount(itemID('Super restore(4)')) >= 5
				) {
					await user.removeItemFromBank(itemID('Saradomin brew(4)'), 10);
					await user.removeItemFromBank(itemID('Super restore(4)'), 5);
				}
				const newGear = {
					...user.settings.get(UserSettings.Gear.Misc)
				};
				newGear[EquipmentSlot.Body] = null;
				newGear[EquipmentSlot.Legs] = null;
				await user.settings.update(UserSettings.Gear.Misc, newGear);
				pkedQuantity = 0.5 * successfulQuantity;
				xpReceived *= 0.8;
				diedStr = `Your minion got killed during the activity and lost gear, catch quantity, 10x Saradomin brew and 5x Super restore.`;
			}
			if (gotPked && !died) {
				if (
					userBank.amount(itemID('Saradomin brew(4)')) >= 10 &&
					userBank.amount(itemID('Super restore(4)')) >= 5
				) {
					let lostBrew = rand(1, 10);
					let lostRestore = rand(1, 5);
					await user.removeItemFromBank(itemID('Saradomin brew(4)'), lostBrew);
					await user.removeItemFromBank(itemID('Super restore(4)'), lostRestore);
					pkStr = `Your minion got attacked during the activity, escaped and lost some catch quantity, ${lostBrew}x Saradomin brew and ${lostRestore}x Super restore.`;
					pkedQuantity = 0.1 * successfulQuantity;
					xpReceived *= 0.9;
				}
			}
		}

		let babyChinChance = 0;
		if (creature.name.toLowerCase().includes('chinchompa')) {
			babyChinChance = calcBabyChinchompaChance(currentLevel, creature);
		}

		let creatureTable = creature.table;
		let magicSecStr = '';
		let herbXP = 0;
		let xpStr = '';
		if (creature.id === HERBIBOAR_ID) {
			creatureTable = generateHerbiTable(
				user.skillLevel(SkillsEnum.Herblore),
				user.hasItemEquippedOrInBank(Number(itemID('Magic secateurs')))
			);
			if (user.hasItemEquippedOrInBank(Number(itemID('Magic secateurs')))) {
				magicSecStr = ` Extra herbs for Magic secateurs`;
			}
			// TODO: Check wiki in future for herblore xp from herbiboar
			if (currentHerbLevel >= 31) {
				herbXP += quantity * rand(25, 75);
				xpStr = await user.addXP({
					skillName: SkillsEnum.Herblore,
					amount: herbXP,
					duration
				});
			}
		}
		const loot = new Bank();
		for (let i = 0; i < successfulQuantity - pkedQuantity; i++) {
			loot.add(creatureTable.roll());
			if (roll(babyChinChance) && creature.name.toLowerCase().includes('chinchompa')) {
				loot.add(itemID('Baby chinchompa'));
			}
		}

		await user.incrementCreatureScore(creature.id, Math.floor(successfulQuantity));
		xpStr += await user.addXP({
			skillName: SkillsEnum.Hunter,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished hunting ${
			creature.name
		} ${quantity}x times, due to clever creatures you missed out on ${
			quantity - successfulQuantity
		}x catches. ${xpStr}`;

		if (user.usingPet('Sandy')) {
			if (creature.id === 3251) {
				if (user.hasItemEquippedAnywhere(itemID('Hunter master cape'))) {
					str += `\nYou received **double** loot because of Sandy, and being a master hunter.`;
					loot.multiply(2);
				}
			} else {
				str += `\nYou received **triple** loot because of Sandy.`;
				loot.multiply(3);
			}
		}

		await user.addItemsToBank(loot.values(), true);

		str += `\n\nYou received: ${loot}.${magicSecStr.length > 1 ? magicSecStr : ''}`;

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

		updateBankSetting(this.client, ClientSettings.EconomyStats.HunterLoot, loot);

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
			data,
			loot.bank
		);
	}
}
