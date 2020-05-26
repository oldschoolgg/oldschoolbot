import { CommandStore, KlasaMessage } from 'klasa';

import {
	stringMatches,
	formatDuration,
	rand
} from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { Time, Activity, Tasks } from '../../lib/constants';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Farming from '../../lib/skilling/skills/farming/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			name: 'farm',
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [plantName:...string] [upgradeType:...string] [payment:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, plantName = '', upgradeType = '', payment = '']: [null | number | string, string, string, string]) {
		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		var difference = quantity;

		// default farm run speed
		const speedMod = 1;
		var numOfPatches = 0;
		var timePerPatch = Time.Minute * 1.5;

		if (typeof quantity === 'string') {
			payment = upgradeType;
			upgradeType = plantName;
			plantName = quantity;
			quantity = null;
		}

		if (quantity === 0) {
			throw `You can't grow 0 plants! Please choose an appropriate quantity to farm.`
		}

		const plants = Farming.Plants.find(
			plants =>
				stringMatches(plants.name, plantName) ||
				stringMatches(plants.name.split(' ')[0], plantName)
		);

		if (!plants) {
			throw `That's not a valid seed to plant. Valid seeds are ${Farming.Plants.map(
				plants => plants.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Farming) < plants.level) {
			throw `${msg.author.minionName} needs ${plants.level} Farming to plant ${plants.name}.`;
		}

		if (plants.seedType === 'herb'){
			numOfPatches = 8;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 65) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'fruit tree'){
			numOfPatches = 5;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 85) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'tree'){
			numOfPatches = 5;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 65) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'allotment'){
			numOfPatches = 14;
		}
		if (plants.seedType === 'cactus'){
			numOfPatches = 2;
		}
		if (plants.seedType === 'bush'){
			numOfPatches = 5;
		}
		if (plants.seedType === 'spirit'){
			numOfPatches = 1;
			if (msg.author.skillLevel(SkillsEnum.Farming) === 99) {
				numOfPatches += 4;
			}
			if (msg.author.skillLevel(SkillsEnum.Farming) > 91) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'hardwood'){
			numOfPatches = 3;
		}
		if (plants.seedType === 'seaweed'){
			numOfPatches = 2;
		}
		if (plants.seedType === 'vine'){
			numOfPatches = 12;
		}
		if (plants.seedType === 'calquat'){
			numOfPatches = 1;
		}
		if (plants.seedType === 'redwood'){
			numOfPatches = 0;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 85) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'crystal'){
			numOfPatches = 1;
		}
		if (plants.seedType === 'celastrus'){
			numOfPatches = 0;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 85) {
				numOfPatches += 1;
			}
		}

		// 1.5 mins per patch --> ex: 10 patches = 15 mins
		const timeforFarmTrip = (speedMod * timePerPatch * numOfPatches);

		// If no quantity provided, set it to the max PATCHES available.
		if (quantity === null) {
			const amountOfSeedsOwned = msg.author.settings.get(UserSettings.Bank)[plants.inputItems];
			if (!amountOfSeedsOwned) throw `You have no ${plants.inputItems}s.`;
			quantity = Math.min(
				Math.floor(msg.author.maxTripLength / timePerPatch),
				numOfPatches
			);
		}

		// Check the user has the required seeds to plant.
		const hasRequiredSeeds = await msg.author.hasItem(plants.inputItems, quantity);
		if (!hasRequiredSeeds) {
			throw `You dont have ${quantity}x ${plants.name}s.`;
		}

		const duration = quantity * timeforFarmTrip;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				plants.name
			}s you can plant is ${Math.floor(msg.author.maxTripLength / timeforFarmTrip), numOfPatches}.`;
		}

		if (numOfPatches === 0) {
			throw `There are no patches available to you for this plant. Please train your farming or raise your quest points!`
		}
		if (quantity > numOfPatches) {
			throw `There are not enough ${plants.seedType} patches to plant that many. The max amount of patches to plant in is ${numOfPatches}.`
		}

		const data: FarmingActivityTaskOptions = {
			plantsName: plants.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			upgradeType,
			duration,
			payment,
			type: Activity.Farming,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration,
			// growthFinish: Date.now() + duration + plants.growthTime
		};

		// initiates a cooldown feature for each of the seed types.
		// allows for a run of specific seed type to only be possible until the previous plant has grown.
		//herbs
		if (plants.seedType === 'herb') {
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.herbPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.herbPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedHerb, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.herbPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.herbPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.herbLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.herbLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.herbLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.herbPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedHerb)}s
					are still growing! Come back in
					${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.herbPlantTime)
					+ plants.growthTime))}.`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestHerb, UserSettings.FarmingPatches.lastPlantedHerb)
					msg.author.settings.update(UserSettings.FarmingPatches.herbHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.herbLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.herbHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.herbLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.herbHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.herbLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedHerb, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.herbPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.herbLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.herbLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.herbLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.herbPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//fruit trees
		else if (plants.seedType === 'fruit tree'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.fruitTreePlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.fruitTreePatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedFruitTree, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.fruitTreePlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.fruitTreePatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.fruitTreePatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedFruitTree)}s
					are still growing! Come back in
					${formatDuration(currentDate-(msg.author.settings.get(UserSettings.FarmingPatches.fruitTreePlantTime)
					+ plants.growthTime))}.`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestFruitTree, UserSettings.FarmingPatches.lastPlantedFruitTree)
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.fruitTreeLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.fruitTreeLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.fruitTreeLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedFruitTree, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreePlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreeLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.fruitTreePatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestFruitTree)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//tree
		else if (plants.seedType === 'tree'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.treePlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.treePatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedTree, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.treePlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.treePatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.treeLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.treeLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.treeLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.treePatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedTree)}s
					are still growing! Come back in
					${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.treePlantTime)
						 + plants.growthTime))}.`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestTree, UserSettings.FarmingPatches.lastPlantedTree)
					msg.author.settings.update(UserSettings.FarmingPatches.treeHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.treeLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.treeHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.treeLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.treeHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.treeLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedTree, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.treePlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.treeLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.treeLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.treeLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.treePatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestTree)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//allotment
		else if (plants.seedType === 'allotment'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.allotmentPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.allotmentPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedAllotment, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.allotmentPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.allotmentPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.allotmentLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.allotmentLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.allotmentLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.allotmentPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedAllotment)}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.fruitTreePlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestAllotment, UserSettings.FarmingPatches.lastPlantedAllotment)
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.allotmentLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.allotmentLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.allotmentLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedAllotment, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.allotmentPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestAllotment)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//cactuses, cactusi? what's the plural of cactus?
		else if (plants.seedType === 'cactus'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.cactusPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.cactusPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedCactus, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.cactusPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.cactusPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.cactusLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.cactusLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.cactusLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.cactusPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedCactus)}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.cactusPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestCactus, UserSettings.FarmingPatches.lastPlantedCactus)
					msg.author.settings.update(UserSettings.FarmingPatches.cactusHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.cactusLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.cactusHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.cactusLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.cactusHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.cactusLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedCactus, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.cactusPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.cactusLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.cactusLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.cactusLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.cactusPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestCactus)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//bushes
		else if (plants.seedType === 'bush'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.bushPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.bushPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedBush, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.bushPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.bushPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.bushLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.bushLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.bushLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.bushPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedBush)}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.bushPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestBush, UserSettings.FarmingPatches.lastPlantedBush)
					msg.author.settings.update(UserSettings.FarmingPatches.bushHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.bushLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.bushHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.bushLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.bushHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.bushLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedBush, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.bushPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.bushLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.bushLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.bushLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.bushPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestBush)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//spirit trees
		else if (plants.seedType === 'spirit'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.spiritPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.spiritPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.spiritPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.spiritPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.spiritLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.spiritLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.spiritLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.spiritPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.spiritPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.spiritPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.spiritHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.spiritLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.spiritHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.spiritLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.spiritHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.spiritLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.spiritLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.spiritLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.spiritLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.spiritPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//hardwood trees
		else if (plants.seedType === 'hardwood'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.hardwoodPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.hardwoodPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedHardwood, plants.seedType)
				msg.author.settings.update(UserSettings.FarmingPatches.hardwoodPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.hardwoodPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.hardwoodLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.hardwoodLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.hardwoodLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.hardwoodPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${msg.author.settings.get(UserSettings.FarmingPatches.lastPlantedHardwood)}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.hardwoodPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.harvestHardwood, UserSettings.FarmingPatches.lastPlantedHardwood)
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.hardwoodLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.hardwoodLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.hardwoodLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.lastPlantedHardwood, plants.seedType)
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.hardwoodPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHardwood)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}

		}
		//seaweeds
		else if (plants.seedType === 'seaweed'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.seaweedPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.seaweedPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.seaweedPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.seaweedPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.seaweedLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.seaweedLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.seaweedLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.seaweedPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.seaweedPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.seaweedLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.seaweedLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.seaweedLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.seaweedPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}

		}
		//vines (grapes)
		else if (plants.seedType === 'vine'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.vinePlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.vinePatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.vinePlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.vinePatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.vineLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.vineLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.vineLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.vinePatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.vinePlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.vinePlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.vineHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.vineLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.vineHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.vineLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.vineHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.vineLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.vineLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.vineLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.vineLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.vinePatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//calquats
		else if (plants.seedType === 'calquat'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.calquatPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.calquatPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.calquatPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.calquatPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.calquatLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.calquatLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.calquatLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.calquatPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.calquatPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.calquatPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.calquatHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.calquatLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.calquatHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.calquatLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.calquatHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.calquatLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.calquatLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.calquatLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.calquatLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.calquatPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//redwood trees
		else if (plants.seedType === 'redwood'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.redwoodPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.redwoodPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.redwoodPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.redwoodPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.redwoodLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.redwoodLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.redwoodLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.redwoodPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.redwoodPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.redwoodLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.redwoodLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.redwoodLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.redwoodPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//crystal trees
		else if (plants.seedType === 'crystal'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.crystalPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.crystalPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.crystalPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.crystalPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.crystalLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.crystalLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.crystalLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.crystalPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.crystalPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.crystalPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.crystalHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.crystalLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.crystalHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.crystalLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.crystalHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.crystalLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.crystalLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.crystalLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.crystalLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.crystalPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}
		}
		//celastrus trees
		else if (plants.seedType === 'celastrus'){
			difference = currentDate - msg.author.settings.get(UserSettings.FarmingPatches.celastrusPlantTime);
			if (msg.author.settings.get(UserSettings.FarmingPatches.celastrusPatchStage) === 0) {
				msg.author.settings.update(UserSettings.FarmingPatches.celastrusPlantTime, currentDate)
				msg.author.settings.update(UserSettings.FarmingPatches.celastrusPatchStage, 1)
				msg.author.settings.update(UserSettings.FarmingPatches.celastrusLastQuantity, quantity)
				msg.author.settings.update(UserSettings.FarmingPatches.celastrusLastUpgradeType, upgradeType)
				msg.author.settings.update(UserSettings.FarmingPatches.celastrusLastPayment, payment)
				await msg.author.removeItemFromBank(plants.inputItems, quantity);

				await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);
			}
			else if (msg.author.settings.get(UserSettings.FarmingPatches.celastrusPatchStage) === 1) {
				if (difference < plants.growthTime) {
					throw `Your ${plants.seedType}s are still growing! Come back in ${formatDuration(currentDate - (msg.author.settings.get(UserSettings.FarmingPatches.celastrusPlantTime) + plants.growthTime))}`
				}
				else {
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusPlantTime, currentDate)
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusHarvestQuantity, msg.author.settings.get(UserSettings.FarmingPatches.celastrusLastQuantity))
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusHarvestUpgradeType, msg.author.settings.get(UserSettings.FarmingPatches.celastrusLastUpgradeType))
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusHarvestPayment, msg.author.settings.get(UserSettings.FarmingPatches.celastrusLastPayment))
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusLastQuantity, quantity)
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusLastUpgradeType, upgradeType)
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusLastPayment, payment)
					msg.author.settings.update(UserSettings.FarmingPatches.celastrusPatchHarvestable, true)
					await msg.author.removeItemFromBank(plants.inputItems, quantity);

					await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
					msg.author.incrementMinionDailyDuration(duration);
					return msg.send(
						`${msg.author.minionName} is now harvesting ${msg.author.settings.get(UserSettings.FarmingPatches.harvestHerb)}s
						 and then planting ${quantity}x ${
							plants.name
						}s.
						It'll take around ${formatDuration(duration)} to finish.`
					);
				}
			}

		}

	}
}
