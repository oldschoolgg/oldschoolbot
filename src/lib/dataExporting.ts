async function minionExport(userID: string) {
	const user = await mUserFetch(userID);
	const data: Record<any, any> = {};
	data.id = user.id;
	data.cl = user.cl;
	data.bank = user.bank;
	data.gp = user.GP;
	data.equipped_pet = user.user.minion_equippedPet;
	data.combat_level = user.combatLevel;
	data.gear = user.gear;
	data.skills_xp = user.skillsAsXP;
	data.skills_levels = user.skillsAsLevels;
	data.is_ironman = user.isIronman;
	data.qp = user.QP;
	data.bought_date = user.user.minion_bought_date;
	data.name = user.user.minion_name;
	data.blowpipe = user.blowpipe;
	data.ironman_alts = user.user.ironman_alts;
	data.main_account = user.user.main_account;
	data.slayer_unlocks = user.user.slayer_unlocks;
	data.slayer_blocked_tasks = user.user.slayer_blocked_ids;
	data.badges = user.user.badges;
	data.bitfield = user.user.bitfield;
}
