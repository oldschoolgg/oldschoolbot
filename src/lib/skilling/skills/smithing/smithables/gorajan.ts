import { Time } from 'e';

import itemID from '../../../../util/itemID';
import type { SmithedItem } from '../../../types';

const items = [
	['Gorajan warrior helmet', 'Torva full helm'],
	['Gorajan warrior top', 'Torva platebody'],
	['Gorajan warrior legs', 'Torva platelegs'],
	['Gorajan warrior gloves', 'Torva gloves'],
	['Gorajan warrior boots', 'Torva boots'],

	['Gorajan occult helmet', 'Virtus mask'],
	['Gorajan occult top', 'Virtus robe top'],
	['Gorajan occult legs', 'Virtus robe legs'],
	['Gorajan occult gloves', 'Virtus gloves'],
	['Gorajan occult boots', 'Virtus boots'],

	['Gorajan archer helmet', 'Pernix cowl'],
	['Gorajan archer top', 'Pernix body'],
	['Gorajan archer legs', 'Pernix chaps'],
	['Gorajan archer gloves', 'Pernix gloves'],
	['Gorajan archer boots', 'Pernix boots']
];

const Gorajan: SmithedItem[] = items.map(([gora, other]) => ({
	name: gora,
	level: 99,
	xp: 50_000,
	id: itemID(gora),
	inputBars: { [itemID('Gorajan shards')]: 2, [itemID(other)]: 1 },
	timeToUse: Time.Second * 3.4,
	outputMultiple: 1
}));

export default Gorajan;
