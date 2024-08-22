import type { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';

export const allTeamCapes: Item[] = [];
for (let i = 1; i < 51; i++) {
	allTeamCapes.push(getOSItem(`Team-${i} cape`));
}
