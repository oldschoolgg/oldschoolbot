import { Items } from 'oldschooljs';

const halloweenItems = Items.resolveItems([
	// 2025
	'Spooky chair',
	'Grim reaper top',
	'Grim reaper bottoms',
	'Grim reaper gloves',
	'Spooky pumpkin lantern',
	// 2024
	'Beige pumpkin (happy)',
	'White pumpkin (happy)',
	'Yellow pumpkin (happy)',
	'Orange pumpkin (happy)',
	'Red pumpkin (happy)',
	'Dark green pumpkin (happy)',
	'Powder grey pumpkin (happy)',
	'Halloween scarecrow',
	'Scarecrow shirt',
	// 2023
	'Cobweb cape',
	'Web cloak',
	'Spider hat',
	// 2022
	'Witch hat',
	'Witch top',
	'Witch robes',
	'Witch boots',
	'Witch cape',
	'Treat cauldron',
	'Halloween wig',
	// 2021
	'Ugly halloween jumper (orange)',
	'Ugly halloween jumper (black)',
	'Haunted wine bottle',
	'Saucepan',
	// 2020
	'Headless head',
	// 2019
	'Skeleton lantern',
	'Pumpkin lantern',
	'Spookier boots',
	'Spookier gloves',
	'Spookier hood',
	'Spookier robe',
	'Spookier skirt',
	'Spooky boots',
	'Spooky gloves',
	'Spooky hood',
	'Spooky robe',
	'Spooky skirt',
	// 2018
	'Eek',
	'Clown mask',
	'Clown bow tie',
	'Clown gown',
	'Clown trousers',
	'Clown shoes',
	// 2017
	'Jonas mask',
	// 2016
	'Banshee mask',
	'Banshee top',
	'Banshee robe',
	// 2015
	'Gravedigger mask',
	'Gravedigger top',
	'Gravedigger leggings',
	'Gravedigger gloves',
	'Gravedigger boots',
	'Anti-panties',
	// 2014
	'Grim reaper hood',
	// 2013
	'Zombie head (hween)',
	'Jack lantern mask',
	'Skeleton mask',
	'Skeleton shirt',
	'Skeleton leggings',
	'Skeleton gloves',
	'Skeleton boots'
]);

const halloweenOnlyForPermIrons = Items.resolveItems([
	'Scythe',
	'Pumpkin',
	"Black h'ween mask",
	'Red halloween mask',
	'Green halloween mask',
	'Blue halloween mask'
]);

export const HolidayItems = {
	Halloween: {
		halloweenItems,
		halloweenOnlyForPermIrons
	}
};
