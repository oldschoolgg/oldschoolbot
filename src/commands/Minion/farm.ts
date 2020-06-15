import { CommandStore, KlasaMessage } from 'klasa';

import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	removeItemFromBank
} from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { Time, Activity, Tasks, Events } from '../../lib/constants';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Farming from '../../lib/skilling/skills/farming/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import resolvePatchTypeSetting from '../../lib/farming/functions/resolvePatchTypeSettings';
import { PatchTypes } from '../../lib/farming';
import bankHasItem from '../../lib/util/bankHasItem';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage:
				'<quantity:int{1}|name:...string> [plantName:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[quantity, plantName = '']: [
			null | number | string,
			string
		]
	) {
		if (msg.flagArgs.plants) {
			return msg.channel.sendFile(
				Buffer.from(
					Farming.Plants.map(
						item =>
							`${item.name} - lvl ${item.level}: ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))} || `)
								.join(', ')}`
					).join('\n')
				),
				`Farming Plants.txt`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const currentDate = new Date().getTime();
		// var difference = quantity;

		let payment = '';
		let upgradeType = '';
		let str = '';
		let upgradeStr = '';
		let paymentStr = '';
		let numOfPatches = 0;
		let timePerPatch = Time.Minute * 1.5;

		if (typeof quantity === 'string') {
			plantName = quantity;
			quantity = null;
		}

		const plants = Farming.Plants.find(
			plants =>
				stringMatches(plants.name, plantName) ||
				stringMatches(plants.name.split(' ')[0], plantName)
		);

		if (!plants) {
			throw `That's not a valid seed to plant. Valid seeds are ${Farming.Plants.map(
				plants => plants.name
			).join(', ')}. *Make sure you are not attempting to farm 0 crops.*`;
		}

		if (msg.flagArgs.compost) {
			upgradeType = 'compost';
			upgradeStr += `You are treating all of your patches with compost. `;
		}
		if (msg.flagArgs.supercompost) {
			upgradeType = 'supercompost';
			upgradeStr += `You are treating all of your patches with supercompost. `;
		}
		if (msg.flagArgs.ultracompost) {
			upgradeType = 'ultracompost';
			upgradeStr += `You are treating all of your patches with ultracompost. `;
		}
		if (msg.flagArgs.pay) {
			payment = 'pay';
			paymentStr += `You are paying a nearby farmer to look after your patches. `;
		}

		if (msg.author.skillLevel(SkillsEnum.Farming) < plants.level) {
			throw `${msg.author.minionName} needs ${plants.level} Farming to plant ${plants.name}.`;
		}

		if ((plants.seedType === 'herb' || plants.name === 'Poison ivy') && payment === 'pay') throw `You cannot pay a farmer to look after your ${plants.name}s!`;
		if ((plants.seedType === 'tree' || plants.seedType === 'fruit tree')
			&& (payment === 'pay')
			&& (upgradeType === ('compost' || 'supercompost' || 'ultracompost'))) {
			throw `You do not need to use compost if you are paying a nearby farmer to look over your trees.`;
		}

		if ((plants.name === 'Poison ivy' && (payment === 'pay' || upgradeType != ''))) {
			throw `There would be no point to add compost to your ${plants.name}s!`;
		}

		if (plants.seedType === 'herb') {
			numOfPatches = 8;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 65) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'fruit tree') {
			numOfPatches = 5;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 85) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'tree') {
			numOfPatches = 5;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 65) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'allotment') {
			numOfPatches = 14;
		}
		if (plants.seedType === 'cactus') {
			numOfPatches = 2;
		}
		if (plants.seedType === 'bush') {
			numOfPatches = 5;
		}
		if (plants.seedType === 'spirit') {
			numOfPatches = 1;
			if (msg.author.skillLevel(SkillsEnum.Farming) === 99) {
				numOfPatches += 4;
			}
			if (msg.author.skillLevel(SkillsEnum.Farming) > 91) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'hardwood') {
			numOfPatches = 3;
		}
		if (plants.seedType === 'seaweed') {
			numOfPatches = 2;
		}
		if (plants.seedType === 'vine') {
			numOfPatches = 12;
		}
		if (plants.seedType === 'calquat') {
			numOfPatches = 1;
		}
		if (plants.seedType === 'redwood') {
			numOfPatches = 0;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 85) {
				numOfPatches += 1;
			}
		}
		if (plants.seedType === 'crystal') {
			numOfPatches = 1;
		}
		if (plants.seedType === 'celastrus') {
			numOfPatches = 0;
			if (msg.author.skillLevel(SkillsEnum.Farming) > 85) {
				numOfPatches += 1;
			}
		}

		// If no quantity provided, set it to the max PATCHES available.
		if (quantity === null) {
			quantity = Math.min(Math.floor(msg.author.maxTripLength / timePerPatch), numOfPatches);
		}

		let newBank = { ...userBank };
		const requiredSeeds: [string, number][] = Object.entries(plants.inputItems);
		for (const [seedID, qty] of requiredSeeds) {
			if (!bankHasItem(userBank, parseInt(seedID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(seedID))}s.`;
			} else if (bankHasItem(userBank, parseInt(seedID), qty * quantity)) {
				newBank = removeItemFromBank(newBank, parseInt(seedID), qty * quantity);
			}
			if (newBank[parseInt(seedID)] < qty) {
				this.client.emit(
					Events.Wtf,
					`${msg.author.sanitizedName} had insufficient ${seedID}s to be removed.`
				);
				throw `What a terrible failure :(`;
			}
		}

		if (payment === 'pay') {
			const requiredPayment: [string, number][] = Object.entries(plants.protectionPayment);
			for (const [itemID, qty] of requiredPayment) {
				if (!bankHasItem(userBank, parseInt(itemID), qty * quantity)) {
					throw `You don't have enough ${itemNameFromID(parseInt(itemID))} to make payments to nearby farmers.`;
				} else if (bankHasItem(userBank, parseInt(itemID), qty * quantity)) {
					newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
				}
				if (newBank[parseInt(itemID)] < qty) {
					this.client.emit(
						Events.Wtf,
						`${msg.author.sanitizedName} had insufficient ${itemID}s to be removed.`
					);
					throw `What a terrible failure :(`;
				}
			}
		}

		if (upgradeType === 'compost' || upgradeType === 'supercompost' || upgradeType === 'ultracompost') {
			const hasCompostType = await msg.author.hasItem(itemID(upgradeType), quantity);
				if (!hasCompostType) {
					throw `You dont have ${quantity}x ${upgradeType}.`;
			}
			newBank = removeItemFromBank(newBank, itemID(upgradeType), quantity)
			if (newBank[itemID(upgradeType)] < quantity) {
				this.client.emit(
					Events.Wtf,
					`${msg.author.sanitizedName} had insufficient ${upgradeType}s to be removed.`
				);
				throw `What a terrible failure :(`;
			}
		}

		// 1.5 mins per patch --> ex: 10 patches = 15 mins
		const duration = timePerPatch * quantity;

		// Check the user has the required seeds to plant.
		/* const hasRequiredSeeds = await msg.author.hasItem(plants.inputItems, quantity);
		if (!hasRequiredSeeds) {
			throw `You dont have ${quantity}x ${itemNameFromID(parseInt(plants.inputItems))}s.`;
		} */

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				plants.name
			}s you can plant is ${(Math.floor(msg.author.maxTripLength / timePerPatch),
			numOfPatches)}.`;
		}

		if (numOfPatches === 0) {
			throw `There are no patches available to you for this plant at this stage. Please train your farming or raise your quest points!`;
		}
		if (quantity > numOfPatches) {
			throw `There are not enough ${plants.seedType} patches to plant that many. The max amount of patches to plant in is ${numOfPatches}.`;
		}

		const seedType: any = plants.seedType;
		const seedToPatch: PatchTypes.FarmingPatchTypes = seedType;
		const getPatchType = resolvePatchTypeSetting(seedToPatch);
		const patchType: any = msg.author.settings.get(getPatchType);

		/*const updatePatches = {
			PatchStage: 0,
		};
		msg.author.settings.update(getPatchType, updatePatches);*/

		const data: FarmingActivityTaskOptions = {
			plantsName: plants.name,
			patchType: patchType,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			upgradeType,
			duration,
			msg,
			type: Activity.Farming,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + 1000
		};

		// placeholder: if user does not have something already planted, just plant the new seeds.
		if (patchType.PatchStage === 0) {
			const initialPatches = {
				LastPlanted: plants.name,
				PatchStage: 1,
				PlantTime: currentDate,
				LastQuantity: quantity,
				LastUpgradeType: upgradeType,
				LastPayment: payment,
				IsHarvestable: true
			};

			msg.author.settings.update(getPatchType, initialPatches);

			str += `${msg.author.minionName} is now planting ${quantity}x ${
				plants.name
			}s. ${upgradeStr}${paymentStr}\nIt'll take around ${formatDuration(duration)} to finish.`;
		} else if (patchType.PatchStage === 1) {
			const storeHarvestablePlant = patchType.LastPlanted;
			const planted = Farming.Plants.find(
				plants =>
					stringMatches(plants.name, storeHarvestablePlant) ||
					stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
			);
			if (!planted) {
				throw `This error shouldn't happen. Just to clear possible undefined error`;
			}

			const storeHarvestableQuantity = patchType.LastQuantity;
			// placeholder: if user has something already planted, harvest it and plant the new seeds.
			//	const lastPlantTime = patchType.PlantTime;
			//	const difference = currentDate - lastPlantTime;
			// initiate a cooldown feature for each of the seed types.
			/* allows for a run of specific seed type to only be possible until the
				previous run's plants has grown.*/
			/*if (difference > planted.growthTime) {
				throw `Please come back when your crops have finished growing in ${formatDuration((patchType.PlantTime + (plants.growthTime * Time.Minute)- currentDate ))}!`;
			}*/
			const updatePatches = {
				LastPlanted: plants.name,
				PatchStage: 1,
				PlantTime: currentDate,
				LastQuantity: quantity,
				LastUpgradeType: upgradeType,
				LastPayment: payment,
				IsHarvestable: true
			};

			msg.author.settings.update(getPatchType, updatePatches);

			str += `${
				msg.author.minionName
			} is now harvesting ${storeHarvestableQuantity}x ${storeHarvestablePlant}s, and then planting ${quantity}x ${
				plants.name
			}s. ${upgradeStr}${paymentStr}\nIt'll take around ${formatDuration(duration)} to finish.`;
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		// Remove the bars from their bank.
		await msg.author.settings.update(UserSettings.Bank, newBank);
		return msg.send(str);
	}
}
