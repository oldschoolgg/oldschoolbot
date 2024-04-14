import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';
import { Ashes } from './Ashes';
import { Axes } from './Axes';
import { Barrows } from './Barrows';
import { BluntWeapons } from './BluntWeapons';
import { BoltTips } from './BoltTips';
import { Bones } from './Bones';
import { Bows } from './Bows';
import { Claws } from './Claws';
import { Clothing } from './Clothing';
import { Dagger } from './Dagger';
import { Defender } from './Defender';
import { Drygores } from './Drygores';
import { Dwarven } from './Dwarven';
import { EnsouledHeads } from './EnsouledHeads';
import { Explosive } from './Explosive';
import { Food } from './Food';
import { Gems } from './Gems';
import { Gilded } from './Gilded';
import { Glass } from './Glass';
import { Halberd } from './Halberd';
import { Hasta } from './Hasta';
import { Herb } from './Herb';
import { HybridArmour } from './HybridArmour';
import { Jewellery } from './Jewellery';
import { LeatherHides } from './LeatherHides';
import { Logs } from './Logs';
import { Longsword } from './Longsword';
import { Mace } from './Mace';
import { Magic } from './Magic';
import { MagicArmour } from './MagicArmour';
import { MeleeArmour } from './MeleeArmour';
import { Metals } from './Metals';
import { MysteryBoxes } from './MysteryBoxes';
import { Ores } from './Ores';
import { Organic } from './Organic';
import { Pious } from './Pious';
import { Planks } from './Planks';
import { Potion } from './Potion';
import { Projectiles } from './Projectiles';
import { RangedArmour } from './RangedArmour';
import { RawFood } from './RawFood';
import { Runes } from './Runes';
import { Scimitar } from './Scimitar';
import { Shield } from './Shield';
import { Spear } from './Spear';
import { Staff } from './Staff';
import { Sword } from './Sword';
import { Talisman } from './Talisman';
import { ThirdAge } from './ThirdAge';
import { TreasureTrails } from './TreasureTrails';
import { UncutGems } from './UncutGems';
import { UnstrungBows } from './UnstrungBows';

const Whips: DisassemblySourceGroup = {
	name: 'Whips',
	items: [{ item: getOSItem('Abyssal whip'), lvl: 90, flags: new Set(['abyssal']) }],
	parts: { abyssal: 50, sharp: 25, flexible: 25 }
};

export const DisassemblyGroupMap = {
	LeatherHides,
	Projectiles,
	Hasta,
	Runes,
	Gems,
	Claws,
	Dagger,
	UnstrungBows,
	MagicArmour,
	BluntWeapons,
	Logs,
	Organic,
	Herb,
	Potion,
	BoltTips,
	Planks,
	Halberd,
	Metals,
	Bones,
	RangedArmour,
	Axes,
	Spear,
	UncutGems,
	HybridArmour,
	Bows,
	Food,
	Staff,
	Glass,
	Longsword,
	Jewellery,
	Ores,
	Talisman,
	Scimitar,
	Clothing,
	Sword,
	MeleeArmour,
	Mace,
	Ashes,
	Magic,
	Defender,
	Shield,
	TreasureTrails,
	Drygores,
	Dwarven,
	ThirdAge,
	Barrows,
	Pious,
	EnsouledHeads,
	RawFood,
	MysteryBoxes,
	Gilded,
	Whips,
	Explosive
} as const;

export const DisassemblySourceGroups = Object.values(DisassemblyGroupMap);
