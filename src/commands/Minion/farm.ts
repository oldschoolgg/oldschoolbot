import { CommandStore, KlasaMessage } from 'klasa';

import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	removeItemFromBank
} from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { Time, Activity, Tasks } from '../../lib/constants';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Farming from '../../lib/skilling/skills/farming/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import resolvePatchTypeSetting from '../../lib/farming/functions/resolvePatchTypeSettings';
import itemID from '../../lib/util/itemID';
import { calcNumOfPatches, returnListOfPlants } from '../../lib/skilling/functions/calcsFarming';
import hasGracefulEquipped from '../../lib/gear/functions/hasGracefulEquipped';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [plantName:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, plantName = '']: [null | number | string, string]) {
		if (msg.flagArgs.plants) {
			return returnListOfPlants(msg);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const questPoints = msg.author.settings.get(UserSettings.QP);
		const GP = msg.author.settings.get(UserSettings.GP);
		const currentWoodcuttingLevel = msg.author.skillLevel(SkillsEnum.Woodcutting);
		const currentDate = new Date().getTime();

		let payment = false;
		let upgradeType = '';
		let str = '';
		let upgradeStr = '';
		let paymentStr = '';
		const boostStr = [];

		if (typeof quantity === 'string') {
			plantName = quantity;
			quantity = null;
		}

		const plants = Farming.Plants.find(plants =>
			plants.aliases.some(
				alias =>
					stringMatches(alias, plantName) || stringMatches(alias.split(' ')[0], plantName)
			)
		);

		if (!plants) {
			throw `That's not a valid seed to plant. Valid seeds are ${Farming.Plants.map(
				plants => plants.name
			).join(', ')}. *Make sure you are not attempting to farm 0 crops.*`;
		}

		const getPatchType = resolvePatchTypeSetting(plants.seedType);
		if (!getPatchType) return;
		const patchType = msg.author.settings.get(getPatchType);

		const timePerPatchTravel = Time.Second * plants.timePerPatchTravel;
		const timePerPatchHarvest = Time.Second * plants.timePerHarvest;
		const timePerPatchPlant = Time.Second * 5;

		if (msg.flagArgs.supercompost) {
			upgradeType = 'supercompost';
			upgradeStr += `You are treating all of your patches with supercompost. `;
		}
		if (msg.flagArgs.ultracompost) {
			upgradeType = 'ultracompost';
			upgradeStr += `You are treating all of your patches with ultracompost. `;
		}
		if (msg.flagArgs.pay) {
			payment = true;
			paymentStr += `You are paying a nearby farmer to look after your patches. `;
		}

		if (msg.author.skillLevel(SkillsEnum.Farming) < plants.level) {
			throw `${msg.author.minionName} needs ${plants.level} Farming to plant ${plants.name}.`;
		}

		if (!plants.canPayFarmer && payment) {
			throw `You cannot pay a farmer to look after your ${plants.name}s!`;
		}
		if (
			plants.canCompostandPay === false &&
			payment === true &&
			upgradeType === ('supercompost' || 'ultracompost')
		) {
			throw `You do not need to use compost if you are paying a nearby farmer to look over your trees.`;
		}

		if (plants.canCompostPatch === false && upgradeType !== '') {
			throw `There would be no point to add compost to your ${plants.name}s!`;
		}

		if (!plants.canPayFarmer && payment) {
			throw `You cannot pay a farmer to look after your ${plants.name}s!`;
		}

		const numOfPatches = calcNumOfPatches(plants, msg.author, questPoints);

		if (numOfPatches === 0) {
			throw 'There are no available patches to you. Check requirements for additional patches by with the command `+farm --plants`';
		}

		// If no quantity provided, set it to the max PATCHES available.
		if (quantity === null) {
			quantity = Math.min(
				Math.floor(
					msg.author.maxTripLength /
						(timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest)
				),
				numOfPatches
			);
		}

		if (quantity > numOfPatches) {
			throw `There are not enough ${plants.seedType} patches to plant that many. The max amount of patches to plant in is ${numOfPatches}.`;
		}

		let duration: number;
		if (patchType.patchStage) {
			duration =
				patchType.lastQuantity *
				(timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest);
			if (quantity > patchType.lastQuantity) {
				duration +=
					(quantity - patchType.lastQuantity) * (timePerPatchTravel + timePerPatchPlant);
			}
		} else duration = quantity * (timePerPatchTravel + timePerPatchPlant);

		// Reduce time if user has graceful equipped
		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			boostStr.push('**Boosts**: 10% for Graceful');
			duration *= 0.9;
		}

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				plants.name
			} you can plant is ${(Math.floor(
				msg.author.maxTripLength /
					(timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest)
			),
			numOfPatches)}.`;
		}

		let newBank = { ...userBank };
		const requiredSeeds: [string, number][] = Object.entries(plants.inputItems);
		for (const [seedID, qty] of requiredSeeds) {
			if (!bankHasItem(userBank, parseInt(seedID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(seedID))}s.`;
			} else if (bankHasItem(userBank, parseInt(seedID), qty * quantity)) {
				newBank = removeItemFromBank(newBank, parseInt(seedID), qty * quantity);
			}
		}

		if (payment === true) {
			if (!plants.protectionPayment) return;
			const requiredPayment: [string, number][] = Object.entries(plants.protectionPayment);
			for (const [itemID, qty] of requiredPayment) {
				if (!bankHasItem(userBank, parseInt(itemID), qty * quantity)) {
					throw `You don't have enough ${itemNameFromID(
						parseInt(itemID)
					)} to make payments to nearby farmers.`;
				} else if (bankHasItem(userBank, parseInt(itemID), qty * quantity)) {
					newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
				}
			}
		}

		if (upgradeType === 'supercompost' || upgradeType === 'ultracompost') {
			const hasCompostType = await msg.author.hasItem(itemID(upgradeType), quantity);
			if (!hasCompostType) {
				throw `You dont have ${quantity}x ${upgradeType}.`;
			}
			newBank = removeItemFromBank(newBank, itemID(upgradeType), quantity);
		} else if (bankHasItem(userBank, itemID('compost'), quantity) && plants.canCompostPatch) {
			upgradeType = 'compost';
			upgradeStr += `You are treating all of your patches with compost. `;
			newBank = removeItemFromBank(newBank, itemID(upgradeType), quantity);
		}

		await msg.author.settings.update(UserSettings.Bank, newBank);

		const data: FarmingActivityTaskOptions = {
			plantsName: plants.name,
			patchType,
			getPatchType,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			upgradeType,
			planting: true,
			duration,
			msg,
			currentDate,
			type: Activity.Farming,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// If user does not have something already planted, just plant the new seeds.
		if (!patchType.patchStage) {
			activityStr += `${msg.author.minionName} is now planting ${quantity}x ${
				plants.name
			}. ${upgradeStr}${paymentStr}\nIt'll take around ${formatDuration(
				duration
			)} to finish.\n\n${boostStr.join(', ')}`;
		} else if (patchType.patchStage) {
			const storeHarvestablePlant = patchType.lastPlanted;
			const planted = Farming.Plants.find(
				plants =>
					stringMatches(plants.name, storeHarvestablePlant) ||
					stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
			);
			if (!planted)
				throw `This error shouldn't happen. Just to clear possible undefined error`;

			const lastPlantTime: number = patchType.plantTime;
			const difference = currentDate - lastPlantTime;
			/* initiate a cooldown feature for each of the seed types.
				allows for a run of specific seed type to only be possible until the
				previous run's plants has grown.*/
			if (difference < planted.growthTime * Time.Minute) {
				throw `Please come back when your crops have finished growing in ${formatDuration(
					lastPlantTime + plants.growthTime * Time.Minute - currentDate
				)}!`;
			}

			const storeHarvestableQuantity = patchType.lastQuantity;

			if (planted.needsChopForHarvest) {
				if (!planted.treeWoodcuttingLevel) return;
				if (
					currentWoodcuttingLevel < planted.treeWoodcuttingLevel &&
					GP < 200 * storeHarvestableQuantity
				) {
					throw `Your minion remembers that they do not have ${planted.treeWoodcuttingLevel} woodcutting or the 200GP per patch required to be able to harvest the currently planted trees.`;
				}
			}

			activityStr += `${
				msg.author.minionName
			} is now harvesting ${storeHarvestableQuantity}x ${storeHarvestablePlant}, and then planting ${quantity}x ${
				plants.name
			}. ${upgradeStr}${paymentStr}\nIt'll take around ${formatDuration(
				duration
			)} to finish.\n\n${boostStr.join(' ')}`;
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		await msg.author.settings.update(UserSettings.Bank, newBank);
		return msg.send(str);
	}
}
