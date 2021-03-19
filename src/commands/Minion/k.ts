import {
	calcWhatPercent,
	increaseNumByPercent,
	objectEntries,
	objectKeys,
	reduceNumByPercent,
	round,
	Time
} from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { Activity } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import findMonster from '../../lib/minions/functions/findMonster';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { calcPOHBoosts } from '../../lib/poh';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import {
	addArrayOfNumbers,
	formatDuration,
	isWeekend,
	itemID,
	itemNameFromID,
	randomVariation,
	removeDuplicatesFromArray
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const invalidMonster = (prefix: string) =>
	`That isn't a valid monster, the available monsters are: ${killableMonsters
		.map(mon => mon.name)
		.join(', ')}. For example, \`${prefix}minion kill 5 zulrah\``;

const { floor } = Math;

function applySkillBoost(
	user: KlasaUser,
	duration: number,
	styles: AttackStyles[]
): [number, string] {
	const skillTotal = addArrayOfNumbers(styles.map(s => user.skillLevel(s)));

	let newDuration = duration;
	let str = '';
	let percent = round(calcWhatPercent(skillTotal, styles.length * 99), 2);

	if (percent < 50) {
		percent = 50 - percent;
		newDuration = increaseNumByPercent(newDuration, percent);
		str = `-${percent.toFixed(2)}% for low stats`;
	} else {
		percent = Math.min(15, percent / 6.5);
		newDuration = reduceNumByPercent(newDuration, percent);
		str = `${percent.toFixed(2)}% for stats`;
	}

	return [newDuration, str];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to kill monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		const { minionName } = msg.author;

		const boosts = [];
		let messages: string[] = [];

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		if (!name) return msg.channel.send(invalidMonster(msg.cmdPrefix));
		const monster = findMonster(name);
		if (!monster) return msg.channel.send(invalidMonster(msg.cmdPrefix));

		if (monster.id === 696969) {
			throw `You would be foolish to try to face King Goldemar in a solo fight.`;
		}

		if (msg.author.usingPet('Ishi') && monster.name !== 'Ogress Warrior') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.kill(msg, ['Ogress Warrior']);
			return msg.channel.send(`Let's kill some ogress warriors instead? 🥰 🐳`);
		}

		// Check requirements
		const [hasReqs, reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) throw reason;

		let [timeToFinish, percentReduced] = reducedTimeFromKC(
			monster,
			msg.author.getKC(monster.id)
		);

		const attackStyles = resolveAttackStyles(msg.author, monster.id)[2];
		const [newTime, skillBoostMsg] = applySkillBoost(msg.author, timeToFinish, attackStyles);

		timeToFinish = newTime;
		boosts.push(skillBoostMsg);

		timeToFinish /= 2;
		boosts.push(`2x BSO Boost`);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

		if (monster.pohBoosts) {
			const [boostPercent, messages] = calcPOHBoosts(
				await msg.author.getPOH(),
				monster.pohBoosts
			);
			if (boostPercent > 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
				boosts.push(messages.join(' + '));
			}
		}

		if (monster.itemInBankBoosts) {
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				if (!msg.author.hasItemEquippedOrInBank(parseInt(itemID))) continue;
				timeToFinish *= (100 - boostAmount) / 100;
				boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
			}
		}

		if (msg.author.hasItemEquippedAnywhere(itemID('Dwarven warhammer'))) {
			timeToFinish *= 0.6;
			boosts.push(`40% boost for Dwarven warhammer`);
		}

		if (Monsters.get(monster.id)?.data.attributes.includes(MonsterAttribute.Dragon)) {
			if (msg.author.hasItemEquippedAnywhere(itemID('Dragon hunter lance'))) {
				timeToFinish *= 0.8;
				boosts.push(`20% boost for Dragon hunter lance`);
			}
		}

		const maxTripLength = msg.author.maxTripLength(Activity.MonsterKilling);

		const hasBlessing = msg.author.hasItemEquippedAnywhere(itemID('Dwarven blessing'));
		if (hasBlessing) {
			timeToFinish *= 0.8;
			boosts.push(`20% for Dwarven blessing`);
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = floor(maxTripLength / timeToFinish);
		}

		let duration = timeToFinish * quantity;
		// If you have dwarven blessing, you need 1 prayer pot per 5 mins
		const prayerPots = msg.author.bank().amount('Prayer potion(4)');
		const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));
		const gearSetupsUsed = objectEntries(msg.author.rawGear()).filter(entry =>
			monster.attackStyleToUse?.includes(entry[0])
		);
		let prayerPotsNeeded = Math.max(1, fiveMinIncrements);
		const hasPrayerMasterCape = gearSetupsUsed.some(
			c => c[1].cape?.item === itemID('Prayer master cape')
		);
		if (hasPrayerMasterCape && hasBlessing) {
			boosts.push(`40% less prayer pots`);
			prayerPotsNeeded = Math.floor(0.6 * prayerPotsNeeded);
		}
		prayerPotsNeeded = Math.max(1, prayerPotsNeeded);
		if (hasBlessing) {
			if (prayerPots < prayerPotsNeeded) {
				return msg.send(
					`You don't have enough Prayer potion(4)'s to power your Dwarven blessing.`
				);
			}
		}

		// Check food
		let foodStr: undefined | string = undefined;
		if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
			const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, msg.author);
			messages = messages.concat(foodMessages);

			const [result] = await removeFoodFromUser({
				client: this.client,
				user: msg.author,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				attackStylesUsed: removeDuplicatesFromArray([
					...objectKeys(monster.minimumGearRequirements ?? {}),
					monster.attackStyleToUse
				]),
				learningPercentage: percentReduced
			});

			foodStr = result;
		}

		if (duration > maxTripLength) {
			return msg.send(
				`${minionName} can't go on PvM trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${
					monster.name
				} is ${floor(maxTripLength / timeToFinish)}.`
			);
		}

		duration = randomVariation(duration, 3);

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		if (
			attackStyles.includes(SkillsEnum.Ranged) &&
			msg.author.hasItemEquippedAnywhere('Ranged master cape')
		) {
			duration *= 0.85;
			boosts.push(`15% for Ranged master cape`);
		} else if (
			attackStyles.includes(SkillsEnum.Magic) &&
			msg.author.hasItemEquippedAnywhere('Magic master cape')
		) {
			duration *= 0.85;
			boosts.push(`15% for Magic master cape`);
		} else if (msg.author.hasItemEquippedAnywhere('Attack master cape')) {
			duration *= 0.85;
			boosts.push(`15% for Attack master cape`);
		}

		if (hasBlessing && prayerPotsNeeded) {
			await msg.author.removeItemFromBank(itemID('Prayer potion(4)'), prayerPotsNeeded);
		}

		await addSubTaskToActivityTask<MonsterActivityTaskOptions>(this.client, {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonsterKilling
		});

		let response = `${minionName} is now killing ${quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish. Attack styles used: ${attackStyles.join(', ')}.`;
		if (foodStr) {
			response += ` Removed ${foodStr}.\n`;
		}

		if (hasBlessing) {
			response += `\nRemoved ${prayerPotsNeeded}x Prayer potion(4) to power Dwarven blessing.`;
		}

		if (boosts.length > 0) {
			response += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (messages.length > 0) {
			response += `\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
}
