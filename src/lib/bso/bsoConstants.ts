import { Time } from 'e';
import { resolveItems } from 'oldschooljs';

export const GLOBAL_BSO_XP_MULTIPLIER = 5;
export const BSO_MAX_TOTAL_LEVEL = 3120;

export const MIN_LENGTH_FOR_PET = Time.Minute * 5;

export const IVY_MAX_TRIP_LENGTH_BOOST = Time.Minute * 25;

export const doaPurples = resolveItems([
	'Oceanic relic',
	'Oceanic dye',
	'Aquifer aegis',
	'Shark tooth',
	'Shark jaw',
	'Bruce',
	'Pearl',
	'Bluey'
]);

export const ORI_DISABLED_MONSTERS = [
	'The Nightmare',
	"Phosani's Nightmare",
	'Ignecarus',
	'King Goldemar',
	'Kalphite King',
	'Nex',
	'Moktang',
	'Naxxus',
	'Vasa Magus'
] as const;

export const CHINCANNON_MESSAGES = [
	'Your team received no loot, your Chincannon blew it up!',
	'Oops.. your Chincannon blew up all the loot.',
	'Your Chincannon blew up all the loot!',
	'Your Chincannon turned the loot into dust.'
];

export const OSB_VIRTUS_IDS = [26_241, 26_243, 26_245];
export const YETI_ID = 129_521;
export const KING_GOLDEMAR_GUARD_ID = 30_913;
