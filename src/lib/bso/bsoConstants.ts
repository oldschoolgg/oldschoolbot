import { Time } from '@oldschoolgg/toolkit';
import { activity_type_enum } from '@prisma/client';
import { Bank, resolveItems } from 'oldschooljs';

import Skillcapes from '@/lib/skilling/skillcapes.js';

export const GLOBAL_BSO_XP_MULTIPLIER = 5;

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

export const masterFarmerOutfit = resolveItems([
	'Master farmer hat',
	'Master farmer jacket',
	'Master farmer pants',
	'Master farmer gloves',
	'Master farmer boots'
]);

export const bsoTackleBoxes = resolveItems([
	"Champion's tackle box",
	'Professional tackle box',
	'Standard tackle box',
	'Basic tackle box'
]);

export const BlacksmithOutfit = resolveItems([
	'Blacksmith helmet',
	'Blacksmith top',
	'Blacksmith apron',
	'Blacksmith gloves',
	'Blacksmith boots'
]);

export const bsoDeprecatedActivities: activity_type_enum[] = [
	activity_type_enum.BossEvent,
	activity_type_enum.TrickOrTreat,
	activity_type_enum.HalloweenMiniMinigame,
	activity_type_enum.Mortimer,
	activity_type_enum.BirthdayCollectIngredients,
	activity_type_enum.SnoozeSpellActive
];

export const compCapeCreatableBank = new Bank();
for (const cape of Skillcapes) {
	compCapeCreatableBank.add(cape.masterCape.id);
}
compCapeCreatableBank.add('Master quest cape');
compCapeCreatableBank.add('Achievement diary cape (t)');
compCapeCreatableBank.add('Music cape (t)');

compCapeCreatableBank.freeze();

export const itemContractResetTime = Time.Hour * 7.8;
export const giveBoxResetTime = Time.Hour * 23.5;
