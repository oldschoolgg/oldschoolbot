import { increaseNumByPercent, randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { addArrayOfNumbers } from 'oldschooljs/dist/util';

import { Activity, Emoji, Events, Time } from '../../lib/constants';
import { maxOtherStats } from '../../lib/gear';
import { GearSetupTypes } from '../../lib/gear/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { HighGambleTable, LowGambleTable, MediumGambleTable } from '../../lib/simulation/baGamble';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { BarbarianAssaultActivityTaskOptions, DungeonOptions } from '../../lib/types/minions';
import {
	calcWhatPercent,
	formatDuration,
	randomVariation,
	reduceNumByPercent,
	round,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getOSItem from '../../lib/util/getOSItem';

const BarbBuyables = [
	{
		item: getOSItem('Fighter hat'),
		cost: 275 * 4
	}
];

const levels = [
	{
		level: 2,
		cost: 200 * 4
	},
	{
		level: 3,
		cost: 300 * 4
	},
	{
		level: 4,
		cost: 400 * 4
	},
	{
		level: 5,
		cost: 500 * 4
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'Sends your minion to do barbarian assault, or buy rewards and gamble.',
			examples: ['+barbassault [start]'],
			subcommands: true,
			usage: '[start|level|buy|gamble] [buyableOrGamble:...string]',
			usageDelim: ' ',
			aliases: ['ba']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		return msg.send(
			`**Honour Points:** ${msg.author.settings.get(
				UserSettings.HonourPoints
			)} **Honour Level:** ${msg.author.settings.get(
				UserSettings.HonourLevel
			)} **High Gambles:** ${msg.author.settings.get(UserSettings.HighGambles)}\n\n` +
				`You can start a Barbarian Assault party using \`${msg.cmdPrefix}ba start\`, you'll need 2+ people to join to start.` +
				` We have a BA channel in our server for finding teams: (discord.gg/ob). \n` +
				`Barbarian Assault works differently in the bot than ingame, there's only 1 role, no waves, and 1 balance of honour points.` +
				`\n\nYou can buy rewards with \`${msg.cmdPrefix}ba buy\`, level up your Honour Level with \`${msg.cmdPrefix}ba level\`.` +
				` You can gamble using \`${msg.cmdPrefix}ba gamble high/medium/low\`.`
		);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const buyable = BarbBuyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.send(
				`Here are the items you can buy: \n\n${BarbBuyables.map(
					i => `**${i.item.name}:** ${i.cost} points`
				).join('\n')}.`
			);
		}

		const { item, cost } = buyable;
		const balance = msg.author.settings.get(UserSettings.HonourPoints);
		if (balance < cost) {
			return msg.send(
				`You don't have enough Honour Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		await msg.author.settings.update(UserSettings.HonourPoints, balance - cost);
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.send(`Successfully purchased 1x ${item.name} for ${cost} Honour Points.`);
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage, [input]: [string]) {
		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: 4,
			ironmanAllowed: true,
			message: `${msg.author.username} has created a Barbarian Assault party! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave. There must be 2+ users in the party.`,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}

				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		let totalLevel = 0;
		for (const user of users) {
			totalLevel += user.settings.get(UserSettings.HonourLevel);
		}

		const boosts = [];

		let waveTime = randomVariation(Time.Minute * 4, 10);

		// Up to 12.5% speed boost for max strength
		const fighter = randArrItem(users);
		const gearStats = fighter.setupStats(GearSetupTypes.Melee);
		const strengthPercent = round(
			calcWhatPercent(gearStats.melee_strength, maxOtherStats.melee_strength) / 8,
			2
		);
		waveTime = reduceNumByPercent(waveTime, strengthPercent);
		boosts.push(`${strengthPercent}% for ${fighter.username}'s melee gear`);

		// Up to 30% speed boost for team total honour level
		const totalLevelPercent = round(calcWhatPercent(totalLevel, 5 * users.length) / 3.3, 2);
		boosts.push(`${totalLevelPercent}% for team honour levels`);
		waveTime = reduceNumByPercent(waveTime, totalLevelPercent);

		if (users.length === 1) {
			waveTime = increaseNumByPercent(waveTime, 10);
			boosts.push(`10% slower for solo`);
		}

		// Up to 10%, at 200 kc, speed boost for team average kc
		const averageKC =
			addArrayOfNumbers(
				await Promise.all(users.map(u => u.getMinigameScore('BarbarianAssault')))
			) / users.length;
		const kcPercent = round(Math.min(100, calcWhatPercent(averageKC, 200)) / 5, 2);
		boosts.push(`${kcPercent}% for average KC`);
		waveTime = reduceNumByPercent(waveTime, kcPercent);

		const quantity = Math.floor(msg.author.maxTripLength(Activity.BarbarianAssault) / waveTime);
		const duration = quantity * waveTime;

		boosts.push(`Each wave takes ${formatDuration(waveTime)}`);

		let str = `${partyOptions.leader.username}'s party (${users
			.map(u => u.username)
			.join(
				', '
			)}) is now off to do ${quantity} waves of Barbarian Assault. Each wave takes ${formatDuration(
			waveTime
		)} - the total trip will take ${formatDuration(duration)}. `;

		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		await addSubTaskToActivityTask<DungeonOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Dungeoneering,
			leader: msg.author.id,
			users: users.map(u => u.id)
		});

		return msg.channel.send(str, {
			split: true
		});
	}
}
