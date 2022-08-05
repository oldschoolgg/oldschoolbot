import { activity_type_enum } from '@prisma/client';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable, Openables } from 'oldschooljs';

import { BitField } from './constants';
import { ChimplingImpling, EternalImpling, InfernalImpling, MysteryImpling } from './simulation/customImplings';
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

export const implings: Record<number, { level: number; customRequirements?: (user: KlasaUser) => Promise<boolean> }> = {
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
	[EternalImpling.id]: { level: 99, customRequirements: async user => user.hasItemEquippedAnywhere('Vasa cloak') },
	[MysteryImpling.id]: { level: 105 }
};

const defaultImpTable = new LootTable()
	.add('Baby impling jar', 1, 126)
	.add('Young impling jar', 1, 85)
	.add('Gourmet impling jar', 1, 88)
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

export async function handlePassiveImplings(user: KlasaUser, data: ActivityTaskOptions) {
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

	let baseChance = IMPLING_CHANCE_PER_MINUTE;
	const hasScrollOfTheHunt = user.bitfield.includes(BitField.HasScrollOfTheHunt);
	if (hasScrollOfTheHunt) baseChance = Math.floor(baseChance / 2);
	if (user.hasItemEquippedAnywhere('Hunter master cape')) baseChance = Math.floor(baseChance / 2);

	const impTable = implingTableByWorldLocation[activityInArea(data)](baseChance, user.usingPet('Mr. E'));

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
