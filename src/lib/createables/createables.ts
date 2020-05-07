import { Bank } from '../types';
import Barrows from './barrows';
import Misc from './Misc';
import Crafting from './Crafting';
import Prayer from './prayer';
import SkillingSets from './SkillingSets';
import Smithing from './smithing';

interface Createable {
	name: string;
	outputItems: Bank;
	inputItems: Bank;
	smithingLevel?: number;
	addOutputToCollectionLog?: boolean;
	cantHaveItems: Bank;
	firemakingLevel?: number;
	craftingLevel?: number;
	prayerLevel?: number;
}

const Createables: Createable[] = [
	...Barrows,
	...Misc,
	...Crafting,
	...Prayer,
	...SkillingSets,
	...Smithing
];

export default Createables;
