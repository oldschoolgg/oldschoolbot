export const InteractionID = {
	PaginatedMessage: {
		FirstPage: 'PM_FIRST_PAGE',
		PreviousPage: 'PM_PREVIOUS_PAGE',
		NextPage: 'PM_NEXT_PAGE',
		LastPage: 'PM_LAST_PAGE'
	},
	Slayer: {
		AutoSlaySaved: 'SLAYER_AUTO_SLAY_SAVED',
		AutoSlayDefault: 'SLAYER_AUTO_SLAY_DEFAULT',
		AutoSlayEHP: 'SLAYER_AUTO_SLAY_EHP',
		AutoSlayBoss: 'SLAYER_AUTO_SLAY_BOSS',
		SkipTask: 'SLAYER_SKIP_TASK',
		CancelTask: 'SLAYER_CANCEL_TASK',
		BlockTask: 'SLAYER_BLOCK_TASK'
	}
} as const;
