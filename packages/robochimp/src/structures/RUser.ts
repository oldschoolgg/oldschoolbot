import { userMention } from '@oldschoolgg/discord';
import type { Prisma, User } from '@prisma/robochimp';

import { Bits, type PatronTier, tiers } from '@/util.js';

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

	get leaguesPointsTotal() {
		return this._user.leagues_points_total;
	}

	get githubId() {
		return this._user.github_id;
	}

	get perkTierRaw() {
		return this._user.perk_tier ?? 0;
	}

	get perkTier(): PatronTier | null {
		const tier = tiers.find(t => t.perkTier === this._user.perk_tier);
		return tier ?? null;
	}

	public isMod() {
		return [Bits.Admin, Bits.Mod].some(_bit => this.bits.includes(_bit));
	}

	public isTrusted() {
		return [Bits.Admin, Bits.Mod, Bits.Trusted].some(_bit => this.bits.includes(_bit));
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
		if (!this._user.user_group_id) return [this._user.id.toString()];
		const group = await roboChimpClient.user.findMany({
			where: {
				user_group_id: this._user.user_group_id
			}
		});
		if (!group) return [this._user.id.toString()];
		return group.map(u => u.id.toString());
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
		return this._user.osb_cl_percent ?? 0;
	}

	get bsoTotalLevel() {
		return this._user.bso_total_level;
	}

	get bsoClPercent() {
		return this._user.bso_cl_percent ?? 0;
	}

	get osbMastery() {
		return this._user.osb_mastery ?? 0;
	}

	get bsoMastery() {
		return this._user.bso_mastery ?? 0;
	}

	globalMastery(): number {
		return (this.osbMastery + this.bsoMastery) / 2;
	}

	globalCLPercent(): number {
		return (this.osbClPercent + this.bsoClPercent) / 2;
	}
}
