import { UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { ItemBank } from '../types';

export class MUserStats {
	userStats: UserStats;
	baHonourLevel: number;

	constructor(userStats: UserStats) {
		this.userStats = userStats;
		this.baHonourLevel = userStats.honour_level;
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

	get lapsScores(): Bank {
		return new Bank(this.userStats.laps_scores as ItemBank);
	}
}
