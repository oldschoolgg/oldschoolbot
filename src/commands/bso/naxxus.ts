import { calcPercentOfNum, calcWhatPercent, increaseNumByPercent, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Naxxus } from '../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
// import { NaxxusActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, updateBankSetting } from '../../lib/util';
// import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { Gear } from '../../lib/structures/Gear';
import { GearStats } from '../../lib/gear';
import { Item } from 'oldschooljs/dist/meta/types';
import getOSItem from '../../lib/util/getOSItem';
import { MessageEmbed } from 'discord.js';


const bisMageGear = new Gear({
	head: 'Gorajan occult helmet', // 20
	body: 'Gorajan occult top', // 45
	legs: 'Gorajan occult legs', // 40
	hands: 'Gorajan occult gloves', // 22
	feet: 'Gorajan occult boots', // 22
	cape: 'Vasa cloak', // 38
	ring: 'Spellbound ring(i)', // 25
	weapon: 'Void staff', // 250
	shield: 'Abyssal tome', // 45
	neck: 'Arcane blast necklace' // 25
});

const bisMeleeGear = new Gear({
	head: 'Gorajan warrior helmet',
	body: 'Gorajan warrior top',
	legs: 'Gorajan warrior legs',
	hands: 'Gorajan warrior gloves', 
	feet: 'Gorajan warrior boots',
	neck: "Brawler's hook necklace",
	cape: 'TzKal cape',
	weapon: 'Drygore rapier',
	shield: 'Offhand drygore rapier',
	ring: 'Ignis ring(i)'
});

interface ItemBoost {
	item: Item;
	boost: number;
	setup: 'mage' | 'melee'
}
const itemBoosts: ItemBoost[] = [
	{
		item: getOSItem('Void Staff'),
		boost: 10,
		setup: 'mage'
	},
	{
		item: getOSItem('Abyssal Tome'),
		boost: 7.5,
		setup: 'mage'
	},
	{
		item: getOSItem('Spellbound Ring(i)'),
		boost: 2.5,
		setup: 'mage'
	},
	{
		item: getOSItem('Spellbound Ring'),
		boost: 2,
		setup: 'mage'
	}
]

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}
	
	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const quantity = 1;

		const user = msg.author;

		const [hasReqs, rejectReason] = user.hasMonsterRequirements(Naxxus);
		if (!hasReqs) {
			return msg.channel.send(`${user.username} doesn't have the requirements for this monster: ${rejectReason}`);
		}

		const boosts = [];
		let effectiveTime = Naxxus.timeToFinish;
		if (isWeekend()) {
			effectiveTime = reduceNumByPercent(effectiveTime, 5);
			boosts.push('5% Weekend boost');
		}

		if ((user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0) < 100) {
			effectiveTime = increaseNumByPercent(effectiveTime, 15);
			boosts.push(`-15% <100 KC`);
		}

		if ((user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0) > 500) {
			effectiveTime = reduceNumByPercent(effectiveTime, 15);
			boosts.push(`15% >500 KC`);
		}
	
		const mage = calcSetupPercent(
			bisMageGear.stats,
			user.getGear('mage').stats,
			'attack_magic',
			['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'defence_crush', 'defence_ranged', 'defence_slash', 'defence_stab']
		);

		const melee = calcSetupPercent(
			bisMeleeGear.stats,
			user.getGear('melee').stats,
			'attack_stab',
			['attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic', 'defence_magic']
		);

		const totalGearPercent = (melee + mage) / 2;
		const speedReductionMaxPercent = 15;
		effectiveTime = reduceNumByPercent(effectiveTime, calcPercentOfNum(Math.ceil(totalGearPercent), speedReductionMaxPercent));
		boosts.push(`${calcPercentOfNum(Math.ceil(totalGearPercent), speedReductionMaxPercent)}% gear stats [${melee}% of max melee, ${mage}% of max mage]`);

		itemBoosts.forEach(itemBoost => {
			if ( user.getGear(itemBoost.setup).hasEquipped(itemBoost.item.id) ) {
				effectiveTime = reduceNumByPercent(effectiveTime, itemBoost.boost);
				boosts.push(`${itemBoost.boost}% ${itemBoost.item.name}`);
			}
		});

		const kc = user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0;
		let brewsNeeded = 20;
		if (kc > 500) brewsNeeded *= 0.2;
		else if (kc > 400) brewsNeeded *= 0.4;
		else if (kc > 300) brewsNeeded *= 0.6;
		else if (kc > 200) brewsNeeded *= 0.8;

		brewsNeeded = brewsNeeded * quantity;

		let [hasEnough, foodBank, foodReason] = brewRestoreSupplyCalc(user, brewsNeeded);
		foodBank = foodBank as Bank;

		if ( !hasEnough ) {
			return msg.channel.send(`${user.username} doesn't have the food requirements for this monster: ${foodReason}`);
		}
		
		if ( !user.bank().has(new Bank().add('Enhanced Divine Water', 2)) ) {
			return msg.channel.send(`${user.username} doesn't have the food requirements for this monster: Requires 2 Enhanced Divine Water`);
		}
		foodBank.add('Enhanced Divine Water', 2);

		await user.removeItemsFromBank(foodBank);

		await trackLoot({
			changeType: 'cost',
			cost: foodBank,
			id: Naxxus.name,
			type: 'Monster'
		});


		const duration = effectiveTime * quantity;
		// await addSubTaskToActivityTask<NaxxusActivityTaskOptions>({
		// 	userID: msg.author.id,
		// 	channelID: msg.channel.id,
		// 	quantity,
		// 	duration,
		// 	type: 'Naxxus',
		// });

		updateBankSetting(this.client, ClientSettings.EconomyStats.NaxxusCost, foodBank);

		const embed = new MessageEmbed().setDescription(
			`Your minion is now attempting to kill ${quantity}x Naxxus. ${foodBank.toString()}. The trip will take ${formatDuration(
				duration
			)}. ${boosts.length > 0 ? "**Boosts:** " + boosts.join(', ') : ''}`
		).setImage(
			'https://cdn.discordapp.com/attachments/920771763976167455/935659463434698783/179ad8548cf42d494bfb473171a1124b.jpg'
		);
		
		return msg.channel.send({
			embeds: [embed]
		});
	}
}

function calcSetupPercent(
	maxStats: GearStats,
	userStats: GearStats,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[],
) {
	let numKeys = 0;
	let totalPercent = 0;
	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0 || ignoreStats.includes(key)) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent;
		numKeys++;
	}
	totalPercent /= numKeys;
	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}
	return totalPercent;
}

function brewRestoreSupplyCalc(user: KlasaUser, brewsNeeded: number) {
	const userItems = user.bank().items();
	const itemBank = new Bank();
	
	let totalBrews = 0;
	const enhancedBrews = userItems.filter(([item]) => item.name.toLowerCase() === 'enhanced saradomin brew')[0] ?? ['', 0];
	const brews = userItems.filter(([item]) => item.name.toLowerCase() === 'saradomin brew(4)')[0] ?? ['', 0];
	
	totalBrews += enhancedBrews[1] * 2;
	if ( totalBrews >= brewsNeeded ) itemBank.add('Enhanced Saradomin Brew', Math.ceil(brewsNeeded/2));
	else {
		itemBank.add('Enhanced Saradomin Brew', enhancedBrews[1]);
		totalBrews += brews[1];
		if ( totalBrews >= brewsNeeded ) {
			itemBank.add('Saradomin Brew (4)', totalBrews - enhancedBrews[1] * 2);
		} else {
			return [false, itemBank, `Not enough saradomin brews. ${enhancedBrews[1]} enhanced & ${brews[1]} normal found, ${brewsNeeded} required (enhanced count for 2).`]
		}
	};

	const restoresNeeded = Math.floor(brewsNeeded / 3);
	let totalRestores = 0;
	const enhancedRestores = userItems.filter(([item]) => item.name.toLowerCase() === 'enhanced super restore')[0] ?? ['', 0];
	const restores = userItems.filter(([item]) => item.name.toLowerCase() === 'super restore(4)')[0] ?? ['', 0];
	
	totalRestores += enhancedRestores[1] * 2;
	if ( totalRestores >= restoresNeeded ) itemBank.add('Enhanced Super Restore', Math.ceil(restoresNeeded/2));
	else {
		itemBank.add('Enhanced Super Restore', enhancedRestores[1]);
		totalRestores += restores[1];
		if ( totalRestores >= restoresNeeded ) {
			itemBank.add('Super Restore (4)', totalRestores - enhancedRestores[1] * 2);
		} else {
			return [false, itemBank, `Not enough super restores. ${enhancedRestores[1]} enhanced & ${restores[1]} normal found, ${restoresNeeded} required (enhanced count for 2).`]
		}
	};

	return [true, itemBank, ''];
}