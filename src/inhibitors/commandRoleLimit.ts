import {  Inhibitor, InhibitorStore, KlasaMessage, KlasaClient } from 'klasa';

import { SupportServer, Roles } from '../lib/constants';

export default class extends Inhibitor {
	public constructor(
		client: KlasaClient,
		store: InhibitorStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory);
	}

	public async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (msg.channel.id !== '342983479501389826') return;
		if (
			msg.member &&
			[Roles.Booster, Roles.Contributor].some(roleID => msg.member?.roles.has(roleID))
		) {
			return false;
        }
        
        return true;
	}
}
