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

type Impling = [number, number];

export const implings: Impling[] = [
	// [Impling ID, Level to Catch]
	[BabyImpling.id, 17],
	[YoungImpling.id, 22],
	[GourmetImpling.id, 28],
	[EarthImpling.id, 36],
	[EssenceImpling.id, 42],
	[EclecticImpling.id, 50],
	[NatureImpling.id, 58],
	[MagpieImpling.id, 65],
	[NinjaImpling.id, 74],
	[CrystalImpling.id, 80],
	[DragonImpling.id, 83],
	[LuckyImpling.id, 89]
];

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
	[WorldLocations.Priffdinas]: new LootTable({ limit: 142 }).add('Crystal impling jar', 1, 1),
	[WorldLocations.World]: new LootTable().oneIn(69, defaultImpTable)
};

export function handlePassiveImplings(user: KlasaUser, data: ActivityTaskOptions) {
	const minutes = Math.floor(data.duration / Time.Minute);

	if (minutes < 4) return null;
	const level = user.skillLevel(SkillsEnum.Hunter);

	let bank = new Bank();
	const missed = new Bank();

	for (let i = 0; i < minutes; i++) {
		const loot = implingTableByWorldLocation[activityInArea(data)].roll();
		if (loot.length === 0) continue;
		const implingReceived = implings.find(i => i[0] === loot.items()[0][0].id)!;
		if (level < implingReceived[1]) missed.add(loot);
		else bank.add(loot);
	}

	if (bank.length === 0 && missed.length === 0) return null;
	return { bank, missed };
}
