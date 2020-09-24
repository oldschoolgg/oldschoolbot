import { Task } from 'klasa';
import { Monsters } from 'oldschooljs';
import TzTokJad from 'oldschooljs/dist/simulation/monsters/special/TzTokJad';

import { Emoji, Events } from '../../../lib/constants';
import mejJalImage from '../../../lib/image/mejJalImage';
import fightCavesSupplies from '../../../lib/minions/data/fightCavesSupplies';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { FightCavesActivityTaskOptions } from '../../../lib/types/minions';
import {
	calcPercentOfNum,
	calcWhatPercent,
	formatDuration,
	noOp,
	percentChance,
	rand,
	removeItemFromBank
} from '../../../lib/util';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import itemID from '../../../lib/util/itemID';

const TokkulID = itemID('Tokkul');
const TzrekJadPet = itemID('Tzrek-jad');

export default class extends Task {
	async run({
		userID,
		channelID,
		jadDeathChance,
		preJadDeathTime,
		duration
	}: FightCavesActivityTaskOptions) {}
}
