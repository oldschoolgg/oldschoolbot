import { EItem } from 'oldschooljs';

export function isHardwoodOnePointFiveTick({
	logID,
	woodcuttingLevel,
	farmingLevel,
	forestry
}: {
	logID: number;
	woodcuttingLevel: number;
	farmingLevel: number;
	forestry: boolean;
}) {
	if (forestry || woodcuttingLevel < 92) return false;
	return (logID === EItem.TEAK_LOGS && farmingLevel >= 35) || (logID === EItem.MAHOGANY_LOGS && farmingLevel >= 55);
}
