import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { calcWhatPercent, formatDuration, reduceNumByPercent } from '../../lib/util';
import { sumOfSetupStats } from '../../lib/gear/functions/sumOfSetupStats';
import { UserSettings } from '../../lib/settings/types/UserSettings';

const { TzTokJad } = Monsters;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true
		});
	}

	determineDuration(user: KlasaUser) {
		let baseTime = Time.Hour * 2;

		//
		const jadKC = user.getKC(TzTokJad);
		const percentIncreaseFromKC = Math.floor(calcWhatPercent(Math.min(50, jadKC), 50)) / 2;
		baseTime = reduceNumByPercent(baseTime, percentIncreaseFromKC);

		// Reduce the time based on how good their ranged gear is, if their gear has the max of
		// 181 ranged attack bonus, they will get a full 25% increase.
		const usersRangeStats = sumOfSetupStats(user.settings.get(UserSettings.Gear.Range));

		const percentIncreaseFromRangeStats =
			Math.floor(calcWhatPercent(usersRangeStats.attack_ranged, 236)) / 2;

		baseTime = reduceNumByPercent(baseTime, percentIncreaseFromRangeStats);

		return baseTime;
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

	async run(msg: KlasaMessage) {
		const duration = this.determineDuration(msg.author);
		const jadDeathChance = this.determineChanceOfDeathInJad(msg.author);
		const preJadDeathChance = this.determineChanceOfDeathPreJad(msg.author);

		const attempts = msg.author.settings.get(UserSettings.Stats.FightCavesAttempts);
		const usersRangeStats = sumOfSetupStats(msg.author.settings.get(UserSettings.Gear.Range));
		const jadKC = msg.author.getKC(TzTokJad);

		return msg.send(
			`Your fight caves trip will take: ${formatDuration(duration)} (${duration /
				1000 /
				60} minutes).
				
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
