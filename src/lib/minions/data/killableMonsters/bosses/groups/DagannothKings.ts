import { Monsters } from 'oldschooljs';

import setMonsterGroup from '../../../../../util/setMonsterGroup';

export const DagannothKingsMonsterGroup = [Monsters.DagannothRex, Monsters.DagannothPrime, Monsters.DagannothSupreme];

setMonsterGroup({
	id: 632_267,
	name: 'Dagannoth kings',
	monsters: DagannothKingsMonsterGroup,
	newItemData: {
		id: 632_267,
		name: 'Dagannoth kings',
		aliases: ['dagannoth kings', 'dks', 'dag kings']
	},
	randomStart: true
});

export const DagannothKings = Monsters.find(mon => mon.name === 'Dagannoth kings')!;

export default DagannothKings;
