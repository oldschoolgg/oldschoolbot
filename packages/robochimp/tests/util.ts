import { cryptoRng } from '@oldschoolgg/rng';
import type { Prisma, User } from '@prisma/robochimp';

import { RUser } from '../src/structures/RUser.js';

class TestRUser extends RUser {
	override async update(data: Prisma.UserUncheckedUpdateInput): Promise<this> {
		for (const [key, value] of Object.entries(data)) {
			// @ts-expect-error
			this._user[key] = value;
		}
		return this;
	}
}

export function mockUser(): RUser {
	const id = BigInt(cryptoRng.randInt(1, 1_000_000));
	const rawUser: User = {
		id,
		bits: [],
		github_id: null,
		patreon_id: null,
		user_group_id: null,
		migrated_user_id: null,

		leagues_completed_tasks_ids: [],
		leagues_points_balance_bso: 0,
		leagues_points_total: 0,
		leagues_points_balance_osb: 0,
		react_emoji_id: null,

		osb_total_level: null,
		bso_total_level: null,
		osb_total_xp: null,
		bso_total_xp: null,
		osb_cl_percent: null,
		bso_cl_percent: null,
		osb_mastery: null,
		bso_mastery: null,

		store_bitfield: [],

		testing_points: 0,
		testing_points_balance: 0,

		perk_tier: 0,
		premium_balance_tier: null,
		premium_balance_expiry_date: null
	};
	const user = new TestRUser(rawUser);
	return user;
}
