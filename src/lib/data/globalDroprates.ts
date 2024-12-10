import getOSItem from '../util/getOSItem';
import { itemNameFromID } from '../util/smallUtils';
import { doaMetamorphPets } from './CollectionsExport';

export const globalDroprates = {
	doug: {
		name: 'Doug (pet)',
		baseRate: 7000,
		clIncrease: 1.5,
		minLength: true,
		rolledPer: 'minute',
		item: getOSItem('Doug')
	},
	takon: {
		name: 'Takon (pet)',
		baseRate: 600,
		clIncrease: 1.5,
		tameBaseRate: 4500,
		rolledPer: 'kc',
		minLength: false,
		item: getOSItem('Takon')
	},
	steve: {
		name: 'Steve (pet)',
		baseRate: 300,
		clIncrease: 1.5,
		tameBaseRate: 500,
		rolledPer: 'kc',
		minLength: false,
		item: getOSItem('Steve')
	},
	voidling: {
		name: 'Voidling (pet)',
		baseRate: 500,
		clIncrease: 1.5,
		rolledPer: 'kc',
		minLength: false,
		item: getOSItem('Voidling')
	},
	remy: {
		name: 'Remy (pet)',
		baseRate: 5000,
		clIncrease: 1.5,
		rolledPer: 'minute',
		minLength: true,
		item: getOSItem('Remy')
	},
	shelldon: {
		name: 'Shelldon (pet)',
		baseRate: 8000,
		clIncrease: 1.5,
		rolledPer: 'minute',
		minLength: true,
		item: getOSItem('Shelldon')
	},
	zak: {
		name: 'Zak (pet)',
		baseRate: 3000,
		clIncrease: 1.4,
		minLength: true,
		rolledPer: 'minute',
		notes: ['Drops when smelting things (Excluding blast furnace)', 'Requires 10 QP'],
		item: getOSItem('Zak')
	},
	zippyHunter: {
		name: 'Zippy (pet) (hunter)',
		baseRate: 3500,
		clIncrease: 1.5,
		minLength: false,
		rolledPer: 'catch',
		notes: ['Received when hunting Eastern ferrets', 'Can also be received from questing'],
		item: getOSItem('Zippy')
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
		rolledPer: 'minute',
		item: getOSItem('Scruffy')
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
	},
	sandy: {
		name: 'Sandy (pet)',
		baseRate: 6000,
		clIncrease: 1.5,
		minLength: false,
		rolledPer: 'catch',
		notes: ['Received when hunting Sandy Geckos'],
		item: getOSItem('Sandy')
	},
	echo: {
		name: 'Echo (pet)',
		baseRate: 1000,
		clIncrease: 1.5,
		minLength: false,
		rolledPer: 'kill',
		notes: ['Received from killing Vladimir Drakan'],
		item: getOSItem('Echo')
	},
	fungo: {
		name: 'Fungo (pet)',
		baseRate: 50,
		clIncrease: 1.5,
		minLength: false,
		rolledPer: 'harvest',
		notes: ['Received from harvesting any planted zygomite'],
		item: getOSItem('Fungo')
	}
};
