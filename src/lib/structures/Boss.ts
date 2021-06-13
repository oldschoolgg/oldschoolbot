import { MessageAttachment, TextChannel } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, randFloat, reduceNumByPercent, sumArr } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { table } from 'table';

// import { calcDwwhChance } from '../../tasks/minions/minigames/kingGoldemarActivity';
import { Activity } from '../constants';
import { GearSetupTypes, GearStats } from '../gear';
import { Skills } from '../types';
import { NewBossOptions } from '../types/minions';
import { formatDuration, formatSkillRequirements, updateBankSetting } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { Gear } from './Gear';
import { Mass } from './Mass';

export const gpCostPerKill = (user: KlasaUser) =>
	user.getGear('melee').hasEquipped(['Ring of charos', 'Ring of charos(a)'], false)
		? 5_000_000
		: 10_000_000;

export const calcDwwhChance = (users: KlasaUser[]) => {
	const size = Math.min(users.length, 10);
	const baseRate = 850;
	const modDenominator = 15;

	let dropRate = (baseRate / 2) * (1 + size / modDenominator);
	let groupRate = Math.ceil(dropRate / size);
	groupRate = Math.ceil(groupRate);

	if (users.some(u => u.getGear('melee').hasEquipped('Ring of luck'))) {
		groupRate = Math.floor(reduceNumByPercent(groupRate, 15));
	}
	return groupRate;
};

export type UserDenyResult = [true, string] | [false];

function teamSizeBoostPercent(size: number) {
	switch (size) {
		case 1:
			return -5;
		case 2:
			return 15;
		case 3:
			return 19;
		case 4:
			return 21;
		case 5:
			return 23;
		case 6:
			return 26;
		case 7:
			return 29;
		default:
			return 31;
	}
}

export function calcFood(solo: boolean, kc: number) {
	const items = new Bank();

	let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
	if (solo) brewsNeeded += 2;
	const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));

	items.add('Saradomin brew(4)', brewsNeeded + 1);
	items.add('Super restore(4)', restoresNeeded);
	return items;
}

function calcSetupPercent(
	maxGear: Gear,
	userGear: Gear,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[]
) {
	const maxStats = maxGear.stats;
	const userStats = userGear.stats;
	let numKeys = 0;
	let totalPercent = 0;

	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0 || ignoreStats.includes(key)) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent;
		numKeys++;
	}

	totalPercent /= numKeys;

	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}

	if (isNaN(totalPercent) || totalPercent < 0 || totalPercent > 100) {
		throw new Error(`Invalid total gear percent.`);
	}

	return totalPercent;
}

interface BossOptions {
	id: number;
	baseDuration: number;
	baseFoodRequired: number;
	skillRequirements: Skills;
	itemBoosts: [string, number][];
	customDenier: (user: KlasaUser) => Promise<UserDenyResult>;
	bisGear: Gear;
	gearSetup: GearSetupTypes;
	itemCost?: (user: KlasaUser) => Promise<Bank>;
	mostImportantStat: keyof GearStats;
	food: Bank | ((user: KlasaUser) => Bank);
	settingsKeys: [string, string];
	channel: TextChannel;
	activity: Activity;
	massText: string;
	leader: KlasaUser;
	minSize: number;
	solo: boolean;
	canDie: boolean;
}

export interface BossUser {
	user: KlasaUser;
	userPercentChange: number;
	deathChance: number;
	itemsToRemove: Bank;
	debugStr: string;
}

export class BossInstance {
	id: number;
	baseDuration: number;
	skillRequirements: Skills;
	itemBoosts: [string, number][];
	customDenier: (user: KlasaUser) => Promise<UserDenyResult>;
	bisGear: Gear;
	gearSetup: GearSetupTypes;
	itemCost?: (user: KlasaUser) => Promise<Bank>;
	mostImportantStat: keyof GearStats;
	food: Bank | ((user: KlasaUser) => Bank);
	bossUsers: BossUser[] = [];
	duration: number = -1;
	totalPercent: number = -1;
	settingsKeys: [string, string];
	client: KlasaClient;
	channel: TextChannel;
	activity: Activity;
	massText: string;
	users: KlasaUser[] | null = null;
	leader: KlasaUser;
	minSize: number;
	solo: boolean;
	canDie: boolean;

	constructor(options: BossOptions) {
		this.baseDuration = options.baseDuration;
		this.skillRequirements = options.skillRequirements;
		this.itemBoosts = options.itemBoosts;
		this.customDenier = options.customDenier;
		this.bisGear = options.bisGear;
		this.gearSetup = options.gearSetup;
		this.itemCost = options.itemCost;
		this.mostImportantStat = options.mostImportantStat;
		this.id = options.id;
		this.food = options.food;
		this.settingsKeys = options.settingsKeys;
		this.channel = options.channel;
		this.client = this.channel.client as KlasaClient;
		this.activity = options.activity;
		this.leader = options.leader;
		this.minSize = options.minSize;
		this.solo = options.solo;
		this.canDie = options.canDie;
		this.massText = [
			options.massText,
			'\n',
			`**Item Boosts:** ${this.itemBoosts.map(i => `${i[0]}: ${i[1]}%`).join(', ')}`,
			`**BiS Gear:** ${this.bisGear}`,
			`**Skill Reqs:** ${formatSkillRequirements(this.skillRequirements)}`
		].join('\n');
	}

	async validateTeam() {
		for (const user of this.users!) {
			const [denied, reason] = await this.checkUser(user);
			if (denied) {
				throw new Error(`${user} ${reason}`);
			}
		}
	}

	async init() {
		const mass = new Mass({
			channel: this.channel,
			maxSize: 10,
			minSize: this.minSize,
			leader: this.leader,
			text: this.massText,
			ironmenAllowed: true,
			customDenier: async (user: KlasaUser) => {
				const result = await this.checkUser(user);
				return result;
			}
		});
		this.users = this.solo ? [this.leader] : await mass.init();
		await this.validateTeam();
		const { bossUsers, duration, totalPercent } = await this.calculateBossUsers();
		this.bossUsers = bossUsers;
		this.duration = duration;
		this.totalPercent = totalPercent;
	}

	async checkUser(user: KlasaUser): Promise<UserDenyResult> {
		const [denied, reason] = await this.customDenier(user);
		if (denied) {
			return [true, reason!];
		}
		if (!user.hasMinion) {
			return [true, "doesn't have a minion"];
		}
		if (user.minionIsBusy) {
			return [true, 'minion is busy'];
		}
		if (!user.hasSkillReqs(this.skillRequirements)[0]) {
			return [true, "doesn't meet skill requirements"];
		}
		const itemCost = await this.calcFoodForUser(user, false);
		if (!user.owns(itemCost)) {
			return [true, `doesn't have ${itemCost}`];
		}

		const gearPercent = calcSetupPercent(
			this.bisGear,
			user.getGear(this.gearSetup),
			this.mostImportantStat,
			[]
		);
		if (gearPercent < 20) {
			return [true, `has terrible gear`];
		}

		return [false];
	}

	async calcFoodForUser(user: KlasaUser, solo = false) {
		const kc = user.getKC(this.id);
		const itemsToRemove = calcFood(solo, kc);
		const itemCost = this.itemCost && (await this.itemCost(user));
		if (itemCost) itemsToRemove.add(itemCost);
		return itemsToRemove;
	}

	async calculateBossUsers() {
		const maxReduction = 40;
		const speedReductionForGear = 25;
		const speedReductionForKC = 35;
		let speedReductionForBoosts = sumArr(this.itemBoosts.map(i => i[1]));
		const totalSpeedReduction =
			speedReductionForGear + speedReductionForKC + speedReductionForBoosts;
		const kcCap = 250;

		const bossUsers: BossUser[] = [];
		let totalPercent = 0;

		// Track user len outside the loop because the loop corrupts it. (calcFoodForUser())
		for (const user of this.users!) {
			const gear = user.getGear(this.gearSetup);
			let debugStr = [];
			let userPercentChange = 0;

			// Gear
			const gearPercent = calcSetupPercent(this.bisGear, gear, this.mostImportantStat, []);
			const gearBoostPercent = calcPercentOfNum(gearPercent, speedReductionForGear);
			userPercentChange += gearBoostPercent;
			debugStr.push(`**Gear**[${gearPercent.toFixed(1)}%]`);

			// KC
			const kc = user.getKC(this.id);
			const kcPercent = Math.min(100, calcWhatPercent(kc, kcCap));
			const kcBoostPercent = calcPercentOfNum(kcPercent, speedReductionForKC);
			userPercentChange += kcBoostPercent;
			debugStr.push(`**KC**[${kcPercent.toFixed(1)}%]`);

			// Item boosts
			let itemBoosts = 0;
			for (const [name, amount] of this.itemBoosts) {
				if (gear.hasEquipped(name, false, true)) {
					itemBoosts += amount;
				}
			}
			const itemBoostPercent = calcWhatPercent(itemBoosts, speedReductionForBoosts);
			const itemBoostsBoostPercent = calcPercentOfNum(
				itemBoostPercent,
				speedReductionForBoosts
			);
			userPercentChange += itemBoostsBoostPercent;
			debugStr.push(`**Boosts**[${itemBoostPercent.toFixed(1)}%]`);

			// Items to remove
			const itemsToRemove = await this.calcFoodForUser(user, this.users!.length === 1);
			debugStr.push(`**Cost**[${itemsToRemove}]`);

			// Total
			debugStr.push(
				`**Total**[${calcWhatPercent(userPercentChange, totalSpeedReduction).toFixed(2)}%]`
			);

			// Death chance
			let deathChance = this.canDie
				? Math.max(0, reduceNumByPercent(55, kcBoostPercent * 2.4 + gearBoostPercent)) +
				  randFloat(4.5, 5.5)
				: 0;
			debugStr.push(`**Death**[${deathChance.toFixed(2)}%]`);

			// Apply a percentage of maxReduction based on the percent of total boosts.
			const percentToAdd =
				((userPercentChange / totalSpeedReduction) * maxReduction) / this.users!.length;
			totalPercent += percentToAdd;

			bossUsers.push({
				user,
				userPercentChange,
				itemsToRemove,
				debugStr: debugStr.join(' '),
				deathChance
			});
		}

		let duration = this.baseDuration;
		duration = reduceNumByPercent(duration, totalPercent);

		// Reduce or increase the duration based on the team size. Solo is longer, big team is faster.
		duration -= duration * (teamSizeBoostPercent(this.users!.length) / 100);

		return {
			bossUsers,
			duration,
			totalPercent
		};
	}

	async start() {
		await this.init();
		await this.validateTeam();
		const totalCost = new Bank();
		for (const { user, itemsToRemove } of this.bossUsers) {
			await user.removeItemsFromBank(itemsToRemove);
			totalCost.add(itemsToRemove);
		}
		updateBankSetting(this.client, this.settingsKeys[0], totalCost);

		await addSubTaskToActivityTask<NewBossOptions>(this.client, {
			userID: this.users![0].id,
			channelID: this.channel.id,
			quantity: 1,
			duration: this.duration,
			type: this.activity,
			users: this.users!.map(u => u.id),
			bossUsers: this.bossUsers.map(u => ({ ...u, user: u.user.id }))
		});
		return {
			bossUsers: this.bossUsers
		};
	}

	async simulate() {
		const arr = Array(30).fill(this.leader);
		let results: any[] = [];
		for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
			let ar = arr.slice(0, num);
			this.users = ar;
			const { bossUsers, duration } = await this.calculateBossUsers();
			if (this.users.length !== bossUsers.length) {
				console.error('wtfffffffff');
			}
			const dwwhChance = calcDwwhChance(bossUsers.map(i => i.user));
			results.push([
				bossUsers.length,
				bossUsers[0].userPercentChange.toFixed(1),
				formatDuration(duration),
				bossUsers[0].deathChance.toFixed(1),
				dwwhChance,
				formatDuration(dwwhChance * duration),
				bossUsers[0].itemsToRemove.multiply(bossUsers.length).multiply(dwwhChance)
			]);
		}
		const normalTable = table([
			[
				'Team Size',
				'%',
				'Duration',
				'Death Chance',
				'DWWH Chance',
				'DWWH Hours',
				'Item Cost For DWWH'
			],
			...results
		]);
		return new MessageAttachment(Buffer.from(normalTable), `boss-sim.txt`);
	}
}
