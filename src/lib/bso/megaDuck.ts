export interface MegaDuckLocation {
	x: number;
	y: number;
	placesVisited: string[];
	usersParticipated: Record<string, number>;
	steps: [number, number][];
}

export const defaultMegaDuckLocation: Readonly<MegaDuckLocation> = {
	x: 1356,
	y: 209,
	usersParticipated: {},
	placesVisited: [],
	steps: []
};
