import { randFloat, randInt } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, Monsters, MonsterSlayerMaster } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';
import { MoreThan } from 'typeorm';

import { CombatOptionsEnum } from '../minions/data/combatConstants';
import { DetermineBoostParams } from '../minions/types';
import { getNewUser } from '../settings/settings';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { SlayerTaskTable } from '../typeorm/SlayerTaskTable.entity';
import { addBanks, bankHasItem, roll, skillsMeetRequirements } from '../util';
import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
import { slayerMasters } from './slayerMasters';
import { SlayerRewardsShop, SlayerTaskUnlocksEnum } from './slayerUnlocks';
import { bossTasks } from './tasks/bossTasks';
import { AssignableSlayerTask, SlayerMaster } from './types';

export enum AutoslayOptionsEnum {
	Reserved,
	HighestUnlocked,
	MaxEfficiency,
	LowestCombat
}

export enum SlayerMasterEnum {
	Reserved,
	Turael,
	Mazchna,
	Vannaka,
	Chaeldar,
	Konar,
	Nieve,
	Duradel
}

export function determineBoostChoice(params: DetermineBoostParams) {
	let boostChoice = 'none';

	if (params.msg.flagArgs.none || (params.method && params.method === 'none')) {
		return boostChoice;
	}
	if (params.msg.flagArgs.barrage || (params.method && params.method === 'barrage')) {
		boostChoice = 'barrage';
	} else if (params.msg.flagArgs.burst || (params.method && params.method === 'burst')) {
		boostChoice = 'burst';
	} else if (params.msg.flagArgs.cannon || (params.method && params.method === 'cannon')) {
		boostChoice = 'cannon';
	} else if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBarrage) && params.monster!.canBarrage) {
		boostChoice = 'barrage';
	} else if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBurst) && params.monster!.canBarrage) {
		boostChoice = 'burst';
	} else if (params.cbOpts.includes(CombatOptionsEnum.AlwaysCannon)) {
		boostChoice = 'cannon';
	}

	if (boostChoice === 'barrage' && params.msg.author.skillLevel(SkillsEnum.Magic) < 94) {
		boostChoice = 'burst';
	}
	return boostChoice;
}

export function calculateSlayerPoints(currentStreak: number, master: SlayerMaster) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];

	if (currentStreak < 5) {
		return 0;
	}
	for (let i = 0; i < streaks.length; i++) {
		if (currentStreak >= streaks[i] && currentStreak % streaks[i] === 0) {
			return master.basePoints * multiplier[i];
		}
	}
	return master.basePoints;
}

export function weightedPick(filteredTasks: AssignableSlayerTask[]) {
	let totalweight = 0;
	for (let i = 0; i < filteredTasks.length; i++) {
		totalweight += filteredTasks[i].weight;
	}
	const randomWeight = randFloat(1, totalweight);

	let result = 0;
	let weight = 0;

	for (let i = 0; i < filteredTasks.length; i++) {
		weight += filteredTasks[i].weight;
		if (randomWeight <= weight) {
			result = i;
			break;
		}
	}

	let task = filteredTasks[result];

	return task;
}

export function userCanUseMaster(user: KlasaUser, master: SlayerMaster) {
	return (
		user.settings.get(UserSettings.QP) >= (master.questPoints ?? 0) &&
		user.skillLevel(SkillsEnum.Slayer) >= (master.slayerLvl ?? 0) &&
		user.combatLevel >= (master.combatLvl ?? 0)
	);
}

export function userCanUseTask(
	user: KlasaUser,
	task: AssignableSlayerTask,
	master: SlayerMaster,
	allowBossTasks: boolean = false
) {
	if (task.isBoss && !allowBossTasks) return false;
	if (task.dontAssign) return false;
	const myLastTask = user.settings.get(UserSettings.Slayer.LastTask);
	if (myLastTask === task.monster.id) return false;
	if (task.combatLevel && task.combatLevel > user.combatLevel) return false;
	if (task.questPoints && task.questPoints > user.settings.get(UserSettings.QP)) return false;
	if (task.slayerLevel && task.slayerLevel > user.skillLevel(SkillsEnum.Slayer)) return false;
	if (task.levelRequirements && !skillsMeetRequirements(user.rawSkills, task.levelRequirements)) return false;
	const myBlockList = user.settings.get(UserSettings.Slayer.BlockedTasks) ?? [];
	if (myBlockList.includes(task.monster.id)) return false;
	const myUnlocks = user.settings.get(UserSettings.Slayer.SlayerUnlocks);
	// Slayer unlock restrictions:
	const lmon = task.monster.name.toLowerCase();
	const lmast = master.name.toLowerCase();
	if (lmon === 'grotesque guardians' && !bankHasItem(user.bank().bank, itemID('Brittle key'))) return false;
	if (lmon === 'lizardman' && !myUnlocks.includes(SlayerTaskUnlocksEnum.ReptileGotRipped)) return false;
	if (lmon === 'red dragon' && !myUnlocks.includes(SlayerTaskUnlocksEnum.SeeingRed)) return false;
	if (lmon === 'mithril dragon' && !myUnlocks.includes(SlayerTaskUnlocksEnum.IHopeYouMithMe)) return false;
	if (lmon === 'aviansie' && !myUnlocks.includes(SlayerTaskUnlocksEnum.WatchTheBirdie)) return false;
	if (lmon === 'tzhaar-ket' && !myUnlocks.includes(SlayerTaskUnlocksEnum.HotStuff)) return false;
	if (lmon === 'spitting wyvern' && myUnlocks.includes(SlayerTaskUnlocksEnum.StopTheWyvern)) return false;
	if (
		lmon === 'feral vampyre' &&
		(lmast === 'konar quo maten' || lmast === 'duradel' || lmast === 'nieve' || lmast === 'chaeldar') &&
		!myUnlocks.includes(SlayerTaskUnlocksEnum.ActualVampyreSlayer)
	)
		return false;
	if (
		lmon === 'basilisk' &&
		(lmast === 'konar quo maten' || lmast === 'duradel' || lmast === 'nieve') &&
		!myUnlocks.includes(SlayerTaskUnlocksEnum.Basilocked)
	)
		return false;
	return true;
}

export async function assignNewSlayerTask(_user: KlasaUser, master: SlayerMaster) {
	// assignedTask is the task object, currentTask is the database row.
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t, master, false));
	let bossTask = false;
	if (
		_user.settings.get(UserSettings.Slayer.SlayerUnlocks).includes(SlayerTaskUnlocksEnum.LikeABoss) &&
		(master.name.toLowerCase() === 'konar quo maten' ||
			master.name.toLowerCase() === 'duradel' ||
			master.name.toLowerCase() === 'nieve' ||
			master.name.toLowerCase() === 'chaeldar') &&
		roll(25)
	) {
		bossTask = true;
	}

	let assignedTask: AssignableSlayerTask | null = null;
	if (bossTask) {
		const baseBossTasks = bossTasks.filter(t => userCanUseTask(_user, t, master, true));
		if (baseBossTasks.length) {
			assignedTask = weightedPick(baseBossTasks);
		} else {
			assignedTask = weightedPick(baseTasks);
		}
	} else {
		assignedTask = weightedPick(baseTasks);
	}

	const newUser = await getNewUser(_user.id);

	const currentTask = new SlayerTaskTable();
	currentTask.user = newUser;
	currentTask.quantity = randInt(assignedTask!.amount[0], assignedTask!.amount[1]);
	currentTask.quantityRemaining = currentTask.quantity;
	currentTask.slayerMasterID = master.id;
	currentTask.monsterID = assignedTask!.monster.id;
	currentTask.skipped = false;
	await currentTask.save();
	await _user.settings.update(UserSettings.Slayer.LastTask, assignedTask!.monster.id);

	return { currentTask, assignedTask };
}

export function calcMaxBlockedTasks(qps: number) {
	// 6 Blocks total 5 for 250 qps, + 1 for lumby.
	// For now we're do 1 free + 1 for every 50 qps.
	return Math.min(1 + Math.floor(qps / 50), 6);
}
export function getCommonTaskName(task: Monster) {
	let commonName = task.name;
	switch (task.id) {
		case Monsters.KalphiteWorker.id:
			commonName = 'Kalphite';
			break;
		case Monsters.MountainTroll.id:
			commonName = 'Troll';
			break;
		case Monsters.FossilIslandWyvernSpitting.id:
			commonName = 'Fossil Island Wyvern';
			break;
		case Monsters.FeralVampyre.id:
			commonName = 'Vampyre';
			break;
		case Monsters.ElfWarrior.id:
			commonName = 'Elves';
			break;
		case Monsters.SpiritualRanger.id:
		case Monsters.SpiritualMage.id:
			commonName = 'Spiritual Creature';
			break;
		case Monsters.BlackBear.id:
			commonName = 'Bear';
			break;
		case Monsters.GuardDog.id:
			commonName = 'Dog';
			break;
		case Monsters.TzHaarKet.id:
			commonName = 'TzHaar';
			break;
		default:
	}
	if (commonName !== 'TzHaar' && !commonName.endsWith('s')) commonName += 's';
	return commonName;
}
export async function getUsersCurrentSlayerInfo(id: string) {
	const [currentTask, totalTasksDone] = await Promise.all([
		SlayerTaskTable.findOne({
			where: {
				user: id,
				quantityRemaining: MoreThan(0),
				skipped: false
			}
		}),
		SlayerTaskTable.count({ where: { user: id, quantityRemaining: 0, skipped: false } })
	]);

	const slayerMaster = currentTask ? slayerMasters.find(master => master.id === currentTask.slayerMasterID) : null;

	return {
		currentTask: currentTask ?? null,
		assignedTask: currentTask ? slayerMaster!.tasks.find(m => m.monster.id === currentTask.monsterID)! : null,
		totalTasksDone,
		slayerMaster
	};
}

export const allSlayerHelmets = [
	'Slayer helmet',
	'Slayer helmet (i)',
	'Black slayer helmet',
	'Black slayer helmet (i)',
	'Green slayer helmet',
	'Green slayer helmet (i)',
	'Red slayer helmet',
	'Red slayer helmet (i)',
	'Purple slayer helmet',
	'Purple slayer helmet (i)',
	'Turquoise slayer helmet',
	'Turquoise slayer helmet (i)',
	'Hydra slayer helmet',
	'Hydra slayer helmet (i)',
	'Twisted slayer helmet',
	'Twisted slayer helmet (i)'
];

export function getSlayerMasterOSJSbyID(slayerMasterID: number) {
	const osjsSlayerMaster = [
		MonsterSlayerMaster.Turael,
		MonsterSlayerMaster.Turael,
		MonsterSlayerMaster.Mazchna,
		MonsterSlayerMaster.Vannaka,
		MonsterSlayerMaster.Chaeldar,
		MonsterSlayerMaster.Konar,
		MonsterSlayerMaster.Nieve,
		MonsterSlayerMaster.Duradel,
		MonsterSlayerMaster.Krystilia
	];
	return osjsSlayerMaster[slayerMasterID];
}

export function getSlayerReward(id: SlayerTaskUnlocksEnum): string {
	const { name } = SlayerRewardsShop.find(srs => {
		return srs!.id === id;
	})!;
	return name;
}
export function hasSlayerUnlock(
	myUnlocks: SlayerTaskUnlocksEnum[] | number[],
	required: SlayerTaskUnlocksEnum[] | number[]
) {
	const missing: string[] = [];
	let success = true;
	let errors = '';

	required.forEach(req => {
		if (!myUnlocks.includes(req)) {
			success = false;
			missing.push(getSlayerReward(req as SlayerTaskUnlocksEnum));
		}
	});

	errors = missing.join(', ');
	return { success, errors };
}

export function filterLootReplace(myBank: Bank, myLoot: Bank) {
	// Order: Fang, eye, heart.
	const numBlackMask = myLoot.amount('Black mask (10)');
	let numHydraEyes = myLoot.amount("Hydra's eye");
	numHydraEyes += myLoot.amount("Hydra's fang");
	numHydraEyes += myLoot.amount("Hydra's heart");
	const numDarkTotemBases = myLoot.amount('Dark totem base');
	const numBludgeonPieces = myLoot.amount('Bludgeon claw');
	const ringPieces = resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"]) as number[];
	const totemPieces = resolveItems(['Dark totem base', 'Dark totem middle', 'Dark totem top']) as number[];
	const bludgeonPieces = resolveItems(['Bludgeon claw', 'Bludgeon spine', 'Bludgeon axon']) as number[];

	myLoot.filter(l => {
		return (
			l.id !== 420 &&
			l.id !== itemID('Black mask (10)') &&
			l.id !== itemID("Hydra's eye") &&
			l.id !== itemID("Hydra's fang") &&
			l.id !== itemID("Hydra's heart") &&
			l.id !== itemID('Dark totem base') &&
			l.id !== itemID('Dark totem middle') &&
			l.id !== itemID('Dark totem top') &&
			l.id !== itemID('Bludgeon claw')
		);
	}, true);

	const myClLoot = new Bank(myLoot.bank);

	if (numBlackMask) {
		for (let x = 0; x < numBlackMask; x++) {
			myLoot.add('Black mask');
			myClLoot.add('Black mask (10)');
		}
	}
	if (numBludgeonPieces) {
		for (let x = 0; x < numBludgeonPieces; x++) {
			const bank: number[] = [];
			const combinedBank = addBanks([myBank.bank, myLoot.bank]);
			for (const piece of bludgeonPieces) {
				bank.push(combinedBank[piece] ?? 0);
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(bludgeonPieces[i]);
					myClLoot.add(bludgeonPieces[i]);
					break;
				}
			}
		}
	}
	if (numDarkTotemBases) {
		for (let x = 0; x < numDarkTotemBases; x++) {
			const bank: number[] = [];
			const combinedBank = addBanks([myBank.bank, myLoot.bank]);
			for (const piece of totemPieces) {
				bank.push(combinedBank[piece] ?? 0);
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(totemPieces[i]);
					myClLoot.add(totemPieces[i]);
					break;
				}
			}
		}
	}
	if (numHydraEyes) {
		for (let x = 0; x < numHydraEyes; x++) {
			const bank: number[] = [];
			const combinedBank = addBanks([myBank.bank, myLoot.bank]);
			for (const piece of ringPieces) {
				bank.push(combinedBank[piece] ?? 0);
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(ringPieces[i]);
					myClLoot.add(ringPieces[i]);
					break;
				}
			}
		}
	}
	return {
		bankLoot: myLoot,
		clLoot: myClLoot
	};
}
