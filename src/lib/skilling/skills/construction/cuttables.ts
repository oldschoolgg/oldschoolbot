import itemID from '../../../util/itemID';
import { Cuttable } from '../../types';

const Plankables: Cuttable[] = [
	{
		name: 'Logs',
		inputItem: itemID('Logs'),
		outputItem: itemID('Plank'),
		gpCost: 100
	},
	{
		name: 'Oak',
		inputItem: itemID('Oak logs'),
		outputItem: itemID('Oak plank'),
		gpCost: 250
	},
	{
		name: 'Teak',
		inputItem: itemID('Teak logs'),
		outputItem: itemID('Teak plank'),
		gpCost: 500
	},
	{
		name: 'Mahogany',
		inputItem: itemID('Mahogany logs'),
		outputItem: itemID('Mahogany plank'),
		gpCost: 1500
	}
];

const Cuttables = {
	aliases: ['saw'],
	Plankables
};

export default Cuttables;
