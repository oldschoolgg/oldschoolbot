import type { Item } from '@/index.js';

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export const itemChanges: Record<number, DeepPartial<Item>> = {
	27665: {
		//Accursed sceptre
		equipment: {
			requirements: {
				magic: 70
			}
		}
	},
	27690: {
		//Voidwaker
		equipment: {
			requirements: {
				attack: 75
			}
		}
	},
	27655: {
		//Webweaver bow
		equipment: {
			requirements: {
				ranged: 75
			}
		}
	},
	27610: {
		//Venator bow
		equipment: {
			requirements: {
				ranged: 80
			}
		}
	},
	27624: {
		//Ancient sceptre
		equipment: {
			requirements: {
				magic: 70,
				strength: 60,
				attack: 50
			}
		}
	},
	30105: {
		name: 'Tooth half of key (moon key)'
	},
	30107: {
		name: 'Loop half of key (moon key)'
	},
	26945: {
		name: "Pharaoh's sceptre",
		id: 9044
	}
};

export const itemsToDuplicate = [
	{ id: 25_485, idToDuplicate: 28_307 }, //Ultor ring
	{ id: 25_486, idToDuplicate: 28_313 }, //Magus ring
	{ id: 25_487, idToDuplicate: 28_310 }, //Venator ring
	{ id: 25_488, idToDuplicate: 28_316 } //Bellator ring
];
