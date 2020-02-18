import { Client } from 'discord.js';

import { SupportServer } from '../constants';

export default function getSupportGuild(client: Client) {
	const guild = client.guilds.get(SupportServer);
	if (!guild) throw `Can't find support guild.`;
	return guild;
}
