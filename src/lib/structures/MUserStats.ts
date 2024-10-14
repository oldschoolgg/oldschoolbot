import type { UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../clues/clueTiers';
import type { ClueBank } from '../minions/types';
import type { ItemBank } from '../types';
import { getToaKCs } from '../util/smallUtils';

export class MUserStats {
	userStats: UserStats;
	baHonourLevel: number;
	sacrificedBank: Bank;
	titheFarmsCompleted: number;
	lapsScores: ItemBank;
	openableScores: Bank;
	kcBank: ItemBank;
	highGambles: number;
	gotrRiftSearches: number;
	slayerWildyTaskStreak: number;
	slayerTaskStreak: number;

	constructor(userStats: UserStats) {
		this.userStats = userStats;
		this.baHonourLevel = userStats.honour_level;
		const sacBank = this.userStats.sacrificed_bank as ItemBank;
		// biome-ignore lint/performance/noDelete: <explanation>
		delete sacBank['0'];
		this.sacrificedBank = new Bank().add(sacBank);
		this.titheFarmsCompleted = this.userStats.tithe_farms_completed;
		this.lapsScores = userStats.laps_scores as ItemBank;
		this.openableScores = new Bank().add(userStats.openable_scores as ItemBank);
		this.kcBank = userStats.monster_scores as ItemBank;
		this.highGambles = userStats.high_gambles;
		this.gotrRiftSearches = userStats.gotr_rift_searches;
		this.slayerWildyTaskStreak = userStats.slayer_wildy_task_streak;
		this.slayerTaskStreak = userStats.slayer_task_streak;
	}

	static async fromID(id: string) {
		const userStats = await prisma.userStats.findFirstOrThrow({ where: { user_id: BigInt(id) } });
		return new MUserStats(userStats);
	}

	getToaKCs() {
		return getToaKCs(this.userStats.toa_raid_levels_bank);
	}

	clueScoresFromOpenables(): ClueBank {
		const clueCounts = {} as ClueBank;
		for (const tier of ClueTiers) clueCounts[tier.name] = 0;

		for (const [key, val] of Object.entries(this.userStats.openable_scores as ItemBank)) {
			const clueTier = ClueTiers.find(i => i.id === Number.parseInt(key));
			if (!clueTier) continue;
			clueCounts[clueTier.name] += val;
		}

		return clueCounts;
	}

	get monsterScores() {
		return this.userStats.monster_scores as ItemBank;
	}

	sacrifiedBank() {
		return new Bank().add(this.userStats.sacrificed_bank as ItemBank);
	}

	randomEventCompletionsBank() {
		return this.userStats.random_event_completions_bank as ItemBank;
	}

	get lootFromZippyBank(): Bank {
		return new Bank(this.userStats.loot_from_zippy_bank as ItemBank);
	}

	get barsFromAdzeBank(): Bank {
		return new Bank(this.userStats.bars_from_adze_bank as ItemBank);
	}

	get oresFromSpiritsBank(): Bank {
		return new Bank(this.userStats.ores_from_spirits_bank as ItemBank);
	}

	get barsFromKlikBank(): Bank {
		return new Bank(this.userStats.bars_from_klik_bank as ItemBank);
	}

	get portableTannerBank(): Bank {
		return new Bank(this.userStats.portable_tanner_bank as ItemBank);
	}

	get clueUpgraderBank(): Bank {
		return new Bank(this.userStats.clue_upgrader_bank as ItemBank);
	}

	get icCostBank(): Bank {
		return new Bank(this.userStats.ic_cost_bank as ItemBank);
	}

	get icLootBank(): Bank {
		return new Bank(this.userStats.ic_loot_bank as ItemBank);
	}

	get pekyLootBank(): Bank {
		return new Bank(this.userStats.peky_loot_bank as ItemBank);
	}

	get obisLootBank(): Bank {
		return new Bank(this.userStats.obis_loot_bank as ItemBank);
	}

	get brockLootBank(): Bank {
		return new Bank(this.userStats.brock_loot_bank as ItemBank);
	}

	get wilvusLootBank(): Bank {
		return new Bank(this.userStats.wilvus_loot_bank as ItemBank);
	}

	get dougLootBank(): Bank {
		return new Bank(this.userStats.doug_loot_bank as ItemBank);
	}

	get harryLootBank(): Bank {
		return new Bank(this.userStats.harry_loot_bank as ItemBank);
	}

	get smokeyLootBank(): Bank {
		return new Bank(this.userStats.smokey_loot_bank as ItemBank);
	}

	get doubledLootBank(): Bank {
		return new Bank(this.userStats.doubled_loot_bank as ItemBank);
	}

	get icDonationsGivenBank(): Bank {
		return new Bank(this.userStats.ic_donations_given_bank as ItemBank);
	}

	get icDonationsReceivedBank(): Bank {
		return new Bank(this.userStats.ic_donations_received_bank as ItemBank);
	}

	get tameClBank(): Bank {
		return new Bank(this.userStats.tame_cl_bank as ItemBank);
	}

	get doaCost(): Bank {
		return new Bank(this.userStats.doa_cost as ItemBank);
	}

	get doaLoot(): Bank {
		return new Bank(this.userStats.doa_loot as ItemBank);
	}

	get chinCannonDestroyedLoot(): Bank {
		return new Bank(this.userStats.chincannon_destroyed_loot_bank as ItemBank);
	}

	get cleansingScrollBank(): Bank {
		return new Bank(this.userStats.cleansing_scroll_bank as ItemBank);
	}
}
