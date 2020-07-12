import { CommandStore, KlasaMessage } from 'klasa';

import { stringMatches, formatDuration, rand } from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { Time, Activity, Tasks } from '../../lib/constants';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Farming from '../../lib/skilling/skills/farming/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import resolvePatchTypeSetting from '../../lib/farming/functions/resolvePatchTypeSettings';
import { PatchTypes } from '../../lib/farming';
import { FarmingPatchTypes } from '../../lib/farming/types';
import itemID from '../../lib/util/itemID';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<seedType:...string>',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [seedType = '']: [string]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const GP = msg.author.settings.get(UserSettings.GP);
		const currentWoodcuttingLevel = msg.author.skillLevel(SkillsEnum.Woodcutting);
		const currentDate = new Date().getTime();

		const getSeedType: any = seedType;
		const seedToPatch: PatchTypes.FarmingPatchTypes = getSeedType;
		const getPatchType = resolvePatchTypeSetting(seedToPatch);
		if (!getPatchType) {
			let patchStr = '';
			for (const patches in FarmingPatchTypes) {
				patchStr += `${patches}, `;
			}
			throw `That is not a valid patch type! The available patches are: ${patchStr}`;
		}
		const patchType: any = msg.author.settings.get(getPatchType);

		const upgradeType = '';
		let str = '';
		let boostStr = '';
		const timePerPatch = Time.Minute * 1.5;

		// If no quantity provided, set it to the max PATCHES available.

		const newBank = { ...userBank };

		// 1.5 mins per patch --> ex: 10 patches = 15 mins
		let duration = timePerPatch * patchType.LastQuantity;

		// Reduce time if user has graceful equipped
		if (
			hasArrayOfItemsEquipped(
				[
					'Graceful hood',
					'Graceful top',
					'Graceful legs',
					'Graceful gloves',
					'Graceful boots',
					'Graceful cape'
				].map(itemID),
				msg.author.settings.get(UserSettings.Gear.Skilling)
			)
		) {
			boostStr += '\n\n**Boosts**: 10% for Graceful.';
			duration *= 0.9;
		}

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity.`;
		}

		const data: FarmingActivityTaskOptions = {
			plantsName: patchType.LastPlanted,
			patchType,
			userID: msg.author.id,
			channelID: msg.channel.id,
			upgradeType,
			duration,
			quantity: patchType.LastQuantity,
			planting: false,
			msg,
			type: Activity.Farming,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// If user does not have something already planted, just plant the new seeds.
		if (patchType.PatchStage === 0) {
			throw `There is nothing planted in this patch to harvest!`;
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

			const lastPlantTime: number = patchType.PlantTime;
			const difference = currentDate - lastPlantTime;
			// initiate a cooldown feature for each of the seed types.
			/* allows for a run of specific seed type to only be possible until the
				previous run's plants has grown.*/
			if (difference < planted.growthTime * Time.Minute) {
				throw `Please come back when your crops have finished growing in ${formatDuration(
					lastPlantTime + planted.growthTime * Time.Minute - currentDate
				)}!`;
			}

			const storeHarvestableQuantity = patchType.LastQuantity;

			if (planted.needsChopForHarvest === true) {
				if (!planted.treeWoodcuttingLevel) return;
				if (
					currentWoodcuttingLevel < planted.treeWoodcuttingLevel &&
					GP < 200 * storeHarvestableQuantity
				) {
					throw `Your minion remembers that they do not have ${planted.treeWoodcuttingLevel} woodcutting or the 200GP per patch required to be able to harvest the currently planted trees.`;
				}
			}

			const updatePatches = {
				LastPlanted: '',
				PatchStage: 0,
				PlantTime: 0,
				LastQuantity: 0,
				LastUpgradeType: '',
				LastPayment: '',
				IsHarvestable: false
			};

			msg.author.settings.update(getPatchType, updatePatches);

			str += `${
				msg.author.minionName
			} is now harvesting ${storeHarvestableQuantity}x ${storeHarvestablePlant}.\nIt'll take around ${formatDuration(
				duration
			)} to finish. ${boostStr}`;
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		await msg.author.settings.update(UserSettings.Bank, newBank);
		return msg.send(str);
	}
}
