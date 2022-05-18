import { Inventions } from '../../invention/inventions';
import { setCustomItem } from '../util';

function addInvention(id: number, name: string) {
	const invention = Inventions.find(i => i.name === name);
	if (!invention) throw new Error(`Tried to add non-existant invention: ${name}`);
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
