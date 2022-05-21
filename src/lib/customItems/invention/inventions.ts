import { setCustomItem } from '../util';

function addInvention(id: number, name: string) {
	setCustomItem(
		id,
		name,
		'Coal',
		{
			customItemData: {
				cantDropFromMysteryBoxes: true,
				isSuperUntradeable: true
			}
		},
		100_000
	);
}

addInvention(63_300, 'Superior bonecrusher');
addInvention(63_302, 'Superior dwarf multicannon');
addInvention(63_304, 'Superior inferno adze');
