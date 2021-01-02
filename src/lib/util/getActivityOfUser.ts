import { Client } from 'discord.js';

import { OldSchoolBotClient } from '../structures/OldSchoolBotClient';

export default function getActivityOfUser(client: Client, userID: string) {
	const task = (client as OldSchoolBotClient).minionActivityCache.get(userID);
	return task ?? null;
}
