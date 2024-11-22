import { Collection } from '../../structures/Collection';
import type Openable from '../../structures/Openable';
import BrimstoneChest from './BrimstoneChest';
import Casket from './Casket';
import CrystalChest from './CrystalChest';
import ElvenCrystalChest from './ElvenCrystalChest';
import GiantEggSacFull from './GiantEggSacFull';
import GrubbyChest from './GrubbyChest';
import { BronzeHAMChest, IronHAMChest, SilverHAMChest, SteelHAMChest } from './HAMStoreRoomChests';
import { AdeptSack, BasicSack, ExpertSack, MasterSack } from './HuntersLootSack';
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
} from './Implings';
import IntricatePouch from './IntricatePouch';
import LarransChest from './LarransChest';
import MuddyChest from './MuddyChest';
import MysteryBox from './MysteryBox';
import NestBoxEmpty from './NestBoxEmpty';
import NestBoxRing from './NestBoxRing';
import NestBoxSeeds from './NestBoxSeeds';
import OgreCoffin from './OgreCoffin';
import { GiantsFoundryOrePack, VolcanicMineOrePack } from './OrePack';
import SeedPack from './SeedPack';
import SinisterChest from './SinisterChest';
import ZombiePiratesLocker from './ZombiePiratesLocker';

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

export * from './HallowedSack';
