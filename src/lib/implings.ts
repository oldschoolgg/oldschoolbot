import { activity_type_enum } from '@prisma/client';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable, Openables } from 'oldschooljs';

import { SkillsEnum } from './skilling/types';
import { ActivityTaskOptions } from './types/minions';
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

const defaultImpTable = new LootTable()
	.add('Baby impling jar', 1, 66)
	.add('Young impling jar', 1, 55)
	.add('Gourmet impling jar', 1, 48)
	.add('Earth impling jar', 1, 38)
	.add('Essence impling jar', 1, 29)
	.add('Eclectic impling jar', 1, 24)
	.add('Nature impling jar', 1, 33)
	.add('Magpie impling jar', 1, 24)
	.add('Ninja impling jar', 1, 21)
	.add('Dragon impling jar', 1, 10)
	.add('Lucky impling jar', 1, 1);

const implingTableByWorldLocation = {
	[WorldLocations.Priffdinas]: new LootTable({ limit: 155 }).add('Crystal impling jar', 1, 1),
	[WorldLocations.World]: new LootTable().oneIn(85, defaultImpTable)
};

export function handlePassiveImplings(user: KlasaUser, data: ActivityTaskOptions) {
	if (
		[
			'FightCaves',
			'Inferno',
			'Christmas',
			'TheatreOfBlood',
			activity_type_enum.BarbarianAssault,
			activity_type_enum.CastleWars,
			activity_type_enum.LastManStanding,
			activity_type_enum.PestControl
		].includes(data.type)
	)
		return null;
	const minutes = Math.floor(data.duration / Time.Minute);

	if (minutes < 4) return null;
	const level = user.skillLevel(SkillsEnum.Hunter);

	let bank = new Bank();
	const missed = new Bank();

	const impTable = implingTableByWorldLocation[activityInArea(data)];

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
