import { userMention } from '@oldschoolgg/discord';
import { RedisKeys } from '@oldschoolgg/util';
import type { Prisma, User } from '@prisma/robochimp';

import { redis } from '@/lib/redis.js';
import { Bits, type PatronTier, tiers } from '@/util.js';

export type RUserGroupUser = Pick<User, 'id' | 'bits' | 'perk_tier'>;

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

	get leaguesPointsTotal(): number {
		return this._user.leagues_points_total;
	}

	get githubId(): number | null {
		return this._user.github_id;
	}

	get perkTierRaw(): number {
		return Math.max(0, ...this._groupUsers.map(u => u.perk_tier ?? 0));
	}

	get perkTier(): PatronTier | null {
		const tier = tiers.find(t => t.perkTier === this.perkTierRaw);
		return tier ?? null;
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

	get testingPoints(): number {
		return this._user.testing_points;
	}

	get patreonId(): string | null {
		return this._user.patreon_id;
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
				perk_tier: true
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
		redis.set(RedisKeys.RoboChimpUser(this.id), JSON.stringify(newUser));
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
	user: Pick<User, 'id' | 'bits' | 'perk_tier' | 'user_group_id'>
): Promise<RUserGroupUser[]> {
	if (!user.user_group_id) {
		return [{ id: user.id, bits: user.bits, perk_tier: user.perk_tier }];
	}

	return roboChimpClient.user.findMany({
		where: {
			user_group_id: user.user_group_id
		},
		select: {
			id: true,
			bits: true,
			perk_tier: true
		},
		orderBy: {
			id: 'asc'
		}
	});
}
