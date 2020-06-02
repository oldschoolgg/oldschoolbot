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
import { FarmingPatchTypes } from '../../lib/farming/types';
import resolveFarmingTypeSetting from '../../lib/farming/functions/resolvePatchTypeSettings';
import { PatchTypes } from '../../lib/farming';

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
			throw `There are no patches available to you for this plant at this stage. Please train your farming or raise your quest points!`
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

		// Match the seed type to the patch type
		// these are just tests to see what works / doesn't
		const patch = FarmingPatchTypes.find(patch => stringMatches(patch.name, plants.seedType));
		const patchType = msg.author.settings.get(resolveFarmingTypeSetting(plants.seedType);

		// initiate a cooldown feature for each of the seed types.
		// allows for a run of specific seed type to only be possible until the previous plant has grown.




		// placeholder: if user does not have something already planted, just plant the new seeds.
		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
				msg.author.incrementMinionDailyDuration(duration);
				return msg.send(
					`${msg.author.minionName} is now planting ${quantity}x ${
						plants.name
					}s , it'll take around ${formatDuration(duration)} to finish.`
				);

		// placeholder: if user has something already planted, harvest it and plant the new seeds.
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
