import { sumArr } from 'e';

export function averageArr(arr: number[]) {
	return sumArr(arr) / arr.length;
}

export function getWrappedArrayItem<T>(array: T[], index: number): T {
	const wrappedIndex = ((index % array.length) + array.length) % array.length;
	return array[wrappedIndex];
}
