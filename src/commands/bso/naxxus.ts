import { MessageEmbed } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, increaseNumByPercent, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { checkUserCanUseDegradeableItem, degradeableItems, degradeItem } from '../../lib/degradeableItems';
import { GearStats } from '../../lib/gear';
import { Naxxus } from '../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { NaxxusActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import brewRestoreSupplyCalc from '../../lib/util/brewRestoreSupplyCalc';
import getOSItem from '../../lib/util/getOSItem';

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

const itemBoosts: {
	item: Item;
	boost: number;
	setup: 'mage' | 'melee';
}[] = [
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
];

const NAXXUS_HP = 3900;

function calcSetupPercent(
	maxStats: GearStats,
	userStats: GearStats,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[]
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

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,100}]',
			usageDelim: ' ',
			aliases: ['naxx'],
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity]: [number | null]) {
		const user = msg.author;
		if (typeof quantity === 'string' || quantity === undefined) {
			quantity = null;
		}
		const [hasReqs, rejectReason] = user.hasMonsterRequirements(Naxxus);
		if (!hasReqs) {
			return msg.channel.send(`${user.username} doesn't meet the requirements to fight Naxxus: ${rejectReason}`);
		}

		const boosts = [];
		let effectiveTime = Naxxus.timeToFinish;
		if (isWeekend()) {
			effectiveTime = reduceNumByPercent(effectiveTime, 5);
			boosts.push('5% Weekend boost');
		}

		if ((user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0) < 100) {
			effectiveTime = increaseNumByPercent(effectiveTime, 15);
			boosts.push('-15% <100 KC');
		}

		if ((user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0) > 500) {
			effectiveTime = reduceNumByPercent(effectiveTime, 15);
			boosts.push('15% >500 KC');
		}

		const mage = calcSetupPercent(bisMageGear.stats, user.getGear('mage').stats, 'attack_magic', [
			'attack_stab',
			'attack_slash',
			'attack_crush',
			'attack_ranged',
			'defence_crush',
			'defence_ranged',
			'defence_slash',
			'defence_stab'
		]);

		const melee = calcSetupPercent(bisMeleeGear.stats, user.getGear('melee').stats, 'attack_stab', [
			'attack_slash',
			'attack_crush',
			'attack_ranged',
			'attack_magic',
			'defence_magic'
		]);

		const totalGearPercent = (melee + mage) / 2;
		const speedReductionMaxPercent = 15;
		effectiveTime = reduceNumByPercent(
			effectiveTime,
			calcPercentOfNum(Math.ceil(totalGearPercent), speedReductionMaxPercent)
		);
		boosts.push(
			`${calcPercentOfNum(Math.ceil(totalGearPercent), speedReductionMaxPercent)}% gear stats [${Math.ceil(
				melee
			)}% of max melee gear, ${Math.ceil(mage)}% of max mage gear]`
		);

		itemBoosts.forEach(itemBoost => {
			if (user.getGear(itemBoost.setup).hasEquipped(itemBoost.item.id)) {
				effectiveTime = reduceNumByPercent(effectiveTime, itemBoost.boost);
				boosts.push(`${itemBoost.boost}% ${itemBoost.item.name}`);
			}
		});

		const maxTripLength = msg.author.maxTripLength('Naxxus');
		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / effectiveTime);
		}
		if (quantity * effectiveTime > maxTripLength) {
			return msg.channel.send(
				`The max amount of times you can fight Naxxus is ${Math.floor(maxTripLength / effectiveTime)}!`
			);
		}

		const kc = user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0;
		let brewsNeeded = 20;
		if (kc > 500) brewsNeeded *= 0.2;
		else if (kc > 400) brewsNeeded *= 0.4;
		else if (kc > 300) brewsNeeded *= 0.6;
		else if (kc > 200) brewsNeeded *= 0.8;

		brewsNeeded *= quantity;
		let { hasEnough, foodBank, foodReason } = brewRestoreSupplyCalc(user, brewsNeeded);

		if (!hasEnough) {
			return msg.channel.send(
				`${user.username} doesn't have the necessary potions to fight Naxxus: ${foodReason}`
			);
		}

		if (!user.bank().has(new Bank().add('Enhanced Divine Water', 2 * quantity))) {
			return msg.channel.send(
				`${user.username} doesn't have the necessary potions to fight Naxxus: For this fight you will need 2 Enhanced Divine Water`
			);
		}
		foodBank.add('Enhanced Divine Water', 2 * quantity);

		const duration = effectiveTime * quantity;
		// Some degrading items use charges based on DURATION
		// It is important this is after duration modifiers so that the item isn't over-charged
		for (const degItem of degradeableItems) {
			if (
				user.getGear(degItem.setup).hasEquipped(degItem.item.name) &&
				['melee', 'mage'].includes(degItem.setup)
			) {
				const chargesNeeded = degItem.charges(NAXXUS_HP * quantity, duration, msg.author);
				const res = checkUserCanUseDegradeableItem({
					item: degItem.item,
					chargesToDegrade: chargesNeeded,
					user: msg.author
				});
				if (!res.hasEnough) {
					return msg.channel.send(res.userMessage!);
				}
				await degradeItem({
					item: degItem.item,
					chargesToDegrade: chargesNeeded,
					user
				});
			}
		}

		await user.removeItemsFromBank(foodBank);

		await trackLoot({
			changeType: 'cost',
			cost: foodBank,
			id: Naxxus.name,
			type: 'Monster'
		});

		await addSubTaskToActivityTask<NaxxusActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Naxxus'
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.NaxxusCost, foodBank);

		const embed = new MessageEmbed()
			.setDescription(
				`Your minion is now attempting to defeat Naxxus ${quantity}x times. The trip will take ${formatDuration(
					duration
				)}.
				**Supplies**: ${foodBank.toString()}.
				${boosts.length > 0 ? `**Boosts:** ${boosts.join(', ')}` : ''}`
			)
			.setImage(
				'https://cdn.discordapp.com/attachments/920771763976167455/935659463434698783/179ad8548cf42d494bfb473171a1124b.jpg'
			);

		return msg.channel.send({
			embeds: [embed]
		});
	}
}
