import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const BattleaxeBase: DisassemblySourceGroup = {
	name: 'BattleaxeBase',
	items: [
		{ item: i('Bronze battleaxe'), lvl: 1 },
		{ item: i('Iron battleaxe'), lvl: 10 },
		{ item: i('Steel battleaxe'), lvl: 20 },
		{ item: i('Mithril battleaxe'), lvl: 30 },
		{ item: i('Rune battleaxe'), lvl: 50 }
	],
	parts: {},
	partQuantity: 8
};

export default BattleaxeBase;
