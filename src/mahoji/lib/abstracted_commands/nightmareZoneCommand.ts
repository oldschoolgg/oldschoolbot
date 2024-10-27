import type { ChatInputCommandInteraction } from 'discord.js';
import { Time, calcWhatPercent, reduceNumByPercent, round, sumArr } from 'e';
import { Bank } from 'oldschooljs';

import type { NMZStrategy } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { MAX_QP } from '../../../lib/minions/data/quests';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { getMinigameEntity } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { Skills } from '../../../lib/types';
import { formatDuration, hasSkillReqs, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import type { NightmareZoneActivityTaskOptions } from './../../../lib/types/minions';

const itemBoosts = [
	// Special weapons
	[
		{
			item: getOSItem('Dragon claws'),
			boost: 20
		},
		{
			item: getOSItem('Granite maul'),
			boost: 15
		},
		{
			item: getOSItem('Dragon dagger(p++)'),
			boost: 10
		}
	],
	// Amulets
	[
		{
			item: getOSItem('Amulet of torture'),
			boost: 5
		},
		{
			item: getOSItem('Amulet of fury'),
			boost: 3
		},
		{
			item: getOSItem('Berserker necklace'),
			boost: 1
		}
	],
	// Capes
	[
		{
			item: getOSItem('Infernal cape'),
			boost: 5
		},
		{
			item: getOSItem('Fire cape'),
			boost: 3
		}
	],
	// Gloves
	[
		{
			item: getOSItem('Ferocious gloves'),
			boost: 5
		},
		{
			item: getOSItem('Barrows gloves'),
			boost: 3
		}
	],
	// Boots
	[
		{
			item: getOSItem('Primordial boots'),
			boost: 5
		},
		{
			item: getOSItem('Dragon boots'),
			boost: 3
		},
		{
			item: getOSItem('Guardian boots'),
			boost: 3
		}
	],
	// Rings
	[
		{
			item: getOSItem('Berserker ring (i)'),
			boost: 5
		},
		{
			item: getOSItem('Brimstone ring'),
			boost: 3
		},
		{
			item: getOSItem('Berserker ring'),
			boost: 1
		}
	]
];

export const nightmareZoneImbueables = [
	{ input: getOSItem('Black mask'), output: getOSItem('Black mask (i)'), points: 1_250_000 },
	{ input: getOSItem('Slayer helmet'), output: getOSItem('Slayer helmet (i)'), points: 1_250_000 },
	{
		input: getOSItem('Turquoise slayer helmet'),
		output: getOSItem('Turquoise slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Red slayer helmet'),
		output: getOSItem('Red slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Green slayer helmet'),
		output: getOSItem('Green slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Twisted slayer helmet'),
		output: getOSItem('Twisted slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Black slayer helmet'),
		output: getOSItem('Black slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Purple slayer helmet'),
		output: getOSItem('Purple slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Hydra slayer helmet'),
		output: getOSItem('Hydra slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Tztok slayer helmet'),
		output: getOSItem('Tztok slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Vampyric slayer helmet'),
		output: getOSItem('Vampyric slayer helmet (i)'),
		points: 1_250_000
	},
	{
		input: getOSItem('Tzkal slayer helmet'),
		output: getOSItem('Tzkal slayer helmet (i)'),
		points: 1_250_000
	},
	{ input: getOSItem('Salve amulet'), output: getOSItem('Salve amulet(i)'), points: 800_000 },
	{ input: getOSItem('Salve amulet (e)'), output: getOSItem('Salve amulet(ei)'), points: 800_000 },
	{
		input: getOSItem('Ring of the gods'),
		output: getOSItem('Ring of the gods (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Ring of suffering'),
		output: getOSItem('Ring of suffering (i)'),
		points: 725_000
	},
	{
		input: getOSItem('Ring of suffering (r)'),
		output: getOSItem('Ring of suffering (ri)'),
		points: 725_000
	},
	{
		input: getOSItem('Berserker ring'),
		output: getOSItem('Berserker ring (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Warrior ring'),
		output: getOSItem('Warrior ring (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Archers ring'),
		output: getOSItem('Archers ring (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Seers ring'),
		output: getOSItem('Seers ring (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Tyrannical ring'),
		output: getOSItem('Tyrannical ring (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Treasonous ring'),
		output: getOSItem('Treasonous ring (i)'),
		points: 650_000
	},
	{
		input: getOSItem('Granite ring'),
		output: getOSItem('Granite ring (i)'),
		points: 500_000
	}
];

export const nightmareZoneBuyables: { name: string; output: Bank; cost: number; aliases: string[] }[] = [
	{
		name: 'Flax',
		output: new Bank().add('Flax', 1),
		cost: 75,
		aliases: ['flax']
	},
	{
		name: 'Bucket of sand',
		output: new Bank().add('Bucket of sand', 1),
		cost: 200,
		aliases: ['sand']
	},
	{
		name: 'Seaweed',
		output: new Bank().add('Seaweed', 1),
		cost: 200,
		aliases: []
	},
	{
		name: 'Dragon scale dust',
		output: new Bank().add('Dragon scale dust', 1),
		cost: 750,
		aliases: ['dragon dust']
	},
	{
		name: 'Compost potion(4)',
		output: new Bank().add('Compost potion(4)', 1),
		cost: 5000,
		aliases: ['compost potion']
	},
	{
		name: 'Air rune',
		output: new Bank().add('Air rune', 1),
		cost: 25,
		aliases: []
	},
	{
		name: 'Water rune',
		output: new Bank().add('Water rune', 1),
		cost: 25,
		aliases: []
	},
	{
		name: 'Earth rune',
		output: new Bank().add('Earth rune', 1),
		cost: 25,
		aliases: []
	},
	{
		name: 'Fire rune',
		output: new Bank().add('Fire rune', 1),
		cost: 25,
		aliases: []
	},
	{
		name: 'Pure essence',
		output: new Bank().add('Pure essence', 1),
		cost: 70,
		aliases: []
	},
	/* TODO: Lock this to max 15 Herb boxes per day
	{
		name: 'Herb box',
		output: new Bank().add('Herb box', 1),
		cost: 9500,
		aliases: []
	},
	*/
	{
		name: 'Vial of water',
		output: new Bank().add('Vial of water', 1),
		cost: 145,
		aliases: []
	}
];

export async function nightmareZoneStatsCommand(user: MUser) {
	const scores = await getMinigameEntity(user.id);
	return `**Nightmare Zone Stats:**

**Nightmare Zone monsters killed:** ${scores.nmz}.
**Nightmare Zone points:** ${user.user.nmz_points} Points.`;
}

export async function nightmareZoneStartCommand(user: MUser, strategy: NMZStrategy, channelID: string) {
	const skillReqs: Skills = {
		defence: 70,
		strength: 70,
		attack: 70,
		hitpoints: 70,
		prayer: 43
	};

	const [hasReqs] = hasSkillReqs(user, skillReqs);
	if (!hasReqs) {
		return `You don't meet skill requirements, you need ${Object.entries(skillReqs)
			.map(([name, lvl]) => `${lvl} ${name}`)
			.join(', ')}.`;
	}

	const { QP } = user;

	if (QP < 100) {
		return `The Nightmare Zone minigame requires **100 QP**, and you have ${QP} QP.`;
	}

	// Check if user have full dharok's
	if (
		!user.hasEquippedOrInBank(
			["Dharok's helm", "Dharok's platebody", "Dharok's platelegs", "Dharok's greataxe"],
			'every'
		)
	) {
		return "The Nightmare Zone minigame requires full Dharok's equipment for optimal experience/points gained.";
	}

	const boosts = [];

	let timePerMonster = Time.Minute * 2;
	// combat stat boosts
	const attackStyles = resolveAttackStyles({
		attackStyles: user.getAttackStyles()
	});
	const skillTotal = sumArr(attackStyles.map(s => user.skillLevel(s))) + user.skillLevel(SkillsEnum.Hitpoints);
	if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
		return 'The Nightmare Zone minigame requires melee combat for efficiency, swap training style using `/minion train style:`';
	}

	let percent = round(calcWhatPercent(skillTotal, (attackStyles.length + 1) * 99), 2);
	percent = Math.min(65, (percent - 70) / 0.46);
	boosts.push(`${percent.toFixed(2)}% for your trained stats (incudling HP)`);
	timePerMonster = reduceNumByPercent(timePerMonster, percent);

	// Reduce time for item boosts
	for (const set of itemBoosts) {
		for (const item of set) {
			if (user.hasEquippedOrInBank(item.item.id)) {
				timePerMonster *= (100 - item.boost) / 100;
				boosts.push(`${item.boost}% faster for ${item.item.name}`);
				break;
			}
		}
	}

	const maxTripLength = calcMaxTripLength(user, 'NightmareZone');
	const quantity = Math.floor(maxTripLength / timePerMonster);
	const duration = quantity * timePerMonster;
	// Consume GP (and prayer potion if experience setup)
	// Dream GP cost
	const dreamGP = QP >= MAX_QP ? 16_000 : 26_000;
	// Dream length
	const dreamLength = (strategy === 'points' ? 30 : 60) * Time.Minute;
	const dreamCost = new Bank().add('Coins', Math.max(Math.floor((dreamGP * duration) / dreamLength), 1));
	if (strategy === 'experience') {
		dreamCost.add('Prayer potion(4)', Math.max(Math.floor(duration / (Time.Minute * 5)), 1));
	}
	const totalCost = new Bank(dreamCost).clone();

	if (!user.owns(totalCost)) {
		return `You don't have the required gold coins for this trip. You need ${totalCost}.`;
	}

	await user.removeItemsFromBank(totalCost);
	updateBankSetting('nmz_cost', totalCost);
	await trackLoot({
		id: 'nmz',
		type: 'Minigame',
		totalCost,
		changeType: 'cost',
		users: [
			{
				id: user.id,
				cost: totalCost
			}
		]
	});

	await addSubTaskToActivityTask<NightmareZoneActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'NightmareZone',
		channelID: channelID.toString(),
		minigameID: 'nmz',
		strategy
	});

	return `${
		user.minionName
	} is now killing ${quantity}x monsters in the Nightmare Zone! It will take ${formatDuration(
		duration
	)} to finish. **Boosts:** ${boosts.join(', ')}\nYour minion used up ${totalCost}`;
}

export async function nightmareZoneShopCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	item: string | undefined,
	quantity = 1
) {
	const currentUserPoints = user.user.nmz_points;
	if (!item) {
		return `You currently have ${currentUserPoints.toLocaleString()} Nightmare Zone points.`;
	}

	if (user.user.minion_ironman) {
		return `${user.usernameOrMention} is an ironman, so they can't buy anything from this shop!`;
	}

	const shopItem = nightmareZoneBuyables.find(
		i => stringMatches(item, i.name) || i.aliases.some(alias => stringMatches(alias, item))
	);
	if (!shopItem) {
		return `This is not a valid item to buy. These are the items that can be bought using Nightmare Zone point: ${nightmareZoneBuyables
			.map(v => v.name)
			.join(', ')}`;
	}

	const costPerItem = shopItem.cost;
	const cost = quantity * costPerItem;
	if (cost > currentUserPoints) {
		return `You don't have enough Nightmare Zone points to buy ${quantity.toLocaleString()}x ${
			shopItem.name
		} (${costPerItem} Nightmare Zone points each).\nYou have ${currentUserPoints} Nightmare Zone points.\n${
			currentUserPoints < costPerItem
				? "You don't have enough Nightmare Zone points for any of this item."
				: `You only have enough for ${Math.floor(currentUserPoints / costPerItem).toLocaleString()}`
		}`;
	}

	const loot = new Bank(shopItem.output).multiply(quantity);
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spend **${cost.toLocaleString()}** Nightmare Zone points to buy **${loot}**?`
	);

	await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: loot
	});

	await user.update({
		nmz_points: {
			decrement: cost
		}
	});

	return `You successfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(costPerItem * quantity).toLocaleString()} Nightmare Zone points.\nYou now have ${currentUserPoints - cost} Nightmare Zone points left.`;
}

export async function nightmareZoneImbueCommand(user: MUser, input = '') {
	const item = nightmareZoneImbueables.find(
		i => stringMatches(input, i.input.name) || stringMatches(input, i.output.name)
	);
	if (!item) {
		return `That's not a valid item you can imbue. These are the items you can imbue: ${nightmareZoneImbueables
			.map(i => i.input.name)
			.join(', ')}.`;
	}
	let imbueCost = item.points;
	if (user.hasCompletedCATier('hard')) {
		imbueCost /= 2;
	}
	const bal = user.user.nmz_points;
	if (bal < imbueCost) {
		return `You don't have enough Nightmare Zone points to imbue a ${item.input.name}. You have ${bal} but need ${imbueCost}.`;
	}
	const { bank } = user;
	if (!bank.has(item.input.id)) {
		return `You don't have a ${item.input.name}.`;
	}
	await user.update({
		nmz_points: {
			decrement: imbueCost
		}
	});
	const cost = new Bank().add(item.input.id);
	const loot = new Bank().add(item.output.id);
	await transactItems({
		userID: user.id,
		itemsToAdd: loot,
		itemsToRemove: cost,
		collectionLog: true
	});
	return `Added ${loot} to your bank, removed ${imbueCost}x Nightmare Zone points and ${cost}.${
		user.hasCompletedCATier('hard') ? ' 50% off for having completed the Hard Tier of the Combat Achievement.' : ''
	}`;
}
