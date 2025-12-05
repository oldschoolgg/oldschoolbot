export type AuthenticatedUser = {
	id: string;
	username: string | null;
	avatar: string | null;
	global_name: string | null;
	bits: number[];
}
