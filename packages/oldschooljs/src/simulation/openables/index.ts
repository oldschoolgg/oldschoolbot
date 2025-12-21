import { Collection } from '@/structures/Collection.js';
import type Openable from '@/structures/Openable.js';
import type { SimpleOpenable } from '@/structures/SimpleOpenable.js';
import { BrimstoneChest } from './BrimstoneChest.js';
import { Casket } from './Casket.js';
import CastleWarsSupplyCrate from './CastleWarsSupplyCrate.js';
import { CrystalChest } from './CrystalChest.js';
import { ElvenCrystalChest } from './ElvenCrystalChest.js';
import { GiantEggSacFull } from './GiantEggSacFull.js';
import { GrubbyChest } from './GrubbyChest.js';
import { BronzeHAMChest, IronHAMChest, SilverHAMChest, SteelHAMChest } from './HAMStoreRoomChests.js';
import { AdeptSack, BasicSack, ExpertSack, MasterSack } from './HuntersLootSack.js';
import {
	BabyImpling,
	CrystalImpling,
	DragonImpling,
	EarthImpling,
	EclecticImpling,
	EssenceImpling,
	GourmetImpling,
	LuckyImpling,
	MagpieImpling,
	NatureImpling,
	NinjaImpling,
	YoungImpling
} from './Implings.js';
import { IntricatePouch } from './IntricatePouch.js';
import { LarransChest } from './LarransChest.js';
import { MoonKeyChest } from './MoonKeyChest.js';
import { MuddyChest } from './MuddyChest.js';
import { MysteryBox } from './MysteryBox.js';
import { NestBoxEmpty } from './NestBoxEmpty.js';
import { NestBoxRing } from './NestBoxRing.js';
import { NestBoxSeeds } from './NestBoxSeeds.js';
import { OgreCoffin } from './OgreCoffin.js';
import { GiantsFoundryOrePack, VolcanicMineOrePack } from './OrePack.js';
import { SeedPackOpenable as SeedPack } from './SeedPack.js';
import { SinisterChest } from './SinisterChest.js';
import { ZombiePiratesLocker } from './ZombiePiratesLocker.js';

export {
	MysteryBox,
	NestBoxEmpty,
	NestBoxRing,
	NestBoxSeeds,
	GiantEggSacFull,
	BronzeHAMChest,
	IronHAMChest,
	SilverHAMChest,
	SteelHAMChest,
	Casket,
	CrystalChest,
	ElvenCrystalChest,
	GrubbyChest,
	MuddyChest,
	OgreCoffin,
	SinisterChest,
	BrimstoneChest,
	MoonKeyChest,
	LarransChest,
	SeedPack,
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
	LuckyImpling,
	VolcanicMineOrePack,
	GiantsFoundryOrePack,
	IntricatePouch,
	BasicSack,
	AdeptSack,
	ExpertSack,
	MasterSack,
	ZombiePiratesLocker,
	CastleWarsSupplyCrate
};

const openablesObject: Record<string, SimpleOpenable> = {
	MysteryBox,
	NestBoxEmpty,
	NestBoxRing,
	NestBoxSeeds,
	GiantEggSacFull,
	BronzeHAMChest,
	IronHAMChest,
	SilverHAMChest,
	SteelHAMChest,
	Casket,
	CrystalChest,
	ElvenCrystalChest,
	GrubbyChest,
	MuddyChest,
	OgreCoffin,
	SinisterChest,
	BrimstoneChest,
	MoonKeyChest,
	LarransChest,
	SeedPack,
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
	LuckyImpling,
	VolcanicMineOrePack,
	GiantsFoundryOrePack,
	IntricatePouch,
	BasicSack,
	AdeptSack,
	ExpertSack,
	MasterSack
};

const allMonsters: [number, Openable][] = Object.values(openablesObject).map(openable => [openable.id, openable]);

const Openables: Collection<number, Openable> = Object.assign(new Collection(allMonsters), openablesObject);

export default Openables;

export * from './HallowedSack.js';
