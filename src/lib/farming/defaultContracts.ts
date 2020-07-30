/**
 * The default farming contract information when a farming contract has never been active.
 */
const defaultFarmingContracts = {
	contractStatus: false as boolean,
	contractType: '' as '' | 'easy' | 'medium' | 'hard' | '',
	plantToGrow: '' as string,
	plantTier: 0 as 0 | 1 | 2 | 3 | 4 | 5,
	seedPackTier: 0 as 0 | 1 | 2 | 3 | 4 | 5,
	contractsCompleted: 0 as number
};

export default defaultFarmingContracts;
