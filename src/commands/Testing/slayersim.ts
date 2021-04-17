import { calcWhatPercent, increaseNumByPercent, reduceNumByPercent, round } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Time } from '../../lib/constants';
import { table } from 'table';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	addArrayOfNumbers
} from '../../lib/util';
import {slayerMasters} from "../../lib/slayer/slayerMasters";
import {boostCannon, boostCannonMulti, boostIceBarrage, boostIceBurst} from "../../lib/minions/data/combatConstants";

function applySkillBoostJr(
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
		this.enabled = !this.client.production;
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [option = '']: [null | number | string, string]) {
		if (option !== '') {
			return msg.channel.send('No options accepted at this time');
		}

		// Start sim code
		const simTable: string[][] = [];
		simTable.push(['Master', 'Monster', 'Food/hr', 'Sharks/hr', 'Kills/hr', 'SlayerXP/hr','Cannon', 'KPH', 'MCannon', 'KPH', 'Burst', 'KPH', 'Barrage', 'KPH', 'Boost MSG']);

		slayerMasters.forEach(master => {
			master.tasks.forEach(task => {
				task.monsters.forEach(tmon =>
				{
					const [, osjsMon, attackStyles] = resolveAttackStyles(msg.author, tmon);
					const kMonster = killableMonsters.find(km => {
						return km.id === tmon;
					});
					let [killTime, percentReduced] = reducedTimeFromKC(
						kMonster!,
						1000000
					);
					const [newDuration, boostMsg] = applySkillBoostJr(msg.author, killTime, attackStyles);
					const mSlayerXP = osjsMon?.data?.hitpoints ?
						osjsMon!.data!.slayerXP ?
							osjsMon!.data!.slayerXP :
							osjsMon!.data!.hitpoints
						: 0;

					// add boosts
					let cannonXP = '';
					let killsPerHourCannon = 0;
					let cannonMXP = '';
					let killsPerHourCannonM = 0;
					let barrageXP = '';
					let killsPerHourBarrage = 0;
					let burstXP = '';
					let killsPerHourBurst = 0;
					if (kMonster?.canCannon) {
						if (kMonster?.cannonMulti) {
							const tmpNewDuration = newDuration * (1 - boostCannonMulti/100);
							killsPerHourCannonM = Time.Hour / tmpNewDuration;
							cannonMXP = (killsPerHourCannonM * mSlayerXP).toLocaleString();
						} else {
							const tmpNewDuration = newDuration * (1 - boostCannon/100);
							killsPerHourCannon = Time.Hour / tmpNewDuration;
							cannonXP = (killsPerHourCannon * mSlayerXP).toLocaleString();
						}
					}
					if (kMonster?.canBarrage) {
						const tmpBarrageDuration = newDuration * (1 - boostIceBarrage/100);
						killsPerHourBarrage = Time.Hour / tmpBarrageDuration;
						barrageXP = (killsPerHourBarrage * mSlayerXP).toLocaleString();
						const tmpBurstDuration = newDuration * (1 - boostIceBurst/100);
						killsPerHourBurst = Time.Hour / tmpBurstDuration;
						burstXP = (killsPerHourBurst * mSlayerXP).toLocaleString();
					}

					const killsPerHour = Time.Hour / newDuration;
					let slayerXpPerHour = 'NA';
					slayerXpPerHour = (killsPerHour * mSlayerXP).toLocaleString();

					const foodPerHour = calculateMonsterFood(kMonster!, msg.author)[0] * killsPerHour;
					simTable.push([master!.name, kMonster!.name, Math.round(foodPerHour).toLocaleString(),
						Math.ceil(foodPerHour / 20).toLocaleString(), Math.floor(killsPerHour).toString(),
						slayerXpPerHour, cannonXP, killsPerHourCannon.toLocaleString(), cannonMXP, killsPerHourCannonM.toLocaleString(),  burstXP,
						killsPerHourBurst.toLocaleString(), barrageXP, killsPerHourBarrage.toLocaleString(), `${percentReduced}% for KC, ${boostMsg}`]);
				});
			});
		});
		return msg.channel.sendFile(Buffer.from(table(simTable)), `slayerMonsterSim.txt`);
	}
}
