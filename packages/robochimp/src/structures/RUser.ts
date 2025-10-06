import { userMention } from 'discord.js';

import { Bits, findGroupOfUser, type PatronTier, tiers } from '@/util.js';
import type { Prisma, User } from '../../prisma/generated/robochimp/index.js';

export class RUser {
	private _user: User;
	constructor(user: User) {
		this._user = user;
	}
	get id() {
		return this._user.id;
	}
	get bits(): Bits[] {
		return this._user.bits;
	}
	get username() {
		return globalClient.users.cache.get(this._user.id.toString())?.username ?? this._user.id.toString();
	}

	get leaguesPointsTotal() {
		return this._user.leagues_points_total;
	}
	get githubId() {
		return this._user.github_id;
	}

	get perkTier(): PatronTier | null {
		const tier = tiers.find(t => t.perkTier === this._user.perk_tier);
		return tier ?? null;
	}

	public isMod() {
		return this.bits.includes(Bits.Mod);
	}

	get testingPoints() {
		return this._user.testing_points;
	}

	get patreonId() {
		return this._user.patreon_id;
	}

	get mention() {
		return userMention(this._user.id.toString());
	}

	get userGroupId() {
		return this._user.user_group_id;
	}

	async findGroup() {
		return findGroupOfUser(this._user);
	}

	async update(data: Prisma.UserUncheckedUpdateInput) {
		const newUser = await roboChimpClient.user.update({
			where: {
				id: this.id
			},
			data
		});
		this._user = newUser;
		return this;
	}

	get osbTotalLevel() {
		return this._user.osb_total_level;
	}

	get osbClPercent() {
		return this._user.osb_cl_percent;
	}

	get bsoTotalLevel() {
		return this._user.bso_total_level;
	}

	get bsoClPercent() {
		return this._user.bso_cl_percent;
	}

	globalMastery(): number {
		const globalMastery =
			this._user.osb_mastery !== null && this._user.bso_mastery !== null
				? (this._user.bso_mastery + this._user.osb_mastery) / 2
				: 0;
		return globalMastery;
	}

	globalCLPercent(): number {
		const globalCLPercent =
			this._user.osb_cl_percent !== null && this._user.bso_cl_percent !== null
				? (this._user.osb_cl_percent + this._user.bso_cl_percent) / 2
				: 0;
		return globalCLPercent;
	}
}
