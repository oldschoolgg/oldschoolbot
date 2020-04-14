import generalBosses from './generalBosses';
import gwdBosses from './gwdBosses';
import lowMonsters from './lowMonsters';
import slayerBosses from './slayerBosses';
import slayerMonsters from './slayerMonsters';
import wildyBosses from './wildyBosses';
import { Bank, ArrayItemsResolved } from '../../types';

export interface KillableMonster {
	id: number;
	name: string;
	aliases: string[];
	timeToFinish: number;
	table: {
		kill(quantity: number): Bank;
	};
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
	difficultyRating: number;
	itemsRequired: ArrayItemsResolved;
	notifyDrops: ArrayItemsResolved;
	qpRequired: number;

	/**
	 * A object of ([key: itemID]: boostPercentage) boosts that apply to
	 * this monster.
	 */
	itemInBankBoosts?: Bank;
}

const killableMonsters = generalBosses.concat(
	gwdBosses,
	lowMonsters,
	slayerBosses,
	slayerMonsters,
	wildyBosses
);

export default killableMonsters;
