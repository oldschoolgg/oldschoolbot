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
addInvention(63_301, 'Superior bonecrusher (broken)');
addInvention(63_302, 'Superior dwarf multicannon');
addInvention(63_303, 'Superior dwarf multicannon (broken)');
addInvention(63_304, 'Superior inferno adze');
addInvention(63_305, 'Superior inferno adze (broken)');
