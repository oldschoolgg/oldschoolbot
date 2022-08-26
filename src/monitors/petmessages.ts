import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import pets from '../lib/data/pets';
import { ItemBank } from '../lib/types';
import { channelIsSendable, roll } from '../lib/util';
import { mUserFetch, untrustedGuildSettingsCache } from '../mahoji/mahojiSettings';

export default class extends Monitor {
	public __memberCache: { [key: string]: number } = {};

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { ignoreOthers: false, enabled: true });
	}

	/* eslint-disable consistent-return */
	async run(msg: KlasaMessage) {
		if (!msg.guild) return;
		const cachedSettings = untrustedGuildSettingsCache.get(msg.guild.id);
		if (!cachedSettings?.petchannel) return;

		// If they sent a message in this server in the past 1.5 mins, return.
		const lastMessage = this.__memberCache[`${msg.author.id}.${msg.guild.id}`] || 1;
		if (Date.now() - lastMessage < 80_000) return;
		this.__memberCache[`${msg.author.id}.${msg.guild.id}`] = Date.now();

		const pet = pets[Math.floor(Math.random() * pets.length)];
		if (roll(Math.max(Math.min(pet.chance, 250_000), 1000))) {
			const user = await mUserFetch(msg.author.id);
			const userPets = user.user.pets as ItemBank;
			const newUserPets = { ...userPets };
			if (!newUserPets[pet.id]) newUserPets[pet.id] = 1;
			else newUserPets[pet.id]++;
			await user.update({
				pets: { ...newUserPets }
			});
			if (!channelIsSendable(msg.channel)) return;
			if (userPets[pet.id] > 1) {
				msg.channel.send(`${msg.author} has a funny feeling like they would have been followed. ${pet.emoji}`);
			} else {
				msg.channel.send(`You have a funny feeling like you’re being followed, ${msg.author} ${pet.emoji}
Type \`${cachedSettings.prefix ?? '+'}mypets\` to see your pets.`);
			}
		}
	}
}
