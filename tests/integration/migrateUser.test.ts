import { randomSnowflake } from '@oldschoolgg/toolkit';
import {
	Activity,
	Bingo,
	BingoParticipant,
	BuyCommandTransaction,
	CommandUsage,
	EconomyTransaction,
	FarmedCrop,
	GearPreset,
	Giveaway,
	HistoricalData,
	LastManStandingGame,
	LootTrack,
	Minigame,
	MortimerTricks,
	PinnedTrip,
	PlayerOwnedHouse,
	Prisma,
	ReclaimableItem,
	SlayerTask,
	UserStats,
	XPGain
} from '@prisma/client';
import { deepClone, randArrItem, randInt, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { describe, expect, test, vi } from 'vitest';

import { BitField } from '../../src/lib/constants';
import { GearSetupType, UserFullGearSetup } from '../../src/lib/gear/types';
import { GrandExchange } from '../../src/lib/grandExchange';
import { prisma } from '../../src/lib/settings/prisma';
import { SkillsEnum } from '../../src/lib/skilling/types';
import { processPendingActivities } from '../../src/lib/Task';
import { Skills } from '../../src/lib/types';
import { isGroupActivity } from '../../src/lib/util';
import { migrateUser } from '../../src/lib/util/migrateUser';
import resolveItems from '../../src/lib/util/resolveItems';
import { tradePlayerItems } from '../../src/lib/util/tradePlayerItems';
import { buyCommand } from '../../src/mahoji/commands/buy';
import { chopCommand } from '../../src/mahoji/commands/chop';
import { configCommand } from '../../src/mahoji/commands/config';
import { farmingCommand } from '../../src/mahoji/commands/farming';
import { fishCommand } from '../../src/mahoji/commands/fish';
import { geCommand } from '../../src/mahoji/commands/ge';
import { gearCommand } from '../../src/mahoji/commands/gear';
import { gearPresetsCommand } from '../../src/mahoji/commands/gearpresets';
import { killCommand } from '../../src/mahoji/commands/k';
import { mineCommand } from '../../src/mahoji/commands/mine';
import { minigamesCommand } from '../../src/mahoji/commands/minigames';
import { minionCommand } from '../../src/mahoji/commands/minion';
import { pohCommand } from '../../src/mahoji/commands/poh';
import { runecraftCommand } from '../../src/mahoji/commands/runecraft';
import { sellCommand } from '../../src/mahoji/commands/sell';
import { slayerCommand } from '../../src/mahoji/commands/slayer';
import { toolsCommand } from '../../src/mahoji/commands/tools';
import { syncNewUserUsername } from '../../src/mahoji/lib/preCommand';
import { OSBMahojiCommand } from '../../src/mahoji/lib/util';
import { createTestUser, mockClient, TestUser } from './util';
import { BotItemSell, FishingContestCatch, GEListing, StashUnit, Tame, TameActivity } from '.prisma/client';

const randomActivities: [OSBMahojiCommand, Object][] = [
	[runecraftCommand, { rune: 'Fire rune' }],
	[runecraftCommand, { rune: 'Earth rune' }],
	[runecraftCommand, { rune: 'Air rune' }],
	[chopCommand, { name: 'Logs' }],
	[chopCommand, { name: 'Oak logs' }],
	[chopCommand, { name: 'Willow logs' }],
	[chopCommand, { name: 'Teak logs' }],
	[mineCommand, { name: 'Runite ore' }],
	[mineCommand, { name: 'Coal' }],
	[mineCommand, { name: 'Adamantite ore' }],
	[mineCommand, { name: 'Mithril ore' }],
	[fishCommand, { name: 'Karambwanji' }],
	[fishCommand, { name: 'Sardine' }],
	[fishCommand, { name: 'Trout' }],
	[fishCommand, { name: 'Swordfish' }]
];

interface TestCommand {
	name: string;
	cmd: [OSBMahojiCommand, Object] | ((user: TestUser) => Promise<any>);
	activity?: boolean;
	priority?: boolean;
}
class UserData {
	// Class Data
	private loaded: boolean = false;
	private mUser: MUser | null = null;

	// Robochimp:
	githubId?: number | null;

	// User info
	id: string;
	username: string | null | undefined;
	bank?: Bank;
	clbank?: Bank;
	gear?: UserFullGearSetup;
	skillsAsLevels?: Required<Skills>;
	// Tables:
	poh?: PlayerOwnedHouse;
	minigames?: Minigame;
	userStats?: UserStats;
	stashUnits?: StashUnit[];
	gearPresets?: GearPreset[];
	activities?: Activity[];
	slayerTasks?: SlayerTask[];
	giveaways?: Giveaway[];
	farmedCrops?: FarmedCrop[];
	pinnedTrips?: PinnedTrip[];
	lms?: LastManStandingGame[];
	lootTrack?: LootTrack[];
	botItemSell?: BotItemSell[];
	buyCommandTx?: BuyCommandTransaction[];
	historicalData?: HistoricalData[];
	reclaimableItems?: ReclaimableItem[];
	xpGains?: XPGain[];
	economyTx?: EconomyTransaction[];
	bingoParticipant?: BingoParticipant[];
	// Special:
	bingos?: Bingo[];
	commandUsage?: CommandUsage[];
	geListings?: GEListing[];
	// BSO Data
	tames?: Tame[];
	tameActivity?: TameActivity[];
	fishingContestCatches?: FishingContestCatch[];
	// BSO Event Data
	mortimerTricks?: MortimerTricks[];

	constructor(_user: string | MUser) {
		this.id = typeof _user === 'string' ? _user : _user.id;
	}

	async sync() {
		if (this.mUser === null) {
			this.mUser = await mUserFetch(this.id);
		} else {
			await this.mUser.sync();
		}
		const newUser = await prisma.newUser.findFirst({ where: { id: this.id }, select: { username: true } });
		if (newUser) this.username = newUser.username;

		this.bank = new Bank(this.mUser.bank);
		this.clbank = new Bank(this.mUser.cl);
		this.gear = { ...deepClone(this.mUser.gear) };
		this.skillsAsLevels = deepClone(this.mUser.skillsAsLevels);

		const robochimpUser = await roboChimpClient.user.findFirst({
			where: { id: BigInt(this.id) },
			select: { github_id: true }
		});
		if (robochimpUser) this.githubId = robochimpUser.github_id;

		const stashUnits = await prisma.stashUnit.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { stash_id: 'asc' }
		});
		if (stashUnits.length > 0) this.stashUnits = stashUnits;

		const gearPresets = await prisma.gearPreset.findMany({
			where: { user_id: this.id },
			orderBy: { name: 'asc' }
		});
		if (gearPresets.length > 0) this.gearPresets = gearPresets;

		const activities = await prisma.activity.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { start_date: 'asc' }
		});
		if (activities.length > 0) this.activities = activities;

		const slayerTasks = await prisma.slayerTask.findMany({ where: { user_id: this.id }, orderBy: { id: 'asc' } });
		if (slayerTasks.length > 0) this.slayerTasks = slayerTasks;

		const poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: this.id } });
		if (poh) this.poh = poh;

		const giveaways = await prisma.giveaway.findMany({ where: { user_id: this.id }, orderBy: { id: 'asc' } });
		if (giveaways.length > 0) this.giveaways = giveaways;

		const farmedCrops = await prisma.farmedCrop.findMany({ where: { user_id: this.id }, orderBy: { id: 'asc' } });
		if (farmedCrops.length > 0) this.farmedCrops = farmedCrops;

		const minigames = await prisma.minigame.findFirst({ where: { user_id: this.id } });
		if (minigames) this.minigames = minigames;

		const pinnedTrips = await prisma.pinnedTrip.findMany({
			where: { user_id: this.id },
			orderBy: { activity_id: 'asc' }
		});
		if (pinnedTrips.length > 0) this.pinnedTrips = pinnedTrips;

		const lms = await prisma.lastManStandingGame.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (lms.length > 0) this.lms = lms;

		const lootTrack = await prisma.lootTrack.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (lootTrack.length > 0) this.lootTrack = lootTrack;

		const botItemSell = await prisma.botItemSell.findMany({
			where: { user_id: this.id },
			orderBy: { item_id: 'asc' }
		});
		if (botItemSell.length > 0) this.botItemSell = botItemSell;

		const buyCommandTx = await prisma.buyCommandTransaction.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (buyCommandTx.length > 0) this.buyCommandTx = buyCommandTx;

		const reclaimableItems = await prisma.reclaimableItem.findMany({
			where: { user_id: this.id },
			orderBy: { key: 'asc' }
		});
		if (reclaimableItems.length > 0) this.reclaimableItems = reclaimableItems;

		const xpGains = await prisma.xPGain.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (xpGains.length > 0) this.xpGains = xpGains;

		const economyTx = await prisma.economyTransaction.findMany({
			where: { OR: [{ sender: BigInt(this.id) }, { recipient: BigInt(this.id) }] },
			orderBy: { date: 'asc' }
		});

		if (economyTx.length > 0) this.economyTx = economyTx;

		const bingoParticipant = await prisma.bingoParticipant.findMany({
			where: { user_id: this.id },
			orderBy: { bingo_id: 'asc' }
		});
		if (bingoParticipant.length > 0) this.bingoParticipant = bingoParticipant;

		const userStats = await prisma.userStats.findFirst({ where: { user_id: BigInt(this.id) } });
		if (userStats) this.userStats = userStats;

		const bingos = await prisma.bingo.findMany({ where: { creator_id: this.id }, orderBy: { id: 'asc' } });
		if (bingos.length > 0) this.bingos = bingos;

		const historicalData = await prisma.historicalData.findMany({
			where: { user_id: this.id },
			orderBy: { date: 'asc' }
		});
		if (historicalData.length > 0) this.historicalData = historicalData;

		const commandUsage = await prisma.commandUsage.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { date: 'asc' }
		});
		if (commandUsage.length > 0) this.commandUsage = commandUsage;

		const geListings = await prisma.gEListing.findMany({
			where: { user_id: this.id },
			orderBy: { id: 'asc' }
		});
		if (geListings.length > 0) this.geListings = geListings;

		this.loaded = true;
	}

	equals(target: UserData): { result: boolean; errors: string[] } {
		const errors: string[] = [];
		if (!this.loaded || !target.loaded) {
			errors.push('Both UserData object must be loaded. Try .sync()');
			return { result: false, errors };
		}

		if (this.username !== target.username) {
			errors.push(`Usernames don't match (new_users) - ${this.username}:${target.username}`);
		}

		if (this.githubId !== target.githubId) {
			errors.push("Robochimp user doesn't match");
		}

		if (!this.bank!.equals(target.bank!)) {
			errors.push(`Banks don't match. Difference: ${this.bank!.remove(target.bank!)}`);
		}
		if (!this.clbank!.equals(target.clbank!)) {
			errors.push(`CL's don't match. Difference: ${this.clbank!.remove(target.clbank!)}`);
		}
		for (const gearSlot of Object.keys(this.gear!)) {
			if (
				this.gear![gearSlot as GearSetupType].toString() !== target.gear![gearSlot as GearSetupType].toString()
			) {
				errors.push(`${gearSlot} gear doesn't match`);
			}
		}

		// Check skill levels:
		for (const skill of Object.keys(this.skillsAsLevels!)) {
			const src = this.skillsAsLevels![skill as SkillsEnum];
			const dst = target.skillsAsLevels![skill as SkillsEnum];
			if (src !== dst) {
				errors.push(`${skill} level doesn't match. ${src} vs ${dst}`);
			}
		}

		// Single-row table checks:
		// PlayerOwnedHouse check:
		if (this.poh !== target.poh) {
			if (!this.poh || !target.poh) {
				errors.push(`Only one user has POH data: ${this.poh ? 'source' : 'target'}`);
			} else {
				for (const pohObject of Object.keys(this.poh)) {
					const key = pohObject as keyof PlayerOwnedHouse;
					if (key === 'user_id') continue;
					if (this.poh[key] !== target.poh[key]) {
						errors.push(`POH Object doesn't match: ${this.poh[key]} !== ${target.poh[key]}`);
					}
				}
			}
		}
		// Minigames check:
		if (this.minigames !== target.minigames) {
			if (!this.minigames || !target.minigames) {
				errors.push(`Only one user has Minigame data: ${this.minigames ? 'source' : 'target'}`);
			} else {
				for (const minigameKey of Object.keys(this.minigames)) {
					const key = minigameKey as keyof Minigame;
					if (key === 'user_id') continue;
					if (this.minigames[key] !== target.minigames[key]) {
						errors.push(
							`Minigame score doesn't match: ${this.minigames[key]} !== ${target.minigames[key]}`
						);
					}
				}
			}
		}
		// UserStats
		if (this.userStats !== target.userStats) {
			if (!this.userStats || !target.userStats) {
				errors.push(`Only one user has UserStats data: ${this.userStats ? 'source' : 'target'}`);
			} else {
				for (const statKey of Object.keys(this.userStats)) {
					const key = statKey as keyof UserStats;
					if (key === 'user_id') continue;
					if (JSON.stringify(this.userStats[key]) !== JSON.stringify(target.userStats[key])) {
						errors.push(
							`User Stats doesn't match: ${JSON.stringify(this.userStats[key])} !== ${JSON.stringify(
								target.userStats[key]
							)}`
						);
					}
				}
			}
		}

		// Multi-row table checks:
		// Stash Unit Check
		if (this.stashUnits !== target.stashUnits) {
			const srcCt = this.stashUnits?.length ?? 0;
			const dstCt = target.stashUnits?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of stash units. ${srcCt} vs ${dstCt}`);
			} else if (
				!this.stashUnits!.every(s =>
					target.stashUnits!.some(
						t =>
							t.stash_id === s.stash_id &&
							t.has_built === s.has_built &&
							JSON.stringify(s.items_contained) === JSON.stringify(t.items_contained)
					)
				)
			) {
				errors.push("One or more stash units don't match");
			}
		}

		// GearPresets check:
		if (this.gearPresets !== target.gearPresets) {
			const srcCt = this.gearPresets?.length ?? 0;
			const dstCt = target.gearPresets?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of GearPrests. ${srcCt} vs ${dstCt}`);
			} else if (!this.gearPresets!.every(s => target.gearPresets!.some(t => s.name === t.name))) {
				errors.push("One or more GearPresets don't match");
			}
		}

		// Activities check:
		if (this.activities !== target.activities) {
			const srcCt = this.activities?.length ?? 0;
			const dstCt = target.activities?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of activities. ${srcCt} vs ${dstCt}`);
			} else if (
				!this.activities!.every(s =>
					target.activities!.some(t => {
						if (isGroupActivity(s.data)) {
							if (!isGroupActivity(t.data)) return false;
							// First check for manipulated group activity user array:
							const srcUsers = JSON.stringify(s.data.users).replace(this.id, target.id);
							const dstUsers = JSON.stringify(t.data.users);
							return srcUsers === dstUsers;
						}
						// Otherwise just look for the ID, since nothing else is mangled.
						return s.id === t.id;
					})
				)
			) {
				errors.push("One or more activities don't match");
			}
		}
		// Slayer Task check:
		if (this.slayerTasks !== target.slayerTasks) {
			const srcCt = this.slayerTasks?.length ?? 0;
			const dstCt = target.slayerTasks?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of slayer tasks. ${srcCt} vs ${dstCt}`);
			} else if (!this.slayerTasks!.every(s => target.slayerTasks!.some(t => s.id === t.id))) {
				errors.push("One or more slayer tasks don't match.");
			}
		}

		// Giveaways
		if (this.giveaways !== target.giveaways) {
			const srcCt = this.giveaways?.length ?? 0;
			const dstCt = target.giveaways?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of giveaways tasks. ${srcCt} vs ${dstCt}`);
			} else if (!this.giveaways!.every(s => target.giveaways!.some(t => s.id === t.id))) {
				errors.push("One or more giveaways don't match.");
			}
		}

		// Farmed Crops
		if (this.farmedCrops !== target.farmedCrops) {
			const srcCt = this.farmedCrops?.length ?? 0;
			const dstCt = target.farmedCrops?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of Farmed Crop rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.farmedCrops!.every(s => target.farmedCrops!.some(t => s.id === t.id))) {
				errors.push("One or more Farmed Crops don't match.");
			}
		}

		// Pinned Trip
		if (this.pinnedTrips !== target.pinnedTrips) {
			const srcCt = this.pinnedTrips?.length ?? 0;
			const dstCt = target.pinnedTrips?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of Pinned Trip rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.pinnedTrips!.every(s => target.pinnedTrips!.some(t => s.id === t.id))) {
				errors.push("One or more Pinned Trips don't match.");
			}
		}

		// LMS
		if (this.lms !== target.lms) {
			const srcCt = this.lms?.length ?? 0;
			const dstCt = target.lms?.length ?? 0;
			// We only check row count here, since there's no other unique identifiers.
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of LMS game rows. ${srcCt} vs ${dstCt}`);
			}
		}

		// LootTrack
		if (this.lootTrack !== target.lootTrack) {
			const srcCt = this.lootTrack?.length ?? 0;
			const dstCt = target.lootTrack?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of Loot Track rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.lootTrack!.every(s => target.lootTrack!.some(t => s.id === t.id))) {
				errors.push("One or more Loot Track rows don't match.");
			}
		}

		// BotItemSell
		if (this.botItemSell !== target.botItemSell) {
			const srcCt = this.botItemSell?.length ?? 0;
			const dstCt = target.botItemSell?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of BotItemSell rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.botItemSell!.every(s => target.botItemSell!.some(t => s.id === t.id))) {
				errors.push("One or more BotItemSell rows don't match.");
			}
		}

		// BuyCommandTransaction
		if (this.buyCommandTx !== target.buyCommandTx) {
			const srcCt = this.buyCommandTx?.length ?? 0;
			const dstCt = target.buyCommandTx?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of BuyCommandTransaction rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.buyCommandTx!.every(s => target.buyCommandTx!.some(t => s.id === t.id))) {
				errors.push("One or more BuyCommandTransaction rows don't match.");
			}
		}

		// Historical Data
		if (this.historicalData !== target.historicalData) {
			const srcCt = this.historicalData?.length ?? 0;
			const dstCt = target.historicalData?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of Historical Data rows. ${srcCt} vs ${dstCt}`);
			} else if (
				!this.historicalData!.every(s =>
					target.historicalData!.some(t => s.date.getTime() === t.date.getTime())
				)
			) {
				errors.push("One or more Historical Data rows don't match.");
			}
		}

		// Reclaimable Items
		if (this.reclaimableItems !== target.reclaimableItems) {
			const srcCt = this.reclaimableItems?.length ?? 0;
			const dstCt = target.reclaimableItems?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of ReclaimableItems rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.reclaimableItems!.every(s => target.reclaimableItems!.some(t => s.key === t.key))) {
				errors.push("One or more ReclaimableItems rows don't match.");
			}
		}

		// XPGains
		if (this.xpGains !== target.xpGains) {
			const srcCt = this.xpGains?.length ?? 0;
			const dstCt = target.xpGains?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of BotItemSell rows. ${srcCt} vs ${dstCt}`);
			} else if (!this.xpGains!.every(s => target.xpGains!.some(t => s.id === t.id))) {
				errors.push("One or more BotItemSell rows don't match.");
			}
		}

		// Economy Tx
		if (this.economyTx !== target.economyTx) {
			const srcCt = this.economyTx?.length ?? 0;
			const dstCt = target.economyTx?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of EconomyTransaction rows. ${srcCt} vs ${dstCt}`);
			} else if (
				!this.economyTx!.every(s =>
					target.economyTx!.some(t => {
						if ([t.sender, s.sender].includes(BigInt(this.id))) {
							return t.recipient === s.recipient && s.id === t.id;
						}
						return t.sender === s.sender && s.id === t.id;
					})
				)
			) {
				errors.push("One or more EconomyTransaction rows don't match.");
			}
		}

		// BingoParticipant
		if (this.bingoParticipant !== target.bingoParticipant) {
			const srcCt = this.bingoParticipant?.length ?? 0;
			const dstCt = target.bingoParticipant?.length ?? 0;
			if (srcCt !== dstCt) {
				errors.push(`Wrong number of BingoParticipant rows. ${srcCt} vs ${dstCt}`);
			} else if (
				!this.bingoParticipant!.every(s =>
					target.bingoParticipant!.some(t => s.bingo_id === t.bingo_id && s.bingo_team_id === t.bingo_team_id)
				)
			) {
				errors.push("One or more BingoParticipant rows don't match.");
			}
		}

		// Merged-multi row checks: (Don't compare counts, only check if bigger set contains smaller set)
		// Bingo
		if (this.bingos !== target.bingos) {
			this.bingos ??= [];
			target.bingos ??= [];

			const balance = this.bingos.length > target.bingos.length;
			const biggerSet = balance ? this.bingos : target.bingos;
			const smallerSet = balance ? target.bingos : this.bingos;
			if (!smallerSet.every(s => biggerSet.some(b => s.id === b.id))) {
				errors.push('Mismatched bingo data - Comparison failed.');
			}
		}

		// Command Usage
		if (this.commandUsage !== target.commandUsage) {
			this.commandUsage ??= [];
			target.commandUsage ??= [];
			const balance = this.commandUsage.length > target.commandUsage.length;
			const biggerSet = balance ? this.commandUsage : target.commandUsage;
			const smallerSet = balance ? target.commandUsage : this.commandUsage;
			if (!smallerSet.every(s => biggerSet.some(b => s.id === b.id))) {
				errors.push('Mismatched command_usage data - Comparison failed.');
			}
		}

		// GE Listings
		if (this.geListings !== target.geListings) {
			this.geListings ??= [];
			target.geListings ??= [];
			const balance = this.geListings.length > target.geListings.length;
			const biggerSet = balance ? this.geListings : target.geListings;
			const smallerSet = balance ? target.geListings : this.geListings;
			if (!smallerSet.every(s => biggerSet.some(b => s.id === b.id))) {
				errors.push('Mismatched GE Listing data - Comparison failed.');
			}
		}

		if (errors.length > 0) {
			errors.unshift(`Failed comparing ${this.id} vs ${target.id}:`);
			return { result: false, errors };
		}
		return { result: true, errors };
	}
}
const allTableCommands: TestCommand[] = [
	{
		name: 'Buy minion',
		cmd: [minionCommand, { buy: {} }],
		priority: true
	},
	{
		name: 'Random Activities',
		cmd: async user => {
			for (let x = 0; x < 3; x++) {
				const activity = randArrItem(randomActivities);
				await user.runCommand(activity[0], activity[1]);
				await processPendingActivities();
			}
		}
	},
	{
		name: 'Group Activity',
		cmd: async user => {
			const users = shuffleArr([user.id, randomSnowflake(), randomSnowflake()]);
			const data = {
				leader: user.id,
				users,
				detailedUsers: [users.map(u => [u, randInt(15_000, 25_000), []])],
				quantity: 1,
				wipedRoom: [null],
				raidLevel: 450
			};
			const duration = 30 * 60 * 1000;
			const start_date = new Date();
			const finish_date = new Date(start_date.getTime() + duration);
			await prisma.activity.create({
				data: {
					type: 'TombsOfAmascut',
					user_id: BigInt(user.id),
					start_date,
					finish_date,
					data,
					duration,
					completed: true,
					group_activity: true,
					channel_id: 1_111_111_111_111n
				}
			});
		}
	},
	{
		name: 'Generate POH',
		cmd: [pohCommand, { view: {} }]
	},
	{
		name: 'Set POH Wallkit',
		cmd: [pohCommand, { wallkit: { name: 'Hosidius' } }]
	},
	{
		name: 'Create new_users entry',
		cmd: async user => {
			await syncNewUserUsername(user, `testUser${randInt(1000, 9999).toString()}`);
		},
		priority: true
	},
	{
		name: 'Buy command transaction',
		cmd: async user => {
			const randomBuyItems: string[] = [
				'Vial',
				'Feather',
				'Bucket',
				'Vial of water',
				'Eye of newt',
				'Fishing bait'
			];
			await user.runCommand(buyCommand, {
				name: randArrItem(randomBuyItems),
				quantity: randInt(1, 100).toString()
			});
		}
	},
	{
		name: 'Economy Transaction (sender)',
		cmd: async user => {
			const randomItems = ['Cannonball', 'Blood rune', 'Twisted bow', 'Kodai wand', 'Bandos tassets'];
			const recvBank = new Bank().add(randArrItem(randomItems), randInt(10, 99)).add(randArrItem(randomItems));
			const partner = await createTestUser(randomSnowflake(), recvBank);
			await tradePlayerItems(user, partner, undefined, recvBank);
		}
	},
	{
		name: 'Economy Transaction (receiver)',
		cmd: async user => {
			const randomItems = ['Feather', 'Soul rune', 'Dragon claws', 'Ghrazi rapier', 'Bandos boots'];
			const recvBank = new Bank().add(randArrItem(randomItems), randInt(10, 99)).add(randArrItem(randomItems));
			const partner = await createTestUser(randomSnowflake(), recvBank);
			await tradePlayerItems(partner, user, recvBank, undefined);
		}
	},
	{
		name: 'Skilling Gear',
		cmd: [
			gearCommand,
			{
				equip: {
					gear_setup: 'skilling',
					items: 'Pyromancer garb, Pyromancer boots, Pyromancer hood, Pyromancer robe, Warm gloves'
				}
			}
		]
	},
	{
		name: 'Melee Gear',
		cmd: [
			gearCommand,
			{
				equip: {
					gear_setup: 'melee',
					items: 'Bandos chestplate, Bandos tassets, Berserker ring, Ghrazi rapier'
				}
			}
		]
	},
	{
		name: 'GearPresets',
		cmd: async user => {
			const presetNamme = `preset${randInt(100, 999).toString()}`;
			await user.runCommand(gearPresetsCommand, {
				create: {
					name: presetNamme,
					body: 'Bandos chestplate',
					legs: 'Bandos tassets',
					ring: 'Berserker ring',
					weapon: 'Ghrazi rapier'
				}
			});
		}
	},
	{
		name: 'Create giveaway',
		cmd: async user => {
			await prisma.giveaway.create({
				data: {
					id: randInt(1_000_000, 9_999_999),
					channel_id: '1111111111111',
					start_date: new Date(),
					finish_date: new Date(Date.now() + 60 * 60 * 1000),
					completed: false,
					loot: { '2': 100 },
					user_id: user.id,
					duration: 60 * 60 * 1000,
					message_id: '2222222222222',
					users_entered: []
				}
			});
		}
	},
	{
		name: 'Slayer task',
		cmd: [slayerCommand, { new_task: { master: 'Turael' } }]
	},
	{
		name: 'Farmed crop',
		cmd: [farmingCommand, { plant: { plant_name: 'Potato' } }],
		activity: true
	},
	{
		name: 'Minigames',
		cmd: [minigamesCommand, { mahogany_homes: { start: { tier: '1' } } }],
		activity: true
	},
	{
		name: 'Pin Trip',
		cmd: async user => {
			const result = await prisma.activity.findFirst({
				where: { user_id: BigInt(user.id) },
				select: { id: true }
			});
			if (result) {
				const { id: activityId } = result;
				await user.runCommand(configCommand, { user: { pin_trip: { trip: activityId.toString() } } });
			}
		}
	},
	{
		name: 'Last man standing',
		cmd: [minigamesCommand, { lms: { start: {} } }],
		activity: true
	},
	{
		name: 'Loot track',
		cmd: [killCommand, { name: 'Goblin' }],
		activity: true
	},
	{
		name: 'User stats',
		cmd: [farmingCommand, { tithe_farm: {} }],
		activity: true
	},
	{
		name: 'Bot Item Transaction',
		cmd: [sellCommand, { items: '2 Shield right half' }]
	},
	{
		name: 'GE Listings',
		cmd: async user => {
			const item = randArrItem(resolveItems(['Cannonball', 'Feather', 'Fire rune', 'Guam leaf'])).toString();
			const price = randInt(1, 100);
			const quantity = randInt(1, 100);
			await user.runCommand(geCommand, { buy: { item, quantity, price } });
		}
	},
	{
		name: 'Stash Units',
		cmd: async user => {
			await user.runCommand(toolsCommand, { stash_units: { build_all: {} } });
			await user.runCommand(toolsCommand, { stash_units: { fill_all: {} } });
		}
	},
	{
		name: 'Create bingo',
		cmd: async user => {
			const createOptions = {
				title: 'Test Bingo',
				duration_days: 30,
				start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				ticket_price: 1_000_000,
				team_size: 3,
				notifications_channel_id: '111111111111111',
				organizers: [],
				bingo_tiles: [],
				creator_id: user.id,
				guild_id: '342983479501389826'
			};
			await prisma.bingo.create({ data: createOptions });
		}
	},
	{
		name: 'Bingo Participant',
		cmd: async user => {
			const activeBingos = await prisma.bingo.findMany({ select: { id: true } });
			if (activeBingos.length === 0) return;
			const myBingo = randArrItem(activeBingos).id;
			// Check if we're in this bingo already:
			const existingTeam = await prisma.bingoParticipant.findFirst({
				where: { user_id: user.id, bingo_id: myBingo }
			});
			if (existingTeam) return;
			await prisma.bingoTeam.create({
				data: {
					bingo_id: myBingo,
					users: {
						createMany: {
							data: [
								{
									bingo_id: myBingo,
									tickets_bought: 1,
									user_id: user.id
								}
							]
						}
					}
				}
			});
		}
	},
	{
		name: 'Sync robochimp user',
		cmd: async user => {
			await user.runCommand(minionCommand, { status: {} });
			await roboChimpClient.user.updateMany({ where: { id: BigInt(user.id) }, data: { github_id: 123_456 } });
		}
	},
	{
		name: 'Historical data',
		cmd: async user => {
			await prisma.historicalData.create({
				data: {
					user_id: user.id,
					GP: 100_000,
					total_xp: 10_000,
					cl_completion_percentage: 5,
					cl_completion_count: 5,
					cl_global_rank: 5
				}
			});
		}
	},
	{
		name: 'Command usage',
		cmd: async user => {
			const randCommands = ['minion', 'runecraft', 'chop', 'mine', 'buy'];
			await prisma.commandUsage.create({
				data: {
					user_id: BigInt(user.id),
					channel_id: 1_111_111_111n,
					status: 'Unknown',
					args: {},
					command_name: randArrItem(randCommands),
					guild_id: null,
					inhibited: false
				}
			});
		}
	},
	{
		name: 'Reclaimable Item (spoofed)',
		cmd: async user => {
			const slugs = [
				['osb', 'osrs'],
				['holiday', 'misc', 'party', 'hween', 'bday']
			];
			let key = '';
			for (const group of slugs) {
				key += `${randArrItem(group)}-`;
			}
			const itemId = randInt(10_000, 25_000);
			key += `${itemId}`;
			await prisma.reclaimableItem.create({
				data: {
					user_id: user.id,
					key,
					name: `OSB Item ${itemId}`,
					description: `A reclaimable OSB item with id: ${itemId}`,
					date: new Date(),
					item_id: itemId,
					quantity: 1
				}
			});
		}
	},
	// BSO Commands / data tables
	{
		name: 'Create tame',
		cmd: async user => {
			const tameNicknames = ['Xlaug', 'Smog', 'Xmaug', 'Infernape', 'Charmander', 'Charizard'];
			await prisma.tame.create({
				data: {
					user_id: user.id,
					nickname: randArrItem(tameNicknames),
					species_id: 1,
					growth_stage: 'adult',
					growth_percent: 100,
					max_combat_level: randInt(75, 100),
					max_artisan_level: randInt(1, 10),
					max_gatherer_level: randInt(15, 30),
					max_support_level: randInt(1, 10)
				}
			});
		},
		priority: true
	},
	{
		name: 'Create tame activity',
		cmd: async user => {
			const tame = await prisma.tame.findFirst({ where: { user_id: user.id }, select: { id: true } });
			if (!tame) return false;
			const start_date = new Date();
			const duration = 60 * 60 * 1000;
			const finish_date = new Date(start_date.getTime() + duration);
			await prisma.tameActivity.create({
				data: {
					start_date,
					finish_date,
					duration,
					user_id: user.id,
					tame_id: tame.id,
					type: 'pvm',
					channel_id: '1111111111111111111',
					completed: true,
					data: { type: 'pvm', monsterID: 707_070, quantity: randInt(30, 100) }
				}
			});
		}
	},
	{
		name: 'Fishing Contest Catch',
		cmd: async user => {
			const fishNames = [
				['Pacific', 'Atlantic', 'Antarctic', 'Arctic', 'Indian', 'Summer', 'Frowning', 'Smiling'],
				['Outback', 'Tailback', 'Longfin', 'Tuna', 'Bluefin', 'Whaleback', 'Tigerfish', 'Striped-back']
			];
			const name = fishNames.map(slug => randArrItem(slug)).join(' ');
			await prisma.fishingContestCatch.create({
				data: {
					user_id: BigInt(user.id),
					name,
					length_cm: randInt(80, 120)
				}
			});
		},
		priority: true
	},
	// BSO Event data
	{
		name: 'Mortimer tricks you',
		cmd: async user => {
			const target_id = user.id;
			const trickster_id = randomSnowflake();
			await prisma.mortimerTricks.create({
				data: {
					trickster_id,
					target_id,
					completed: false
				}
			});
		}
	},
	{
		name: 'Mortimer tricks target',
		cmd: async user => {
			const trickster_id = user.id;
			const target_id = randomSnowflake();
			await prisma.mortimerTricks.create({
				data: {
					trickster_id,
					target_id,
					completed: false
				}
			});
		}
	}
];

async function runTestCommand(user: TestUser, command: TestCommand) {
	if (typeof command.cmd === 'function') {
		await command.cmd(user);
	} else {
		const [cmd, args] = command.cmd;
		await user.runCommand(cmd, args);
		if (command.activity) await processPendingActivities();
	}
}
async function runAllTestCommandsOnUser(user: TestUser) {
	for (const command of allTableCommands) {
		await runTestCommand(user, command);
	}
	return user;
}

async function runRandomTestCommandsOnUser(user: TestUser, numCommands: number = 6) {
	const commandHistory: string[] = [];
	const priorityCommands = allTableCommands.filter(c => c.priority);
	const otherCommands = allTableCommands.filter(c => !c.priority);
	for (const command of priorityCommands) {
		commandHistory.push(`${new Date().toISOString()}:${command.name}`);
		await runTestCommand(user, command);
	}
	for (let i = 0; i < numCommands; i++) {
		const command = randArrItem(otherCommands);
		commandHistory.push(`${new Date().toISOString()}:${command.name}`);
		await runTestCommand(user, command);
	}
	return commandHistory;
}

async function buildBaseUser(userId: string) {
	const startBank = new Bank()
		// Activity required items:
		.add('Pure essence', 1_000_000)
		.add('Stamina potion(4)', 1000)
		.add('Dragon axe')
		.add('Harmonised orb')
		.add('Potato seed', 500)
		.add('Fishing bait', 10_000)
		.add('Feather', 10_000)
		.add('Shield right half', 2)
		// Build stash units:
		.add('Mahogany plank', 10_000)
		.add('Teak plank', 10_000)
		.add('Oak plank', 10_000)
		.add('Plank', 10_000)
		.add('Bronze nails', 10_000)
		.add('Gold leaf', 500)
		// Stash unit items
		.add('Gold ring', 1)
		.add('Gold necklace', 1)
		.add('Bronze spear', 1)
		.add('Dragon pickaxe')
		// Gear items to equip:
		.add('Pyromancer hood')
		.add('Pyromancer garb')
		.add('Pyromancer robe')
		.add('Pyromancer boots')
		.add('Warm gloves')
		.add('Bandos chestplate')
		.add('Bandos tassets')
		.add('Bandos boots')
		.add('Berserker ring')
		.add('Ghrazi rapier');

	const userData: Partial<Prisma.UserCreateInput> = {
		skills_runecraft: 13_034_431,
		skills_woodcutting: 13_034_431,
		skills_mining: 13_034_431,
		skills_construction: 6_600_000,
		skills_farming: 1_000_000,
		skills_fishing: 13_034_431,
		skills_defence: 13_034_431,
		skills_attack: 13_034_431,
		skills_strength: 13_034_431,
		skills_agility: randInt(1_000_000, 5_000_000),
		bitfield: [BitField.HasHosidiusWallkit],
		kourend_favour: { Hosidius: 100, Arceuus: 0, Shayzien: 0, Lovakengj: 0 },
		GP: 100_000_000
	};
	const user = await createTestUser(userId, startBank, userData);
	return user;
}
describe('migrate user test', async () => {
	await mockClient();
	vi.doMock('../../src/lib/util', async () => {
		const actual: any = await vi.importActual('../../src/lib/util');
		return {
			...actual,
			channelIsSendable: () => false
		};
	});

	const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
	const sleepDelay = 350;

	const logResult = (
		result: { result: boolean; errors: string[] },
		sourceData: UserData,
		newData: UserData,
		srcHistory?: string[],
		dstHistory?: string[]
	) => {
		if (!result.result) {
			if (srcHistory) {
				console.log(`Source Command History: ${sourceData.id}`);
				console.log(srcHistory);
			}
			if (dstHistory) {
				console.log(`Target Command History: ${newData.id}`);
				console.log(dstHistory);
			}
			console.log(`source: ${sourceData.id}  dest: ${newData.id}`);
			console.log(result.errors);
			console.log(JSON.stringify(sourceData));
			console.log(JSON.stringify(newData));
		}
	};

	await GrandExchange.totalReset();
	await GrandExchange.init();

	test('test migrating existing user to target with no records', async () => {
		const sourceUser = await buildBaseUser(randomSnowflake());
		await runAllTestCommandsOnUser(sourceUser);

		const destUserId = randomSnowflake();

		const sourceData = new UserData(sourceUser);
		await sourceData.sync();

		const migrateResult = await migrateUser(sourceUser.id, destUserId);
		expect(migrateResult).toEqual(true);

		const newData = new UserData(destUserId);
		await newData.sync();

		const compareResult = sourceData.equals(newData);
		logResult(compareResult, sourceData, newData);

		expect(compareResult.result).toBe(true);
	});

	test('test migrating full user on top of full profile', async () => {
		const sourceUser = await buildBaseUser(randomSnowflake());
		const destUser = await buildBaseUser(randomSnowflake());
		await runAllTestCommandsOnUser(sourceUser);
		await runAllTestCommandsOnUser(destUser);

		const sourceData = new UserData(sourceUser);
		await sourceData.sync();

		const migrateResult = await migrateUser(sourceUser.id, destUser.id);
		expect(migrateResult).toEqual(true);

		const newData = new UserData(destUser.id);
		await newData.sync();
		const compareResult = sourceData.equals(newData);
		logResult(compareResult, sourceData, newData);

		expect(compareResult.result).toBe(true);

		if (newData.poh) newData.poh.spellbook_altar = 33;
		if (newData.userStats) newData.userStats.sacrificed_bank = new Bank().add('Cannonball').bank;
		newData.skillsAsLevels!.cooking = 1_000_000;
		newData.bingos = [];
		newData.botItemSell = [];
		if (newData.gear?.melee) newData.gear.melee.weapon = null;

		const badResult = sourceData.equals(newData);
		expect(badResult.result).toBe(false);

		const expectedBadResult = [
			`Failed comparing ${sourceUser.id} vs ${destUser.id}:`,
			"melee gear doesn't match",
			"cooking level doesn't match. 1 vs 1000000",
			"POH Object doesn't match: null !== 33",
			'User Stats doesn\'t match: {} !== {"2":1}',
			'Wrong number of BotItemSell rows. 1 vs 0'
		];
		expect(badResult.errors).toEqual(expectedBadResult);
	});

	test(
		'test migrating random user on top of empty profile',
		async () => {
			const sourceUser = await buildBaseUser(randomSnowflake());
			const destUserId = randomSnowflake();

			const sourceRolls = randInt(6, 11);
			const cmdHistory = await runRandomTestCommandsOnUser(sourceUser, sourceRolls);

			// sleep to let the DB catch up - necessary!
			await sleep(sleepDelay);
			const sourceData = new UserData(sourceUser);
			await sourceData.sync();

			const result = await migrateUser(sourceUser, destUserId);

			if (result !== true) throw new Error(`${sourceUser.id} - ${result}`);
			expect(result).toEqual(true);

			const newData = new UserData(destUserId);
			await newData.sync();

			const compareResult = sourceData.equals(newData);
			logResult(compareResult, sourceData, newData, cmdHistory, []);

			expect(compareResult.result).toBe(true);
		},
		{ repeats: 3 }
	);

	test(
		'test migrating random user on top of random profile',
		async () => {
			const sourceUser = await buildBaseUser(randomSnowflake());
			const destUser = await buildBaseUser(randomSnowflake());

			const sourceRolls = randInt(5, 12);
			const destRolls = randInt(5, 12);

			const srcHistory = await runRandomTestCommandsOnUser(sourceUser, sourceRolls);
			const dstHistory = await runRandomTestCommandsOnUser(destUser, destRolls);

			// sleep to let the DB catch up - necessary!
			await sleep(sleepDelay);
			const sourceData = new UserData(sourceUser);
			await sourceData.sync();

			const result = await migrateUser(sourceUser, destUser);
			expect(result).toEqual(true);

			const newData = new UserData(destUser);
			await newData.sync();

			const compareResult = sourceData.equals(newData);
			logResult(compareResult, sourceData, newData, srcHistory, dstHistory);

			expect(compareResult.result).toBe(true);
		},
		{ repeats: 6 }
	);

	test(
		'test migrating random user on top of full profile',
		async () => {
			const sourceUser = await buildBaseUser(randomSnowflake());
			const destUser = await buildBaseUser(randomSnowflake());

			const cmdHistory = await runRandomTestCommandsOnUser(sourceUser);
			await runAllTestCommandsOnUser(destUser);

			// sleep to let the DB catch up - necessary!
			await sleep(sleepDelay);
			const sourceData = new UserData(sourceUser);
			await sourceData.sync();

			const result = await migrateUser(sourceUser, destUser);
			expect(result).toEqual(true);

			const newData = new UserData(destUser);
			await newData.sync();

			const compareResult = sourceData.equals(newData);
			logResult(compareResult, sourceData, newData, cmdHistory, []);

			expect(compareResult.result).toBe(true);
		},
		{ repeats: 3 }
	);

	// Sleep to avoid 'command failed' errors
	await sleep(sleepDelay);
});
