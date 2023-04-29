/**
Underwater raid
--------------------------------------------
requires merfolk trident in melee
it could be: you need lots of staminas to compensate for the gora, UNTIL you get a trident, which then lets you be superman underwater basically, and no stams needed, no weight limit

- Something that turns your monkey into a wizard monkey, allowing it to cast spells.    
- Trident: boosts underwater agil/fishing, and boosts the raid itself. Can be enchanted by wizard monkey tame to be better. Possibly its used/boosts elsewhere?
- Oceanic dye for gorajan 
- Some gear item (a ring, a cape, whatever)
- ranger ring: costs 20 archer rings, masori


https://runescape.wiki/w/Stalker%27s_ring
https://chisel.weirdgloop.org/gazproj/mrid#/trident/@/ocean/
https://runescape.wiki/w/Fishing%20trident
https://runescape.wiki/w/Ocean%27s_Archer
https://runescape.wiki/w/Ocean%27s_Warrior
https://runescape.wiki/w/Ocean%27s_Mage
*/

import { Bank } from 'oldschooljs';

import { getSimilarItems } from './data/similarItems';
import { Gear } from './structures/Gear';
import { Skills } from './types';
import { formatSkillRequirements, itemID, itemNameFromID } from './util';
import { resolveOSItems } from './util/resolveItems';

const minDOAStats: Skills = {
	attack: 110,
	strength: 110,
	defence: 110,
	magic: 110,
	prayer: 110,
	ranged: 110
};
interface GearSetupPercents {
	melee: number;
	range: number;
	mage: number;
	total: number;
}
const minimumSuppliesNeeded = new Bank({
	'Saradomin brew(4)': 10,
	'Super restore(4)': 5,
	'Ranging potion(4)': 1,
	'Super combat potion(4)': 1,
	'Magic potion(4)': 1
});

const maxMage = new Gear({
	head: 'Gorajan occult helmet',
	neck: 'Arcane blast necklace',
	body: 'Gorajan occult top',
	cape: 'Imbued saradomin cape',
	hands: 'Gorajan occult gloves',
	legs: 'Gorajan occult legs',
	feet: 'Gorajan occult boots',
	weapon: 'Void staff',
	ring: 'Lightbearer',
	shield: 'Abyssal tome'
});

const maxRange = new Gear({
	head: 'Gorajan archer helmet',
	neck: 'Farsight snapshot necklace',
	body: 'Gorajan archer top',
	cape: "Ava's assembler",
	hands: 'Gorajan archer gloves',
	legs: 'Gorajan archer legs',
	feet: 'Gorajan archer boots',
	'2h': 'Hellfire bow',
	ring: 'Lightbearer',
	ammo: 'Hellfire arrow'
});
maxRange.ammo!.quantity = 100_000;

export const maxMelee = new Gear({
	cape: 'Tzkal cape',
	weapon: 'Ghrazi rapier',
	shield: 'Avernic defender',
	ring: 'Ignis ring(i)',
	head: 'Gorajan warrior helmet',
	neck: "Brawler's hook necklace",
	body: 'Gorajan warrior top',
	hands: 'Gorajan warrior gloves',
	legs: 'Gorajan warrior legs',
	feet: 'Gorajan warrior boots'
});

const REQUIRED_MAGE_WEAPONS = resolveOSItems(['Void staff', "Tumeken's shadow", 'Sanguinesti staff']);
const VOID_STAFF_CHARGES_PER_RAID = 30;
const TUMEKEN_SHADOW_PER_RAID = 150;
const requirements: {
	name: string;
	doesMeet: (options: {
		user: MUser;
		quantity: number;
		allItemsOwned: Bank;
		gearStats: GearSetupPercents;
	}) => string | true;
	desc: () => string;
}[] = [
	{
		name: 'Range gear',
		doesMeet: ({ user, gearStats, quantity }) => {
			if (gearStats.range < 25) {
				return 'Terrible range gear';
			}

			if (!user.gear.range.hasEquipped(REQUIRED_RANGE_WEAPONS, false)) {
				return `Must have one of these equipped: ${REQUIRED_RANGE_WEAPONS.map(itemNameFromID).join(', ')}`;
			}

			const rangeAmmo = user.gear.range.ammo;
			const rangeWeapon = user.gear.range.equippedWeapon();
			const arrowsNeeded = BOW_ARROWS_NEEDED * quantity;
			if (user.gear.range.hasEquipped('Hellfire bow')) {
				if (user.gear.range.ammo?.item !== itemID('Hellfire arrow')) {
					return 'You need Hellfire arrows equipped with the Hellfire bow.';
				}
				if (!rangeAmmo || rangeAmmo.quantity < arrowsNeeded) {
					return `Need ${arrowsNeeded} arrows equipped`;
				}
			} else if (rangeWeapon?.id !== itemID('Bow of faerdhinen (c)')) {
				if (!rangeAmmo || rangeAmmo.quantity < arrowsNeeded) {
					return `Need ${arrowsNeeded} arrows equipped`;
				}

				if (!REQUIRED_ARROWS.includes(rangeAmmo.item)) {
					return `Need one of these arrows equipped: ${REQUIRED_ARROWS.map(itemNameFromID).join(', ')}`;
				}
			}

			return true;
		},
		desc: () =>
			`decent range gear (BiS is ${maxRange.toString()}), atleast ${BOW_ARROWS_NEEDED}x arrows equipped, and one of these bows: ${REQUIRED_RANGE_WEAPONS.map(
				itemNameFromID
			).join(', ')}`
	},
	{
		name: 'Melee gear',
		doesMeet: ({ user, gearStats }) => {
			if (gearStats.melee < 25) {
				return 'Terrible melee gear';
			}

			if (!user.gear.melee.hasEquipped(MELEE_REQUIRED_WEAPONS, false)) {
				return `Need one of these weapons in your melee setup: ${MELEE_REQUIRED_WEAPONS.map(
					itemNameFromID
				).join(', ')}`;
			}
			if (!user.gear.melee.hasEquipped(MELEE_REQUIRED_ARMOR, false)) {
				return `Need one of these in your melee setup: ${MELEE_REQUIRED_ARMOR.map(itemNameFromID).join(', ')}`;
			}

			return true;
		},
		desc: () =>
			`decent melee gear (BiS is ${maxMeleeLessThan300Gear.toString()}, switched to a Osmumten fang if the raid level is over 300), and one of these weapons: ${MELEE_REQUIRED_WEAPONS.map(
				itemNameFromID
			).join(', ')}, and one of these armor pieces: ${MELEE_REQUIRED_ARMOR.map(itemNameFromID).join(', ')}`
	},
	{
		name: 'Mage gear',
		doesMeet: ({ gearStats }) => {
			if (gearStats.mage < 25) {
				return 'Terrible mage gear';
			}

			return true;
		},
		desc: () => `decent mage gear (BiS is ${maxMage.toString()})`
	},
	{
		name: 'Stats',
		doesMeet: ({ user }) => {
			if (!user.hasSkillReqs(minDOAStats)) {
				return `You need: ${formatSkillRequirements(minDOAStats)}.`;
			}
			return true;
		},
		desc: () => `${formatSkillRequirements(minDOAStats)}`
	},
	{
		name: 'Supplies',
		doesMeet: ({ user, quantity }) => {
			if (!user.owns(minimumSuppliesNeeded.clone().multiply(quantity))) {
				return `You need atleast this much supplies: ${minimumSuppliesNeeded}.`;
			}

			const tumCharges = TUMEKEN_SHADOW_PER_RAID * quantity;
			if (user.gear.mage.hasEquipped("Tumeken's shadow") && user.user.tum_shadow_charges < tumCharges) {
				return `You need atleast ${tumCharges} Tumeken's shadow charges to use it, otherwise it has to be unequipped: ${mentionCommand(
					globalClient,
					'minion',
					'charge'
				)}`;
			}
			const voidStaffCharges = VOID_STAFF_CHARGES_PER_RAID * quantity;
			if (user.gear.mage.hasEquipped('Void staff') && user.user.void_staff_charges < voidStaffCharges) {
				return `You need atleast ${voidStaffCharges} Void staff charges to use it, otherwise it has to be unequipped: ${mentionCommand(
					globalClient,
					'minion',
					'charge'
				)}`;
			}

			return true;
		},
		desc: () => `Need atleast ${minimumSuppliesNeeded}`
	},
	{
		name: 'Rune Pouch',
		doesMeet: ({ allItemsOwned }) => {
			const similarItems = getSimilarItems(itemID('Rune pouch'));
			if (similarItems.every(item => !allItemsOwned.has(item))) {
				return 'You need to own a Rune pouch.';
			}
			return true;
		},
		desc: () => `Need atleast ${minimumSuppliesNeeded}`
	}
];

interface AtlantisRoom {
	id: number;
	name: string;
	calcDeathChance: (user: MUser) => number;
	calcTime: (user: MUser) => number;
	// transmog pets
}

const rooms: AtlantisRoom[] = [
	{
		id: 1,
		name: 'Shadowcaster the Octopus',
		calcDeathChance: (user: MUser) => 1,
		calcTime: () => 1
		// Use mage
	},
	{
		id: 2,
		name: 'Steelmaw the Whale',
		calcDeathChance: (user: MUser) => 1,
		calcTime: () => 1
		// Use range ballista with extra extra sharp javellins
		// ballista can get broken maybe
		// titan ballista
	},
	{
		id: 3,
		name: 'Voidswimmer the Shark',
		calcDeathChance: (user: MUser) => 1,
		calcTime: () => 1
		// Use range
	},
	{
		id: 4,
		name: "Thalassar the Ocean's Warden",
		calcDeathChance: (user: MUser) => 1,
		calcTime: () => 1
		// Use all 3
	}
];
