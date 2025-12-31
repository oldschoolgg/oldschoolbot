import type { ItemBank } from 'oldschooljs';

export type AuthenticatedUser = {
	id: string;
	username: string | null;
	avatar: string | null;
	global_name: string | null;
	bits: number[];
};

type RoboChimpInfo = {
	osb_total_level: number | null;
	bso_total_level: number | null;
	// osb_total_xp: number | null;
	// bso_total_xp: number | null;
	osb_cl_percent: number | null;
	bso_cl_percent: number | null;
	osb_mastery: number | null;
	bso_mastery: number | null;
};

export type FullMinionData = RoboChimpInfo & {
	gp: number;
	is_ironman: boolean;
	qp: number;
	collection_log_bank: ItemBank;
	bitfield: number[];
};

export type AUserIdentity = {
	user_id: string;
	username: string;
	avatar: string | null;
};
