import { Time } from '@oldschoolgg/toolkit';
import {
	BabyImpling,
	Bank,
	CrystalImpling,
	DragonImpling,
	EarthImpling,
	EclecticImpling,
	EssenceImpling,
	GourmetImpling,
	LootTable,
	LuckyImpling,
	MagpieImpling,
	NatureImpling,
	NinjaImpling,
	YoungImpling
} from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import activityInArea, { WorldLocations } from '@/lib/util/activityInArea.js';

export const implings: Record<number, { level: number; catchXP: number }> = {
	[BabyImpling.id]: { level: 17, catchXP: 18 },
	[YoungImpling.id]: { level: 22, catchXP: 20 },
	[GourmetImpling.id]: { level: 28, catchXP: 22 },
	[EarthImpling.id]: { level: 36, catchXP: 25 },
	[EssenceImpling.id]: { level: 42, catchXP: 27 },
	[EclecticImpling.id]: { level: 50, catchXP: 30 },
	[NatureImpling.id]: { level: 58, catchXP: 34 },
	[MagpieImpling.id]: { level: 65, catchXP: 44 },
	[NinjaImpling.id]: { level: 74, catchXP: 52 },
	[CrystalImpling.id]: { level: 80, catchXP: 0 },
	[DragonImpling.id]: { level: 83, catchXP: 65 },
	[LuckyImpling.id]: { level: 89, catchXP: 80 }
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

const defaultImpTable = new LootTable()
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
			activity_type_enum.UnderwaterAgilityThieving,
			activity_type_enum.Colosseum
		].includes(data.type)
	)
		return null;
	const minutes = Math.floor(data.duration / Time.Minute);

	if (minutes < 4) return null;
	const skills = user.skillsAsLevels;
	const level = skills.hunter;

	const bank = new Bank();
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
