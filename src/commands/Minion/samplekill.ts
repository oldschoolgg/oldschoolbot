import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import killableMonsters from '../../lib/killableMonsters';
import { findMonster, itemNameFromID, formatDuration, isWeekend } from '../../lib/util';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { formatItemReqs } from '../../lib/util/formatItemReqs';

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[name:...string]',
			usageDelim: ''
		});
	}

	async run(msg: KlasaMessage, [name = '']: [string]) {
		await msg.author.settings.sync(true);
		if (!msg.author.hasMinion) {
			throw `You don't have a minion yet. You can buy one by typing \`${msg.cmdPrefix}minion buy\`.`;
		}

		const monster = findMonster(name);

		if (!monster)
			throw `Thats not a valid monster to kill. Valid monsters are ${killableMonsters
				.map(mon => mon.name)
				.join(', ')}.`;

		let [timeToFinish] = reducedTimeFromKC(
			monster,
			msg.author.settings.get(UserSettings.MonsterScores)[monster.id] ?? 1
		);

		let str = `**Here's the info about that monster based on your account.**\n`;

		if (monster.itemInBankBoosts) {
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				if (!msg.author.hasItemEquippedOrInBank(parseInt(itemID))) continue;
				timeToFinish *= (100 - boostAmount) / 100;
			}
		}

		const maxCanKill = Math.floor(msg.author.maxTripLength / timeToFinish);
		str += `The normal time to kill ${monster.name} is ${formatDuration(
			monster.timeToFinish
		)}. The most you can kill is ${maxCanKill} with a time per kill of ${formatDuration(
			timeToFinish
		)}.\n`;

		const min = timeToFinish * maxCanKill;
		const max = timeToFinish * maxCanKill * 1.2;
		str += `Due to the random variation of up to 20%, this means ${maxCanKill}x kills will take from (${formatDuration(
			min
		)}) to (${formatDuration(max)}) to finish. `;

		if (isWeekend()) {
			str += `Because of the 10% weekend boost it will now take from (${formatDuration(
				min * 0.9
			)}) to (${formatDuration(max * 0.9)}) to finish.`;
		}

		const QP = msg.author.settings.get(UserSettings.QP);
		if (monster.qpRequired) {
			str += `\n${monster.name} requires ${monster.qpRequired}qp to kill, and you have ${QP}qp.`;
		}
		if (monster.itemsRequired.length > 0) {
			str += `\n\nThese items are required to kill ${monster.name}: ${formatItemReqs(
				monster.itemsRequired
			)}`;
		}
		if (monster.itemInBankBoosts) {
			str += `\n\nThese items provide boosts for ${monster.name}: `;
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				str += `${boostAmount}% boost for ${itemNameFromID(parseInt(itemID))}, `;
			}
			str = str.replace(/,\s*$/, '\n');
		}
		return msg.send(str);
	}
}
