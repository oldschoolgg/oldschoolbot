import { Client as TagsClient } from '@kcp/tags';
import { Client } from 'klasa';
import pLimit from 'p-limit';

import { clientOptions } from '../config/config';
import { initCustomItems } from '../customItems';
import { initItemAliases } from '../itemAliases';
import { piscinaPool } from '../workers';

Client.use(TagsClient);

import('../settings/schemas/ClientSchema');
import('../settings/schemas/UserSchema');
import('../settings/schemas/GuildSchema');

const { production } = clientOptions;

if (typeof production !== 'boolean') {
	throw new Error(`Must provide production boolean.`);
}

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public queuePromise = pLimit(1);
	public piscinaPool = piscinaPool;
	public production = production ?? false;

	public init = async (): Promise<this> => {
		initCustomItems();
		initItemAliases();
		return this;
	};
}
