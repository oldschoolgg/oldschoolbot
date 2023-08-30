import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { SkillsEnum } from '../../../lib/skilling/types';
import { Skills } from '../../../lib/types';
import { CollectingOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { getPOH } from './pohCommand';

export interface Collectable {
	item: Item;
	skillReqs?: Skills;
	itemCost?: Bank;
	quantity: number;
	duration: number;
	qpRequired?: number;
	onlyTamesCan?: boolean;
}

export const collectables: Collectable[] = [
	{
		item: getOSItem('Blue dragon scale'),
		quantity: 26,
		itemCost: new Bank({
			'Water rune': 1,
			'Air rune': 3,
			'Law rune': 1
		}),
		skillReqs: {
			agility: 70,
			magic: 37
		},
		duration: Time.Minute * 2
	},
	{
		item: getOSItem('Mort myre fungus'),
		quantity: 100,
		itemCost: new Bank({
			'Prayer potion(4)': 1,
			'Ring of dueling(8)': 1
		}),
		skillReqs: {
			prayer: 50
		},
		duration: Time.Minute * 8.3,
		qpRequired: 32
	},
	{
		item: getOSItem('Flax'),
		quantity: 28,
		duration: Time.Minute * 1.68
	},
	{
		item: getOSItem('Swamp toad'),
		quantity: 28,
		duration: Time.Minute * 1.68
	},
	{
		item: getOSItem("Red spiders' eggs"),
		quantity: 80,
		itemCost: new Bank({
			'Stamina potion(4)': 1
		}),
		duration: Time.Minute * 8.5
	},
	{
		item: getOSItem('White berries'),
		quantity: 27,
		qpRequired: 22,
		skillReqs: {
			ranged: 60,
			thieving: 50,
			agility: 56,
			crafting: 10,
			fletching: 5,
			cooking: 30
		},
		duration: Time.Minute * 4.05
	},
	{
		item: getOSItem('Snape grass'),
		quantity: 120,
		itemCost: new Bank({
			'Law rune': 12,
			'Astral rune': 12
		}),
		duration: Time.Minute * 6.5,
		qpRequired: 72
	},
	{
		item: getOSItem('Snake weed'),
		quantity: 150,
		itemCost: new Bank({
			'Ring of dueling(8)': 1
		}),
		duration: Time.Minute * 30,
		qpRequired: 3
	},
	{
		item: getOSItem('Bucket of sand'),
		quantity: 30,
		itemCost: new Bank({
			'Law rune': 1,
			Coins: 30 * 25
		}),
		duration: Time.Minute,
		qpRequired: 30
	},
	{
		item: getOSItem('Jangerberries'),
		quantity: 224,
		itemCost: new Bank({
			'Ring of dueling(8)': 1
		}),
		skillReqs: {
			agility: 10
		},
		duration: Time.Minute * 24
	},
	// Miniquest to get Tarn's diary for Salve amulet (e)/(ei)
	{
		item: getOSItem("Tarn's diary"),
		quantity: 1,
		itemCost: new Bank({
			'Prayer potion(4)': 2
		}),
		skillReqs: {
			slayer: 40,
			attack: 60,
			strength: 60,
			ranged: 60,
			defence: 60,
			magic: 60
		},
		duration: 10 * Time.Minute,
		qpRequired: 100
	},
	{
		item: getOSItem('Neem drupe'),
		quantity: 5,
		itemCost: new Bank({
			'Astral rune': 26,
			'Cosmic rune': 12
		}),
		skillReqs: {
			magic: 82,
			herblore: 82,
			agility: 92
		},
		duration: 5 * Time.Minute,
		qpRequired: 82
	},
	{
		item: getOSItem('Orange'),
		quantity: 1,
		duration: 2 * Time.Minute,
		onlyTamesCan: true
	},
	{
		item: getOSItem('Cabbage'),
		quantity: 28,
		duration: 1.2 * Time.Minute
	}
];

export async function collectCommand(
	user: MUser,
	channelID: string,
	objectName: string,
	quantity?: number,
	no_stams?: boolean
) {
	const collectable = collectables.find(c => stringMatches(c.item.name, objectName));
	if (!collectable) {
		return `That's not something your minion can collect, you can collect these things: ${collectables
			.map(i => i.item.name)
			.join(', ')}.`;
	}

	if (collectable.onlyTamesCan) {
		return 'Only Tames can collect this.';
	}

	const maxTripLength = calcMaxTripLength(user, 'Collecting');
	if (collectable.qpRequired && user.QP < collectable.qpRequired) {
		return `You need ${collectable.qpRequired} QP to collect ${collectable.item.name}.`;
	}

	if (collectable.skillReqs) {
		for (const [skillName, lvl] of Object.entries(collectable.skillReqs)) {
			if (user.skillLevel(skillName as SkillsEnum) < lvl) {
				return `You need ${lvl} ${skillName} to collect ${collectable.item.name}.`;
			}
		}
	}

	if (no_stams === undefined) {
		no_stams = false;
	}

	if (!quantity) {
		quantity = Math.floor(maxTripLength / collectable.duration);
	}
	let duration = collectable.duration * quantity;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on a trip longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${collectable.item.name} is ${Math.floor(
			maxTripLength / collectable.duration
		)}.`;
	}

	const poh = await getPOH(user.id);
	const hasJewelleryBox = poh.jewellery_box !== null;

	let cost: Bank = new Bank();

	if (collectable.itemCost) {
		{
			cost = collectable.itemCost.clone().multiply(quantity);
			if (cost.has('Ring of dueling(8)') && hasJewelleryBox)
				cost.remove('Ring of dueling(8)', cost.amount('Ring of dueling(8)'));
		}
		if (cost.has('Stamina potion(4)') && no_stams) {
			// 50% longer trip time for not using stamina potion (4)
			duration *= 1.5;
			cost.remove('Stamina potion(4)', cost.amount('Stamina potion (4)'));
		}
		if (!user.owns(cost)) {
			return `You don't have the items needed for this trip, you need: ${cost}.`;
		}
		await transactItems({ userID: user.id, itemsToRemove: cost });

		await updateBankSetting('collecting_cost', cost);
	}

	await addSubTaskToActivityTask<CollectingOptions>({
		collectableID: collectable.item.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		noStaminas: no_stams,
		type: 'Collecting'
	});

	return `${user.minionName} is now collecting ${quantity * collectable.quantity}x ${
		collectable.item.name
	}, it'll take around ${formatDuration(duration)} to finish.${
		cost.toString().length > 0
			? `
Removed ${cost} from your bank.`
			: ''
	}${no_stams ? '\n50% longer trip due to not using Stamina potions.' : ''}`;
}
