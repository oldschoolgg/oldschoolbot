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

		let isDragon = false;
		if (monster.name.toLowerCase() !== 'vorkath' && osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)) {
			isDragon = true;
			if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter lance') &&
				!attackStyles.includes(SkillsEnum.Ranged) &&
				!attackStyles.includes(SkillsEnum.Magic)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				ownedBoostItems.push('Dragon hunter lance');
				totalItemBoost += 15;
			} else if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
				attackStyles.includes(SkillsEnum.Ranged)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				ownedBoostItems.push('Dragon hunter crossbow');
				totalItemBoost += 15;
			}
		}
		// poh boosts
		if (monster.pohBoosts) {
			const [boostPercent, messages] = calcPOHBoosts(await msg.author.getPOH(), monster.pohBoosts);
			if (boostPercent > 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
				let boostString = messages.join(' ').replace(RegExp('[0-9]{2}% for '), '');
				ownedBoostItems.push(`${boostString}`);
				totalItemBoost += boostPercent;
			}
		}
		// combat stat boosts
		const skillTotal = addArrayOfNumbers(attackStyles.map(s => user.skillLevel(s)));

		let percent = round(calcWhatPercent(skillTotal, attackStyles.length * 99), 2);

		const str = [`**${monster.name}**\n`];

		let skillString = '';

		if (percent < 50) {
			percent = 50 - percent;
			skillString = `Skills boost: -${percent.toFixed(2)}% for your skills.\n`;
			timeToFinish = increaseNumByPercent(timeToFinish, percent);
		} else {
			percent = Math.min(15, percent / 6.5);
			skillString = `Skills boost: ${percent.toFixed(2)}% for your skills.\n`;
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
		const maxCanKillSlay = Math.floor(
			msg.author.maxTripLength('MonsterKilling') / reduceNumByPercent(timeToFinish, 15)
		);
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
		let itemRequirements = [];
		if (monster.itemsRequired && monster.itemsRequired.length > 0) {
			itemRequirements.push(`**Items Required:** ${formatItemReqs(monster.itemsRequired)}\n`);
		}
		if (monster.itemCost) {
			itemRequirements.push(
				`**Item Cost per Trip:** ${formatItemCosts(monster.itemCost, timeToFinish * maxCanKill)}\n`
			);
		}
		// let gearReductions=[];
		if (monster.healAmountNeeded) {
			let [hpNeededPerKill, gearStats] = calculateMonsterFood(monster, user);
			let gearReductions = gearStats.replace(RegExp(': Reduced from (?:[0-9]+?), '), '\n').replace('), ', ')\n');
			if (hpNeededPerKill > 0) {
				itemRequirements.push(
					`**Healing Required:** ${gearReductions}\nYou require ${
						hpNeededPerKill * maxCanKill
					} hp for a full trip\n`
				);
			} else {
				itemRequirements.push(`**Healing Required:** ${gearReductions}\n**Food boost**: ${hpString}\n`);
			}
		}
		str.push(`${itemRequirements.join('')}`);
		let totalBoost = [];
		if (isDragon) {
			totalBoost.push('15% for Dragon hunter lance OR 15% for Dragon hunter crossbow');
		}
		if (monster.itemInBankBoosts) {
			totalBoost.push(`${formatItemBoosts(monster.itemInBankBoosts)}`);
		}
		if (monster.pohBoosts) {
			totalBoost.push(
				`${formatPohBoosts(monster.pohBoosts)
					.replace(RegExp('(Pool:)'), '')
					.replace(')', '')
					.replace('(', '')
					.replace('\n', '')}`
			);
		}
		if (totalBoost.length > 0) {
			str.push(
				`**Boosts**\nAvailable Boosts: ${totalBoost.join(',')}\n${
					ownedBoostItems.length > 0
						? `Your boosts: ${ownedBoostItems.join(', ')} for ${totalItemBoost}%`
						: ''
				}\n${skillString}`
			);
		} else {
			str.push(`**Boosts**\n${skillString}`);
		}
		str.push('**Trip info**');

		str.push(
			`Maximum trip length: ${formatDuration(
				msg.author.maxTripLength('MonsterKilling')
			)}\nNormal kill time: ${formatDuration(
				monster.timeToFinish
			)}. You can kill up to ${maxCanKill} per trip (${formatDuration(timeToFinish)} per kill).`
		);
		str.push(
			`If you were on a slayer task: ${maxCanKillSlay} per trip (${formatDuration(
				reduceNumByPercent(timeToFinish, 15)
			)} per kill).`
		);
		const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);

		str.push(
			`Every ${kcForOnePercent}kc you will gain a 1% (upto 10%).\nYou currently recieve a ${percentReduced}% boost with your ${userKc}kc.\n`
		);

		const min = timeToFinish * maxCanKill * 1.01;

		const max = timeToFinish * maxCanKill * 1.2;
		str.push(
			`Due to the random variation of an added 1-20% duration, ${maxCanKill}x kills can take between (${formatDuration(
				min
			)} and (${formatDuration(max)})\nIf the Weekend boost is active, it takes: (${formatDuration(
				min * 0.9
			)}) to (${formatDuration(max * 0.9)}) to finish.\n`
		);
		return msg.channel.send(str.join('\n'));
	}
}
