import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { randArrItem, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { client } from '..';
import { mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';
import Grimy from './skilling/skills/herblore/mixables/grimy';
import { SkillsEnum } from './skilling/types';
import { getAllUserTames, TameSpeciesID } from './tames';
import { ItemBank, Skills } from './types';
import { MinigameActivityTaskOptions } from './types/minions';
import { formatDuration, stringMatches } from './util';
import addSubTaskToActivityTask from './util/addSubTaskToActivityTask';
import { calcMaxTripLength } from './util/calcMaxTripLength';
import getOSItem from './util/getOSItem';
import { handleTripFinish } from './util/handleTripFinish';
import { minionName } from './util/minionUtils';
import { resolveOSItems } from './util/resolveItems';

export const bathhouseTierNames = ['Warm', 'Hot', 'Fiery'] as const;
type BathhouseTierName = typeof bathhouseTierNames[number];

interface BathhouseTaskOptions extends MinigameActivityTaskOptions {
	mixture: string;
	ore: number;
	tier: BathhouseTierName;
}
interface BathhouseOre {
	item: Item;
	warmth: number;
	logs: Item;
	tiers: BathhouseTierName[];
}
export const BathhouseOres: BathhouseOre[] = [
	{
		item: getOSItem('Copper ore'),
		warmth: 1,
		logs: getOSItem('Logs'),
		tiers: ['Warm']
	},
	{
		item: getOSItem('Tin ore'),
		warmth: 1,
		logs: getOSItem('Logs'),
		tiers: ['Warm']
	},
	{
		item: getOSItem('Iron ore'),
		warmth: 2,
		logs: getOSItem('Oak logs'),
		tiers: ['Warm', 'Hot']
	},
	{
		item: getOSItem('Gold ore'),
		warmth: 2,
		logs: getOSItem('Willow logs'),
		tiers: ['Warm', 'Hot']
	},
	{
		item: getOSItem('Mithril ore'),
		warmth: 5,
		logs: getOSItem('Maple logs'),
		tiers: ['Warm', 'Hot']
	},
	{
		item: getOSItem('Adamantite ore'),
		warmth: 10,
		logs: getOSItem('Yew logs'),
		tiers: ['Warm', 'Hot', 'Fiery']
	},
	{
		item: getOSItem('Runite ore'),
		warmth: 25,
		logs: getOSItem('Magic logs'),
		tiers: ['Warm', 'Hot', 'Fiery']
	}
];

interface BathhouseTier {
	name: BathhouseTierName;
	hoursReq: number;
	skillRequirements: Skills;
	customRequirements?: (user: User) => Promise<[true] | [false, string]>;
	// tipTable
	// tips: (user: User, activity: BathhouseTaskOptions) => Bank;
	warmthPerBath: number;
	xpMultiplier: number;
}
export const bathHouseTiers: BathhouseTier[] = [
	{
		name: 'Warm',
		hoursReq: 0,
		skillRequirements: {
			herblore: 50,
			firemaking: 50
		},
		warmthPerBath: 25 * 10,
		xpMultiplier: 1
	},
	{
		name: 'Hot',
		hoursReq: 3,
		skillRequirements: {
			herblore: 80,
			firemaking: 80
		},
		warmthPerBath: 25 * 25,
		xpMultiplier: 1.35
	},
	{
		name: 'Fiery',
		hoursReq: 10,
		skillRequirements: {
			herblore: 95,
			firemaking: 95
		},
		warmthPerBath: 25 * 50,
		xpMultiplier: 1.8
		// customRequirements:async (user: User) => {
		//     const [tame, activity] = await getUsersTame(user)
		//     const species = !tame ? null : getTameSpecies(tame);
		//     if (!species || species.name !== "Igne") return [false, `You need a Ignecarus tame  `]
		// }
	}
];

export const BathwaterMixtures = [
	{ items: resolveOSItems(['Guam leaf', 'Avantoe']), name: 'Vitalizing' },
	{ items: resolveOSItems(['Marrentill', 'Kwuarm']), name: 'Soothing' },
	{ items: resolveOSItems(['Tarromin', 'Snapdragon']), name: 'Caustic' },
	{ items: resolveOSItems(['Harralander', 'Cadantine']), name: 'Magical' },
	{ items: resolveOSItems(['Ranarr weed', 'Lantadyme']), name: 'Holy' },
	{ items: resolveOSItems(['Toadflax', 'Dwarf weed']), name: 'Invigorating' },
	{ items: resolveOSItems(['Irit leaf', 'Torstol']), name: 'Healing' }
] as const;
// type BathwaterMixtureName = typeof BathwaterMixtures[number]['name'];

interface BathhouseSpecies {
	name: string;
	tier: BathhouseTierName;
	// preferredMixture:
}

const species: BathhouseSpecies[] = [
	{
		name: 'Fairies',
		tier: 'Warm'
	},
	{
		name: 'Monkeys',
		tier: 'Warm'
	},
	{
		name: 'Goblins',
		tier: 'Warm'
	},
	{
		name: 'Imps',
		tier: 'Warm'
	},

	{
		name: 'Giants',
		tier: 'Hot'
	},
	{
		name: 'Fiends',
		tier: 'Hot'
	},
	{
		name: 'Ogres',
		tier: 'Hot'
	},
	{
		name: 'Gargoyles',
		tier: 'Hot'
	},
	{
		name: 'TzHaar',
		tier: 'Fiery'
	},
	{
		name: 'Wyverns',
		tier: 'Fiery'
	},
	{
		name: 'Abyssals',
		tier: 'Fiery'
	},
	{
		name: 'Dragons',
		tier: 'Fiery'
	},
	{
		name: 'Demons',
		tier: 'Fiery'
	}
];

export const baxBathHelpStr = `**Baxtorian Bathhouses**

- In this minigame, you play the role of a Boiler and Herbalist. Your job is to heat the water, and infuse it with herbs to give the water special properties.
- You heat the water using ore, logs and coal. The ore/logs you use, is partly your choice.
- You infuse the water with mixtures of herb pairs (e.g. Ranarr and Tarromin), your choice of which to use.
- There are 3 tiers (Warm, Hot, Fiery), they are in increasing difficulty and requirements.
- You get Herblore and Smithing experience for your work, as well as occasional tips from the customers.
`;

export async function baxtorianBathhousesStartCommand({
	user,
	klasaUser,
	tier,
	ore,
	mixture,
	channelID
}: {
	user: User;
	klasaUser: KlasaUser;
	tier: string;
	channelID: bigint;
	ore?: string;
	mixture?: string;
}) {
	const userBank = new Bank(user.bank as ItemBank);
	const maxTripLength = calcMaxTripLength(user);
	const durationPerPath = Time.Minute * 10;
	const quantity = Math.floor(maxTripLength / durationPerPath);
	const duration = quantity * durationPerPath;
	const bathHouseTier = bathHouseTiers.find(i => stringMatches(i.name, tier)) ?? bathHouseTiers[0];
	const warmthNeeded = bathHouseTier.warmthPerBath * quantity;
	const herbsNeeded = quantity;

	let oreToUse = ore ? BathhouseOres.find(o => stringMatches(o.item.name, ore)) : null;
	if (!oreToUse) {
		oreToUse = BathhouseOres.find(o => userBank.amount(o.item.id) >= warmthNeeded / o.warmth) ?? BathhouseOres[0];
	}
	let mixtureToUse = mixture ? BathwaterMixtures.find(m => m.items.some(o => stringMatches(o.name, mixture))) : null;
	if (!mixtureToUse) {
		mixtureToUse =
			BathwaterMixtures.find(o => {
				const checkBank = new Bank();
				for (const h of o.items) checkBank.add(h.id, herbsNeeded);
				return userBank.has(checkBank);
			}) ?? BathwaterMixtures[0];
	}
	const boosts: string[] = [];

	const tameToUse = (await getAllUserTames(user.id)).filter(
		i => !i.tame_activity && i.species_id === TameSpeciesID.Igne
	)[0];

	let oreNeeded = Math.floor(warmthNeeded / oreToUse.warmth);
	let coalNeeded = quantity * 22;
	let logsNeeded = quantity * 12;
	if (tameToUse) {
		boosts.push('30% Less heating needed');
		oreNeeded = Math.floor(reduceNumByPercent(oreNeeded, 30));
		coalNeeded = Math.floor(reduceNumByPercent(coalNeeded, 30));
		logsNeeded = Math.floor(reduceNumByPercent(logsNeeded, 30));
	}
	const heatingCost = new Bank()
		.add(oreToUse.item.id, oreNeeded)
		.add('Coal', coalNeeded)
		.add(oreToUse.logs.id, logsNeeded);

	const herbCost = new Bank();
	for (const h of mixtureToUse.items) herbCost.add(h.id, herbsNeeded);

	const cost = new Bank().add(heatingCost).add(herbCost);

	if (!klasaUser.owns(cost)) return `You don't own ${cost}.`;
	await klasaUser.removeItemsFromBank(cost);

	await addSubTaskToActivityTask<BathhouseTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'BaxtorianBathhouses',
		minigameID: 'bax_baths',
		mixture: mixtureToUse.name,
		ore: oreToUse.item.id,
		tier: bathHouseTier.name
	});

	return `${userMention(user.id)}, your minion is now working at the Baxtorian Bathhouses for ${formatDuration(
		duration
	)}. They are using ${heatingCost} to heat the water, and ${herbCost} for their water mixture. Removed ${cost} from your bank.
**Boosts:** ${boosts.length > 0 ? boosts.join(', ') : 'None.'}`;
}

function calculateResult(data: BathhouseTaskOptions) {
	const { quantity } = data;
	const ore = BathhouseOres.find(i => i.item.id === data.ore)!;
	const tier = bathHouseTiers.find(t => t.name === data.tier)!;
	const mixture = BathwaterMixtures.find(i => i.name === data.mixture)!;
	const [firstHerb, secondHerb] = mixture.items.map(herb => Grimy.find(i => i.id === herb.id)!);
	const speciesServed = randArrItem(species.filter(i => i.tier === tier.name));

	const herbXP = (2500 * quantity + firstHerb.xp * 10 * quantity + secondHerb.xp * 10 * quantity) * tier.xpMultiplier;
	const smithingXP = 10 * quantity * ore.warmth * tier.xpMultiplier;

	// const herbCost = new Bank().add(firstHerb.id, quantity).add(secondHerb.id, quantity);
	// const fmCost = new Bank().add(ore.item.id, Math.floor(tier.warmthPerBath / ore.warmth));

	const loot = new Bank();
	return {
		loot,
		herbXP,
		smithingXP,
		ore,
		tier,
		herbs: [firstHerb, secondHerb].map(i => i.id).map(getOSItem),
		speciesServed
	};
}

export async function baxtorianBathhousesActivity(data: BathhouseTaskOptions) {
	const { userID, channelID, quantity, duration } = data;
	const mahojiUser = await mahojiUsersSettingsFetch(userID);
	const klasaUser = await client.fetchUser(userID);
	const { loot, herbXP, smithingXP, ore, tier, herbs, speciesServed } = calculateResult(data);

	let xpStr = await klasaUser.addXP({ skillName: SkillsEnum.Herblore, amount: herbXP, multiplier: false, duration });
	xpStr += await klasaUser.addXP({
		skillName: SkillsEnum.Firemaking,
		amount: firemakingXP,
		multiplier: false,
		duration
	});

	handleTripFinish(
		client,
		klasaUser,
		channelID,
		`${userMention(userID)}, ${minionName(mahojiUser)} finished running ${quantity}x ${tier.name} baths for ${
			speciesServed.name
		} at the Baxtorian Bathhouses.
You received: ${loot}.
Herbs That You Used: ${herbs.map(i => i.name).join(', ')}
Ore You Used: ${ore.item.name}
${xpStr}`,
		['bsominigames', { baxtorian_bathhouses: { start: { todo: 1 } } }, true],
		undefined,
		data,
		loot
	);
}
