import { roll } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, Monsters, Openables } from 'oldschooljs';
import SimpleOpenable from 'oldschooljs/dist/structures/SimpleOpenable';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Activity } from './constants';
import { SkillsEnum } from './skilling/types';
import {
	ActivityTaskOptions,
	AgilityActivityTaskOptions,
	MonsterActivityTaskOptions,
	PickpocketActivityTaskOptions
} from './types/minions';

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

type Impling = [SimpleOpenable, number, number, null | ((activity: ActivityTaskOptions) => boolean)];

export const implings: Impling[] = [
	// [Imp, Weight, Level, Inhibitor]
	[BabyImpling, 66, 17, null],
	[YoungImpling, 55, 22, null],
	[GourmetImpling, 48, 28, null],
	[EarthImpling, 38, 36, null],
	[EssenceImpling, 29, 42, null],
	[EclecticImpling, 24, 50, null],
	[NatureImpling, 33, 58, null],
	[MagpieImpling, 24, 65, null],
	[NinjaImpling, 21, 74, null],
	[
		CrystalImpling,
		16,
		80,
		(activity: ActivityTaskOptions) => {
			if ([Activity.Gauntlet, Activity.Zalcano].includes(activity.type)) return true;
			if (
				activity.type === Activity.MonsterKilling &&
				[Monsters.DarkBeast.id, Monsters.PrifddinasElf.id].includes(
					(activity as MonsterActivityTaskOptions).monsterID
				)
			) {
				return true;
			}
			if (
				activity.type === Activity.Pickpocket &&
				(activity as PickpocketActivityTaskOptions).monsterID === Monsters.PrifddinasElf.id
			) {
				return true;
			}
			if (
				activity.type === Activity.Agility &&
				(activity as AgilityActivityTaskOptions).courseID === 'Prifddinas Rooftop Course'
			) {
				return true;
			}

			return false;
		}
	],
	[DragonImpling, 10, 83, null],
	[LuckyImpling, 1, 89, null]
];

export const ImplingTable = new SimpleTable<Impling>();
for (const imp of implings) {
	ImplingTable.add(imp, imp[1]);
}

const IMPLING_CHANCE_PER_MINUTE = 65;

export function handlePassiveImplings(user: KlasaUser, data: ActivityTaskOptions) {
	const minutes = 100_000; // Math.floor(data.duration / Time.Minute);

	if (minutes < 4) return null;
	const level = user.skillLevel(SkillsEnum.Hunter);

	const bank = new Bank();
	const missed = new Bank();
	for (let i = 0; i < minutes; i++) {
		const gotImp = roll(IMPLING_CHANCE_PER_MINUTE);
		if (gotImp) {
			const [imp, , levelReq, inhibitor] = ImplingTable.roll()!.item;
			if (inhibitor && !inhibitor(data)) continue;
			if (level < levelReq) {
				missed.add(imp.id);
			} else {
				bank.add(imp.id);
			}
		}
	}
	if (bank.length === 0 && missed.length === 0) return null;
	return { bank, missed };
}
