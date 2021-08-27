import { roll, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, Openables } from 'oldschooljs';
import SimpleOpenable from 'oldschooljs/dist/structures/SimpleOpenable';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { SkillsEnum } from './skilling/types';
import { ActivityTaskOptions } from './types/minions';

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

const implings = [
	[BabyImpling, 55, 17],
	[YoungImpling, 45, 22],
	[GourmetImpling, 43, 28],
	[EarthImpling, 32, 36],
	[EssenceImpling, 25, 42],
	[EclecticImpling, 24, 50],
	[NatureImpling, 33, 58],
	[MagpieImpling, 24, 65],
	[NinjaImpling, 20, 74],
	[CrystalImpling, 15, 80],
	[DragonImpling, 9, 83],
	[LuckyImpling, 4, 89]
] as const;

export const ImplingTable = new SimpleTable<SimpleOpenable>();
for (const [imp, weight] of implings) {
	ImplingTable.add(imp, weight);
}

export const AVERAGE_TIME_PER_IMPLING_FIND = Time.Hour;
const IMPLING_CHANCE_PER_MINUTE = 5;

export function handlePassiveImplings(user: KlasaUser, activity: ActivityTaskOptions) {
	const minutes = Math.floor(activity.duration / Time.Minute);

	if (minutes < 4) return null;
	const level = user.skillLevel(SkillsEnum.Hunter);

	let bank = new Bank();
	const missed: SimpleOpenable[] = [];
	for (let i = 0; i < minutes; i++) {
		const gotImp = roll(IMPLING_CHANCE_PER_MINUTE);
		if (gotImp) {
			const imp = ImplingTable.roll()!.item;
			const levelReq = implings.find(i => i[0] === imp)![2];
			if (level < levelReq) {
				missed.push(imp);
			} else {
				bank.add(imp.id);
			}
		}
	}
	if (bank.length === 0 && missed.length === 0) return null;
	return { bank, missed };
}
