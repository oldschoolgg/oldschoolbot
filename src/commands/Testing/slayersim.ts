import { calcWhatPercent, increaseNumByPercent, reduceNumByPercent, round } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Time } from '../../lib/constants';
import { bossTasks } from '../../lib/slayer/tasks/bossTasks';
import { table } from 'table';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { UserSettings } from '../../lib/settings/types/UserSettings'
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { userCanUseTask, weightedPick} from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	addArrayOfNumbers, itemNameFromID,
	roll
} from '../../lib/util';
import {SlayerMaster} from "../../lib/slayer/types";
import {slayerMasters} from "../../lib/slayer/slayerMasters";

// boss tasks
export async function assignNewSlayerTask(_user: KlasaUser, master: SlayerMaster) {
	// assignedTask is the task object, currentTask is the database row.
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t, master));
	let bossTask = false;

	/*
	if (
		_user.settings
			.get(UserSettings.Slayer.SlayerUnlocks)
			.includes(SlayerTaskUnlocksEnum.LikeABoss) &&
		(master.name.toLowerCase() === 'konar quo maten' ||
			master.name.toLowerCase() === 'duradel' ||
			master.name.toLowerCase() === 'nieve' ||
			master.name.toLowerCase() === 'chaeldar') &&
		roll(25)
	) {
		bossTask = true;
	}
	console.log(`Boss task? ${bossTask}.`);

	 */
	const assignedTask = bossTask ? weightedPick(bossTasks) : weightedPick(baseTasks);
	//const newUser = await getNewUser(_user.id);

	/*
		const currentTask = new SlayerTaskTable();
		currentTask.user = newUser;
		currentTask.quantity = randInt(assignedTask.amount[0], assignedTask.amount[1]);
		currentTask.quantityRemaining = currentTask.quantity;
		currentTask.slayerMasterID = master.id;
		currentTask.monsterID = assignedTask.monster.id;
		currentTask.skipped = false;
		await currentTask.save();
		*/
	//await _user.settings.update(UserSettings.Slayer.LastTask, assignedTask.monster.id);

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

		if (option === 'tasksim' ) {
			const simTable: string[][] = [];
			simTable.push(['Master', 'Monster', 'Weight', 'Rolls', 'Total Rolls']);
			const tasks = {};
			const iterations = 5000;
			slayerMasters.forEach(master => {
				for (let i = 1; i < iterations; i++) {
					const newTask = assignNewSlayerTask(msg.author, master);
					tasks[newTask!.monster!.name] = tasks[newTask!.monster!.name] ?
						{ ct: tasks[newTask!.monster!.name].ct + 1, weight: tasks[newTask!.monster!.name].weight }
						: { ct: 1, weight: tasks[newTask!.monster!.name].weight };
				}
				Object.keys(tasks).forEach(tstr => {
					simTable.push([master.name, tstr, tasks[tstr].weight.toString(), tasks[tstr].ct.toLocaleString(), iterations.toLocaleString()]);
				});

			});
			return msg.channel.sendFile(Buffer.from(table(simTable)), `slayerMasterTaskSim.txt`);

		}
		// Start sim code
		// TODO Sim code for masters, tasks xp/per hour
		// Sim code for numnber of tasks.
		const simTable: string[][] = [];
		simTable.push(['Master', 'Monster', 'Food/hr', 'Sharks/hr', 'Kills/hr', 'SlayerXP/hr', 'Boost MSG']);

		slayerMasters.forEach(master => {
			master.tasks.forEach(task => {
				const [, osjsMon, attackStyles] = resolveAttackStyles(msg.author, task!.monster!.id);
				const kMonster = killableMonsters.find(km => {
					return km.id === task!.monster.id;
				});
				let [killTime, percentReduced] = reducedTimeFromKC(
					kMonster!,
					msg.author.getKC(task.monster.id)
				);
				const [newDuration, boostMsg] = applySkillBoost(msg.author, killTime, attackStyles);
				// add code to uses boosts maybe?
				const killsPerHour = Time.Hour / newDuration;
				let slayerXpPerHour = 'NA';
				if (osjsMon?.data?.hitpoints) {
					slayerXpPerHour = (osjsMon!.data!.slayerXP ?
						killsPerHour * osjsMon!.data!.slayerXP :
						killsPerHour * osjsMon!.data!.hitpoints).toLocaleString();
				}
				const foodPerHour = calculateMonsterFood(kMonster!, msg.author)[0] * killsPerHour;
				simTable.push([master!.name, kMonster!.name, Math.round(foodPerHour).toLocaleString(),
					Math.ceil(foodPerHour / 20).toLocaleString(), Math.floor(killsPerHour).toString(),
					slayerXpPerHour, `${percentReduced}% for KC, ${boostMsg}`]);

			});
		});

		return msg.channel.sendFile(Buffer.from(table(simTable)), `slayerMonsterSim.txt`);

/*
		// Check requirements
		const [hasReqs, reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) throw reason;

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

		for (const [itemID, boostAmount] of Object.entries(
			msg.author.resolveAvailableItemBoosts(monster)
		)) {
			timeToFinish *= (100 - boostAmount) / 100;
			boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
		}

		// Removed vorkath because he has a special boost.
		if (
			monster.name.toLowerCase() !== 'vorkath' &&
			osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)
		) {
			if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter lance') &&
				!attackStyles.includes(SkillsEnum.Ranged) &&
				!attackStyles.includes(SkillsEnum.Magic)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Dragon hunter lance');
			} else if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
				attackStyles.includes(SkillsEnum.Ranged)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Dragon hunter crossbow');
			}
		}
		// Add 15% slayer boost on task if they have black mask or similar
		if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask (i)'))) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Black mask (i) on non-melee task');
			}
		} else if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask'))) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			boosts.push('15% for Black mask on melee task');
		}

		const maxTripLength = msg.author.maxTripLength(Activity.MonsterKilling);

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = floor(maxTripLength / timeToFinish);
		}
		*/

	}
}
