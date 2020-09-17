import { Client } from 'discord.js';
import { KlasaUser } from 'klasa';

import { minionIsBusy } from '../pgBoss';

export default function getActivityOfUser(client: Client, user: KlasaUser) {
	return minionIsBusy(user.id);
}
