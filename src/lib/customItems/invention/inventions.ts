import { setCustomItem } from '../util';

function addInvention(id: number, name: string, itemToExtend = 'Coal') {
	setCustomItem(
		id,
		name,
		itemToExtend,
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
addInvention(63_304, 'Superior inferno adze', 'Dragon pickaxe');
addInvention(63_306, 'Silverhawk boots', 'Dragon boots');
addInvention(63_308, 'Mecha mortar');
addInvention(63_310, 'Quick trap');
addInvention(63_312, 'Arcane harvester', 'Magic secateurs');
addInvention(63_314, 'Clue upgrader');
addInvention(63_316, 'Portable tanner');
addInvention(63_318, 'Drygore saw');
addInvention(63_320, 'Dwarven toolkit');
addInvention(63_322, 'Mecha rod');
addInvention(63_324, 'Master hammer and chisel');
addInvention(63_325, 'Abyssal amulet');
