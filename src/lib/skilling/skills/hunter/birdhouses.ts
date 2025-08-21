import birdhouses, { type Birdhouse } from './birdHouseTrapping';
import defaultBirdhouseTrap, { type BirdhouseData } from './defaultBirdHouseTrap';

interface BirdhouseDetails {
	raw: BirdhouseData;
	isReady: boolean;
	readyIn: null | number;
	birdHouse: Birdhouse | null;
	readyAt: Date | null;
}

export function calculateBirdhouseDetails(user: MUser): BirdhouseDetails {
	const birdHouseTraps = user.user.minion_birdhouseTraps;
	if (!birdHouseTraps) {
		return {
			raw: defaultBirdhouseTrap,
			isReady: false,
			readyIn: null,
			birdHouse: null,
			readyAt: null
		};
	}

	const details = birdHouseTraps as unknown as BirdhouseData;

	const birdHouse = details.lastPlaced ? birdhouses.find(_birdhouse => _birdhouse.name === details.lastPlaced) : null;
	if (!birdHouse) throw new Error(`Missing ${details.lastPlaced} birdhouse`);

	const lastPlacedTime: number = details.birdhouseTime;
	const difference = Date.now() - lastPlacedTime;
	const isReady = difference > birdHouse.waitTime;
	const readyIn = lastPlacedTime + birdHouse.waitTime - Date.now();
	return {
		raw: details,
		isReady,
		readyIn,
		birdHouse,
		readyAt: new Date(Date.now() + readyIn)
	};
}
