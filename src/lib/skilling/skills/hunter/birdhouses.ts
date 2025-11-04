import type { IBirdhouseData } from '@oldschoolgg/schemas';

import birdhouses, { type Birdhouse } from './birdHouseTrapping.js';

interface BirdhouseDetails {
	raw: IBirdhouseData;
	isReady: boolean;
	readyIn: null | number;
	birdHouse: Birdhouse | null;
	readyAt: Date | null;
}

export function calculateBirdhouseDetails(user: MUser): BirdhouseDetails {
	const birdHouseTraps = user.fetchBirdhouseData();

	const birdHouse = birdHouseTraps.lastPlaced
		? birdhouses.find(_birdhouse => _birdhouse.name === birdHouseTraps.lastPlaced)
		: null;
	if (!birdHouse) throw new Error(`Missing ${birdHouseTraps.lastPlaced} birdhouse`);

	const lastPlacedTime: number = birdHouseTraps.birdhouseTime;
	const difference = Date.now() - lastPlacedTime;
	const isReady = difference > birdHouse.waitTime;
	const readyIn = lastPlacedTime + birdHouse.waitTime - Date.now();
	return {
		raw: birdHouseTraps,
		isReady,
		readyIn,
		birdHouse,
		readyAt: new Date(Date.now() + readyIn)
	};
}
