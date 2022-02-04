import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FightCavesActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, percentChance, rand, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import itemID from '../../lib/util/itemID';

const { TzTokJad } = Monsters;

export const fightCavesCost = new Bank({
	'Prayer potion(4)': 10,
	'Saradomin brew(4)': 6,
	'Super restore(4)': 4
});

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissionsForBot: ['ATTACH_FILES'],
			description:
				'Sends your minion to complete the fight caves - it will start off bad but get better with more attempts. Requires range gear, prayer pots, brews and restores.',
			examples: ['+fightcaves'],
			categoryFlags: ['minion', 'minigame']
		});
	}

	determineDuration(user: KlasaUser): [number, string] {
		let baseTime = Time.Hour * 2;
		const gear = user.getGear('range');
		let debugStr = '';

		// Reduce time based on KC
		const jadKC = user.getKC(TzTokJad.id);
		const percentIncreaseFromKC = Math.min(50, jadKC);
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
		if (user.hasItemEquippedAnywhere(itemID('Saradomin godsword'))) {
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

	async checkGear(user: KlasaUser) {
		const gear = user.getGear('range');
		const equippedWeapon = gear.equippedWeapon();

		const usersRangeStats = gear.stats;

		if (
			!equippedWeapon ||
			!equippedWeapon.weapon ||
			!['crossbow', 'bow'].includes(equippedWeapon.weapon.weapon_type)
		) {
			throw 'JalYt, you not wearing ranged weapon?! TzTok-Jad stomp you to death if you get close, come back with a bow or a crossbow.';
		}

		if (usersRangeStats.attack_ranged < 160) {
			throw 'JalYt, your ranged gear not strong enough! You die very quickly with your bad gear, come back with better range gear.';
		}

		if (!user.owns(fightCavesCost)) {
			throw `JalYt, you need supplies to have a chance in the caves...come back with ${fightCavesCost}.`;
		}

		if (user.skillLevel(SkillsEnum.Prayer) < 43) {
			throw 'JalYt, come back when you have atleast 43 Prayer, TzTok-Jad annihilate you without protection from gods.';
		}
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		try {
			await this.checkGear(msg.author);
		} catch (err) {
			if (typeof err === 'string') {
				return msg.channel.send({ files: [await chatHeadImage({ content: err, head: 'mejJal' })] });
			}
			throw err;
		}

		let [duration, debugStr] = this.determineDuration(msg.author);
		const jadDeathChance = this.determineChanceOfDeathInJad(msg.author);
		let preJadDeathChance = this.determineChanceOfDeathPreJad(msg.author);

		const attempts = msg.author.settings.get(UserSettings.Stats.FightCavesAttempts);
		const usersRangeStats = msg.author.getGear('range').stats;
		const jadKC = msg.author.getKC(TzTokJad.id);

		duration += (rand(1, 5) * duration) / 100;

		const hasToad = msg.author.equippedPet() === itemID('Wintertoad');
		if (hasToad) {
			duration /= 2;
			preJadDeathChance = 0;
		}

		const diedPreJad = percentChance(preJadDeathChance);
		const preJadDeathTime = diedPreJad ? rand(Time.Minute * 20, duration) : null;

		await msg.author.removeItemsFromBank(fightCavesCost);

		// Add slayer
		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask!.monster_id === Monsters.TzHaarKet.id &&
			usersTask.currentTask!.quantity_remaining === usersTask.currentTask!.quantity;

		// 15% boost for on task
		if (isOnTask && msg.author.hasItemEquippedOrInBank('Black mask (i)')) {
			duration *= 0.85;
			debugStr += ', 15% on Task with Black mask (i)';
		}

		await addSubTaskToActivityTask<FightCavesActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration,
			type: 'FightCaves',
			jadDeathChance,
			preJadDeathChance,
			preJadDeathTime
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.FightCavesCost, fightCavesCost);

		const totalDeathChance = (((100 - preJadDeathChance) * (100 - jadDeathChance)) / 100).toFixed(1);

		return msg.channel.send({
			content: `**Duration:** ${formatDuration(duration)} (${(duration / 1000 / 60).toFixed(2)} minutes)
**Boosts:** ${debugStr}
**Range Attack Bonus:** ${usersRangeStats.attack_ranged}
**Jad KC:** ${jadKC}
**Attempts:** ${attempts}
${
	hasToad
		? '<:wintertoad:749945071230779493> The extreme cold of your Wintertoad counters the Fight Caves, allowing you to kill the creatures much faster!'
		: ''
}

**Removed from your bank:** ${fightCavesCost}`,
			files: [
				await chatHeadImage({
					content: `You're on your own now JalYt, prepare to fight for your life! I think you have ${totalDeathChance}% chance of survival.`,
					head: 'mejJal'
				})
			]
		});
	}
}
