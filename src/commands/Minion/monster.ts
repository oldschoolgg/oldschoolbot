import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { requiresMinion } from '../../lib/minions/decorators';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	calcWhatPercent,
	formatDuration,
	formatItemBoosts,
	formatItemReqs,
	itemNameFromID
} from '../../lib/util';
import { findMonster } from '../../lib/util/findMonster';

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

		if (!monster) {
			return msg.send(
				`Thats not a valid monster to kill. Valid monsters are ${killableMonsters
					.map(mon => mon.name)
					.join(', ')}.`
			);
		}

		const userKc = msg.author.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0;
		let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, userKc);

		const ownedBoostItems = [];
		let totalItemBoost = 0;
		if (monster.itemInBankBoosts) {
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				if (!msg.author.hasItemEquippedOrInBank(parseInt(itemID))) continue;
				timeToFinish *= (100 - boostAmount) / 100;
				totalItemBoost += boostAmount;
				ownedBoostItems.push(itemNameFromID(parseInt(itemID)));
			}
		}
		const maxCanKill = Math.floor(
			msg.author.maxTripLength(Activity.MonsterKilling) / timeToFinish
		);

		const QP = msg.author.settings.get(UserSettings.QP);

		const str = [];
		if (monster.qpRequired) {
			str.push(
				`${monster.name} requires **${monster.qpRequired}qp** to kill, and you have ${QP}qp.\n`
			);
		}
		if (monster.itemsRequired && monster.itemsRequired.length > 0) {
			str.push(`**Items Required:** ${formatItemReqs(monster.itemsRequired)}\n`);
		}

		if (monster.healAmountNeeded && 1 > 2) {
			str.push(`**Healing Required:** ${monster.healAmountNeeded}hp per kill`);
			const [hpNeededPerKill] = calculateMonsterFood(monster, msg.author);
			str.push(
				`With your current gear you only need ${hpNeededPerKill}hp (${
					100 - calcWhatPercent(hpNeededPerKill, monster.healAmountNeeded)
				}% less)\n ${hpNeededPerKill * maxCanKill}hp for a full trip.\n`
			);
		}

		if (monster.itemInBankBoosts) {
			str.push(`**Boosts:** ${formatItemBoosts(monster.itemInBankBoosts)}.\n`);
			if (totalItemBoost) {
				str.push(
					`You own ${ownedBoostItems.join(
						', '
					)} for a total boost of **${totalItemBoost}**\n`
				);
			}
		}

		str.push(
			`The normal time to kill ${monster.name} is ${formatDuration(monster.timeToFinish)}.`
		);

		const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);
		str.push(
			`This time can be reduced through experience gained by killing the monster, every ${kcForOnePercent}kc you will gain a 1% boost to kill efficiency up to a maximum of 10% at ${
				kcForOnePercent * 10
			}kc.`
		);

		str.push(`You currently recieve a ${percentReduced}% boost with your ${userKc}kc.\n`);

		str.push(
			`**Maximum Trip Length:** ${formatDuration(
				msg.author.maxTripLength(Activity.MonsterKilling)
			)}.\n`
		);

		str.push(
			`This means the most you can kill with your current item and KC boosts is ${maxCanKill} (${formatDuration(
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
			`If the Weekend boost is active, it takes: (${formatDuration(
				min * 0.9
			)}) to (${formatDuration(max * 0.9)}) to finish.\n`
		);

		return msg.send(str.join('\n'));
	}
}
