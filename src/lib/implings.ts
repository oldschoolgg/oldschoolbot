import { activity_type_enum } from '@prisma/client';
import { Time } from 'e';
import { Bank, LootTable, Openables } from 'oldschooljs';

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

export const implings: Record<number, { level: number }> = {
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
	[LuckyImpling.id]: { level: 89 }
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
	.add('Lucky impling jar', 1, 400);

const implingTableByWorldLocation = {
	[WorldLocations.Priffdinas]: new LootTable({ limit: 155 }).add('Crystal impling jar', 1, 1),
	[WorldLocations.World]: new LootTable().oneIn(85, defaultImpTable)
};

export function handlePassiveImplings(user: MUser, data: ActivityTaskData) {
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
			activity_type_enum.Construction,
			activity_type_enum.TombsOfAmascut,
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

	const impTable = implingTableByWorldLocation[activityInArea(user, data)];

	for (let i = 0; i < minutes; i++) {
		const loot = impTable.roll();
		if (loot.length === 0) continue;
		const implingReceived = implings[loot.items()[0][0].id]!;
		if (level < implingReceived.level) missed.add(loot);
		else bank.add(loot);
	}

	if (bank.length === 0 && missed.length === 0) return null;
	return { bank, missed };
}
