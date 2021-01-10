import { objectEntries, randArrItem, randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Time } from '../../lib/constants';
import { roll } from '../../lib/data/monsters/raids';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Plank } from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { MahoganyHomesActivityTaskOptions } from '../../lib/types/minions';
import {
	addArrayOfNumbers,
	calcPercentOfNum,
	calcWhatPercent,
	formatDuration,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const contractTiers = [
	{
		name: 'Expert',
		level: 70,
		plank: Plank.MahoganyPlank,
		xp: 2750,
		points: 5,
		plankXP: [112, 240]
	},
	{
		name: 'Adept',
		level: 50,
		plank: Plank.TeakPlank,
		xp: 2250,
		points: 4,
		plankXP: [72, 190]
	},
	{
		name: 'Novice',
		level: 20,
		plank: Plank.OakPlank,
		xp: 1250,
		points: 3,
		plankXP: [48, 160]
	},
	{
		name: 'Beginner',
		level: 1,
		plank: Plank.Plank,
		xp: 500,
		points: 2,
		plankXP: [22.5, 127.5]
	}
];

const planksTable = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 4];

function calcTrip(
	level: number,
	kc: number,
	maxLen: number,
	hasSack: boolean
): [number, Bank, number, number, number] {
	const percentSkill = Math.min(100, calcWhatPercent(kc, 300));
	const qtyPerHour = 31 + Math.ceil(calcPercentOfNum(percentSkill, 5)) + (hasSack ? 6 : 0);
	const qtyPerMaxLen = (qtyPerHour / Time.Hour) * maxLen;
	const lenPerQty = maxLen / qtyPerMaxLen;
	const tier = contractTiers.find(tier => level >= tier.level)!;

	const qty = Math.floor(maxLen / lenPerQty);
	let itemsNeeded = new Bank();
	let xp = 0;

	for (let i = 0; i < qty; i++) {
		if (tier.name !== 'Beginner' && roll(5)) {
			itemsNeeded.add('Steel bar', randInt(2, 4));
		}
		let planksNeeded = 0;
		const planksCap = randInt(10, 16);

		while (planksNeeded <= planksCap - 2) {
			const plankBuild = randArrItem(planksTable);
			planksNeeded += plankBuild;
			xp += tier.plankXP[roll(2) ? 0 : 1] * plankBuild;
		}
		itemsNeeded.add(tier.plank, planksNeeded);
		xp += tier.xp;
	}

	const points = qty * tier.points;
	return [qty, itemsNeeded, xp, lenPerQty * qty, points];
}

const buyables = [
	{ item: getOSItem('Builders supply crate'), cost: 25 },
	{ item: getOSItem(`Amy's saw`), cost: 500 },
	{ item: getOSItem(`Plank sack`), cost: 350 },
	{ item: getOSItem(`Hosidius blueprints`), cost: 2000 },
	{ item: getOSItem(`Carpenter's helmet`), cost: 400 },
	{ item: getOSItem(`Carpenter's shirt`), cost: 800 },
	{ item: getOSItem(`Carpenter's trousers`), cost: 600 },
	{ item: getOSItem(`Carpenter's boots`), cost: 200 }
];

export default class MahoganyHomesCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[build|buy] [action:...string]',
			usageDelim: ' ',
			aliases: ['mh'],
			subcommands: true
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		return msg.send(
			`You have ${msg.author.settings.get(UserSettings.CarpenterPoints)} Carpenter points.

To do a Mahogany Homes trip, use \`${msg.cmdPrefix}mh build\`
To buy rewards with your Carpenter points, use \`${msg.cmdPrefix}mh buy\``
		);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const buyable = buyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.send(
				`Here are the items you can buy: \n\n${buyables
					.map(i => `**${i.item.name}:** ${i.cost} points`)
					.join('\n')}.`
			);
		}

		const { item, cost } = buyable;
		const balance = msg.author.settings.get(UserSettings.CarpenterPoints);
		if (balance < cost) {
			return msg.send(
				`You don't have enough Carpenter Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		await msg.author.settings.update(UserSettings.CarpenterPoints, balance - cost);
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.send(`Successfully purchased 1x ${item.name} for ${cost} Carpenter Points.`);
	}

	@requiresMinion
	@minionNotBusy
	async build(msg: KlasaMessage) {
		await msg.author.settings.sync(true);

		if (msg.flagArgs.xphr) {
			let str = 'Approximate XP/Hr\n\n';
			for (let i = 1; i < 100; i += i > 95 ? 1 : 5) {
				str += `\n---- Level ${i} ----\n\n\n`;
				for (const bool of [true, false]) {
					let xpArr: number[] = [];
					let itemsNeeded = new Bank();
					for (let o = 0; o < 500; o++) {
						const [, items, xp] = calcTrip(i, 9000, Time.Hour, bool);
						xpArr.push(xp);
						itemsNeeded.add(items);
					}
					let avgXP = addArrayOfNumbers(xpArr) / xpArr.length;
					for (const [key, val] of objectEntries(itemsNeeded.bank)) {
						itemsNeeded.bank[key] = Math.round(val / xpArr.length);
					}
					str += `${bool ? 'With' : 'NO'} Plank sack ${avgXP.toLocaleString()} XP/HR
    Items per HR: ${itemsNeeded}\n\n`;
				}
				str += '\n\n\n';
			}
			return msg.channel.sendFile(Buffer.from(str), 'construction-xpxhr.txt');
		}

		const conLevel = msg.author.skillLevel(SkillsEnum.Construction);
		const kc = msg.author.getMinigameScore(MinigameIDsEnum.MahoganyHomes);

		const hasSack = msg.author.hasItemEquippedOrInBank('Plank sack');
		const [quantity, itemsNeeded, xp, duration, points] = calcTrip(
			conLevel,
			kc,
			msg.author.maxTripLength,
			hasSack
		);

		if (!msg.author.bank().has(itemsNeeded.bank)) {
			return msg.send(`You don't have enough items for this trip. You need: ${itemsNeeded}.`);
		}
		await msg.author.removeItemsFromBank(itemsNeeded.bank);

		await addSubTaskToActivityTask<MahoganyHomesActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			type: Activity.MahoganyHomes,
			minigameID: MinigameIDsEnum.MahoganyHomes,
			quantity,
			duration,
			points,
			xp
		});

		let str = `${
			msg.author.minionName
		} is now doing ${quantity}x Mahogany homes contracts, the trip will take ${formatDuration(
			duration
		)}. Removed ${itemsNeeded} from your bank.`;

		if (hasSack) {
			str += `\nYou're getting more XP/Hr because of your Plank sack!`;
		}

		return msg.send(str);
	}
}
