import { Time } from 'e';
import { Openables } from 'oldschooljs';
import SimpleOpenable from 'oldschooljs/dist/structures/SimpleOpenable';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

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

export const ImplingTable = new SimpleTable<SimpleOpenable>()
	.add(BabyImpling, 55)
	.add(YoungImpling, 45)
	.add(GourmetImpling, 43)
	.add(EarthImpling, 32)
	.add(EssenceImpling, 25)
	.add(EclecticImpling, 24)
	.add(NatureImpling, 33)
	.add(MagpieImpling, 24)
	.add(NinjaImpling, 20)
	.add(CrystalImpling, 15)
	.add(DragonImpling, 9)
	.add(LuckyImpling, 4);

export const AVERAGE_TIME_PER_IMPLING_FIND = Time.Hour;
