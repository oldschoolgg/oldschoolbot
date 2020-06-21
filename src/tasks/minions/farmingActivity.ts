import { Task } from 'klasa';

import { roll } from '../../lib/util';
import { Events, Emoji } from '../../lib/constants';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import Farming from '../../lib/skilling/skills/farming/farming';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../lib/skilling/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
// import itemID from '../../lib/util/itemID';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';
import itemID from '../../lib/util/itemID';
import { rand } from 'oldschooljs/dist/util/util';
// might be needed
// import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends Task {
	async run({
		plantsName,
		patchType,
		quantity,
		upgradeType,
		userID,
		channelID,
		msg
	}: FarmingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentFarmingLevel = user.skillLevel(SkillsEnum.Farming);
		const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);
		let baseBonus = 1;
		let bonusXP = 0;
		let plantXp = 0;
		let harvestXp = 0;
		let compostXp = 0;
		let checkHealthXp = 0;
		let rakeXp = 0;
		let woodcuttingXp = 0;
		let payStr = '';
		let wcStr = '';
		let rakeStr = '';
		let alivePlants = 0;
		let chopped = false;
		let farmingXpReceived = 0;
		let chanceOfDeathReduction = 1;
		let cropYield = 0;
		let lives = 3;

		const plant = Farming.Plants.find(plant => plant.name === plantsName);
		if (!plant) return;

		const lastPlant = Farming.Plants.find(plant => plant.name === patchType.LastPlanted);
		if (!lastPlant) return;

		const hasMagicSecateurs = await msg.author.hasItem(itemID('Magic secateurs'), 1);
		if (hasMagicSecateurs) {
			baseBonus += 0.1;
		}
		const hasFarmingCape = await msg.author.hasItem(itemID('Farming cape'), 1);
		const hasFarmingCapeTrimmed = await msg.author.hasItem(itemID('Farming cape(t)'), 1);
		if (hasFarmingCape || hasFarmingCapeTrimmed) {
			baseBonus += 0.05;
		}

		if (upgradeType === 'compost') compostXp = 18;
		if (upgradeType === 'supercompost') compostXp = 26;
		if (upgradeType === 'ultracompost') compostXp = 36;

		// initial lives = 3. Compost, super, ultra, increases lives by 1 respectively and reduces chanceofdeath as well.
		// Payment = 0% chance of death
		if (patchType.LastUpgradeType === 'compost') {
			lives += 1;
			chanceOfDeathReduction = 1 / 2;
		} else if (patchType.LastUpgradeType === 'supercompost') {
			lives += 2;
			chanceOfDeathReduction = 1 / 5;
		} else if (patchType.LastUpgradeType === 'ultracompost') {
			lives += 3;
			chanceOfDeathReduction = 1 / 10;
		}

		if (patchType.LastPayment === true) chanceOfDeathReduction = 0;

		const loot = { [plant.inputItems]: quantity };

		if (patchType.IsHarvestable === false) {
			rakeXp = quantity * 4 * 3; // # of patches * exp per weed * # of weeds
			plantXp = quantity * (plant.plantXp + compostXp);
			farmingXpReceived = plantXp + harvestXp + rakeXp;

			// check for full set of farmer item
			if (
				hasArrayOfItemsEquipped(
					Object.keys(Farming.farmerItems).map(i => parseInt(i)),
					user.settings.get(UserSettings.Gear.Skilling)
				)
			) {
				const amountToAdd = Math.floor(farmingXpReceived * (2.5 / 100));
				bonusXP += amountToAdd;
			} else {
				// For each farmer item, check if they have it, give its XP boost if so.
				for (const [itemID, bonus] of Object.entries(Farming.farmerItems)) {
					if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
						const amountToAdd = Math.floor(farmingXpReceived * (bonus / 100));
						bonusXP += amountToAdd;
					}
				}
			}

			loot[itemID('Weeds')] = quantity * 3;

			let str = `${user}, ${
				user.minionName
			} finished raking ${quantity} patches and planting ${quantity}x ${
				plant.name
			}s.\nYou received ${plantXp.toLocaleString()} XP from planting and ${rakeXp.toLocaleString()} XP from raking for a total of ${farmingXpReceived.toLocaleString()} Farming XP.`;

			if (bonusXP > 0) {
				str += ` You received an additional ${bonusXP.toLocaleString()} in bonus XP.`;
			}

			await user.addXP(SkillsEnum.Farming, Math.floor(farmingXpReceived + bonusXP));
			const newLevel = user.skillLevel(SkillsEnum.Farming);

			if (newLevel > currentFarmingLevel) {
				str += `\n\n${user.minionName}'s Farming level is now ${newLevel}!`;
			}

			delete loot[plant.inputItems];

			if (Object.keys(loot).length > 0) {
				str += `\n\nYou received: ${await createReadableItemListFromBank(
					this.client,
					loot
				)}.`;
			}

			await user.addItemsToBank(loot, true);

			str += `\n\n${user.minionName} tells you to come back after your plants have finished growing!`;

			const channel = this.client.channels.get(channelID);
			if (!channelIsSendable(channel)) return;

			channel.send(str);
		} else if (patchType.IsHarvestable === true) {
			const plantToHarvest = Farming.Plants.find(
				plant => plant.name === patchType.LastPlanted
			);
			if (!plantToHarvest) return;

			harvestXp = cropYield * plantToHarvest.harvestXp;

			let quantityDead = 0;
			for (let i = 0; i < patchType.LastQuantity; i++) {
				for (let j = 0; j < plantToHarvest.numOfStages - 1; j++) {
					const checkIfDied = Math.random();
					if (
						checkIfDied <
						Math.floor(plantToHarvest.chanceOfDeath * chanceOfDeathReduction) / 128
					) {
						quantityDead += 1;
						break;
					}
				}
			}

			alivePlants = patchType.LastQuantity - quantityDead;

			plantXp = patchType.LastQuantity * (plant.plantXp + compostXp);
			checkHealthXp = alivePlants * plantToHarvest.checkXp;

			if (plantToHarvest.givesCrops === true) {
				if (!plantToHarvest.outputCrop) return;
				if (plantToHarvest.fixedOutput === true) {
					if (!plantToHarvest.fixedOutputAmount) return;
					cropYield = plantToHarvest.fixedOutputAmount;
				} else {
					const plantChanceFactor =
						Math.floor(
							Math.floor(
								plant.chance1 +
									(plant.chance99 - plant.chance1) *
										((user.skillLevel(SkillsEnum.Farming) - 1) / 98)
							) * baseBonus
						) + 1;
					const chanceToSaveLife = (plantChanceFactor + 1) / 256;
					if (plant.seedType === 'bush') lives = 4;
					console.log(lives);
					const livesHolder = lives;
					for (let k = 0; k < alivePlants; k++) {
						lives = livesHolder;
						for (let n = 0; lives > 0; n++) {
							if (Math.random() > chanceToSaveLife) {
								lives -= 1;
								cropYield += 1;
							} else {
								cropYield += 1;
							}
						}
					}
				}

				if (quantity > patchType.LastQuantity) {
					loot[plantToHarvest.outputCrop] = cropYield;
					loot[6055] = quantity - patchType.LastQuantity; // weeds
				} else {
					loot[plantToHarvest.outputCrop] = cropYield;
				}
			}

			if (plantToHarvest.needsChopForHarvest === true) {
				if (!plantToHarvest.treeWoodcuttingLevel) return;
				if (currentWoodcuttingLevel >= plantToHarvest.treeWoodcuttingLevel) chopped = true;
				else {
					await msg.author.settings.sync(true);
					const GP = msg.author.settings.get(UserSettings.GP);
					if (GP < 200 * alivePlants) {
						throw `You do not have the required woodcutting level or enough GP to clear your patches in order to be able to plant more.`;
					} else {
						payStr = `*You did not have the woodcutting level required, so you paid a nearby farmer 200 GP per patch to remove the previous tree.*`;
						await msg.author.removeGP(200 * alivePlants);
					}
				}
				if (plantToHarvest.givesLogs === true && chopped === true) {
					if (!plantToHarvest.outputLogs) return;
					const amountOfLogs = rand(5, 10);
					loot[plantToHarvest.outputLogs] = amountOfLogs * alivePlants;

					if (!plantToHarvest.woodcuttingXp) return;
					woodcuttingXp += alivePlants * amountOfLogs * plantToHarvest.woodcuttingXp;
					wcStr = ` You also received ${woodcuttingXp.toLocaleString()} Woodcutting XP.`;
				} else if (plantToHarvest.givesCrops === true && chopped === true) {
					if (!plantToHarvest.outputCrop) return;
					loot[plantToHarvest.outputCrop] = cropYield * alivePlants;
				}

				harvestXp = cropYield * alivePlants * plantToHarvest.harvestXp;
			}

			if (quantity > patchType.LastQuantity) {
				loot[6055] = quantity - patchType.LastQuantity; // weeds
				rakeStr += ` ${rakeXp} XP for raking, `;
			}

			farmingXpReceived = plantXp + harvestXp + checkHealthXp + rakeXp;

			let str = `${user}, ${user.minionName} finished planting ${quantity}x ${
				plant.name
			} and harvesting ${patchType.LastQuantity}x ${
				plantToHarvest.name
			}. During your harvest, you found that ${quantityDead}/${
				patchType.LastQuantity
			} of your plants died. ${payStr}\n\nYou received ${plantXp.toLocaleString()} XP for planting, ${rakeStr}${harvestXp.toLocaleString()} XP for harvesting, and ${checkHealthXp.toLocaleString()} XP for checking health for a total of ${farmingXpReceived.toLocaleString()} Farming XP.${wcStr}\n`;

			// check for full set of farmer item
			if (
				hasArrayOfItemsEquipped(
					Object.keys(Farming.farmerItems).map(i => parseInt(i)),
					user.settings.get(UserSettings.Gear.Skilling)
				)
			) {
				const amountToAdd = Math.floor(farmingXpReceived * (2.5 / 100));
				bonusXP += amountToAdd;
			} else {
				// For each farmer item, check if they have it, give its XP boost if so.
				for (const [itemID, bonus] of Object.entries(Farming.farmerItems)) {
					if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
						const amountToAdd = Math.floor(farmingXpReceived * (bonus / 100));
						bonusXP += amountToAdd;
					}
				}
			}

			if (bonusXP > 0) {
				str += ` You received an additional ${bonusXP.toLocaleString()} in bonus XP.`;
			}

			await user.addXP(SkillsEnum.Farming, Math.floor(farmingXpReceived + bonusXP));
			await user.addXP(SkillsEnum.Woodcutting, Math.floor(woodcuttingXp));

			const newFarmingLevel = user.skillLevel(SkillsEnum.Farming);
			const newWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);

			if (newFarmingLevel > currentFarmingLevel) {
				str += `\n\n${user.minionName}'s Farming level is now ${newFarmingLevel}!`;
			}

			if (newWoodcuttingLevel > currentWoodcuttingLevel) {
				str += `\n\n${user.minionName}'s Woodcutting level is now ${newWoodcuttingLevel}!`;
			}

			delete loot[plant.inputItems];

			if (
				lastPlant.petChance &&
				roll((lastPlant.petChance - user.skillLevel(SkillsEnum.Farming) * 25) / alivePlants)
			) {
				loot[itemID('Tangleroot')] = 1;
				str += '\n```diff';
				str += `\n- You have a funny feeling you're being followed...`;
				str += '```';
				this.client.emit(
					Events.ServerNotification,
					`${Emoji.Farming} **${user.username}'s** minion, ${user.minionName}, just received a Tangleroot while farming ${patchType.LastPlanted} at level ${currentFarmingLevel} Farming!`
				);
			}

			if (Object.keys(loot).length > 0) {
				str += `\nYou received: ${await createReadableItemListFromBank(
					this.client,
					loot
				)}.`;
			}

			str += `\n\n${user.minionName} tells you to come back after your plants have finished growing! `;

			await user.addItemsToBank(loot, true);

			const channel = this.client.channels.get(channelID);
			if (!channelIsSendable(channel)) return;

			channel.send(str);
		}
	}
}
