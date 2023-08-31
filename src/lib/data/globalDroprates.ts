import { itemNameFromID } from '../util/smallUtils';
import { doaMetamorphPets } from './CollectionsExport';

export const globalDroprates = {
	doug: {
		name: 'Doug (pet)',
		baseRate: 7000,
		clIncrease: 1.5,
		minLength: true,
		rolledPer: 'minute'
	},
	takon: {
		name: 'Takon (pet)',
		baseRate: 600,
		clIncrease: 1.5,
		tameBaseRate: 4500,
		rolledPer: 'kc',
		minLength: false
	},
	steve: {
		name: 'Steve (pet)',
		baseRate: 300,
		clIncrease: 1.5,
		tameBaseRate: 500,
		rolledPer: 'kc',
		minLength: false
	},
	voidling: {
		name: 'Voidling (pet)',
		baseRate: 500,
		clIncrease: 1.5,
		rolledPer: 'kc',
		minLength: false
	},
	remy: {
		name: 'Remy (pet)',
		baseRate: 5000,
		clIncrease: 1.5,
		rolledPer: 'minute',
		minLength: true
	},
	shelldon: {
		name: 'Shelldon (pet)',
		baseRate: 8000,
		clIncrease: 1.5,
		rolledPer: 'minute',
		minLength: true
	},
	zak: {
		name: 'Zak (pet)',
		baseRate: 3000,
		clIncrease: 1.4,
		minLength: true,
		rolledPer: 'minute',
		notes: ['Drops when smelting things (Excluding blast furnace)', 'Requires 10 QP']
	},
	zippyHunter: {
		name: 'Zippy (pet) (hunter)',
		baseRate: 3500,
		clIncrease: 1.5,
		minLength: false,
		rolledPer: 'catch',
		notes: ['Received when hunting Eastern ferrets', 'Can also be received from questing']
	},
	zippyQuesting: {
		name: 'Zippy (pet) (questing)',
		baseRate: 350,
		minLength: false,
		rolledPer: 'trip',
		notes: ['Can also be received from hunting Eastern ferrets']
	},
	scruffy: {
		name: 'Scruffy (pet)',
		baseRate: 4000,
		clIncrease: 1.5,
		minLength: true,
		rolledPer: 'minute'
	},
	doaMetamorphPet: {
		name: `Depths of Atlantis Metamorph (${doaMetamorphPets.map(itemNameFromID).join(', ')})`,
		baseRate: 30,
		rolledPer: 'kc',
		notes: ['Dropped only in Challenge Mode', "Can't receive duplicates"]
	},
	doaCrush: {
		name: 'Crush (Depths of Atlantis pet)',
		baseRate: 300,
		cmReduction: 17,
		rolledPer: 'kc',
		notes: ["Droprate increased by 17% in CM's"]
	}
};
