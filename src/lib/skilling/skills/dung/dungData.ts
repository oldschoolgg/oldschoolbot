import getOSItem from '../../../util/getOSItem';

export type Floor = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function isValidFloor(floor: number | string): floor is Floor {
	return [1, 2, 3, 4, 5, 6, 7].includes(floor as number);
}

export const dungBuyables = [
	{
		item: getOSItem('Chaotic rapier'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic longsword'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic maul'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic staff'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic crossbow'),
		cost: 200_000
	},
	{
		item: getOSItem('Offhand Chaotic rapier'),
		cost: 100_000
	},
	{
		item: getOSItem('Offhand Chaotic longsword'),
		cost: 100_000
	},
	{
		item: getOSItem('Offhand Chaotic crossbow'),
		cost: 100_000
	},
	{
		item: getOSItem('Farseer kiteshield'),
		cost: 200_000
	},
	{
		item: getOSItem('Scroll of life'),
		cost: 400_000
	},
	{
		item: getOSItem('Herbicide'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of efficiency'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of farming'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of cleansing'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of dexterity'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of teleportation'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of mystery'),
		cost: 500_000
	},
	{
		item: getOSItem('Amulet of zealots'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of proficiency'),
		cost: 900_000
	},
	{
		item: getOSItem('Frostbite'),
		cost: 2_000_000
	},
	{
		item: getOSItem('Chaotic remnant'),
		cost: 500_000
	},
	{
		item: getOSItem('Scroll of longevity'),
		cost: 800_000
	},
	{
		item: getOSItem('Scroll of the hunt'),
		cost: 800_000
	},
	{
		item: getOSItem('Daemonheim agility pass'),
		cost: 1_000_000
	},
	{
		item: getOSItem('Dungeoneering dye'),
		cost: 4_000_000
	}
];

export function determineDgLevelForFloor(floor: number) {
	return Math.floor(floor * 20 - 20);
}

export function requiredLevel(floor: number) {
	return floor * 14;
}

export function requiredSkills(floor: number) {
	const lvl = requiredLevel(floor);
	const nonCmbLvl = Math.floor(lvl / 1.5);
	return {
		attack: lvl,
		strength: lvl,
		defence: lvl,
		hitpoints: lvl,
		magic: lvl,
		ranged: lvl,
		herblore: nonCmbLvl,
		runecraft: nonCmbLvl,
		prayer: nonCmbLvl,
		fletching: nonCmbLvl,
		fishing: nonCmbLvl,
		cooking: nonCmbLvl,
		construction: nonCmbLvl,
		crafting: nonCmbLvl,
		dungeoneering: determineDgLevelForFloor(floor)
	};
}
