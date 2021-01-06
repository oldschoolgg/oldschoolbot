export interface BirdhouseData {
	lastPlaced: string | null;
	birdHousePlaced: boolean; // false -> nothing placed, true -> something placed
	birdhouseTime: number;
}

/**
 * The default birdhouse information when hunter is not yet trained.
 */
const defaultBirdHouseTrap: BirdhouseData = {
	lastPlaced: null,
	birdHousePlaced: false,
	birdhouseTime: 0
};

export default defaultBirdHouseTrap;
