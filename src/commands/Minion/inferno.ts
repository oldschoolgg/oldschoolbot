import { calcWhatPercent, reduceNumByPercent, sumArr, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Activity, ZUK_ID } from '../../lib/constants';
import fightCavesSupplies from '../../lib/minions/data/fightCavesSupplies';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { InfernoOptions } from '../../lib/types/minions';
import { formatDuration, percentChance, rand, removeBankFromBank, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';

const { TzTokJad } = Monsters;

const minimumRangeItems = [
	'Amulet of fury',
	"Ancient d'hide body",
	'Ancient chaps',
	'Dragon crossbow',
	'Barrows gloves',
	"Ava's assembler",
	'Snakeskin boots'
].map(getOSItem);

export const minimumRangeAttackStat = sumArr(minimumRangeItems.map(i => i.equipment!.attack_ranged));

const minimumMageItems = [
	'Amulet of fury',
	'Saradomin cape',
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	'Barrows gloves',
	'Splitbark boots',
	'Ancient staff'
].map(getOSItem);

export const minimumMageAttackStat = sumArr(minimumMageItems.map(i => i.equipment!.attack_magic));

const startMessages = [
	"You're on your own now JalYt, you face certain death... prepare to fight for your life.",
	'You will certainly die, JalYt, good luck.',
	'Many think they are strong enough to defeat TzKal-Zuk, many are wrong... good luck JalYt.'
];

function gearCheck(user: KlasaUser): true | string {
	const rangeGear = user.getGear('range');
	const mageGear = user.getGear('mage');

	if (!rangeGear.equippedWeapon() || !mageGear.equippedWeapon()) {
		return "You aren't wearing a weapon in your range/mage setup.";
	}

	if (rangeGear.stats.attack_ranged < minimumRangeAttackStat) {
		return `Your range setup needs a minimum of ${minimumRangeAttackStat} ranged attack. Try equipping some of these items: ${minimumRangeItems
			.map(i => i.name)
			.join(', ')}.`;
	}

	if (mageGear.stats.attack_magic < minimumMageAttackStat) {
		return `Your range setup needs a minimum of ${minimumMageAttackStat} mage attack. Try equipping some of these items: ${minimumMageItems
			.map(i => i.name)
			.join(', ')}.`;
	}

	return true;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ATTACH_FILES'],
			description:
				'Sends your minion to complete the fight caves - it will start off bad but get better with more attempts. Requires range gear, prayer pots, brews and restores.',
			examples: ['+inferno'],
			categoryFlags: ['minion', 'minigame']
		});
	}

	determineDuration(user: KlasaUser): [number, string] {
		let baseTime = Time.Hour * 2;
		const gear = user.getGear('range');
		let debugStr = '';

		// Reduce time based on KC
		const kc = user.getKC(ZUK_ID);
		const percentIncreaseFromKC = Math.min(50, kc);
		baseTime = reduceNumByPercent(baseTime, percentIncreaseFromKC);
		debugStr += `${percentIncreaseFromKC}% from KC`;

		// Reduce time based on Gear
		const usersRangeStats = gear.stats;
		const percentIncreaseFromRangeStats = Math.floor(calcWhatPercent(usersRangeStats.attack_ranged, 236)) / 2;
		baseTime = reduceNumByPercent(baseTime, percentIncreaseFromRangeStats);

		if (user.hasItemEquippedOrInBank('Twisted bow')) {
			debugStr += ', 15% from Twisted bow';
			baseTime = reduceNumByPercent(baseTime, 15);
		}

		debugStr += `, ${percentIncreaseFromRangeStats}% from Gear`;

		return [baseTime, debugStr];
	}

	determineChanceOfDeathPreJad(user: KlasaUser) {
		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts);
		let deathChance = Math.max(14 - attempts * 2, 5);

		// -4% Chance of dying before Jad if you have SGS.
		if (user.hasItemEquippedAnywhere('Saradomin godsword')) {
			deathChance -= 4;
		}

		return deathChance;
	}

	determineChanceOfDeathInJad(user: KlasaUser) {
		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts);
		const chance = Math.floor(100 - (Math.log(attempts) / Math.log(Math.sqrt(15))) * 50);

		// Chance of death cannot be 100% or <5%.
		return Math.max(Math.min(chance, 99), 5);
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const gearOkay = gearCheck(msg.author);
		if (typeof gearOkay === 'string') {
			return msg.channel.send(gearOkay);
		}

		let [duration, debugStr] = this.determineDuration(msg.author);
		const jadDeathChance = this.determineChanceOfDeathInJad(msg.author);
		const preJadDeathChance = this.determineChanceOfDeathPreJad(msg.author);

		const attempts = msg.author.settings.get(UserSettings.Stats.FightCavesAttempts);
		const usersRangeStats = msg.author.getGear('range').stats;
		const jadKC = msg.author.getKC(TzTokJad.id);

		duration += (rand(1, 5) * duration) / 100;

		const diedPreJad = percentChance(preJadDeathChance);
		const preJadDeathTime = diedPreJad ? rand(Time.Minute * 20, duration) : null;

		const bank = msg.author.settings.get(UserSettings.Bank);
		const newBank = removeBankFromBank(bank, fightCavesSupplies);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		// Add slayer
		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask =
			Boolean(usersTask.currentTask) &&
			usersTask.currentTask!.monsterID === Monsters.TzHaarKet.id &&
			usersTask.currentTask!.quantityRemaining === usersTask.currentTask!.quantity;

		// 15% boost for on task
		if (isOnTask && msg.author.hasItemEquippedOrInBank('Black mask (i)')) {
			duration *= 0.85;
			debugStr += ', 15% on Task with Black mask (i)';
		}

		await addSubTaskToActivityTask<InfernoOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.FightCaves,
			jadDeathChance,
			preJadDeathChance,
			preJadDeathTime
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.InfernoCost, fightCavesSupplies);

		const totalDeathChance = (((100 - preJadDeathChance) * (100 - jadDeathChance)) / 100).toFixed(1);

		return msg.channel.send({
			content: `**Duration:** ${formatDuration(duration)} (${(duration / 1000 / 60).toFixed(2)} minutes)
**Boosts:** ${debugStr}
**Range Attack Bonus:** ${usersRangeStats.attack_ranged}
**Jad KC:** ${jadKC}
**Attempts:** ${attempts}

**Removed from your bank:** ${new Bank(fightCavesSupplies)}`,
			files: [
				await chatHeadImage({
					content: "You're on your own now JalYt, you face certain death... prepare to fight for your life.",
					head: 'ketKeh'
				})
			]
		});
	}
}
