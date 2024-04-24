import { activity_type_enum } from '@prisma/client';
import { objectEntries, reduceNumByPercent, Time } from 'e';
import { Bank, LootTable, Openables } from 'oldschooljs';

import { BitField } from './constants';
import { inventionBoosts, InventionID, inventionItemBoost } from './invention/inventions';
import { ChimplingImpling, EternalImpling, InfernalImpling, MysteryImpling } from './simulation/customImplings';
import { ActivityTaskData } from './types/minions';
import activityInArea, { WorldLocations } from './util/activityInArea';

const {
	BabyImpling,
	YoungImpling,
	GourmetImpling,
	EarthImpling,
	EssenceImpling,
	EclecticImpling,
	NatureImpling,
	MagpieImpling,
	NinjaImpling,
	CrystalImpling,
	DragonImpling,
	LuckyImpling
} = Openables;

export const implings: Record<number, { level: number; customRequirements?: (user: MUser) => Promise<boolean> }> = {
	// [Impling ID, Level to Catch]
	[BabyImpling.id]: { level: 17 },
	[YoungImpling.id]: { level: 22 },
	[GourmetImpling.id]: { level: 28 },
	[EarthImpling.id]: { level: 36 },
	[EssenceImpling.id]: { level: 42 },
	[EclecticImpling.id]: { level: 50 },
	[NatureImpling.id]: { level: 58 },
	[MagpieImpling.id]: { level: 65 },
	[NinjaImpling.id]: { level: 74 },
	[CrystalImpling.id]: { level: 80 },
	[DragonImpling.id]: { level: 83 },
	[LuckyImpling.id]: { level: 89 },
	[InfernalImpling.id]: { level: 94 },
	[ChimplingImpling.id]: {
		level: 95,
		customRequirements: async user => {
			if (user.owns('Magic banana')) {
				await user.removeItemsFromBank(new Bank().add('Magic banana'));
				return true;
			}
			return false;
		}
	},
	[EternalImpling.id]: { level: 99, customRequirements: async user => user.hasEquippedOrInBank('Vasa cloak') },
	[MysteryImpling.id]: { level: 105 }
};

export const puroImplings: Record<number, { catchXP: number }> = {
	// [Impling ID, XP for Catch]
	[BabyImpling.id]: { catchXP: 18 },
	[YoungImpling.id]: { catchXP: 20 },
	[GourmetImpling.id]: { catchXP: 22 },
	[EarthImpling.id]: { catchXP: 25 },
	[EssenceImpling.id]: { catchXP: 27 },
	[EclecticImpling.id]: { catchXP: 30 },
	[NatureImpling.id]: { catchXP: 34 },
	[MagpieImpling.id]: { catchXP: 44 },
	[NinjaImpling.id]: { catchXP: 52 },
	[DragonImpling.id]: { catchXP: 65 },
	[LuckyImpling.id]: { catchXP: 80 }
};
export const implingsCL = objectEntries(implings).map(m => Number(m[0]));

export const puroImpSpellTable = new LootTable()
	.add('Baby impling jar', 1, 3100)
	.add('Young impling jar', 1, 2885)
	.add('Gourmet impling jar', 1, 2600)
	.add('Earth impling jar', 1, 2400)
	.add('Essence impling jar', 1, 2200)
	.add('Eclectic impling jar', 1, 2000)
	.add('Nature impling jar', 1, 1107)
	.add('Magpie impling jar', 1, 1294)
	.add('Ninja impling jar', 1, 272)
	.add('Dragon impling jar', 1, 118)
	.add('Lucky impling jar', 1, 24);

export const puroImpNormalTable = new LootTable()
	.add('Baby impling jar', 1, 3100)
	.add('Young impling jar', 1, 2885)
	.add('Gourmet impling jar', 1, 2600)
	.add('Earth impling jar', 1, 2400)
	.add('Essence impling jar', 1, 2200)
	.add('Eclectic impling jar', 1, 2000)
	.add('Nature impling jar', 1, 830)
	.add('Magpie impling jar', 1, 970)
	.add('Ninja impling jar', 1, 204)
	.add('Dragon impling jar', 1, 88)
	.add('Lucky impling jar', 1, 18);

export const puroImpHighTierTable = new LootTable()
	.add('Nature impling jar', 1, 150)
	.add('Magpie impling jar', 1, 114)
	.add('Ninja impling jar', 1, 27)
	.add('Dragon impling jar', 1, 9)
	.add('Lucky impling jar', 1, 1);

export const defaultImpTable = new LootTable()
	.add('Baby impling jar', 1, 28_280)
	.add('Young impling jar', 1, 28_280)
	.add('Gourmet impling jar', 1, 35_350)
	.add('Earth impling jar', 1, 35_350)
	.add('Essence impling jar', 1, 28_280)
	.add('Eclectic impling jar', 1, 40_299)
	.add('Nature impling jar', 1, 18_140)
	.add('Magpie impling jar', 1, 21_414)
	.add('Ninja impling jar', 1, 12_707)
	.add('Dragon impling jar', 1, 4000)
	.add('Lucky impling jar', 1, 400)
	.add('Mystery impling jar', 1, 1200)
	.add('Eternal impling jar', 1, 3600)
	.add('Chimpling jar', 1, 10_000)
	.add('Infernal impling jar', 1, 3000);

const mrETable = new LootTable()
	.add('Earth impling jar', 1, 68)
	.add('Essence impling jar', 1, 49)
	.add('Eclectic impling jar', 1, 44)
	.add('Nature impling jar', 1, 63)
	.add('Magpie impling jar', 1, 44)
	.add('Ninja impling jar', 1, 41)
	.add('Dragon impling jar', 1, 24)
	.add('Lucky impling jar', 1, 3)
	.add('Infernal impling jar', 1, 9)
	.add('Chimpling jar', 1, 19)
	.add('Eternal impling jar', 1, 7)
	.add('Mystery impling jar', 1, 3);

const IMPLING_CHANCE_PER_MINUTE = 98;

type TWorldLocationImplingTable = Record<number, (caughtChance: number, hasMrE: boolean) => LootTable>;

const implingTableByWorldLocation: TWorldLocationImplingTable = {
	[WorldLocations.Priffdinas]: caughtChance => {
		const reductionFactor = IMPLING_CHANCE_PER_MINUTE / caughtChance;
		return new LootTable({ limit: Math.floor(142 / reductionFactor) }).add('Crystal impling jar', 1, 1);
	},
	[WorldLocations.World]: (caughtChance, hasMrE) =>
		new LootTable().oneIn(caughtChance, hasMrE ? mrETable : defaultImpTable)
};

export async function handlePassiveImplings(
	user: MUser,
	data: ActivityTaskData,
	messages: string[],
	forceDisableWebshooter = false
) {
	if (
		[
			'FightCaves',
			'Inferno',
			'Christmas',
			'TheatreOfBlood',
			activity_type_enum.PuroPuro,
			activity_type_enum.BarbarianAssault,
			activity_type_enum.CastleWars,
			activity_type_enum.LastManStanding,
			activity_type_enum.PestControl,
			activity_type_enum.FistOfGuthix,
			activity_type_enum.Construction,
			activity_type_enum.TombsOfAmascut,
			activity_type_enum.BalthazarsBigBonanza,
			activity_type_enum.DriftNet,
			activity_type_enum.UnderwaterAgilityThieving
		].includes(data.type)
	)
		return null;
	const minutes = Math.floor(data.duration / Time.Minute);

	if (minutes < 4) return null;
	const skills = user.skillsAsLevels;
	const level = skills.hunter;

	let bank = new Bank();
	const missed = new Bank();

	let baseChance = IMPLING_CHANCE_PER_MINUTE;
	const hasScrollOfTheHunt = user.bitfield.includes(BitField.HasScrollOfTheHunt);
	if (hasScrollOfTheHunt) baseChance = Math.floor(baseChance / 2);
	if (user.hasEquippedOrInBank('Hunter master cape')) baseChance = Math.floor(baseChance / 2);

	// Webshooter
	if (user.hasEquippedOrInBank('Webshooter') && data.duration > Time.Minute && !forceDisableWebshooter) {
		const costRes = await inventionItemBoost({
			user,
			inventionID: InventionID.Webshooter,
			duration: data.duration / 5
		});
		if (costRes.success) {
			baseChance = reduceNumByPercent(baseChance, inventionBoosts.webshooter.passiveImplingBoostPercent);
			messages.push(costRes.messages);
		}
	}

	const area = activityInArea(user, data);
	const impTable = implingTableByWorldLocation[area](baseChance, user.usingPet('Mr. E'));

	for (let i = 0; i < minutes; i++) {
		const loot = impTable.roll();
		if (loot.length === 0) continue;
		const implingReceived = implings[loot.items()[0][0].id]!;
		if (
			level < implingReceived.level ||
			(implingReceived.customRequirements && !(await implingReceived.customRequirements(user)))
		) {
			missed.add(loot);
		} else {
			bank.add(loot);
		}
	}

	if (bank.length === 0 && missed.length === 0) return null;
	return { bank, missed };
}
