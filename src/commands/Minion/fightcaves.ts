import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { Time, Activity, Tasks } from '../../lib/constants';
import {
	calcWhatPercent,
	formatDuration,
	reduceNumByPercent,
	rand,
	percentChance
} from '../../lib/util';
import { sumOfSetupStats } from '../../lib/gear/functions/sumOfSetupStats';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import itemInSlot from '../../lib/gear/functions/itemInSlot';
import { FightCavesActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import mejJalImage from '../../lib/image/mejJalImage';

const { TzTokJad } = Monsters;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	determineDuration(user: KlasaUser): [number, string] {
		let baseTime = Time.Hour * 2;

		let debugStr = '';

		// Reduce time based on KC
		const jadKC = user.getKC(TzTokJad);
		const percentIncreaseFromKC = Math.floor(calcWhatPercent(Math.min(50, jadKC), 50)) / 2;
		baseTime = reduceNumByPercent(baseTime, percentIncreaseFromKC);
		debugStr += `-${percentIncreaseFromKC}% from KC`;

		// Reduce time based on Gear
		const usersRangeStats = sumOfSetupStats(user.settings.get(UserSettings.Gear.Range));
		const percentIncreaseFromRangeStats =
			Math.floor(calcWhatPercent(usersRangeStats.attack_ranged, 236)) / 2;
		baseTime = reduceNumByPercent(baseTime, percentIncreaseFromRangeStats);
		debugStr += `, -${percentIncreaseFromRangeStats}% from Gear`;

		return [baseTime, debugStr];
	}

	determineChanceOfDeathPreJad(user: KlasaUser) {
		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts);
		return Math.max(14 - attempts * 2, 0);
	}

	determineChanceOfDeathInJad(user: KlasaUser) {
		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts);
		const chance = Math.floor(100 - (Math.log(attempts) / Math.log(Math.sqrt(15))) * 50);

		// Chance of death cannot be 100% or <5>%.
		return Math.max(Math.min(chance, 99), 5);
	}

	checkGear(user: KlasaUser) {
		const [weapon] = itemInSlot(
			user.settings.get(UserSettings.Gear.Range),
			EquipmentSlot.Weapon
		);
		const usersRangeStats = sumOfSetupStats(user.settings.get(UserSettings.Gear.Range));
		if (
			!weapon ||
			!weapon.weapon ||
			!['crossbows', 'bows'].includes(weapon.weapon.weapon_type)
		) {
			throw `JalYt, you not wearing ranged weapon?! TzTok-Jad stomp you to death if you get close, come back with range weapon.`;
		}

		if (usersRangeStats.attack_ranged < 160) {
			throw `JalYt, your ranged gear not strong enough! You die very quickly with your bad gear, come back with better range gear.`;
		}
	}

	async run(msg: KlasaMessage) {
		let duration;
		let debugStr;
		let jadDeathChance;
		let preJadDeathChance;

		try {
			this.checkGear(msg.author);

			[duration, debugStr] = this.determineDuration(msg.author);
			jadDeathChance = this.determineChanceOfDeathInJad(msg.author);
			preJadDeathChance = this.determineChanceOfDeathPreJad(msg.author);
		} catch (err) {
			if (typeof err === 'string') {
				return msg.channel.send(await mejJalImage(err));
			}
			throw err;
		}

		const attempts = msg.author.settings.get(UserSettings.Stats.FightCavesAttempts);
		const usersRangeStats = sumOfSetupStats(msg.author.settings.get(UserSettings.Gear.Range));
		const jadKC = msg.author.getKC(TzTokJad);

		duration += (rand(1, 5) * duration) / 100;

		const diedPreJad = percentChance(preJadDeathChance);
		const finishDate = diedPreJad ? rand(Time.Minute, duration) : Date.now() + duration;

		const data: FightCavesActivityTaskOptions = {
			minigameID: TzTokJad.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration,
			type: Activity.FightCaves,
			id: rand(1, 10_000_000),
			finishDate: 1 < 2 ? Date.now() + Number(Time.Minute) : finishDate,
			jadDeathChance,
			preJadDeathChance,
			diedPreJad
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		const totalDeathChance = (
			((100 - preJadDeathChance + 1) * (100 - jadDeathChance)) /
			100
		).toFixed(1);

		return msg.send(
			`**Duration:** ${formatDuration(duration)} (${duration / 1000 / 60} minutes)
**Boosts:** ${debugStr}
**Range Attack Bonus:** ${usersRangeStats.attack_ranged}
**Jad Death Chance:** ${jadDeathChance}%
**Pre-Jad Death Chance:** ${preJadDeathChance}%
**Jad KC:** ${jadKC}
**Attempts:** ${attempts}`,
			await mejJalImage(
				`You're on your own now JalYt, prepare to fight for your life! I think you have ${totalDeathChance}% chance of survival.`
			)
		);
	}
}
