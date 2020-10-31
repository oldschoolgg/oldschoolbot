import { Client as TagsClient } from '@kcp/tags';
import { Client } from 'klasa';
import pLimit from 'p-limit';

import { initItemAliases } from '../itemAliases';
import { piscinaPool } from '../workers';

Client.use(TagsClient);

import('../settings/schemas/ClientSchema');
import('../settings/schemas/UserSchema');
import('../settings/schemas/GuildSchema');

export class OldSchoolBotClient extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public queuePromise = pLimit(1);
	public piscinaPool = piscinaPool;

	public init = async (): Promise<this> => {
		initItemAliases();
		return this;
	};
}
