import { objectEntries, randArrItem, randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Time } from '../../lib/constants';
import { roll } from '../../lib/data/monsters/raids';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { Plank } from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { MahoganyHomesActivityTaskOptions } from '../../lib/types/minions';
import {
	addArrayOfNumbers,
	calcPercentOfNum,
	calcWhatPercent,
	formatDuration
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

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
	const qtyPerHour = 40 + Math.ceil(calcPercentOfNum(percentSkill, 5));
	const qtyPerMaxLen = (qtyPerHour / Time.Hour) * maxLen;
	const lenPerQty = maxLen / qtyPerMaxLen;
	const tier = contractTiers.find(tier => level >= tier.level)!;

	const qty = Math.floor(maxLen / lenPerQty);
	let itemsNeeded = new Bank();
	let xp = 0;

	if (hasSack) {
		// ?
	}

	for (let i = 0; i < qty; i++) {
		if (tier.name !== 'Beginner' && roll(3)) {
			itemsNeeded.add('Steel bar', randInt(1, 2));
		}
		let planksNeeded = 0;
		const planksCap = randInt(10, 16);

		while (planksNeeded <= planksCap) {
			planksNeeded += randArrItem(planksTable);
			xp += tier.plankXP[roll(4) ? 0 : 1];
		}
		itemsNeeded.add(tier.plank, planksNeeded);
		xp += tier.xp;
	}

	const points = qty * tier.points;
	return [qty, itemsNeeded, xp, lenPerQty * qty, points];
}

export default class MahoganyHomesCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<build|buy> [action:string]',
			usageDelim: ' ',
			aliases: ['mh'],
			subcommands: true
		});
	}

	@requiresMinion
	@minionNotBusy
	async build(msg: KlasaMessage) {
		await msg.author.settings.sync(true);

		if (msg.flagArgs.xphr) {
			let str = 'Approximate XP/Hr\n\n';
			for (let i = 1; i < 100; i += i > 95 ? 1 : 5) {
				str += `\n---- Level ${i} ----\n\n\n`;
				let xpArr: number[] = [];
				let itemsNeeded = new Bank();
				for (const bool of [true, false]) {
					for (let o = 0; o < 500; o++) {
						const [, items, xp] = calcTrip(i, 9000, Time.Hour, bool);
						xpArr.push(xp);
						itemsNeeded.add(items);
					}
					let avgXP = addArrayOfNumbers(xpArr) / xpArr.length;
					for (const [key, val] of objectEntries(itemsNeeded.bank)) {
						itemsNeeded.bank[key] = val / xpArr.length;
					}
					str += `${bool ? 'WITH' : 'NO'} Plank sack ${avgXP.toLocaleString()} XP/HR
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
			str += `\nYour getting more XP/Hr because of your Plank sack!`;
		}

		return msg.send(str);
	}
}
