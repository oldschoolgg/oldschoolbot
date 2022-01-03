import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, increaseNumByPercent, reduceNumByPercent, round, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { requiresMinion } from '../../lib/minions/decorators';
import { resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { calcPOHBoosts } from '../../lib/poh';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	addArrayOfNumbers,
	formatDuration,
	formatItemBoosts,
	formatItemCosts,
	formatItemReqs,
	formatPohBoosts,
	itemNameFromID,
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
		const osjsMon = Monsters.get(monster.id);
		const [, , attackStyles] = resolveAttackStyles(user, {
			monsterID: monster.id
		});

		const userKc = msg.author.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0;
		let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, userKc);

		// item boosts
		const ownedBoostItems = [];
		let totalItemBoost = 0;
		for (const [itemID, boostAmount] of Object.entries(msg.author.resolveAvailableItemBoosts(monster))) {
			timeToFinish *= (100 - boostAmount) / 100;
			totalItemBoost += boostAmount;
			ownedBoostItems.push(itemNameFromID(parseInt(itemID)));
		}
		const dragonBoost = [];
		let isDragon = false;
		if (monster.name.toLowerCase() !== 'vorkath' && osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)) {
			isDragon = true;
			if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter lance') &&
				!attackStyles.includes(SkillsEnum.Ranged) &&
				!attackStyles.includes(SkillsEnum.Magic)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				dragonBoost.push('15% for Dragon hunter lance');
			} else if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
				attackStyles.includes(SkillsEnum.Ranged)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				dragonBoost.push('15% for Dragon hunter crossbow');
			}
		}
		// poh boosts
		const ownedPohBoost = [];
		let activePohBoost = false;
		if (monster.pohBoosts) {
			const [boostPercent, messages] = calcPOHBoosts(await msg.author.getPOH(), monster.pohBoosts);
			if (boostPercent > 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
				ownedPohBoost.push(`${messages.join(' ')}`);
				activePohBoost = true;
			}
		}
		// combat stat boosts

		const skillTotal = addArrayOfNumbers(attackStyles.map(s => user.skillLevel(s)));

		let percent = round(calcWhatPercent(skillTotal, attackStyles.length * 99), 2);

		const str = [`**${monster.name}**\n`];

		let skillString = '';

		if (percent < 50) {
			percent = 50 - percent;
			skillString = `**Skills boost:** -${percent.toFixed(2)}% for your skills.\n`;
			timeToFinish = increaseNumByPercent(timeToFinish, percent);
		} else {
			percent = Math.min(15, percent / 6.5);
			skillString = `**Skills boost:** ${percent.toFixed(2)}% for your skills.\n`;
			timeToFinish = reduceNumByPercent(timeToFinish, percent);
		}
		let hpString = '';
		if (monster.healAmountNeeded) {
			const [hpNeededPerKill] = calculateMonsterFood(monster, user);
			if (hpNeededPerKill === 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, 4);
				hpString = '4% boost for no food';
			}
		}

		const maxCanKill = Math.floor(msg.author.maxTripLength('MonsterKilling') / timeToFinish);

		const QP = msg.author.settings.get(UserSettings.QP);

		str.push(`**Barrage/Burst**: ${monster.canBarrage ? 'Yes' : 'No'}`);
		str.push(
			`**Cannon**: ${monster.canCannon ? `Yes, ${monster.cannonMulti ? 'multi' : 'single'} combat area` : 'No'}\n`
		);

		if (monster.qpRequired) {
			str.push(`${monster.name} requires **${monster.qpRequired}qp** to kill, and you have ${QP}qp.\n`);
		}
		if (stringMatches(name, 'shaman') || stringMatches(name, 'lizardman shaman')) {
			const [hasFavour] = gotFavour(user, Favours.Shayzien, 100);
			if (!hasFavour) {
				str.push('You require 100% Shayzien favour\n');
			} else {
				str.push('You meet the required 100% Shayzien favour\n');
			}
		}

		if (monster.itemsRequired && monster.itemsRequired.length > 0) {
			str.push(`**Items Required:** ${formatItemReqs(monster.itemsRequired)}\n`);
		}
		if (monster.itemCost) {
			str.push(`**Item Cost per Kill:** ${formatItemCosts(monster.itemCost, timeToFinish)}\n`);
		}
		// let gearReductions=[];
		if (monster.healAmountNeeded) {
			let [hpNeededPerKill, gearStats] = calculateMonsterFood(monster, user);
			let gearReductions = gearStats.replace(RegExp(': Reduced from (?:[0-9]+?), '), '\n').replace('), ', ')\n');
			if (hpNeededPerKill > 0) {
				str.push(
					`**Healing Required:** ${gearReductions}\nYou require ${
						hpNeededPerKill * maxCanKill
					} hp for a full trip\n`
				);
			} else {
				str.push(`**Healing Required:** ${gearReductions}\n**Food boost**: ${hpString}\n`);
			}
		}
		if (isDragon) {
			str.push('**Boosts:** 15% for Dragon hunter lance OR 15% for Dragon hunter crossbow.\n');
			if (dragonBoost.length > 0) {
				str.push(`**Your boosts** ${dragonBoost}\n`);
			}
		}

		if (monster.itemInBankBoosts) {
			str.push(
				`**Available Boosts**: ${formatItemBoosts(monster.itemInBankBoosts)
					.replace('(', '')
					.replace(')', '')}.\n`
			);
		}
		if (totalItemBoost) {
			str.push(`**Your boosts**: ${ownedBoostItems.join(', ')} for a total boost of **${totalItemBoost}**%.\n`);
		}

		str.push(skillString);

		if (monster.pohBoosts) {
			str.push(
				`**Player Owned House Boosts:**\n${formatPohBoosts(monster.pohBoosts)
					.replace('(', '')
					.replace(')', '')}`
			);
			if (activePohBoost) {
				str.push(`You get ${ownedPohBoost}\n`);
			}
		}

		str.push(`**Normal kill time**: ${formatDuration(monster.timeToFinish)}.`);

		const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);
		str.push(`Every ${kcForOnePercent}kc you will gain a 1% (upto 10%)`);

		str.push(`You currently recieve a ${percentReduced}% boost with your ${userKc}kc.\n`);

		str.push(`**Maximum Trip Length:** ${formatDuration(msg.author.maxTripLength('MonsterKilling'))}.\n`);

		str.push(`**Maximum kills per trip**: ${maxCanKill} (${formatDuration(timeToFinish)} per kill).\n`);

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
