import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { randArrItem, reduceNumByPercent, roll, Time, uniqueArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { table } from 'table';

import { MysteryBoxes } from './bsoOpenables';
import { Emoji, GLOBAL_BSO_XP_MULTIPLIER } from './constants';
import { incrementMinigameScore } from './settings/minigames';
import Grimy from './skilling/skills/herblore/mixables/grimy';
import { SkillsEnum } from './skilling/types';
import { getAllUserTames, TameSpeciesID } from './tames';
import { Skills } from './types';
import { BathhouseTaskOptions } from './types/minions';
import { formatDuration, formatSkillRequirements, skillsMeetRequirements, stringMatches } from './util';
import addSubTaskToActivityTask from './util/addSubTaskToActivityTask';
import { calcMaxTripLength } from './util/calcMaxTripLength';
import getOSItem from './util/getOSItem';
import { handleTripFinish } from './util/handleTripFinish';
import resolveItems, { resolveOSItems } from './util/resolveItems';
import { updateBankSetting } from './util/updateBankSetting';

export const bathhouseTierNames = ['Warm', 'Hot', 'Fiery'] as const;
export type BathhouseTierName = (typeof bathhouseTierNames)[number];

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
		logs: getOSItem('Oak logs'),
		tiers: ['Warm']
	},
	{
		item: getOSItem('Tin ore'),
		warmth: 1,
		logs: getOSItem('Oak logs'),
		tiers: ['Warm']
	},
	{
		item: getOSItem('Iron ore'),
		warmth: 2,
		logs: getOSItem('Willow logs'),
		tiers: ['Warm', 'Hot']
	},
	{
		item: getOSItem('Gold ore'),
		warmth: 2,
		logs: getOSItem('Maple logs'),
		tiers: ['Warm', 'Hot']
	},
	{
		item: getOSItem('Mithril ore'),
		warmth: 5,
		logs: getOSItem('Yew logs'),
		tiers: ['Warm', 'Hot']
	},
	{
		item: getOSItem('Adamantite ore'),
		warmth: 10,
		logs: getOSItem('Magic logs'),
		tiers: ['Warm', 'Hot', 'Fiery']
	},
	{
		item: getOSItem('Runite ore'),
		warmth: 25,
		logs: getOSItem('Elder logs'),
		tiers: ['Warm', 'Hot', 'Fiery']
	}
];

interface BathhouseTier {
	name: BathhouseTierName;
	hoursReq: number;
	skillRequirements: Skills;
	customRequirements?: (user: User) => Promise<[true] | [false, string]>;
	warmthPerBath: number;
	xpMultiplier: number;
	/**
	 * Uniques are less common in lower tiers
	 */
	uniqueMultiplier: number;
}
export const bathHouseTiers: BathhouseTier[] = [
	{
		name: 'Warm',
		hoursReq: 0,
		skillRequirements: {
			herblore: 50,
			firemaking: 50
		},
		warmthPerBath: 5 * 10,
		xpMultiplier: 1,
		uniqueMultiplier: 2.5
	},
	{
		name: 'Hot',
		hoursReq: 3,
		skillRequirements: {
			herblore: 80,
			firemaking: 80
		},
		warmthPerBath: 10 * 25,
		xpMultiplier: 1.35,
		uniqueMultiplier: 1.75
	},
	{
		name: 'Fiery',
		hoursReq: 10,
		skillRequirements: {
			herblore: 95,
			firemaking: 95
		},
		warmthPerBath: 15 * 50,
		xpMultiplier: 1.8,
		uniqueMultiplier: 1
	}
];

export const BathwaterMixtures = [
	{ items: resolveOSItems(['Guam leaf', 'Avantoe']), name: 'Vitalizing' },
	{ items: resolveOSItems(['Marrentill', 'Kwuarm']), name: 'Soothing' },
	{ items: resolveOSItems(['Tarromin', 'Snapdragon']), name: 'Caustic' },
	{ items: resolveOSItems(['Harralander', 'Cadantine']), name: 'Magical' },
	{ items: resolveOSItems(['Ranarr weed', 'Lantadyme']), name: 'Unholy' },
	{ items: resolveOSItems(['Toadflax', 'Dwarf weed']), name: 'Invigorating' },
	{ items: resolveOSItems(['Irit leaf', 'Torstol']), name: 'Healing' }
] as const;
type BathwaterMixtureName = (typeof BathwaterMixtures)[number]['name'];

interface BathhouseSpecies {
	name: string;
	tier: BathhouseTierName;
	preferredMixture: BathwaterMixtureName;
	tipTable: LootTable;
}

const species: BathhouseSpecies[] = [
	{
		name: 'Fairies',
		tier: 'Warm',
		preferredMixture: 'Magical',
		tipTable: new LootTable()
	},
	{
		name: 'Monkeys',
		tier: 'Warm',
		preferredMixture: 'Vitalizing',
		tipTable: new LootTable().add('Banana', [6, 12])
	},
	{
		name: 'Goblins',
		tier: 'Warm',
		preferredMixture: 'Caustic',
		tipTable: new LootTable().add('Coins', [5, 9]).add('Clue scroll (beginner)').add('Goblin mail')
	},
	{
		name: 'Imps',
		tier: 'Warm',
		preferredMixture: 'Unholy',
		tipTable: new LootTable().add('Black bead').add('Red bead').add('White bead').add('Yellow bead')
	},

	{
		name: 'Giants',
		tier: 'Hot',
		preferredMixture: 'Invigorating',
		tipTable: new LootTable().add('Limpwurt root', [2, 6]).add('Iron dagger')
	},
	{
		name: 'Fiends',
		tier: 'Hot',
		preferredMixture: 'Soothing',
		tipTable: new LootTable().add('Fire rune', [10, 20]).add('Water rune', [10, 20])
	},
	{
		name: 'Trolls',
		tier: 'Hot',
		preferredMixture: 'Soothing',
		tipTable: new LootTable().add('Mithril sq shield').add('Avantoe seed')
	},
	{
		name: 'Ogres',
		tier: 'Hot',
		preferredMixture: 'Healing',
		tipTable: new LootTable().add('Limpwurt seed')
	},
	{
		name: 'Gargoyles',
		tier: 'Hot',
		preferredMixture: 'Caustic',
		tipTable: new LootTable()
			.tertiary(64, 'Granite maul')
			.add('Rune platelegs', [1, 2])
			.add('Adamant boots', [1, 2])
	},
	{
		name: 'TzHaar',
		tier: 'Fiery',
		preferredMixture: 'Healing',
		tipTable: new LootTable().add('Obsidian cape').add('Toktz-ket-xil').add('Tzhaar-ket-om')
	},
	{
		name: 'Wyverns',
		tier: 'Fiery',
		preferredMixture: 'Vitalizing',
		tipTable: new LootTable()
			.tertiary(512, 'Draconic visage')
			.add('Dragon platelegs')
			.add('Battlestaff')
			.add('Yew seed')
	},
	{
		name: 'Abyssals',
		tier: 'Fiery',
		preferredMixture: 'Magical',
		tipTable: new LootTable()
			.tertiary(512, 'Abyssal dagger')
			.tertiary(16, 'Abyssal whip')
			.add('Rune med helm')
			.add('Rune chainbody')
	},
	{
		name: 'Dragons',
		tier: 'Fiery',
		preferredMixture: 'Invigorating',
		tipTable: new LootTable()
			.tertiary(256, 'Draconic visage')
			.tertiary(32, 'Dragon pickaxe')
			.add('Rune longsword')
			.add('Dragon med helm')
			.add('Runite bar')
	},
	{
		name: 'Demons',
		tier: 'Fiery',
		preferredMixture: 'Unholy',
		tipTable: new LootTable()
			.tertiary(64, 'Staff of the dead')
			.add('Rune chainbody')
			.add('Dragon dagger(p++)')
			.add('Runite bar')
	}
];

export const baxBathHelpStr = `**Baxtorian Bathhouses**

- In this minigame, you play the role of a Boiler and Herbalist. Your job is to heat the water, and infuse it with herbs to give the water special properties.
- You heat the water using ore, logs and coal. You need better ore/logs for higher tiers (e.g. Runite ore for Fiery temperature)
- Herbs are used to make a water mixture (e.g. Vitalizing), you can use whichever you want. Using one that the species' prefers will earn you extra tips.
- You infuse the water with mixtures of herb pairs (e.g. Ranarr and Tarromin), your choice of which to use.
- There are 3 tiers (Warm, Hot, Fiery), they are in increasing difficulty and requirements, but higher tiers give better xp, unique chances and tips.
- You get Herblore and Firemaking experience for your work, as well as occasional tips from the customers.

Species you can serve, and what mixtures they prefer: ${species
	.map(i => `${i.name} (Prefers ${i.preferredMixture})`)
	.join(', ')}
`;

function calcHerbsNeeded(qty: number) {
	return Math.ceil(qty * 5.5);
}

export async function baxtorianBathhousesStartCommand({
	user,
	tier,
	ore,
	mixture,
	channelID
}: {
	user: MUser;
	tier: string;
	channelID: string;
	ore?: string | number;
	mixture?: string;
}) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const userBank = user.bank;
	const maxTripLength = calcMaxTripLength(user);
	const durationPerPath = Time.Minute * 10;
	const quantity = Math.floor(maxTripLength / durationPerPath);
	const duration = quantity * durationPerPath;
	const bathHouseTier = bathHouseTiers.find(i => stringMatches(i.name, tier)) ?? bathHouseTiers[0];
	const warmthNeeded = bathHouseTier.warmthPerBath * quantity;
	const herbsNeeded = calcHerbsNeeded(quantity);

	let oreToUse = ore
		? typeof ore === 'number'
			? BathhouseOres.find(o => stringMatches(o.item.id, ore))
			: BathhouseOres.find(o => stringMatches(o.item.name, ore))
		: null;
	if (!oreToUse) {
		oreToUse = BathhouseOres.find(o => userBank.amount(o.item.id) >= warmthNeeded / o.warmth) ?? BathhouseOres[0];
	}

	let mixtureToUse = mixture ? BathwaterMixtures.find(m => stringMatches(m.name, mixture)) : null;
	if (!mixtureToUse) {
		mixtureToUse =
			BathwaterMixtures.find(o => {
				const checkBank = new Bank();
				for (const h of o.items) checkBank.add(h.id, herbsNeeded);
				return userBank.has(checkBank);
			}) ?? BathwaterMixtures[0];
	}

	if (!oreToUse.tiers.includes(bathHouseTier.name)) {
		return `Your heating isn't good enough to run a ${
			bathHouseTier.name
		} bath, you need to use one of these: ${BathhouseOres.filter(i => i.tiers.includes(bathHouseTier.name))
			.map(i => i.item.name)
			.join(', ')}`;
	}
	const hasReq = skillsMeetRequirements(user.skillsAsXP, bathHouseTier.skillRequirements);
	if (!hasReq) {
		return `You don't have the required skills to run ${
			bathHouseTier.name
		} baths, you need: ${formatSkillRequirements(bathHouseTier.skillRequirements)}.`;
	}

	const boosts: string[] = [];

	const tames = await getAllUserTames(user.id);
	const tameToUse = tames.find(i => i.tame_activity.length === 0 && i.species_id === TameSpeciesID.Igne);

	let oreNeeded = Math.floor(warmthNeeded / oreToUse.warmth);
	let logsNeeded = Math.floor(warmthNeeded / oreToUse.warmth);
	let coalNeeded = quantity * 22;
	if (tameToUse) {
		boosts.push(`20% Less heating needed as you brought ${tameToUse.nickname ?? 'your Igne tame'} to help you`);
		oreNeeded = Math.floor(reduceNumByPercent(oreNeeded, 20));
		coalNeeded = Math.floor(reduceNumByPercent(coalNeeded, 20));
		logsNeeded = Math.floor(reduceNumByPercent(logsNeeded, 20));
	}
	if (user.hasEquippedOrInBank(['Firemaking master cape'])) {
		boosts.push('5% Less heating for Firemaking mastery');
		oreNeeded = Math.floor(reduceNumByPercent(oreNeeded, 5));
		coalNeeded = Math.floor(reduceNumByPercent(coalNeeded, 5));
		logsNeeded = Math.floor(reduceNumByPercent(logsNeeded, 5));
	}
	const heatingCost = new Bank()
		.add(oreToUse.item.id, oreNeeded)
		.add('Coal', coalNeeded)
		.add(oreToUse.logs.id, logsNeeded);

	const herbCost = new Bank();
	for (const h of mixtureToUse.items) herbCost.add(h.id, herbsNeeded);

	const cost = new Bank().add(heatingCost).add(herbCost);

	if (!user.owns(cost)) {
		return `You don't have enough supplies to do a trip, for ${quantity}x ${bathHouseTier.name} baths, you need: ${cost}.`;
	}
	updateBankSetting('bb_cost', cost);
	await user.removeItemsFromBank(cost);

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
	)}.
${Emoji.Firemaking} **Water Heating cost:** ${heatingCost}
${Emoji.Herblore} **Water Mixture cost:** ${herbCost}
**Boosts:** ${boosts.length > 0 ? boosts.join(', ') : 'None.'}`;
}

function calculateResult(data: BathhouseTaskOptions) {
	const { quantity } = data;
	const ore = BathhouseOres.find(i => i.item.id === data.ore)!;
	const tier = bathHouseTiers.find(t => t.name === data.tier)!;
	const mixture = BathwaterMixtures.find(i => i.name === data.mixture)!;
	const [firstHerb, secondHerb] = mixture.items.map(herb => Grimy.find(i => i.item.id === herb.id)!);
	const speciesCanServe = species.filter(i => i.tier === tier.name);

	const herbXP = quantity * (firstHerb.xp + secondHerb.xp) * 220 * tier.xpMultiplier;
	const firemakingXP = herbXP * 15.5 * tier.xpMultiplier + ore.warmth * 5000;

	const speciesServed: BathhouseSpecies[] = [];
	for (let i = 0; i < quantity; i++) speciesServed.push(randArrItem(speciesCanServe));

	let gaveExtraTips: BathhouseSpecies | null = null;

	const loot = new Bank();
	for (const specie of speciesServed) {
		const isPreferred = data.mixture === specie.preferredMixture;
		loot.add(specie.tipTable.roll(isPreferred ? 3 : 1));
		if (isPreferred) {
			loot.add(MysteryBoxes.roll());
			gaveExtraTips = specie;
		}
	}

	return {
		loot,
		herbXP,
		firemakingXP,
		ore,
		tier,
		herbs: [firstHerb, secondHerb].map(i => i.item.id).map(getOSItem),
		speciesServed,
		mixture,
		gaveExtraTips
	};
}

export function baxBathSim() {
	let results = [];
	for (const tier of bathHouseTiers) {
		for (const ore of BathhouseOres) {
			for (const mixture of BathwaterMixtures) {
				results.push({
					...calculateResult({
						mixture: mixture.name,
						ore: ore.item.id,
						tier: tier.name,
						minigameID: 'bax_baths',
						quantity: 4
					} as BathhouseTaskOptions),
					tier,
					ore,
					mixture
				});
			}
		}
	}

	results.sort((a, b) => b.firemakingXP * GLOBAL_BSO_XP_MULTIPLIER - a.firemakingXP * GLOBAL_BSO_XP_MULTIPLIER);
	let tableArr = [];
	tableArr.push(['Combo', 'FM XP', 'Herb XP']);
	for (const { tier, ore, mixture, firemakingXP, herbXP } of results) {
		tableArr.push([
			`${tier.name} ${ore.item.name} ${mixture.name}`,
			(firemakingXP * GLOBAL_BSO_XP_MULTIPLIER).toLocaleString(),
			(herbXP * GLOBAL_BSO_XP_MULTIPLIER).toLocaleString()
		]);
	}
	return table(tableArr);
}

export async function baxtorianBathhousesActivity(data: BathhouseTaskOptions) {
	const { userID, channelID, quantity, duration } = data;
	const user = await mUserFetch(userID);
	const { cl } = user;
	const { loot, herbXP, firemakingXP, tier, speciesServed, gaveExtraTips } = calculateResult(data);
	await incrementMinigameScore(userID, 'bax_baths', quantity);

	const uniques = resolveItems(['Inferno adze', 'Flame gloves', 'Ring of fire']);
	let uniqueChance = Math.floor(50 * tier.uniqueMultiplier);
	const uniquesNotReceived = uniques.filter(i => !cl.has(i));
	if (uniquesNotReceived.length === 0) uniqueChance *= 1.5;
	const uniquesCanReceive = uniquesNotReceived.length === 0 ? uniques : uniquesNotReceived;
	let gotPurple = false;
	const petChance = Math.floor(1000 * tier.uniqueMultiplier);
	for (let i = 0; i < quantity; i++) {
		if (roll(uniqueChance)) {
			gotPurple = true;
			loot.add(randArrItem(uniquesCanReceive));
		}
		if (roll(petChance)) {
			gotPurple = true;
			loot.add('Phoenix eggling');
		}
	}

	await user.addItemsToBank({ items: loot, collectionLog: true });
	let xpStr = await user.addXP({ skillName: SkillsEnum.Herblore, amount: herbXP, duration });
	xpStr += '\n';
	xpStr += await user.addXP({
		skillName: SkillsEnum.Firemaking,
		amount: firemakingXP,
		duration
	});

	let uniqSpecies = uniqueArr(speciesServed);
	updateBankSetting('bb_loot', loot);

	const str = gotPurple ? `${Emoji.Purple} ||${loot}||` : loot.toString();

	handleTripFinish(
		user,
		channelID,
		`${userMention(userID)}, ${user.minionName} finished running ${quantity}x ${tier.name} baths for ${
			uniqSpecies.length
		} species (${uniqSpecies.map(i => i.name).join(', ')}) at the Baxtorian Bathhouses.
**Tips received:** ${str}.${
			gaveExtraTips
				? `\nYou got extra tips from ${gaveExtraTips.name} for using their preferred water mixture.`
				: ''
		}
${xpStr}`,
		undefined,
		data,
		loot
	);
}
