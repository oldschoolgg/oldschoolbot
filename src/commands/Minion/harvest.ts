import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { production } from '../../config';
import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { defaultPatches, resolvePatchTypeSetting } from '../../lib/minions/farming';
import { FarmingPatchTypes } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Farming from '../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import { bankHasItem, formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<seedType:...string>',
			usageDelim: ' ',
			description: 'Allows a player to harvest a specific patch without replanting a seed.',
			examples: ['+harvest herb', '+harvest tree'],
			categoryFlags: ['minion']
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
			const patchStr: string[] = [];
			const patchArray = Object.values(FarmingPatchTypes);
			for (let i = 0; i < patchArray.length; i++) {
				const patches = patchArray[i];
				patchStr.push(`${patches}`);
			}
			throw `That is not a valid patch type! The available patches are: ${patchStr.join(
				', '
			)}. *Don't include numbers, this command harvests all crops available of the specified patch type.*`;
		}

		const patchType = msg.author.settings.get(getPatchType) ?? defaultPatches;

		const upgradeType = null;
		let returnMessageStr = '';
		const boostStr = [];

		const storeHarvestablePlant = patchType.lastPlanted;
		const planted = storeHarvestablePlant
			? Farming.Plants.find(plants => stringMatches(plants.name, storeHarvestablePlant)) ??
			  Farming.Plants.find(
					plants =>
						stringMatches(plants.name, storeHarvestablePlant) ||
						stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
			  )
			: null;

		const lastPlantTime: number = patchType.plantTime;
		const difference = currentDate - lastPlantTime;
		/* Initiate a cooldown feature for each of the seed types.
			Allows for a run of specific seed type to only be possible until the
			previous run's plants have been fully grown.*/
		if (production && planted && difference < planted.growthTime * Time.Minute) {
			throw `Please come back when your crops have finished growing in ${formatDuration(
				lastPlantTime + planted.growthTime * Time.Minute - currentDate
			)}!`;
		}

		const storeHarvestableQuantity = patchType.lastQuantity;

		if (
			planted &&
			planted.needsChopForHarvest &&
			planted.treeWoodcuttingLevel &&
			currentWoodcuttingLevel < planted.treeWoodcuttingLevel
		) {
			const gpToCutTree =
				planted.seedType === 'redwood' ? 2000 * storeHarvestableQuantity : 200 * storeHarvestableQuantity;
			if (GP < gpToCutTree) {
				throw `${msg.author.minionName} remembers that they do not have ${planted.treeWoodcuttingLevel} woodcutting or the ${gpToCutTree} GP required to be able to harvest the currently planted trees, and so they cancel their trip.`;
			}
		}

		if (!planted) {
			this.client.wtf(new Error(`${msg.author.sanitizedName}'s patch had no plant found in it.`));
			return;
		}

		const timePerPatchTravel = Time.Second * planted.timePerPatchTravel;
		const timePerPatchHarvest = Time.Second * planted.timePerHarvest;

		// 1.5 mins per patch --> ex: 10 patches = 15 mins
		let duration = patchType.lastQuantity * (timePerPatchTravel + timePerPatchHarvest);

		// Reduce time if user has graceful/globetrotter equipped
		if (msg.author.hasGlobetrotterEquipped()) {
			boostStr.push('20% time for having the Globetrotter Outfit');
			duration *= 0.8;
		} else if (msg.author.hasGracefulEquipped()) {
			boostStr.push('10% time for Graceful');
			duration *= 0.9;
		}

		if (msg.author.hasItemEquippedAnywhere(itemID('Ring of endurance'))) {
			boostStr.push('10% time for Ring of Endurance');
			duration *= 0.9;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Farming);

		if (duration > maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity.`;
		}

		// If user does not have something already planted, just plant the new seeds.
		if (!patchType.patchPlanted) {
			throw 'There is nothing planted in this patch to harvest!';
		} else if (patchType.patchPlanted) {
			if (planted.needsChopForHarvest) {
				if (!planted.treeWoodcuttingLevel) return;
				if (currentWoodcuttingLevel < planted.treeWoodcuttingLevel && GP < 200 * storeHarvestableQuantity) {
					throw `Your minion remembers that they do not have ${planted.treeWoodcuttingLevel} woodcutting or the 200GP per patch required to be able to harvest the currently planted trees.`;
				}
			}

			const userBank = msg.author.settings.get(UserSettings.Bank);

			if (
				bankHasItem(userBank, itemID('Magic secateurs')) ||
				msg.author.hasItemEquippedAnywhere(itemID('Magic secateurs'))
			) {
				boostStr.push('10% crop yield for Magic Secateurs');
			}

			if (
				bankHasItem(userBank, itemID('Farming cape')) ||
				bankHasItem(userBank, itemID('Farming cape(t)')) ||
				msg.author.hasItemEquippedAnywhere(itemID('Farming cape')) ||
				msg.author.hasItemEquippedAnywhere(itemID('Farming cape(t)'))
			) {
				boostStr.push('5% crop yield for Farming Skillcape');
			}

			returnMessageStr = `${
				msg.author.minionName
			} is now harvesting ${storeHarvestableQuantity}x ${storeHarvestablePlant}.\nIt'll take around ${formatDuration(
				duration
			)} to finish.\n\n${boostStr.length > 0 ? '**Boosts**: ' : ''}${boostStr.join(', ')}`;
		}

		await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
			plantsName: patchType.lastPlanted,
			patchType,
			getPatchType,
			userID: msg.author.id,
			channelID: msg.channel.id,
			upgradeType,
			duration,
			quantity: patchType.lastQuantity,
			planting: false,
			currentDate,
			type: Activity.Farming,
			autoFarmed: false
		});

		return msg.channel.send(returnMessageStr);
	}
}
