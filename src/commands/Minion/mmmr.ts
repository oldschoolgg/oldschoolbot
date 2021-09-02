import { randArrItem, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import {
	fightingMessages,
	getMonkeyPhrase,
	getRandomMonkey,
	monkeyHeadImage,
	monkeyTiers,
	TOTAL_MONKEYS
} from '../../lib/monkeyRumble';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MonkeyRumbleOptions } from '../../lib/types/minions';
import { stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';

const buyables = monkeyTiers.map((t, index) => ({
	item: t.greegree,
	gamesReq: t.gamesReq,
	strengthLevelReq: t.strengthLevelReq,
	cost: (index + 1) * 100,
	aliases: [t.name, t.greegree.name]
}));

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'Sends your minion to do barbarian assault, or buy rewards and gamble.',
			examples: ['+barbassault [start]'],
			subcommands: true,
			usage: '[start|level|buy] [buyableOrGamble:...string]',
			usageDelim: ' ',
			aliases: ['mr', 'mmr', 'rumble']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		return msg.channel.send(`Total Monkeys you can fight: ${TOTAL_MONKEYS}`);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const buyable = buyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.channel.send(
				`Here are the items you can buy: \n\n${buyables
					.map(i => `**${i.item.name}:** ${i.cost} points`)
					.join('\n')}.`
			);
		}

		const { item, cost } = buyable;
		const balance = msg.author.settings.get(UserSettings.HonourPoints);
		if (balance < cost) {
			return msg.channel.send(
				`You don't have enough Honour Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		await msg.author.settings.update(UserSettings.HonourPoints, balance - cost);
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.channel.send(`Successfully purchased 1x ${item.name} for ${cost} Honour Points.`);
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage) {
		// const boosts = [];

		// let waveTime = randomVariation(Time.Minute * 4, 10);

		// // Up to 12.5% speed boost for max strength
		// const gearStats = msg.author.getGear(GearSetupTypes.Melee).stats;
		// const strengthPercent = round(calcWhatPercent(gearStats.melee_strength, maxOtherStats.melee_strength) / 8, 2);
		// waveTime = reduceNumByPercent(waveTime, strengthPercent);
		// boosts.push(`${strengthPercent}% for ${msg.author.username}'s melee gear`);

		// // Up to 30% speed boost for team total honour level
		// const totalLevelPercent = round(calcWhatPercent(1, 5 * 1) / 3.3, 2);
		// boosts.push(`${totalLevelPercent}% for team honour levels`);
		// waveTime = reduceNumByPercent(waveTime, totalLevelPercent);

		// // Up to 10%, at 200 kc, speed boost for team average kc
		// const averageKC = 1;
		// const kcPercent = round(Math.min(100, calcWhatPercent(averageKC, 200)) / 5, 2);
		// boosts.push(`${kcPercent}% for average KC`);
		// waveTime = reduceNumByPercent(waveTime, kcPercent);

		// const quantity = Math.floor(msg.author.maxTripLength(Activity.BarbarianAssault) / waveTime);
		// const duration = quantity * waveTime;

		// boosts.push(`Each wave takes ${formatDuration(waveTime)}`);

		// let str = `${
		// 	msg.author.minionName
		// } is now off to do ${quantity} waves of Barbarian Assault. Each wave takes ${formatDuration(
		// 	waveTime
		// )} - the total trip will take ${formatDuration(duration)}. `;

		// str += `\n\n**Boosts:** ${boosts.join(', ')}.`;

		if (!msg.author.hasItemEquippedAnywhere("M'speak amulet")) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						head: 'placeHolderName',
						content: getMonkeyPhrase()
					})
				]
			});
		}

		const monkey = getRandomMonkey();

		const fightDuration = Time.Minute * 5;
		const quantity = Math.floor(msg.author.maxTripLength(Activity.MonkeyRumble) / fightDuration);

		await addSubTaskToActivityTask<MonkeyRumbleOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration: 1,
			type: Activity.MonkeyRumble,
			minigameID: 'MadMarimbosMonkeyRumble',
			monkey
		});

		if (!msg.author.settings.get(UserSettings.MonkeysFought).includes(monkey.nameKey)) {
			await msg.author.settings.update(UserSettings.MonkeysFought, monkey.nameKey);
		}

		return msg.channel.send({
			content: `You are fighting ${quantity}x rounds with ${monkey.name}.`,
			files: [await monkeyHeadImage({ monkey, content: randArrItem(fightingMessages) })]
		});
	}
}
