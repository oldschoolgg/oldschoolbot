export const InteractionID = {
	PaginatedMessage: {
		FirstPage: 'PM_FIRST_PAGE',
		PreviousPage: 'PM_PREVIOUS_PAGE',
		NextPage: 'PM_NEXT_PAGE',
		LastPage: 'PM_LAST_PAGE'
	},
	Slayer: {
		AutoSlay: 'AUTO_SLAY',
		AutoSlaySaved: 'SLAYER_AUTO_SLAY_SAVED',
		AutoSlayDefault: 'SLAYER_AUTO_SLAY_DEFAULT',
		AutoSlayEHP: 'SLAYER_AUTO_SLAY_EHP',
		AutoSlayBoss: 'SLAYER_AUTO_SLAY_BOSS',
		SkipTask: 'SLAYER_SKIP_TASK',
		CancelTask: 'SLAYER_CANCEL_TASK',
		BlockTask: 'SLAYER_BLOCK_TASK'
	},
	Party: {
		Join: 'PARTY_JOIN',
		Leave: 'PARTY_LEAVE',
		Cancel: 'PARTY_CANCEL',
		Start: 'PARTY_START'
	},
	Confirmation: {
		Confirm: 'CONFIRM',
		Cancel: 'CANCEL'
	},
	Open: {
		BeginnerCasket: 'OPEN_BEGINNER_CASKET',
		EasyCasket: 'OPEN_EASY_CASKET',
		MediumCasket: 'OPEN_MEDIUM_CASKET',
		HardCasket: 'OPEN_HARD_CASKET',
		EliteCasket: 'OPEN_ELITE_CASKET',
		MasterCasket: 'OPEN_MASTER_CASKET',
		GrandMasterCasket: 'OPEN_GRANDMASTER_CASKET',
		ElderCasket: 'OPEN_ELDER_CASKET',
		SeedPack: 'OPEN_SEED_PACK'
	},
	Commands: {
		BuyMinion: 'BUY_MINION',
		CancelTrip: 'CANCEL_TRIP',
		RepeatTrip: 'REPEAT_TRIP',
		CheckPatches: 'CHECK_PATCHES',
		ClaimDaily: 'CLAIM_DAILY',
		DoShootingStar: 'DO_SHOOTING_STAR',
		StartTearsOfGuthix: 'START_TOG',
		NewSlayerTask: 'NEW_SLAYER_TASK',
		DoBirdHouseRun: 'DO_BIRDHOUSE_RUN',
		// Farming
		FarmingContractEasier: 'FARMING_CONTRACT_EASIER',
		AutoFarmingContract: 'AUTO_FARMING_CONTRACT',
		AutoFarm: 'AUTO_FARM',
		// Clues
		DoBeginnerClue: 'DO_BEGINNER_CLUE',
		DoEasyClue: 'DO_EASY_CLUE',
		DoMediumClue: 'DO_MEDIUM_CLUE',
		DoHardClue: 'DO_HARD_CLUE',
		DoEliteClue: 'DO_ELITE_CLUE',
		DoMasterClue: 'DO_MASTER_CLUE',
		DoGrandMaserClue: 'DO_GRANDMASTER_CLUE',
		DoElderClue: 'DO_ELDER_CLUE',

		// BSO
		RepeatTameTrip: 'REPEAT_TAME_TRIP',
		SpawnLamp: 'SPAWN_LAMP',
		SendItemContract: 'ITEM_CONTRACT_SEND',
		DoFishingContest: 'DO_FISHING_CONTEST'
	}
} as const;
