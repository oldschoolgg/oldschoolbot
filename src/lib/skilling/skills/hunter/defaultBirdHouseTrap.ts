export interface BirdhouseData {
	lastPlaced: string | null;
	birdhousePlaced: boolean; // false -> nothing placed, true -> something placed
	birdhouseTime: number;
}

/**
 * The default birdhouse information when hunter is not yet trained.
 */
const defaultBirdhouseTrap: BirdhouseData = {
	lastPlaced: null,
	birdhousePlaced: false,
	birdhouseTime: 0
};

export default defaultBirdhouseTrap;
