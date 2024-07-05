import { randInt } from 'e';

// Difference between this and ItemBank, is ItemBank is expected to have only integers as strings
export interface GiantsFoundryBank {
	[key: string]: number;
}
const tipMoulds: string[] = [
	'Saw Tip',
	'Gladius Point',
	"Serpent's Fang",
	"Medusa's Head",
	'Chopper Tip',
	'People Poker Point',
	'Corrupted Point',
	"Defender's Tip",
	'Serrated Tip',
	'Needle Point',
	'The Point!'
];

const bladeMoulds: string[] = [
	'Gladius Edge',
	'Stiletto Blade',
	'Medusa Blade',
	'Fish Blade',
	"Defender's Edge",
	'Saw Blade',
	'Flamberge Blade',
	'Serpent Blade',
	'Claymore Blade',
	'Fleur de Blade',
	'Choppa!'
];

const forteMoulds: string[] = [
	'Serrated Forte',
	'Serpent Ricasso',
	'Medusa Ricasso',
	'Disarming Forte',
	'Gladius Ricasso',
	'Chopper Forte',
	'Stiletto Forte',
	"Defender's Base",
	"Juggernaut's Forte",
	'Chopper Forte +1',
	'Spiker!'
];

export const TOTAL_GIANT_WEAPONS = tipMoulds.length * bladeMoulds.length * forteMoulds.length;

// weaponID encoded as 10-4-3
export function encodeGiantWeapons([tip, blade, forte]: [number, number, number]) {
	return `${tip.toString()}-${blade.toString()}-${forte.toString()}`;
}

export function generateRandomGiantWeapon(): [number, number, number] {
	return [randInt(0, tipMoulds.length - 1), randInt(0, bladeMoulds.length - 1), randInt(0, forteMoulds.length - 1)];
}

export function giantWeaponName(weapon: number[]) {
	const [tipMouldID, bladeMouldID, forteMouldID] = weapon;
	return `${tipMoulds[tipMouldID]} ${bladeMoulds[bladeMouldID]} ${forteMoulds[forteMouldID]}`;
}
