import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { Activity, Time } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { requiresMinion } from '../../lib/minions/decorators';
import { resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { calcPOHBoosts } from '../../lib/poh';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	addArrayOfNumbers,
	calcWhatPercent,
	formatDuration,
	formatItemBoosts,
	formatItemReqs,
	formatPohBoosts,
	itemNameFromID,
	reduceNumByPercent,
	round,
	stringMatches
} from '../../lib/util';
import findMonster from '../../lib/util/findMonster';

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 1,
			usage: '[name:...string]',
			categoryFlags: ['minion', 'pvm'],
			description: 'Shows information on a monster, and how long you take to kill it.',
			examples: ['+monster vorkath']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [name = '']: [string]) {
		const monster = findMonster(name);
		const user = msg.author;

		if (stringMatches(name, 'nightmare')) {
			return msg.channel.send(
				'The Nightmare is not supported by this command due to the complexity of the fight.'
			);
		}

		if (!monster) {
			return msg.channel.send({
				content: "That's not a valid monster to kill. See attached file for list of killable monsters.",
				files: [
					new MessageAttachment(
						Buffer.from(killableMonsters.map(mon => mon.name).join('\n')),
						'killableMonsters.txt'
					)
				]
			});
		}

		const userKc = user.getKC(monster.id);
		let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, userKc);

		const ownedBoostItems = [];
		let totalItemBoost = 0;
		for (const [itemID, boostAmount] of Object.entries(user.resolveAvailableItemBoosts(monster))) {
			timeToFinish *= (100 - boostAmount) / 100;
			totalItemBoost += boostAmount;
			ownedBoostItems.push(itemNameFromID(parseInt(itemID)));
		}

		if (monster.pohBoosts) {
			const [boostPercent] = calcPOHBoosts(await msg.author.getPOH(), monster.pohBoosts);
			if (boostPercent > 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
			}
		}

		const [, osjsMon, attackStyles] = resolveAttackStyles(user, {
			monsterID: monster.id
		});

		const skillTotal = addArrayOfNumbers(attackStyles.map(s => user.skillLevel(s)));

		let percent = round(calcWhatPercent(skillTotal, attackStyles.length * 99), 2);

		const str = [`**${monster.name}**\n`];

		let skillString = '';

		if (percent < 50) {
			percent = 50 - percent;
			skillString = `**Skills boost:** -${percent.toFixed(2)}% for your skills.\n`;
		} else {
			percent = Math.min(15, percent / 6.5);
			skillString = `**Skills boost:** ${percent.toFixed(2)}% for your skills.\n`;
		}

		timeToFinish = reduceNumByPercent(timeToFinish, percent);

		const maxCanKill = Math.floor(user.maxTripLength(Activity.MonsterKilling) / timeToFinish);

		const QP = user.settings.get(UserSettings.QP);

		str.push(`**Barrage/Burst**: ${monster.canBarrage ? 'Yes' : 'No'}`);
		str.push(
			`**Cannon**: ${monster.canCannon ? `Yes, ${monster.cannonMulti ? 'multi' : 'single'} combat area` : 'No'}\n`
		);

		if (monster.qpRequired) {
			str.push(`**${monster.qpRequired}qp** to kill, and you have ${QP}qp.\n`);
		}
		if (monster.itemsRequired && monster.itemsRequired.length > 0) {
			str.push(`**Items Required:** ${formatItemReqs(monster.itemsRequired)}\n`);
		}

		if (monster.healAmountNeeded) {
			str.push(`**Healing Required:** ${monster.healAmountNeeded}hp per kill`);
			const [hpNeededPerKill] = calculateMonsterFood(monster, user);
			str.push(
				`With your current gear you only need ${hpNeededPerKill}hp (${(
					100 - calcWhatPercent(hpNeededPerKill, monster.healAmountNeeded)
				).toFixed(2)}% less)\n ${hpNeededPerKill * maxCanKill}hp for a full trip.\n`
			);
		}

		if (monster.itemInBankBoosts) {
			str.push(`**Boosts:** ${formatItemBoosts(monster.itemInBankBoosts)}.\n`);
			if (totalItemBoost) {
				str.push(`You own ${ownedBoostItems.join(', ')} for a total boost of **${totalItemBoost}**%.\n`);
			}
		}

		str.push(skillString);

		if (monster.pohBoosts) {
			str.push(`**Player Owned House Boosts:**\n${formatPohBoosts(monster.pohBoosts)}`);
		}

		// Removed vorkath because he has a special boost.
		if (monster.name.toLowerCase() !== 'vorkath' && osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)) {
			if (
				!monster.disallowedAttackStyles ||
				!monster.disallowedAttackStyles.includes(SkillsEnum.Attack) ||
				!monster.disallowedAttackStyles.includes(SkillsEnum.Strength)
			) {
				str.push('You get 15% for Dragon hunter lance if you use melee.');
			}
			if (!monster.disallowedAttackStyles || !monster.disallowedAttackStyles.includes(SkillsEnum.Ranged)) {
				str.push('You get 15% for Dragon hunter crossbow if you use ranged.');
			}
			str.push('');
		}

		str.push(`The normal time to kill ${monster.name} is ${formatDuration(monster.timeToFinish)}.`);

		const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);
		str.push(
			`This time can be reduced through experience gained by killing the monster, every ${kcForOnePercent}kc you will gain a 1% boost to kill efficiency up to a maximum of 10% at ${
				kcForOnePercent * 10
			}kc.`
		);

		str.push(`You currently recieve a ${percentReduced}% boost with your ${userKc}kc.\n`);

		str.push(`**Maximum Trip Length:** ${formatDuration(user.maxTripLength(Activity.MonsterKilling))}.\n`);

		str.push(
			`This means the most you can kill with your current boosts is ${maxCanKill} (${formatDuration(
				timeToFinish
			)} per kill).\n`
		);

		const min = timeToFinish * maxCanKill * 1.01;
		const max = timeToFinish * maxCanKill * 1.2;
		str.push(
			`Due to the random variation of an added 1-20% duration, ${maxCanKill}x kills can take between (${formatDuration(
				min
			)}) and (${formatDuration(max)})\n`
		);

		str.push(
			`If the Weekend boost is active, it takes: (${formatDuration(min * 0.9)}) to (${formatDuration(
				max * 0.9
			)}) to finish.\n`
		);

		return msg.channel.send(str.join('\n'));
	}
}
