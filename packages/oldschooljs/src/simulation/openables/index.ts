import { Collection } from '@/structures/Collection.js';
import type Openable from '@/structures/Openable.js';
import BrimstoneChest from './BrimstoneChest.js';
import Casket from './Casket.js';
import CrystalChest from './CrystalChest.js';
import ElvenCrystalChest from './ElvenCrystalChest.js';
import GiantEggSacFull from './GiantEggSacFull.js';
import GrubbyChest from './GrubbyChest.js';
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
import IntricatePouch from './IntricatePouch.js';
import LarransChest from './LarransChest.js';
import MuddyChest from './MuddyChest.js';
import MysteryBox from './MysteryBox.js';
import NestBoxEmpty from './NestBoxEmpty.js';
import NestBoxRing from './NestBoxRing.js';
import NestBoxSeeds from './NestBoxSeeds.js';
import OgreCoffin from './OgreCoffin.js';
import { GiantsFoundryOrePack, VolcanicMineOrePack } from './OrePack.js';
import SeedPack from './SeedPack.js';
import SinisterChest from './SinisterChest.js';
import ZombiePiratesLocker from './ZombiePiratesLocker.js';

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
	ZombiePiratesLocker
};

const openablesObject = {
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

const Openables = Object.assign(new Collection(allMonsters), openablesObject);

export default Openables;

export * from './HallowedSack.js';
