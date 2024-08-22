import getOSItem from './getOSItem';

export default function itemID(name: string) {
	const osItem = getOSItem(name);
	return osItem.id;
}
