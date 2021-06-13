import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import pets from '../lib/data/pets';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { channelIsSendable, roll } from '../lib/util';

export default class extends Monitor {
	public __memberCache: { [key: string]: number } = {};

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { ignoreOthers: false, enabled: true });
	}

	/* eslint-disable consistent-return */
	async run(msg: KlasaMessage) {
		if (!msg.guild) return;
		if (!msg.guild.settings.get(GuildSettings.PetChannel)) return;

		// If they sent a message in this server in the past 1.5 mins, return.
		const lastMessage = this.__memberCache[`${msg.author.id}.${msg.guild.id}`] || 1;
		if (Date.now() - lastMessage < 80000) return;
		this.__memberCache[`${msg.author.id}.${msg.guild.id}`] = Date.now();

		const pet = pets[Math.floor(Math.random() * pets.length)];
		if (roll(Math.max(Math.min(pet.chance, 250000), 1000))) {
			await msg.author.settings.sync(true);
			const userPets = msg.author.settings.get(UserSettings.Pets);
			const newUserPets = { ...userPets };
			if (!newUserPets[pet.id]) newUserPets[pet.id] = 1;
			else newUserPets[pet.id]++;
			await msg.author.settings.update(UserSettings.Pets, {
				...newUserPets
			});
			if (!channelIsSendable(msg.channel)) return;
			if (userPets[pet.id] > 1) {
				msg.channel.send(
					`${msg.author} has a funny feeling like they would have been followed. ${pet.emoji}`
				);
			} else {
				msg.channel.send(`You have a funny feeling like you’re being followed, ${
					msg.author
				} ${pet.emoji}
Type \`${msg.guild.settings.get(GuildSettings.Prefix)}mypets\` to see your pets.`);
			}
		}
	}
}
