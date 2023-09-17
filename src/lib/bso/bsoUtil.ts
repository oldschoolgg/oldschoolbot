import { discontinuedItems } from '../constants';

export function removeDiscontinuedItems(arr: number[]) {
	return arr.filter(i => !discontinuedItems.includes(i));
}
