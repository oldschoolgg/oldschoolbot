import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, increaseNumByPercent, objectKeys, reduceNumByPercent, round } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { calcPOHBoosts } from '../../lib/poh';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import findMonster, {
	addArrayOfNumbers,
	formatDuration,
	isWeekend,
	itemNameFromID,
	randomVariation,
	removeDuplicatesFromArray
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

const validMonsters = killableMonsters.map(mon => mon.name).join(`\n`);
const invalidMonsterMsg = (prefix: string) =>
	`That isn't a valid monster.\n\nFor example, \`${prefix}minion kill 5 zulrah\`` +
	`\n\nTry: \`${prefix}k --monsters\` for a list of killable monsters.`;

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
			usage: '',
			usageDelim: ' ',
			description: 'Sends your minion to kill your slayer monster monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const { minionName } = msg.author;
		let quantity = null;

		const boosts = [];
		let messages: string[] = [];

		if (msg.flagArgs.monsters) {
			return msg.channel.send(
				new MessageAttachment(Buffer.from(validMonsters), 'validMonsters.txt')
			);
		}

		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null;

		if (!isOnTask) {
			return msg.channel.send(`You're not on a slayer task, so you can't autoslay!`);
		}

		const monster = findMonster(usersTask.assignedTask!.monster.name);
		if (!monster) {
			this.client.wtf(new Error(`${msg.author.sanitizedName} couldn't Autoslay `  +
				`monster  with id: ${usersTask.assignedTask!.monster.id}. This shouldn't happen.`))
			return msg.channel.send(invalidMonsterMsg(msg.cmdPrefix));
		}




		if (!monster) return msg.channel.send(invalidMonsterMsg(msg.cmdPrefix));

		if (monster.slayerOnly && !isOnTask) {
			return msg.channel.send(
				`You can't kill ${monster.name}, because you're not on a slayer task.`
			);
		}

		// Check requirements
		const [hasReqs, _reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) {
			this.client.wtf(
				new Error(`${msg.author.sanitizedName} doesn't have requirements to Autoslay `  +
					`monster with id: ${monster.id}. This shouldn't happen.`)
			);
			return msg.channel.send(`An error has occured. :sad:`);
		}

		let [timeToFinish, percentReduced] = reducedTimeFromKC(
			monster,
			msg.author.getKC(monster.id)
		);

		const attackStyles = resolveAttackStyles(msg.author, monster.id)[2];
		const [newTime, skillBoostMsg] = applySkillBoost(msg.author, timeToFinish, attackStyles);

		timeToFinish = newTime;
		boosts.push(skillBoostMsg);

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
		// Add 15% slayer boost on task if they have black mask or similar
		if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask'))) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			boosts.push('15% for Slayer Helmet on task');
		}
		for (const [itemID, boostAmount] of Object.entries(
			msg.author.resolveAvailableItemBoosts(monster)
		)) {
			timeToFinish *= (100 - boostAmount) / 100;
			boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.MonsterKilling);

		// If no quantity provided, set it to the max.
		if (quantity === null || quantity === undefined) {
			quantity = floor(maxTripLength / timeToFinish);
		}
		if (typeof quantity !== 'number') quantity = parseInt(quantity);
		if (isOnTask) {
			quantity = Math.min(quantity, usersTask.currentTask!.quantityRemaining);
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

		let duration = timeToFinish * quantity;
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

		if (boosts.length > 0) {
			response += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (messages.length > 0) {
			response += `\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
}
