import { userMention } from '@oldschoolgg/discord';
import {
	getPerkTierEx,
	getPerkTierDisplay as getSharedDisplay,
	getPerkTierDetails as getSharedPerks,
	type PerkTier
} from '@oldschoolgg/toolkit';
import { RedisKeys } from '@oldschoolgg/util';
import type { Prisma, User } from '@prisma/robochimp';

import { redis, rUserTTL } from '@/lib/redis.js';
import { Bits, type PatronTier, tiers } from '@/util.js';

export type RUserGroupUser = Pick<User, 'id' | 'bits'> &
	Partial<Pick<User, 'premium_balance_tier' | 'premium_balance_expiry_date'>>;

export class RUser {
	private _user: User;
	private _groupUsers: RUserGroupUser[];
	constructor(user: User, groupUsers: RUserGroupUser[] = [user]) {
		this._user = user;
		this._groupUsers = groupUsers.length > 0 ? groupUsers : [user];
	}
	get id(): bigint {
		return this._user.id;
	}
	get bits(): Bits[] {
		return [...new Set(this._groupUsers.flatMap(u => u.bits))] as Bits[];
	}

	get patreonBits(): Bits[] {
		return this.bits;
	}

	get leaguesPointsTotal(): number {
		return this._user.leagues_points_total;
	}

	get githubId(): number | null {
		return this._user.github_id;
	}

	private get activePremium(): { tier: number; expiry: bigint } | null {
		return this.premiumEntitlements[0] ?? null;
	}

	get premiumEntitlements(): Array<{ tier: number; expiry: bigint }> {
		const now = Date.now();
		return this._groupUsers
			.flatMap(user => {
				if (!user.premium_balance_tier || !user.premium_balance_expiry_date) return [];
				if (Number(user.premium_balance_expiry_date) <= now) return [];
				return [{ tier: user.premium_balance_tier, expiry: user.premium_balance_expiry_date }];
			})
			.sort((a, b) => b.tier - a.tier || Number(b.expiry - a.expiry));
	}

	get premiumTier(): number | null {
		return this.activePremium?.tier ?? null;
	}

	get premiumExpiry(): bigint | null {
		return this.activePremium?.expiry ?? null;
	}

	get perkTierDetails() {
		return getSharedPerks(this);
	}

	get perkTierRaw(): PerkTier {
		return getPerkTierEx(this);
	}

	get perkTier(): PatronTier | null {
		const tier = tiers.find(t => t.perkTier === this.perkTierRaw);
		return tier ?? null;
	}

	get perkTierDisplay(): string {
		return getSharedDisplay(this);
	}

	public isSupport(): boolean {
		return [Bits.Admin, Bits.Moderator, Bits.SupportStaff].some(_bit => this.bits.includes(_bit));
	}

	public isAdmin(): boolean {
		return this.bits.includes(Bits.Admin);
	}

	public isMod(): boolean {
		return [Bits.Admin, Bits.Moderator].some(_bit => this.bits.includes(_bit));
	}

	public isTrusted(): boolean {
		return [Bits.Admin, Bits.Moderator, Bits.Trusted].some(_bit => this.bits.includes(_bit));
	}

	public isWikiContributor(): boolean {
		return [Bits.WikiContributor].some(_bit => this.bits.includes(_bit));
	}

	public isContributor(): boolean {
		return [Bits.Contributor].some(_bit => this.bits.includes(_bit));
	}

	get testingPoints(): number {
		return this._user.testing_points;
	}

	get patreonId(): string | null {
		return this._user.patreon_id;
	}

	get cyrPatreonId(): string | null {
		return this._user.cyr_patreon_id;
	}

	get mention(): `<@${string}>` {
		return userMention(this._user.id.toString());
	}

	get userGroupId(): string | null {
		return this._user.user_group_id;
	}

	async findGroup(): Promise<string[]> {
		if (this._groupUsers.length > 1) return this._groupUsers.map(u => u.id.toString());
		if (!this._user.user_group_id) return [this._user.id.toString()];
		const group = await roboChimpClient.user.findMany({
			where: {
				user_group_id: this._user.user_group_id
			},
			select: {
				id: true,
				bits: true,
				premium_balance_tier: true,
				premium_balance_expiry_date: true
			}
		});
		this._groupUsers = group;
		return group.map(u => u.id.toString());
	}

	async fetchGroup(): Promise<User[]> {
		const allUserIds = await this.findGroup();
		const users = await roboChimpClient.user.findMany({
			where: {
				id: { in: allUserIds.map(id => BigInt(id)) }
			}
		});
		return users;
	}

	async update(data: Prisma.UserUncheckedUpdateInput): Promise<this> {
		const newUser = await roboChimpClient.user.update({
			where: {
				id: this.id
			},
			data
		});
		redis.set(RedisKeys.RoboChimpUser(this.id), JSON.stringify(newUser), 'EX', rUserTTL());
		this._user = newUser;
		this._groupUsers = await fetchRUserGroupUsers(newUser);
		return this;
	}

	get osbTotalLevel(): number | null {
		return this._user.osb_total_level;
	}

	get osbClPercent(): number {
		return this._user.osb_cl_percent ?? 0;
	}

	get bsoTotalLevel(): number | null {
		return this._user.bso_total_level;
	}

	get bsoClPercent(): number {
		return this._user.bso_cl_percent ?? 0;
	}

	get osbMastery(): number {
		return this._user.osb_mastery ?? 0;
	}

	get bsoMastery(): number {
		return this._user.bso_mastery ?? 0;
	}

	globalMastery(): number {
		return (this.osbMastery + this.bsoMastery) / 2;
	}

	globalCLPercent(): number {
		return (this.osbClPercent + this.bsoClPercent) / 2;
	}
}

export async function fetchRUserGroupUsers(
	user: Pick<User, 'id' | 'bits' | 'premium_balance_tier' | 'premium_balance_expiry_date' | 'user_group_id'>
): Promise<RUserGroupUser[]> {
	if (!user.user_group_id) {
		return [
			{
				id: user.id,
				bits: user.bits,
				premium_balance_tier: user.premium_balance_tier,
				premium_balance_expiry_date: user.premium_balance_expiry_date
			}
		];
	}

	return roboChimpClient.user.findMany({
		where: {
			user_group_id: user.user_group_id
		},
		select: {
			id: true,
			bits: true,
			premium_balance_tier: true,
			premium_balance_expiry_date: true
		},
		orderBy: {
			id: 'asc'
		}
	});
}
