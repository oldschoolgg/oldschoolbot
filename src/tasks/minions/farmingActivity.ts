import { Task } from 'klasa';

//import {plantMatches} from '../../lib/util';
//import { noOp } from '../../lib/util';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import Farming from '../../lib/skilling/skills/farming/farming';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../lib/skilling/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
//import itemID from '../../lib/util/itemID';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';
//might be needed
//import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends Task {
	async run({ plantsName, quantity, upgradeType, payment, userID, channelID,}: FarmingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Farming);
		var baseBonus = 1;
		var bonusXP = quantity;
		var plantXp = quantity;
		var harvestXp = quantity;
	//	var woodcuttingXp = quantity;
		var farmingXpReceived = plantXp + harvestXp;
		var chanceOfDeathReduction = quantity;
	//	var logYield = rand(5,10);
		//yield total
		var cropYield = 0;

		const plant = Farming.Plants.find(plant => plant.name === plantsName);
		if (!plant) return;

		var lives = quantity;
		//initial lives = 3. Compost, super, ultra, increases lives by 1 respectively and reduces chanceofdeath as well.
		if (upgradeType === 'compost')
		{
			lives = 4;
			chanceOfDeathReduction = 1/2;
		}
		else if (upgradeType === 'supercompost')
		{
			lives = 5;
			chanceOfDeathReduction = 1/5;
		}
		else if (upgradeType === 'ultracompost')
		{
			lives = 6;
			chanceOfDeathReduction = 1/7;
		}
		else {
			lives = 3;
		}

		// payment = 0% chance of death
		if (payment === 'pay')
		{
			chanceOfDeathReduction = 0;
		}

		var plantChanceFactor = Math.floor(Math.floor(plant.chance1 + ((plant.chance99 - plant.chance1) * ((user.skillLevel(SkillsEnum.Farming) - 1)/98))) * baseBonus) + 1
		var chanceToSaveLife = ((plantChanceFactor + 1)/256);

  		for (var i=0; lives>0; i++) {
    		if (Math.random() > (chanceToSaveLife)) {
      			lives -= 1;
      			cropYield += 1;
   			}
   		 	else {
     		 	cropYield += 1;
    		}
		}

		//pseudo: if patch is empty --> no harvest, only plant
		//if patch is planted --> harvest and plant

		//if (planted = false) {
		//	let xpReceived = plant.plantXp;
		//	}
		//if (planted = true) {
		//	let xpReceived = plant.plantXp + (plant.harvestXp * cropYield);
		//	}

		// insert if else statement for planting and harvesting plants
		if (plant.seedType === 'herb') {
			//check if there is a plant to harvest. If not, get only the xp for planting.
			// if (user.settings.get(UserSettings.FarmingPatches.herbPatchHarvestable) === false) {
				plantXp = plant.plantXp * quantity;
			}
			else {
				/*const herbToHarvest = Farming.Plants.find(
					herbToHarvest =>
						plantMatches(plant.name, user.settings.get(UserSettings.FarmingPatches.harvestHerb)) ||
						plantMatches(plant.name.split(' ')[0], user.settings.get(UserSettings.FarmingPatches.harvestHerb)));*/

				//harvestXp = (user.settings.get(UserSettings.FarmingPatches.herbLastQuantity) * herbToHarvest?.harvestXp);
				plantXp = chanceOfDeathReduction * cropYield;
			}

		}

		//check for full set of farmer items
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

		await user.addXP(SkillsEnum.Farming, (farmingXpReceived + bonusXP));
		const newLevel = user.skillLevel(SkillsEnum.Farming);

		let str = `${user}, ${user.minionName} finished farming ${quantity}x ${
			plant.name
		} and received ${quantity}x ${plant.outputCrop}. You also received ${farmingXpReceived.toLocaleString()} XP. ${
			user.minionName
		} tells you to come back after your plants have finished growing!.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Farming level is now ${newLevel}!`;
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		channel.send(str);
	}
}
