import {
	type Activity,
	type Bingo,
	type BingoParticipant,
	type BotItemSell,
	type BuyCommandTransaction,
	type CommandUsage,
	type EconomyTransaction,
	type FarmedCrop,
	type GEListing,
	type GearPreset,
	type Giveaway,
	type HistoricalData,
	type LastManStandingGame,
	type LootTrack,
	type Minigame,
	type PinnedTrip,
	type PlayerOwnedHouse,
	type Prisma,
	type ReclaimableItem,
	type SlayerTask,
	type StashUnit,
	type UserStats,
	type XPGain,
	type activity_type_enum,
	command_name_enum
} from '@prisma/client';
import { Time, deepClone, randArrItem, randInt, shuffleArr, sumArr } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';
import { beforeAll, expect, test, vi } from 'vitest';

import { processPendingActivities } from '../../src/lib/Task';
import { BitField } from '../../src/lib/constants';
import type { GearSetupType, UserFullGearSetup } from '../../src/lib/gear/types';
import { trackLoot } from '../../src/lib/lootTrack';
import type { MinigameName } from '../../src/lib/settings/minigames';
import { incrementMinigameScore } from '../../src/lib/settings/minigames';
import type { SkillsEnum } from '../../src/lib/skilling/types';
import { slayerMasters } from '../../src/lib/slayer/slayerMasters';
import { assignNewSlayerTask } from '../../src/lib/slayer/slayerUtil';
import type { Skills } from '../../src/lib/types';
import { isGroupActivity, resolveItems } from '../../src/lib/util';
import { gearEquipMultiImpl } from '../../src/lib/util/equipMulti';
import { findPlant } from '../../src/lib/util/farmingHelpers';
import getOSItem from '../../src/lib/util/getOSItem';
import { migrateUser } from '../../src/lib/util/migrateUser';
import { tradePlayerItems } from '../../src/lib/util/tradePlayerItems';
import { updateBankSetting } from '../../src/lib/util/updateBankSetting';
import { pinTripCommand } from '../../src/mahoji/commands/config';
import { geCommand } from '../../src/mahoji/commands/ge';
import { createOrEditGearSetup } from '../../src/mahoji/commands/gearpresets';
import { minionCommand } from '../../src/mahoji/commands/minion';
import { getPOH, pohWallkitCommand } from '../../src/mahoji/lib/abstracted_commands/pohCommand';
import {
	stashUnitBuildAllCommand,
	stashUnitFillAllCommand
} from '../../src/mahoji/lib/abstracted_commands/stashUnitsCommand';
import type { OSBMahojiCommand } from '../../src/mahoji/lib/util';
import { updateClientGPTrackSetting, userStatsUpdate } from '../../src/mahoji/mahojiSettings';
import { calculateResultOfLMSGames, getUsersLMSStats } from '../../src/tasks/minions/minigames/lmsActivity';
import type { TestUser } from './util';
import { createTestUser, mockClient, mockedId } from './util';

interface TestCommand {
	name: string;
	cmd: [OSBMahojiCommand, object] | ((user: TestUser) => Promise<any>);
	activity?: boolean;
	priority?: boolean;
}
class UserData {
	// Class Data
	private loaded = false;
	private mUser: MUser | null = null;

	// Robochimp:
	githubId: number | null;
	migratedUserId: bigint | null;

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

	constructor(_user: string | MUser) {
		this.id = typeof _user === 'string' ? _user : _user.id;
		this.githubId = null;
		this.migratedUserId = null;
	}

	async sync() {
		if (this.mUser === null) {
			this.mUser = await mUserFetch(this.id);
		} else {
			await this.mUser.sync();
		}
		const newUser = await global.prisma!.newUser.findFirst({ where: { id: this.id }, select: { username: true } });
		if (newUser) this.username = newUser.username;

		this.bank = new Bank(this.mUser.bank);
		this.clbank = new Bank(this.mUser.cl);
		this.gear = { ...deepClone(this.mUser.gear) };
		this.skillsAsLevels = deepClone(this.mUser.skillsAsLevels);

		const robochimpUser = await roboChimpClient.user.findFirst({
			where: { id: BigInt(this.id) },
			select: { github_id: true, migrated_user_id: true }
		});
		if (robochimpUser) {
			this.githubId = robochimpUser.github_id;
			this.migratedUserId = robochimpUser.migrated_user_id;
		}

		const stashUnits = await global.prisma!.stashUnit.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { stash_id: 'asc' }
		});
		if (stashUnits.length > 0) this.stashUnits = stashUnits;

		const gearPresets = await global.prisma!.gearPreset.findMany({
			where: { user_id: this.id },
			orderBy: { name: 'asc' }
		});
		if (gearPresets.length > 0) this.gearPresets = gearPresets;

		const activities = await global.prisma!.activity.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { start_date: 'asc' }
		});
		if (activities.length > 0) this.activities = activities;

		const slayerTasks = await global.prisma!.slayerTask.findMany({
			where: { user_id: this.id },
			orderBy: { id: 'asc' }
		});
		if (slayerTasks.length > 0) this.slayerTasks = slayerTasks;

		const poh = await global.prisma!.playerOwnedHouse.findFirst({ where: { user_id: this.id } });
		if (poh) this.poh = poh;

		const giveaways = await global.prisma!.giveaway.findMany({
			where: { user_id: this.id },
			orderBy: { id: 'asc' }
		});
		if (giveaways.length > 0) this.giveaways = giveaways;

		const farmedCrops = await global.prisma!.farmedCrop.findMany({
			where: { user_id: this.id },
			orderBy: { id: 'asc' }
		});
		if (farmedCrops.length > 0) this.farmedCrops = farmedCrops;

		const minigames = await global.prisma!.minigame.findFirst({ where: { user_id: this.id } });
		if (minigames) this.minigames = minigames;

		const pinnedTrips = await global.prisma!.pinnedTrip.findMany({
			where: { user_id: this.id },
			orderBy: { activity_id: 'asc' }
		});
		if (pinnedTrips.length > 0) this.pinnedTrips = pinnedTrips;

		const lms = await global.prisma!.lastManStandingGame.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (lms.length > 0) this.lms = lms;

		const lootTrack = await global.prisma!.lootTrack.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (lootTrack.length > 0) this.lootTrack = lootTrack;

		const botItemSell = await global.prisma!.botItemSell.findMany({
			where: { user_id: this.id },
			orderBy: { item_id: 'asc' }
		});
		if (botItemSell.length > 0) this.botItemSell = botItemSell;

		const buyCommandTx = await global.prisma!.buyCommandTransaction.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (buyCommandTx.length > 0) this.buyCommandTx = buyCommandTx;

		const reclaimableItems = await global.prisma!.reclaimableItem.findMany({
			where: { user_id: this.id },
			orderBy: { key: 'asc' }
		});
		if (reclaimableItems.length > 0) this.reclaimableItems = reclaimableItems;

		const xpGains = await global.prisma!.xPGain.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { id: 'asc' }
		});
		if (xpGains.length > 0) this.xpGains = xpGains;

		const economyTx = await global.prisma!.economyTransaction.findMany({
			where: { OR: [{ sender: BigInt(this.id) }, { recipient: BigInt(this.id) }] },
			orderBy: { date: 'asc' }
		});

		if (economyTx.length > 0) this.economyTx = economyTx;

		const bingoParticipant = await global.prisma!.bingoParticipant.findMany({
			where: { user_id: this.id },
			orderBy: { bingo_id: 'asc' }
		});
		if (bingoParticipant.length > 0) this.bingoParticipant = bingoParticipant;

		const userStats = await global.prisma!.userStats.findFirst({ where: { user_id: BigInt(this.id) } });
		if (userStats) this.userStats = userStats;

		const bingos = await global.prisma!.bingo.findMany({ where: { creator_id: this.id }, orderBy: { id: 'asc' } });
		if (bingos.length > 0) this.bingos = bingos;

		const historicalData = await global.prisma!.historicalData.findMany({
			where: { user_id: this.id },
			orderBy: { date: 'asc' }
		});
		if (historicalData.length > 0) this.historicalData = historicalData;

		const commandUsage = await global.prisma!.commandUsage.findMany({
			where: { user_id: BigInt(this.id) },
			orderBy: { date: 'asc' }
		});
		if (commandUsage.length > 0) this.commandUsage = commandUsage;

		const geListings = await global.prisma!.gEListing.findMany({
			where: { user_id: this.id },
			orderBy: { id: 'asc' }
		});
		if (geListings.length > 0) this.geListings = geListings;

		this.loaded = true;
	}

	equals(target: UserData, ignoreRoboChimp = false): { result: boolean; errors: string[] } {
		const errors: string[] = [];
		if (!this.loaded || !target.loaded) {
			errors.push('Both UserData object must be loaded. Try .sync()');
			return { result: false, errors };
		}

		if (this.username !== target.username) {
			errors.push(`Usernames don't match (new_users) - ${this.username}:${target.username}`);
		}

		if (!ignoreRoboChimp && this.githubId !== target.githubId) {
			// RoboChimp can be ignored ONLY when it's the second migration (both bots)
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
			const randomActivities: activity_type_enum[] = [
				'Runecraft',
				'Woodcutting',
				'Mining',
				'Crafting',
				'Fletching',
				'Firemaking'
			];
			for (let x = 0; x < 3; x++) {
				const activity = randArrItem(randomActivities);
				const baseDate = new Date();
				const start_date = new Date(baseDate.getTime() - randInt(30, 100) * Time.Hour);
				const duration = Time.Hour - randInt(10, 30) * Time.Minute;
				const finish_date = new Date(start_date.getTime() + duration);
				const data = {
					user_id: BigInt(user.id),
					start_date,
					finish_date,
					completed: true,
					type: activity,
					data: {},
					group_activity: false,
					channel_id: 11_111_111_111n,
					duration
				};
				await global.prisma!.activity.create({ data });
			}
		}
	},
	{
		name: 'Group Activity',
		cmd: async user => {
			const users = shuffleArr([user.id, mockedId(), mockedId()]);
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
			await global.prisma!.activity.create({
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
		cmd: async user => {
			await getPOH(user.id);
		}
	},
	{
		name: 'Set POH Wallkit',
		cmd: async user => {
			await pohWallkitCommand(user, 'Hosidius');
		}
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
			const lootBank = new Bank().add(randArrItem(randomBuyItems), randInt(10, 999));
			await global.prisma!.buyCommandTransaction.create({
				data: {
					user_id: BigInt(user.id),
					cost_gp: randInt(10_000, 10_000_000),
					cost_bank_excluding_gp: {},
					loot_bank: lootBank.toJSON()
				}
			});
		}
	},
	{
		name: 'Economy Transaction (sender)',
		cmd: async user => {
			const randomItems = ['Cannonball', 'Blood rune', 'Twisted bow', 'Kodai wand', 'Bandos tassets'];
			const recvBank = new Bank().add(randArrItem(randomItems), randInt(10, 99)).add(randArrItem(randomItems));
			const partner = await createTestUser(recvBank);
			await tradePlayerItems(user, partner, undefined, recvBank);
		}
	},
	{
		name: 'Economy Transaction (receiver)',
		cmd: async user => {
			const randomItems = ['Feather', 'Soul rune', 'Dragon claws', 'Ghrazi rapier', 'Bandos boots'];
			const recvBank = new Bank().add(randArrItem(randomItems), randInt(10, 99)).add(randArrItem(randomItems));
			const partner = await createTestUser(recvBank);
			await tradePlayerItems(partner, user, recvBank, undefined);
		}
	},
	{
		name: 'Skilling Gear',
		cmd: async user => {
			const setup = 'skilling';
			const items = 'Pyromancer garb, Pyromancer boots, Pyromancer hood, Pyromancer robe, Warm gloves';
			const { success: resultSuccess, failMsg, equippedGear } = gearEquipMultiImpl(user, setup, items);
			if (!resultSuccess) return failMsg!;

			await user.update({ [`gear_${setup}`]: equippedGear as Prisma.InputJsonValue });
		}
	},
	{
		name: 'Melee Gear',
		cmd: async user => {
			const setup = 'melee';
			const items = 'Bandos chestplate, Bandos tassets, Berserker ring, Ghrazi rapier';
			const { success: resultSuccess, failMsg, equippedGear } = gearEquipMultiImpl(user, setup, items);
			if (!resultSuccess) return failMsg!;
			if (!equippedGear) throw new Error('Equipped gear is undefined');
			await user.update({ [`gear_${setup}`]: equippedGear as Prisma.InputJsonValue });
		}
	},
	{
		name: 'GearPresets',
		cmd: async user => {
			const presetNamme = `preset${randInt(100, 999).toString()}`;
			await createOrEditGearSetup(
				user,
				undefined,
				presetNamme,
				false,
				{
					body: 'Bandos chestplate',
					legs: 'Bandos tassets',
					ring: 'Berserker ring',
					weapon: 'Ghrazi rapier'
				},
				undefined,
				undefined
			);
		}
	},
	{
		name: 'Create giveaway',
		cmd: async user => {
			await global.prisma!.giveaway.create({
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
		cmd: async user => {
			await assignNewSlayerTask(user, slayerMasters.find(sm => sm.name === 'Turael')!);
		}
	},
	{
		name: 'Farmed crop',
		cmd: async user => {
			const plant = findPlant('Potato')!;
			await global.prisma!.farmedCrop.create({
				data: {
					user_id: user.id,
					date_planted: new Date(),
					item_id: plant.id,
					quantity_planted: randInt(8, 16),
					was_autofarmed: false,
					paid_for_protection: true,
					upgrade_type: 'compost'
				}
			});
		}
	},
	{
		name: 'Minigames',
		cmd: async user => {
			const minigames: MinigameName[] = [
				'mahogany_homes',
				'pyramid_plunder',
				'agility_arena',
				'raids',
				'gauntlet'
			];
			const quantity = randInt(10, 20);
			await incrementMinigameScore(user.id, randArrItem(minigames), quantity);
		}
	},
	{
		name: 'Pin Trip',
		cmd: async user => {
			const result = await global.prisma!.activity.findFirst({
				where: { user_id: BigInt(user.id) },
				select: { id: true }
			});
			if (result) {
				await pinTripCommand(user, result.id.toString(), undefined, undefined);
			}
		}
	},
	{
		name: 'Last man standing',
		cmd: async user => {
			const quantity = 7;
			const lmsStats = await getUsersLMSStats(user);

			const result = calculateResultOfLMSGames(quantity, lmsStats);

			await global.prisma!.lastManStandingGame.createMany({
				data: result.map(i => ({ ...i, user_id: BigInt(user.id), points: undefined }))
			});
			const points = sumArr(result.map(i => i.points));

			await user.update({
				lms_points: {
					increment: points
				}
			});
		}
	},
	{
		name: 'Loot track',
		cmd: async user => {
			const randomItems = ['Smouldering stone', 'Elysian sigil', 'Twisted bow', 'Pegasian crystal'];
			const duration = randInt(30, 45) * Time.Minute;
			const quantity = randInt(50, 500);
			const totalLoot = new Bank().add(randArrItem(randomItems));
			const totalCost = new Bank().add('Coins', randInt(100, 10_000)).add('Saradomin brew(4)', randInt(1, 99));
			// Track items lost
			await trackLoot({
				totalCost,
				id: 'Goblin',
				type: 'Monster',
				changeType: 'cost',
				users: [
					{
						id: user.id,
						cost: totalCost
					}
				]
			});
			// Track loot (For duration)
			await trackLoot({
				totalLoot,
				id: 'Goblin',
				type: 'Monster',
				changeType: 'loot',
				duration,
				kc: quantity,
				users: [
					{
						id: user.id,
						loot: totalLoot,
						duration
					}
				]
			});
		}
	},
	{
		name: 'User stats',
		cmd: async user => {
			const points = randInt(1000, 10_000);

			await userStatsUpdate(
				user.id,
				{
					tithe_farms_completed: {
						increment: 1
					},
					tithe_farm_points: {
						increment: points
					}
				},
				{}
			);
		}
	},
	{
		name: 'Bot Item Transaction',
		cmd: async user => {
			const randomSellItems = ['Shield left half', 'Feather', 'Cannonball', 'Elysian sigil', 'Fire rune'];
			const itemPrice = randInt(500, 50_000_000);
			const bankToSell = new Bank();
			const item = getOSItem(randArrItem(randomSellItems));
			const qty = randInt(1, 10);
			const totalPrice = itemPrice * qty;

			bankToSell.add(item, qty);
			const botItemSellData: Prisma.BotItemSellCreateManyInput[] = [];
			botItemSellData.push({
				item_id: item.id,
				quantity: qty,
				gp_received: totalPrice,
				user_id: user.id
			});

			const stats = await user.fetchStats({ items_sold_bank: true });
			await Promise.all([
				updateClientGPTrackSetting('gp_sell', totalPrice),
				updateBankSetting('sold_items_bank', bankToSell),
				userStatsUpdate(
					user.id,
					{
						items_sold_bank: new Bank(stats.items_sold_bank as ItemBank).add(bankToSell).toJSON(),
						sell_gp: {
							increment: totalPrice
						}
					},
					{}
				),
				global.prisma!.botItemSell.createMany({ data: botItemSellData })
			]);
		}
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
			await stashUnitBuildAllCommand(user);
			await stashUnitFillAllCommand(user, user.user);
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
			await global.prisma!.bingo.create({ data: createOptions });
		}
	},
	{
		name: 'Bingo Participant',
		cmd: async user => {
			const activeBingos = await global.prisma!.bingo.findMany({ select: { id: true } });
			if (activeBingos.length === 0) return;
			const myBingo = randArrItem(activeBingos).id;
			// Check if we're in this bingo already:
			const existingTeam = await global.prisma!.bingoParticipant.findFirst({
				where: { user_id: user.id, bingo_id: myBingo }
			});
			if (existingTeam) return;
			await global.prisma!.bingoTeam.create({
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
		name: 'Create robochimp user',
		cmd: async user => {
			const updateObj = { github_id: randInt(100_000, 999_999) };
			await roboChimpClient.user.upsert({
				where: {
					id: BigInt(user.id)
				},
				update: updateObj,
				create: {
					id: BigInt(user.id),
					...updateObj
				}
			});
		}
	},
	{
		name: 'Historical data',
		cmd: async user => {
			await global.prisma!.historicalData.create({
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
			const randCommands = [
				command_name_enum.minion,
				command_name_enum.runecraft,
				command_name_enum.chop,
				command_name_enum.mine,
				command_name_enum.buy
			];
			await global.prisma!.commandUsage.create({
				data: {
					user_id: BigInt(user.id),
					channel_id: 1_111_111_111n,
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
			await global.prisma!.reclaimableItem.create({
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

async function runRandomTestCommandsOnUser(user: TestUser, numCommands = 6, forceRoboChimp = false) {
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
	if (forceRoboChimp) {
		const command = allTableCommands.filter(c => c.name.toLowerCase().includes('robochimp'))![0];
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
		id: userId,
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
		GP: 100_000_000
	};
	const user = await createTestUser(startBank, userData);
	return user;
}

vi.doMock('../../src/lib/util', async () => {
	const actual: any = await vi.importActual('../../src/lib/util');
	return {
		...actual,
		channelIsSendable: () => false
	};
});

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

test.concurrent('test preventing a double (clobber) robochimp migration (two bot-migration)', async () => {
	const sourceUserId = mockedId();
	const destUserId = mockedId();

	// Create source user, and populate data:
	const sourceUser = await buildBaseUser(sourceUserId);
	const srcHistory = await runRandomTestCommandsOnUser(sourceUser, 5, true);

	const sourceData = new UserData(sourceUser);
	await sourceData.sync();

	const migrateResult = await migrateUser(sourceUser.id, destUserId);
	expect(migrateResult).toEqual(true);

	const destData = new UserData(destUserId);
	await destData.sync();

	const compareResult = sourceData.equals(destData);
	logResult(compareResult, sourceData, destData, srcHistory, []);
	expect(compareResult.result).toBe(true);

	// Now the actual test, everything above has to happen first...
	await runAllTestCommandsOnUser(sourceUser);

	const newSourceData = new UserData(sourceUser);
	await newSourceData.sync();

	const secondMigrateResult = await migrateUser(sourceUser.id, destUserId);
	expect(secondMigrateResult).toEqual(true);

	const newDestData = new UserData(destUserId);
	await newDestData.sync();

	const newCompareResult = sourceData.equals(destData);
	logResult(newCompareResult, newSourceData, newDestData);
	expect(newCompareResult.result).toBe(true);

	expect(newDestData.githubId).toEqual(sourceData.githubId);
	expect(newDestData.githubId).toEqual(destData.githubId);

	// Make sure the 2nd transfer didn't overwrite robochimp:
	expect(newDestData.githubId !== newSourceData.githubId).toBeTruthy();

	// Verify migrated id is correct
	expect(newDestData.migratedUserId).toEqual(BigInt(sourceData.id));
});

beforeAll(async () => {
	await mockClient();
});

test.concurrent('test migrating existing user to target with no records', async () => {
	const sourceUser = await buildBaseUser(mockedId());
	await runAllTestCommandsOnUser(sourceUser);

	const destUserId = mockedId();

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

test.concurrent('test migrating full user on top of full profile', async () => {
	const sourceUser = await buildBaseUser(mockedId());
	const destUser = await buildBaseUser(mockedId());
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
	if (newData.userStats) newData.userStats.sacrificed_bank = new Bank().add('Cannonball').toJSON();
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

test.concurrent('test migrating random user on top of empty profile', async () => {
	const sourceUser = await buildBaseUser(mockedId());
	const destUserId = mockedId();

	const sourceRolls = randInt(6, 11);
	const cmdHistory = await runRandomTestCommandsOnUser(sourceUser, sourceRolls);

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
});

test.concurrent('test migrating random user on top of random profile', async () => {
	const sourceUser = await buildBaseUser(mockedId());
	const destUser = await buildBaseUser(mockedId());

	const sourceRolls = randInt(5, 12);
	const destRolls = randInt(5, 12);

	const srcHistory = await runRandomTestCommandsOnUser(sourceUser, sourceRolls);
	const dstHistory = await runRandomTestCommandsOnUser(destUser, destRolls);

	const sourceData = new UserData(sourceUser);
	await sourceData.sync();

	const result = await migrateUser(sourceUser, destUser);
	expect(result).toEqual(true);

	const newData = new UserData(destUser);
	await newData.sync();

	const compareResult = sourceData.equals(newData);
	logResult(compareResult, sourceData, newData, srcHistory, dstHistory);

	expect(compareResult.result).toBe(true);
});

test.concurrent('test migrating random user on top of full profile', async () => {
	const sourceUser = await buildBaseUser(mockedId());
	const destUser = await buildBaseUser(mockedId());

	const cmdHistory = await runRandomTestCommandsOnUser(sourceUser);
	await runAllTestCommandsOnUser(destUser);

	const sourceData = new UserData(sourceUser);
	await sourceData.sync();

	const result = await migrateUser(sourceUser, destUser);
	expect(result).toEqual(true);

	const newData = new UserData(destUser);
	await newData.sync();

	const compareResult = sourceData.equals(newData);
	logResult(compareResult, sourceData, newData, cmdHistory, []);

	expect(compareResult.result).toBe(true);
});
