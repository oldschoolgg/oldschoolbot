import { reduceNumByPercent, round, Time } from 'e';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Constructables from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { Skills } from '../../lib/types';
import { ConstructionActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../lib/util/cleanString';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../mahojiSettings';

const ds2Requirements: Skills = {
	magic: 75,
	smithing: 70,
	mining: 68,
	crafting: 62,
	agility: 60,
	thieving: 60,
	construction: 50,
	hitpoints: 50,
	herblore: 45,
	prayer: 42,
	strength: 50,
	woodcutting: 55,
	fishing: 53,
	cooking: 53,
	ranged: 30,
	defence: 40,
	firemaking: 49,
	fletching: 25,
	slayer: 18
};

export const buildCommand: OSBMahojiCommand = {
	name: 'build',
	description: 'Sends your minion to train Construction by building things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/build name:Crude chair']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The object you want to build.',
			required: true,
			autocomplete: async (value: string, user: APIUser) => {
				const mUser = await mahojiUsersSettingsFetch(user.id);
				const conLevel = getSkillsOfMahojiUser(mUser, true).construction;
				return Constructables.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.filter(c => c.level <= conLevel)
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to build (defaults to max).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await globalClient.fetchUser(userID);
		const object = Constructables.find(
			object => stringMatches(object.name, options.name) || stringMatches(object.name.split(' ')[0], options.name)
		);
		const [hasDs2Requirements, ds2Reason] = user.hasSkillReqs(ds2Requirements);

		if (!object) return 'Thats not a valid object to build.';

		if (user.skillLevel(SkillsEnum.Construction) < object.level) {
			return `${user.minionName} needs ${object.level} Construction to create a ${object.name}.`;
		}

		if (object.name === 'Mythical cape (mounted)') {
			if (user.settings.get(UserSettings.QP) < 205) {
				return `${user.minionName} needs 205 Quest Points to build a ${object.name}.`;
			}
			if (!hasDs2Requirements) {
				return `In order to build a ${object.name}, you need: ${ds2Reason}.`;
			}
			if (!user.hasItemEquippedOrInBank('Mythical cape')) {
				return `${user.minionName} needs to own a Mythical cape to build a ${object.name}.`;
			}
		}

		let timeToBuildSingleObject = object.ticks * 300;

		const [plank, planksQtyCost] = object.input;

		const userBank = user.bank();
		const planksHas = userBank.amount(plank);

		const maxTripLength = user.maxTripLength('Construction');
		const maxForMaterials = planksHas / planksQtyCost;

		let boosts: string[] = [];

		if (hasItemsEquippedOrInBank(user, ['Drygore saw'])) {
			const boostRes = await inventionItemBoost({
				userID: BigInt(user.id),
				inventionID: InventionID.DrygoreSaw,
				duration: Math.min(
					maxTripLength,
					options.quantity ? options.quantity * timeToBuildSingleObject : maxTripLength
				)
			});
			if (boostRes.success) {
				timeToBuildSingleObject = reduceNumByPercent(
					timeToBuildSingleObject,
					inventionBoosts.drygoreSaw.buildBoostPercent
				);
				boosts.push(
					`${inventionBoosts.drygoreSaw.buildBoostPercent}% faster building from Drygore saw (${boostRes.messages})`
				);
			}
		}
		const maxForTime = Math.floor(maxTripLength / timeToBuildSingleObject);

		let defaultQuantity = Math.floor(Math.min(maxForTime, Math.max(maxForMaterials, 1)));

		let { quantity } = options;
		if (!quantity) quantity = defaultQuantity;

		const cost = new Bank().add(plank, planksQtyCost * quantity);
		const hasScroll = user.owns('Scroll of proficiency');
		if (hasScroll) {
			cost.bank[plank] = Math.floor(reduceNumByPercent(cost.bank[plank], 15));
			boosts.push('15% less planks used from Scroll of proficiency');
		}

		const objectsPerInv = 26 / planksQtyCost;
		const invsPerTrip = round(quantity / objectsPerInv, 2);

		const duration = quantity * timeToBuildSingleObject;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)} minutes, try a lower quantity. The highest amount of ${object.name}s you can build is ${Math.floor(
				maxTripLength / timeToBuildSingleObject
			)}.`;
		}

		const gpNeeded = Math.floor(10_000 * (invsPerTrip / 8));
		cost.add('Coins', gpNeeded);
		if (!user.owns(cost)) return `You don't own: ${cost}.`;

		await user.removeItemsFromBank(cost);

		updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, cost);

		await addSubTaskToActivityTask<ConstructionActivityTaskOptions>({
			objectID: object.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Construction'
		});

		const xpHr = `${(((object.xp * quantity) / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr`;

		let str = `${user.minionName} is now constructing ${quantity}x ${
			object.name
		}, it'll take around ${formatDuration(duration)} to finish. Removed ${cost} from your bank. **${xpHr}**

You paid ${gpNeeded.toLocaleString()} GP, because you used ${invsPerTrip} inventories of planks.`;
		if (boosts.length > 0) {
			str += `**Boosts:** ${boosts.join(', ')}`;
		}
		return str;
	}
};
