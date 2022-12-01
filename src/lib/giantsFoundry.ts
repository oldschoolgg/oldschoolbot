import { randInt } from 'e';

import { logError } from './util/logError';

// Difference between this and ItemBank, is ItemBank is expected to have only integers as strings
export interface GiantsFoundryBank {
	[key: string]: number;
}
export const tipMoulds: string[] = [
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

export const bladeMoulds: string[] = [
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

export const forteMoulds: string[] = [
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

// weaponID stored as hex 0a0403 => 10, 4, 3
export function decodeGiantWeapons(weaponID: string) {
	const decimal = parseInt(weaponID, 16);
	const [tipMould, bladeMould, forteMould] = [decimal >> 16, (decimal >> 8) & 255, decimal & 255];
	return [tipMould, bladeMould, forteMould];
}

export function encodeGiantWeapons([tip, blade, forte]: [number, number, number]) {
	return ((tip << 16) | (blade << 8) | forte).toString(16);
}

export function generateRandomGiantWeapon(): [number, number, number] {
	return [randInt(0, tipMoulds.length - 1), randInt(0, bladeMoulds.length - 1), randInt(0, forteMoulds.length - 1)];
}

export function giantWeaponName(weapon: string | number[]) {
	if (typeof weapon !== 'string' && weapon.length < 3) {
		logError(new Error('Invalid weapon data'));
		return '';
	}
	const [tipMouldID, bladeMouldID, forteMouldID] = typeof weapon === 'string' ? decodeGiantWeapons(weapon) : weapon;
	return `${tipMoulds[tipMouldID]} ${bladeMoulds[bladeMouldID]} ${forteMoulds[forteMouldID]}`;
}
