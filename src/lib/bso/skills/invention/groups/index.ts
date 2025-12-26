import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

import { Ashes } from './Ashes.js';
import { Axes } from './Axes.js';
import { Barrows } from './Barrows.js';
import { BluntWeapons } from './BluntWeapons.js';
import { BoltTips } from './BoltTips.js';
import { Bones } from './Bones.js';
import { Bows } from './Bows.js';
import { Claws } from './Claws.js';
import { Clothing } from './Clothing.js';
import { Dagger } from './Dagger.js';
import { Defender } from './Defender.js';
import { Drygores } from './Drygores.js';
import { Dwarven } from './Dwarven.js';
import { EnsouledHeads } from './EnsouledHeads.js';
import { Explosive } from './Explosive.js';
import { Food } from './Food.js';
import { Gems } from './Gems.js';
import { Gilded } from './Gilded.js';
import { Glass } from './Glass.js';
import { Halberd } from './Halberd.js';
import { Hasta } from './Hasta.js';
import { Herb } from './Herb.js';
import { HybridArmour } from './HybridArmour.js';
import { Jewellery } from './Jewellery.js';
import { LeatherHides } from './LeatherHides.js';
import { Logs } from './Logs.js';
import { Longsword } from './Longsword.js';
import { Mace } from './Mace.js';
import { Magic } from './Magic.js';
import { MagicArmour } from './MagicArmour.js';
import { MeleeArmour } from './MeleeArmour.js';
import { Metals } from './Metals.js';
import { MysteryBoxes } from './MysteryBoxes.js';
import { Ores } from './Ores.js';
import { Organic } from './Organic.js';
import { Pious } from './Pious.js';
import { Planks } from './Planks.js';
import { Potion } from './Potion.js';
import { Projectiles } from './Projectiles.js';
import { RangedArmour } from './RangedArmour.js';
import { RawFood } from './RawFood.js';
import { Runes } from './Runes.js';
import { Scimitar } from './Scimitar.js';
import { Shield } from './Shield.js';
import { Spear } from './Spear.js';
import { Staff } from './Staff.js';
import { Sword } from './Sword.js';
import { Talisman } from './Talisman.js';
import { ThirdAge } from './ThirdAge.js';
import { TreasureTrails } from './TreasureTrails.js';
import { UncutGems } from './UncutGems.js';
import { UnstrungBows } from './UnstrungBows.js';

const Whips: DisassemblySourceGroup = {
	name: 'Whips',
	items: [{ item: Items.getOrThrow('Abyssal whip'), lvl: 90, flags: new Set(['abyssal']) }],
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
