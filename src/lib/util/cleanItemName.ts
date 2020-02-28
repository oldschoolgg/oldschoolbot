// Cleans weird characters from inputted item names.
export default function cleanItemName(itemName: string) {
	return itemName.replace(/’/g, '');
}
