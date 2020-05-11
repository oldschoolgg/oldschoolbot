import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { calcWhatPercent, formatDuration, reduceNumByPercent } from '../../lib/util';
import { sumOfSetupStats } from '../../lib/gear/functions/sumOfSetupStats';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import itemInSlot from '../../lib/gear/functions/itemInSlot';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

const { TzTokJad } = Monsters;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true
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

		// Chance of death cannot be 100% or 0%.
		return Math.max(Math.min(chance, 99), 1);
	}

	checkGear(user: KlasaUser) {
		const [weapon] = itemInSlot(
			user.settings.get(UserSettings.Gear.Range),
			EquipmentSlot.Weapon
		);
		const usersRangeStats = sumOfSetupStats(user.settings.get(UserSettings.Gear.Range));
		if (usersRangeStats.attack_ranged < 160 || !weapon || !weapon.weapon) {
			throw `Your ranged gear isn't powerful enough to even attempt the Fight Caves, you will surely die! You need ranged gear with high ranged attack.`;
		}

		if (!['crossbows', 'bows'].includes(weapon.weapon.weapon_type)) {
			throw `You're not wearing a ranged weapon?! You should equip one to your range setup.'`;
		}
	}

	async run(msg: KlasaMessage) {
		const [duration, debugStr] = this.determineDuration(msg.author);
		const jadDeathChance = this.determineChanceOfDeathInJad(msg.author);
		const preJadDeathChance = this.determineChanceOfDeathPreJad(msg.author);

		const attempts = msg.author.settings.get(UserSettings.Stats.FightCavesAttempts);
		const usersRangeStats = sumOfSetupStats(msg.author.settings.get(UserSettings.Gear.Range));
		const jadKC = msg.author.getKC(TzTokJad);

		this.checkGear(msg.author);

		return msg.send(
			`Your fight caves trip will take: ${formatDuration(duration)} (${duration /
				1000 /
				60} minutes).
				
${debugStr}
				
Jad KC: ${jadKC}
Range Attack Bonus: ${usersRangeStats.attack_ranged}
Attempts: ${attempts}			

You have a **${jadDeathChance}%** chance of dying in the Jad Fight, based on how many attempts you've done.
You have a **${preJadDeathChance}%** chance of dying before you make it to jad, based on how many attempts you've done.`
		);
	}
}

/*
await msg.author.settings.sync(true);

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		const data: MonsterActivityTaskOptions = {
			monsterID: TzTokJad.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		const response = `${msg.author.minionName} is now off to try to complete the Fight Caves!`;

		return msg.send(response);
		*/
