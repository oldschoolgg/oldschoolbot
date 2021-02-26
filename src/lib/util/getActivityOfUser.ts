import { Client } from 'discord.js';

export default function getActivityOfUser(client: Client, userID: string) {
	const task = client.minionActivityCache.get(userID);
	return task ?? null;
}
