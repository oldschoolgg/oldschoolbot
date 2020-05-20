import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { formatDuration, isWeekend, itemNameFromID } from '../../lib/util';
import findMonster from '../../lib/minions/functions/findMonster';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { formatItemReqs } from '../../lib/util/formatItemReqs';
import { formatItemBoosts } from '../../lib/util/formatItemBoosts';
import { Time } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 1,
			usage: '[name:...string]'
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [name = '']: [string]) {
		const monster = findMonster(name);

		if (!monster) {
			throw `Thats not a valid monster to kill. Valid monsters are ${killableMonsters
				.map(mon => mon.name)
				.join(', ')}.`;
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

		const str = [];

		const QP = msg.author.settings.get(UserSettings.QP);
		if (monster.qpRequired) {
			str.push(
				`${monster.name} requires ${monster.qpRequired}qp to kill, and you have ${QP}qp.\n`
			);
		}
		if (monster.itemsRequired && monster.itemsRequired.length > 0) {
			str.push(
				`These items are required to kill ${monster.name}: ${formatItemReqs(
					monster.itemsRequired
				)}\n`
			);
		}
		if (monster.itemInBankBoosts) {
			str.push(
				`These items provide boosts for ${monster.name}: ${formatItemBoosts(
					monster.itemInBankBoosts
				)}.`
			);
			if (totalItemBoost) {
				str.push(
					`You own ${ownedBoostItems.join(', ')} for a total boost of ${totalItemBoost}\n`
				);
			}
		}

		const maxCanKill = Math.floor(msg.author.maxTripLength / timeToFinish);
		str.push(
			`The normal time to kill ${monster.name} is ${formatDuration(monster.timeToFinish)}.`
		);

		const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);
		str.push(
			`This time can be reduced through experience gained by killing the monster, every ${kcForOnePercent}kc you will gain a 1% boost to kill efficiency up to a maximum of 10% at ${kcForOnePercent *
				10}kc.`
		);

		str.push(
			`You currently recieve a ${percentReduced}% efficiency bonus with your ${userKc}kc.\n`
		);

		str.push(
			`The maximum time your minion can be out on a trip is ${formatDuration(
				msg.author.maxTripLength
			)}.`
		);

		str.push(
			`This means the most you can kill with your current item and KC boosts is ${maxCanKill} with a time per kill of ${formatDuration(
				timeToFinish
			)}.\n`
		);

		const min = timeToFinish * maxCanKill * 1.01;
		const max = timeToFinish * maxCanKill * 1.2;
		str.push(
			`Due to the random variation of an added 1-20% duration, ${maxCanKill}x kills will take from (${formatDuration(
				min
			)}) to (${formatDuration(max)}) to finish.\n`
		);

		if (isWeekend()) {
			str.push(
				`Because of the 10% weekend boost it will now take from (${formatDuration(
					min * 0.9
				)}) to (${formatDuration(max * 0.9)}) to finish.\n`
			);
		}

		return msg.send(str.join('\n'));
	}
}
