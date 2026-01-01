import type { ItemBank } from 'oldschooljs';

export type AuthenticatedUser = {
	id: string;
	username: string | null;
	avatar: string | null;
	global_name: string | null;
	bits: number[];
};

export type FullMinionData = {
	gp: number;
	is_ironman: boolean;
	qp: number;
	collection_log_bank: ItemBank;
	bitfield: number[];
};

export type SUserIdentity = {
	user_id: string;
	username: string;
	avatar: string | null;
};
