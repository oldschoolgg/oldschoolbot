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
import { FarmingPatchTypes } from '../../lib/farming/types';
import hasGracefulEquipped from '../../lib/gear/functions/hasGracefulEquipped';

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
		const GP = msg.author.settings.get(UserSettings.GP);
		const currentWoodcuttingLevel = msg.author.skillLevel(SkillsEnum.Woodcutting);
		const currentDate = new Date().getTime();

		const getPatchType = resolvePatchTypeSetting(seedType);
		if (!getPatchType) {
			let patchStr = '';
			for (const patches in FarmingPatchTypes) {
				patchStr += `${patches}, `;
			}
			throw `That is not a valid patch type! The available patches are: ${patchStr}`;
		}

		const patchType = msg.author.settings.get(getPatchType);

		const upgradeType = '';
		let returnMessageStr = '';
		let boostStr = '';

		const storeHarvestablePlant = patchType.lastPlanted;
		const planted = Farming.Plants.find(
			plants =>
				stringMatches(plants.name, storeHarvestablePlant) ||
				stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
		);
		if (!planted) throw `This error shouldn't happen. Just to clear possible undefined error`;

		const timePerPatchTravel = Time.Second * planted.timePerPatchTravel;
		const timePerPatchHarvest = Time.Second * planted.timePerHarvest;

		// 1.5 mins per patch --> ex: 10 patches = 15 mins
		let duration = patchType.lastQuantity * (timePerPatchTravel + timePerPatchHarvest);

		// Reduce time if user has graceful equipped
		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			boostStr += '\n\n**Boosts**: 10% for Graceful.';
			duration *= 0.9;
		}

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity.`;
		}

		const data: FarmingActivityTaskOptions = {
			plantsName: patchType.lastPlanted,
			patchType,
			getPatchType,
			userID: msg.author.id,
			channelID: msg.channel.id,
			upgradeType,
			duration,
			quantity: patchType.lastQuantity,
			planting: false,
			msg,
			currentDate,
			type: Activity.Farming,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// If user does not have something already planted, just plant the new seeds.
		if (!patchType.patchStage) {
			throw `There is nothing planted in this patch to harvest!`;
		} else if (patchType.patchStage) {
			const storeHarvestablePlant = patchType.lastPlanted;
			const planted = Farming.Plants.find(
				plants =>
					stringMatches(plants.name, storeHarvestablePlant) ||
					stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
			);
			if (!planted) {
				throw `This error shouldn't happen. Just to clear possible undefined error`;
			}

			const lastPlantTime: number = patchType.plantTime;
			const difference = currentDate - lastPlantTime;
			/* initiate a cooldown feature for each of the seed types.
				allows for a run of specific seed type to only be possible until the
				previous run's plants has grown.*/
			if (difference < planted.growthTime * Time.Minute) {
				throw `Please come back when your crops have finished growing in ${formatDuration(
					lastPlantTime + planted.growthTime * Time.Minute - currentDate
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

			returnMessageStr += `${
				msg.author.minionName
			} is now harvesting ${storeHarvestableQuantity}x ${storeHarvestablePlant}.\nIt'll take around ${formatDuration(
				duration
			)} to finish. ${boostStr}`;
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		return msg.send(returnMessageStr);
	}
}
