import { AttachmentBuilder, BaseMessageOptions, TextChannel } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, randFloat, reduceNumByPercent, sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { GearSetupType, GearStats } from '../gear';
import { trackLoot } from '../lootTrack';
import { effectiveMonsters } from '../minions/data/killableMonsters';
import { setupParty } from '../party';
import { Skills } from '../types';
import { NewBossOptions } from '../types/minions';
import { formatDuration, formatSkillRequirements, hasSkillReqs, isWeekend } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import { ClientBankKey, updateBankSetting } from '../util/updateBankSetting';
import { Gear } from './Gear';

export const gpCostPerKill = (user: MUser) =>
	user.gear.melee.hasEquipped(['Ring of charos', 'Ring of charos(a)'], false) ? 5_000_000 : 10_000_000;

export const calcDwwhChance = (users: MUser[]) => {
	const size = Math.min(users.length, 10);
	const baseRate = 850;
	const modDenominator = 15;

	let dropRate = (baseRate / 2) * (1 + size / modDenominator);
	let groupRate = Math.ceil(dropRate / size);
	groupRate = Math.ceil(groupRate);

	if (users.some(u => u.gear.melee.hasEquipped('Ring of luck'))) {
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

	if (numKeys === 0) {
		return 100;
	}

	totalPercent /= numKeys;

	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}

	if (isNaN(totalPercent) || totalPercent < 0 || totalPercent > 100) {
		throw new Error(`Invalid total gear percent: ${totalPercent}`);
	}

	return totalPercent;
}

export interface BossOptions {
	maxSize?: number;
	id: number;
	baseDuration: number;
	skillRequirements: Skills;
	// The total combined values for item boosts equal their relative contribution to the speed, see `speedMaxReduction`
	itemBoosts: [string, number][];
	customDenier: (user: MUser) => Promise<UserDenyResult>;
	bisGear: Gear;
	gearSetup: GearSetupType;
	itemCost?: (options: { user: MUser; kills: number; baseFood: Bank; solo: boolean }) => Promise<Bank>;
	mostImportantStat: keyof GearStats;
	ignoreStats?: (keyof GearStats)[];
	food: Bank | ((user: MUser) => Bank);
	settingsKeys?: [ClientBankKey, ClientBankKey];
	channel: TextChannel;
	activity: 'VasaMagus' | 'KingGoldemar' | 'Ignecarus' | 'BossEvent';
	massText: string;
	leader: MUser;
	minSize: number;
	solo: boolean;
	canDie: boolean;
	kcLearningCap?: number;
	customDeathChance?: (user: MUser, deathChance: number, solo: boolean) => number;
	allowMoreThan1Solo?: boolean;
	allowMoreThan1Group?: boolean;
	quantity?: number;
	allowedMentions?: BaseMessageOptions['allowedMentions'];
	// Duration before mass is automatically send
	automaticStartTime?: number;
	// The total % reduction that perfect gear/kc/boosts nets:
	speedMaxReduction?: number;
	// The relative weight that gear score contributes to the speed:
	speedGearWeight?: number;
	// The relative weight that KC contributes to the speed:
	speedKcWeight?: number;
	// Skip users without item cost (masses)
	skipInvalidUsers?: boolean;
}

export interface BossUser {
	user: MUser;
	userPercentChange: number;
	deathChance: number;
	itemsToRemove: Bank;
	debugStr: string;
	invalid?: boolean;
}

export class BossInstance {
	id: number;
	baseDuration: number;
	skillRequirements: Skills;
	itemBoosts: [string, number][];
	customDenier: (user: MUser) => Promise<UserDenyResult>;
	bisGear: Gear;
	gearSetup: GearSetupType;
	itemCost?: (options: { user: MUser; kills: number; baseFood: Bank; solo: boolean }) => Promise<Bank>;
	mostImportantStat: keyof GearStats;
	ignoreStats: (keyof GearStats)[] = [];
	food: Bank | ((user: MUser) => Bank);
	bossUsers: BossUser[] = [];
	duration: number = -1;
	quantity: number | null = null;
	tempQty: number | null = null;
	allowMoreThan1Solo: boolean = false;
	allowMoreThan1Group: boolean = false;
	totalPercent: number = -1;
	settingsKeys?: [ClientBankKey, ClientBankKey];
	channel: TextChannel;
	activity: 'VasaMagus' | 'KingGoldemar' | 'Ignecarus' | 'BossEvent';
	massText: string;
	users: MUser[] | null = null;
	leader: MUser;
	minSize: number;
	solo: boolean;
	canDie: boolean;
	kcLearningCap: number;
	customDeathChance: null | ((user: MUser, deathChance: number, solo: boolean) => number);
	boosts: string[] = [];
	automaticStartTime: number;
	maxSize: number;
	speedMaxReduction: number = 40;
	speedGearWeight: number = 25;
	speedKcWeight: number = 35;
	skipInvalidUsers?: boolean = false;
	allowedMentions?: BaseMessageOptions['allowedMentions'];

	constructor(options: BossOptions) {
		this.baseDuration = options.baseDuration;
		this.skillRequirements = options.skillRequirements;
		this.itemBoosts = options.itemBoosts;
		this.customDenier = options.customDenier;
		this.bisGear = options.bisGear;
		this.gearSetup = options.gearSetup;
		this.itemCost = options.itemCost;
		this.mostImportantStat = options.mostImportantStat;
		this.ignoreStats = options.ignoreStats ?? [];
		this.id = options.id;
		this.food = options.food;
		this.settingsKeys = options.settingsKeys;
		this.channel = options.channel;
		this.activity = options.activity;
		this.leader = options.leader;
		this.minSize = options.minSize;
		this.solo = options.solo;
		this.canDie = options.canDie;
		this.speedKcWeight = options.speedKcWeight ?? 35;
		this.speedGearWeight = options.speedGearWeight ?? 25;
		this.speedMaxReduction = options.speedMaxReduction ?? 40;
		this.kcLearningCap = options.kcLearningCap ?? 250;
		this.customDeathChance = options.customDeathChance ?? null;
		this.allowMoreThan1Solo = options.allowMoreThan1Solo ?? false;
		this.allowMoreThan1Group = options.allowMoreThan1Group ?? false;
		this.quantity = options.quantity ?? null;
		this.maxSize = options.maxSize ?? 10;
		let massText = [options.massText, '\n'];
		if (Object.keys(this.skillRequirements).length > 0) {
			massText.push(`**Skill Reqs:** ${formatSkillRequirements(this.skillRequirements)}`);
		}
		if (this.itemBoosts.length > 0) {
			massText.push(`**Item Boosts:** ${this.itemBoosts.map(i => `${i[0]}: ${i[1]}%`).join(', ')}`);
		}
		if (this.bisGear.allItems(false).length > 0) {
			massText.push(`**BiS Gear:** ${this.bisGear}`);
		}
		this.massText = massText.join('\n');
		this.automaticStartTime = options.automaticStartTime ?? Time.Minute * 2;
		if (options.skipInvalidUsers) this.skipInvalidUsers = options.skipInvalidUsers;
		this.allowedMentions = options.allowedMentions;
	}

	async validateTeam() {
		for (const bossUser of this.bossUsers!) {
			const [denied, reason] = await this.checkUser(bossUser.user);
			if (denied) {
				if (!this.skipInvalidUsers) {
					throw new Error(`${bossUser.user} ${reason}`);
				} else {
					bossUser.invalid = true;
				}
			}
		}
	}

	calculateQty(duration: number) {
		let baseQty = this.tempQty;
		// Calculate max kill qty
		let tempQty = 1;
		const maxTripLength = this.leader ? calcMaxTripLength(this.leader, this.activity) : Time.Hour;
		tempQty = Math.max(tempQty, Math.floor(maxTripLength / duration));
		// If this boss doesn't allow more than 1KC at time, limit to 1
		if (
			(this.users && this.users.length === 1 && !this.allowMoreThan1Solo) ||
			(this.users && this.users.length > 1 && !this.allowMoreThan1Group)
		) {
			tempQty = 1;
		}
		// If the user informed a higher qty than it can kill or is null, defaults to max
		if (!baseQty || baseQty > tempQty) return tempQty;
		return baseQty;
	}

	async init() {
		this.users =
			this.solo && this.leader
				? [this.leader]
				: await setupParty(this.channel, this.leader, {
						ironmanAllowed: true,
						minSize: this.minSize,
						maxSize: this.maxSize,
						leader: this.leader,
						customDenier: async (user: MUser) => {
							return this.checkUser(user);
						},
						message: this.massText,
						massTimeout: this.automaticStartTime,
						allowedMentions: this.allowedMentions
				  });

		this.tempQty = this.quantity;
		// Force qty to 1 for init calculations
		this.quantity = this.calculateQty(this.baseDuration);
		const { bossUsers, duration, totalPercent } = await this.calculateBossUsers();
		this.quantity = this.calculateQty(duration);
		this.duration = duration * this.quantity;
		// Calculate item usage
		for (const user of bossUsers) {
			// Items to remove
			user.itemsToRemove = await this.calcFoodForUser(user.user, this.users!.length === 1);
			user.debugStr += ` **Cost**[${user.itemsToRemove}]`;
		}

		this.bossUsers = bossUsers;
		this.totalPercent = totalPercent;
	}

	async checkUser(user: MUser): Promise<UserDenyResult> {
		const [denied, reason] = await this.customDenier(user);
		if (denied) {
			return [true, reason!];
		}
		if (!user.user.minion_hasBought) {
			return [true, "doesn't have a minion"];
		}
		if (user.minionIsBusy) {
			return [true, 'minion is busy'];
		}
		if (!hasSkillReqs(user, this.skillRequirements)[0]) {
			return [true, "doesn't meet skill requirements"];
		}
		if (this.quantity) {
			const itemCost = await this.calcFoodForUser(user, false);
			if (!user.owns(itemCost)) {
				return [true, `doesn't have ${itemCost}`];
			}
		}

		const gearPercent = calcSetupPercent(
			this.bisGear,
			user.gear[this.gearSetup],
			this.mostImportantStat,
			this.ignoreStats
		);
		if (gearPercent < 20) {
			return [true, 'has terrible gear'];
		}

		return [false];
	}

	async calcFoodForUser(user: MUser, solo = false) {
		const kc = await user.getKC(this.id);
		let itemsToRemove = calcFood(solo, kc);
		if (this.itemCost) {
			return this.itemCost({ user, kills: this.quantity ?? 0, baseFood: itemsToRemove, solo });
		}
		return itemsToRemove.multiply(this.quantity ?? 0);
	}

	async calculateBossUsers() {
		const {
			speedMaxReduction: maxReduction,
			speedGearWeight: speedReductionForGear,
			speedKcWeight: speedReductionForKC
		} = this;
		// The total combined values for item boosts equal their relative contribution to the speed
		const speedReductionForBoosts = sumArr(this.itemBoosts.map(i => i[1]));
		const totalSpeedReduction = speedReductionForGear + speedReductionForKC + speedReductionForBoosts;

		const bossUsers: BossUser[] = [];
		let totalPercent = 0;

		const solo = this.users!.length === 1;

		// Track user len outside the loop because the loop corrupts it. (calcFoodForUser())
		for (const user of this.users!) {
			const gear = user.gear[this.gearSetup];
			let debugStr = [];
			let userPercentChange = 0;

			// Gear
			const gearPercent = calcSetupPercent(this.bisGear, gear, this.mostImportantStat, this.ignoreStats);
			const gearBoostPercent = calcPercentOfNum(gearPercent, speedReductionForGear);
			userPercentChange += gearBoostPercent;
			debugStr.push(`**Gear**[${gearPercent.toFixed(1)}%]`);

			// KC
			const kc = await user.getKC(this.id);
			const kcPercent = Math.min(100, calcWhatPercent(kc, this.kcLearningCap));
			const kcBoostPercent = calcPercentOfNum(kcPercent, speedReductionForKC);
			userPercentChange += kcBoostPercent;
			debugStr.push(`**KC**[${kcPercent.toFixed(1)}%]`);

			// Item boosts
			if (this.itemBoosts.length > 0) {
				let itemBoosts = 0;
				for (const [name, amount] of this.itemBoosts) {
					if (gear.hasEquipped(name, false, true)) {
						itemBoosts += amount;
					}
				}
				const itemBoostPercent = calcWhatPercent(itemBoosts, speedReductionForBoosts);
				const itemBoostsBoostPercent = calcPercentOfNum(itemBoostPercent, speedReductionForBoosts);
				userPercentChange += itemBoostsBoostPercent;
				debugStr.push(`**Boosts**[${itemBoostPercent.toFixed(1)}%]`);
			}

			// Total
			debugStr.push(`**Total**[${calcWhatPercent(userPercentChange, totalSpeedReduction).toFixed(2)}%]`);

			// Death chance
			let deathChance = this.canDie
				? Math.max(0, reduceNumByPercent(55, kcBoostPercent * 2.4 + gearBoostPercent)) + randFloat(4.5, 5.5)
				: 0;
			if (this.customDeathChance) deathChance = this.customDeathChance(user, deathChance, solo);
			debugStr.push(`**Death**[${deathChance.toFixed(2)}%]`);

			// Apply a percentage of maxReduction based on the percent of total boosts.
			const percentToAdd = ((userPercentChange / totalSpeedReduction) * maxReduction) / this.users!.length;
			totalPercent += percentToAdd;

			bossUsers.push({
				user,
				userPercentChange,
				itemsToRemove: new Bank(),
				debugStr: debugStr.join(' '),
				deathChance
			});
		}

		let duration = this.baseDuration;
		duration = reduceNumByPercent(duration, totalPercent);

		// Reduce or increase the duration based on the team size. Solo is longer, big team is faster.
		duration -= duration * (teamSizeBoostPercent(this.users!.length) / 100);

		if (isWeekend()) {
			this.boosts.push('5% Weekend boost');
			duration = reduceNumByPercent(duration, 5);
		}

		return {
			bossUsers,
			duration,
			totalPercent
		};
	}

	async start() {
		await this.init();
		await this.validateTeam();

		for (const bossUser of this.bossUsers) {
			if (!bossUser.user.owns(bossUser.itemsToRemove)) {
				throw `${bossUser.user.rawUsername} doesn't have enough supplies, they need: ${bossUser.itemsToRemove}.`;
			}
		}

		const totalCost = new Bank();

		if (this.skipInvalidUsers) {
			// Handle big masses - Asynchronously process food removal to speed it up dramatically
			await Promise.allSettled(
				this.bossUsers.map(bu => bu.user.removeItemsFromBank(bu.itemsToRemove).catch(() => (bu.invalid = true)))
			);
			this.bossUsers = this.bossUsers.filter(bu => !bu.invalid);
			this.bossUsers.map(bu => totalCost.add(bu.itemsToRemove));
		} else {
			// Small masses that fail if a user has no food anymore.
			for (const bossUser of this.bossUsers) {
				await bossUser.user.removeItemsFromBank(bossUser.itemsToRemove);
				totalCost.add(bossUser.itemsToRemove);
			}
		}
		if (this.settingsKeys) {
			updateBankSetting(this.settingsKeys[0], totalCost);
		}

		const monster = effectiveMonsters.find(m => m.id === this.id);
		if (!monster) {
			console.error(`No monster for ${this.id}`);
		} else {
			await trackLoot({
				changeType: 'cost',
				totalCost,
				id: monster.name,
				type: 'Monster',
				users: this.bossUsers.map(i => ({
					id: i.user.id,
					cost: i.itemsToRemove
				}))
			});
		}

		await addSubTaskToActivityTask<NewBossOptions>({
			userID: this.users![0].id,
			channelID: this.channel.id,
			quantity: this.quantity!,
			duration: this.duration,
			type: this.activity,
			users: this.bossUsers.map(u => u.user.id),
			bossUsers: this.bossUsers.map(u => ({ ...u, itemsToRemove: u.itemsToRemove.bank, user: u.user.id })),
			bossID: this.id
		});
		return {
			bossUsers: this.bossUsers
		};
	}

	async simulate() {
		const arr = Array(30).fill(this.leader);
		let results: any[] = [];
		for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
			this.users = arr.slice(0, num);
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
			['Team Size', '%', 'Duration', 'Death Chance', 'DWWH Chance', 'DWWH Hours', 'Item Cost For DWWH'],
			...results
		]);
		return new AttachmentBuilder(Buffer.from(normalTable), { name: 'boss-sim.txt' });
	}
}
