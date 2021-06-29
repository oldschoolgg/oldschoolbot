import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { QueueProperties } from '../../commands/Minion/lfg';
import { ActivityTaskOptions } from '../types/minions';

export default interface LfgInterface {
	activity: ActivityTaskOptions;
	HandleTripFinish(data: ActivityTaskOptions, client: KlasaClient): Promise<[string, Bank]>;
	calculateDurationAndActivitiesPerTrip(
		users: KlasaUser[],
		queue: QueueProperties
	): Promise<[number, number, number, string[]]>;
	checkUserRequirements(user: KlasaUser, quantity: number, queue: QueueProperties): any;
	getItemToRemoveFromBank(params: Record<string, any>): void;
}
