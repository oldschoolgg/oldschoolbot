import { calcWhatPercent, increaseNumByPercent, reduceNumByPercent, round } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { table } from 'table';

import { Time } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import { userCanUseTask, weightedPick } from '../../lib/slayer/slayerUtil';
import { bossTasks } from '../../lib/slayer/tasks/bossTasks';
import { SlayerMaster } from '../../lib/slayer/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addArrayOfNumbers } from '../../lib/util';

// boss tasks
export function assignNewSlayerTask(_user: KlasaUser, master: SlayerMaster) {
	// assignedTask is the task object, currentTask is the database row.
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t, master));
	let bossTask = false;

	const assignedTask = bossTask ? weightedPick(bossTasks) : weightedPick(baseTasks);
	return assignedTask;
}
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
			usage: '[option:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to kill monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [option = '']: [null | number | string, string]) {
		if (option !== '') {
			return msg.send('No options supported at this time');
		}
		// Start sim code
		const simTable: string[][] = [];
		simTable.push([
			'Master',
			'Monster',
			'Food/hr',
			'Sharks/hr',
			'Kills/hr',
			'SlayerXP/hr',
			'Boost MSG'
		]);

		slayerMasters.forEach(master => {
			master.tasks.forEach(task => {
				task.monsters.forEach(tmon => {
					const [, osjsMon, attackStyles] = resolveAttackStyles(msg.author, tmon);
					const kMonster = killableMonsters.find(km => {
						return km.id === tmon;
					});
					let [killTime, percentReduced] = reducedTimeFromKC(
						kMonster!,
						msg.author.getKC(task.monster.id)
					);
					const [newDuration, boostMsg] = applySkillBoost(
						msg.author,
						killTime,
						attackStyles
					);

					const killsPerHour = Time.Hour / newDuration;
					let slayerXpPerHour = 'NA';
					if (osjsMon?.data?.hitpoints) {
						slayerXpPerHour = (osjsMon!.data!.slayerXP
							? killsPerHour * osjsMon!.data!.slayerXP
							: killsPerHour * osjsMon!.data!.hitpoints
						).toLocaleString();
					}
					const foodPerHour =
						calculateMonsterFood(kMonster!, msg.author)[0] * killsPerHour;
					simTable.push([
						master!.name,
						kMonster!.name,
						Math.round(foodPerHour).toLocaleString(),
						Math.ceil(foodPerHour / 20).toLocaleString(),
						Math.floor(killsPerHour).toString(),
						slayerXpPerHour,
						`${percentReduced}% for KC, ${boostMsg}`
					]);
				});
			});
		});
		return msg.channel.sendFile(Buffer.from(table(simTable)), `slayerMonsterSim.txt`);
	}
}
