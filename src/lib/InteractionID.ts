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
	}
} as const;
