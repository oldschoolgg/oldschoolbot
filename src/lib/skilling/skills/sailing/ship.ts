import type { UserShip } from '@/prisma/main.js';
import type { SailingFacilityId } from '@/lib/skilling/skills/sailing/facilities.js';
import type { SailingRegionId } from '@/lib/skilling/skills/sailing/regions.js';
import { MAX_SHIP_TIER, type ShipPart } from '@/lib/skilling/skills/sailing/upgrades.js';

export type SailingShipSnapshot = {
	hullTier: number;
	sailsTier: number;
	crewTier: number;
	navigationTier: number;
	cargoTier: number;
};

export type SailingShipBonuses = {
	speedMultiplier: number;
	successBonus: number;
	lootBonus: number;
};

export type SailingUpgradesBank = {
	facilities?: SailingFacilityId[];
	reputation?: number;
	charts?: number;
	unlockedRegions?: SailingRegionId[];
};

export function getUpgradesBank(ship: UserShip): SailingUpgradesBank {
	const raw = ship.upgrades_bank as SailingUpgradesBank | null;
	return raw ?? {};
}

export function getInstalledFacilities(ship: UserShip): SailingFacilityId[] {
	return getUpgradesBank(ship).facilities ?? [];
}

export function hasFacility(ship: UserShip, facility: SailingFacilityId): boolean {
	return getInstalledFacilities(ship).includes(facility);
}

export function getShipReputation(ship: UserShip): number {
	return getUpgradesBank(ship).reputation ?? 0;
}

export function getShipCharts(ship: UserShip): number {
	return getUpgradesBank(ship).charts ?? 0;
}

export function getUnlockedRegions(ship: UserShip): SailingRegionId[] {
	return getUpgradesBank(ship).unlockedRegions ?? ['starter_sea'];
}

export function hasUnlockedRegion(ship: UserShip, region: SailingRegionId): boolean {
	return getUnlockedRegions(ship).includes(region);
}

export async function updateUpgradesBank(userID: string, updates: Partial<SailingUpgradesBank>) {
	const ship = await getOrCreateUserShip(userID);
	const current = getUpgradesBank(ship);
	const next = {
		...current,
		...updates
	};
	return prisma.userShip.update({
		where: { user_id: userID },
		data: { upgrades_bank: next }
	});
}

export function getShipPartTier(ship: UserShip, part: ShipPart): number {
	switch (part) {
		case 'hull':
			return ship.hull_tier;
		case 'sails':
			return ship.sails_tier;
		case 'crew':
			return ship.crew_tier;
		case 'navigation':
			return ship.navigation_tier;
		case 'cargo':
			return ship.cargo_tier;
		default:
			return 1;
	}
}

export function clampShipTier(tier: number): number {
	return Math.max(1, Math.min(MAX_SHIP_TIER, tier));
}

export function snapshotShip(ship: UserShip): SailingShipSnapshot {
	return {
		hullTier: ship.hull_tier,
		sailsTier: ship.sails_tier,
		crewTier: ship.crew_tier,
		navigationTier: ship.navigation_tier,
		cargoTier: ship.cargo_tier
	};
}

export function getShipBonusesFromSnapshot(snapshot: SailingShipSnapshot): SailingShipBonuses {
	const speedBonus = Math.min(0.35, (snapshot.hullTier - 1) * 0.02 + (snapshot.sailsTier - 1) * 0.04);
	const successBonus = Math.min(0.25, (snapshot.crewTier - 1) * 0.03 + (snapshot.navigationTier - 1) * 0.03);
	const lootBonus = Math.min(0.2, (snapshot.cargoTier - 1) * 0.04);

	return {
		speedMultiplier: Math.max(0.65, 1 - speedBonus),
		successBonus,
		lootBonus
	};
}

export async function getOrCreateUserShip(userID: string): Promise<UserShip> {
	let ship = await prisma.userShip.findUnique({
		where: { user_id: userID }
	});
	if (!ship) {
		ship = await prisma.userShip.create({
			data: { user_id: userID }
		});
	}
	return ship;
}
