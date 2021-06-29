import { KlasaClient, KlasaUser } from 'klasa';

import { QueueProperties } from '../../commands/Minion/lfg';
import { ActivityTaskOptions } from '../types/minions';
import { lfgReturnMessageInterface } from './LfgUtils';

export default interface LfgInterface {
	activity: ActivityTaskOptions;
	HandleTripFinish(
		data: ActivityTaskOptions,
		client: KlasaClient
	): Promise<[lfgReturnMessageInterface[], string[], string]>;
	calculateDurationAndActivitiesPerTrip(
		users: KlasaUser[],
		queue: QueueProperties
	): Promise<[number, number, number, string[]]>;
	checkUserRequirements(user: KlasaUser, quantity: number, partySize: number, queue: QueueProperties): any;
	getItemToRemoveFromBank(
		users: KlasaUser[],
		numberOfKills: number,
		client: KlasaClient,
		queue: QueueProperties
	): void;
}
