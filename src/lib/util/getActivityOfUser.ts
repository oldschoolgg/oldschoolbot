import { KlasaUser } from 'klasa';
import { Client } from 'discord.js';
import { ClientSettings } from '../settings/types/ClientSettings';

export default function getActivityOfUser(client: Client, user: KlasaUser) {
	const tasks = Object.values(client.settings?.get(ClientSettings.PgBossJobs) ?? {}).find(
		t => t.userID === user.id
	);
	if (tasks) return tasks.task;
	return null;
}
