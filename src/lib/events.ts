import { Message, TextChannel } from 'discord.js';
import { roll, Time } from 'e';
import LRUCache from 'lru-cache';

import { CLIENT_ID, OWNER_IDS, production, SupportServer } from '../config';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { untrustedGuildSettingsCache } from '../mahoji/mahojiSettings';
import { Channel, Emoji } from './constants';
import pets from './data/pets';
import { ItemBank } from './types';
import { channelIsSendable, memoryAnalysis } from './util';
import { makeBankImage } from './util/makeBankImage';

const rareRolesSrc: [string, number, string][] = [
	['670211706907000842', 250, 'Bronze'],
	['706511231242076253', 1000, 'Xerician'],
	['670211798091300864', 2500, 'Iron'],
	['688563471096348771', 5000, 'Steel'],
	['705987772372221984', 7500, 'Void'],
	['688563333464457304', 10_000, 'Mithril'],
	['688563389185917072', 15_000, 'Adamant'],
	['705988547202515016', 20_000, "Inquisitor's"],
	['670212713258942467', 25_000, 'Rune'],
	['705988292646141983', 30_000, 'Obsidian'],
	['706512132899995648', 40_000, 'Crystal'],
	['670212821484568577', 50_000, 'Dragon'],
	['706508079184871446', 60_000, 'Bandos'],
	['706512315805204502', 65_000, 'Armadyl'],
	['688563635873644576', 75_000, 'Barrows'],
	['705988130401943643', 80_000, 'Ancestral'],
	['706510440452194324', 85_000, "Dagon'hai"],
	['706510238643388476', 90_000, 'Lunar'],
	['688563780686446649', 100_000, 'Justiciar'],
	['670212876832735244', 1_000_000, 'Third Age']
];

const userCache = new LRUCache<string, number>({ max: 1000 });
function rareRoles(msg: Message) {
	if (!msg.guild || msg.guild.id !== SupportServer) {
		return;
	}

	const lastMessage = userCache.get(msg.author.id) ?? 1;
	if (Date.now() - lastMessage < Time.Second * 13) return;
	userCache.set(msg.author.id, Date.now());

	if (!roll(10)) return;

	for (const [roleID, chance, name] of rareRolesSrc) {
		if (roll(chance / 10)) {
			if (msg.member?.roles.cache.has(roleID)) continue;
			if (!production) {
				return msg.channel.send(`${msg.author}, you would've gotten the **${name}** role.`);
			}
			msg.member?.roles.add(roleID);
			msg.react(Emoji.Gift);

			const channel = globalClient.channels.cache.get(Channel.Notifications);

			if (
				!rareRolesSrc
					.slice(0, 3)
					.map(i => i[2])
					.includes(name)
			) {
				(channel as TextChannel).send(
					`${Emoji.Fireworks} **${msg.author.username}** just received the **${name}** role. `
				);
			}
			break;
		}
	}
}

const petCache = new LRUCache<string, number>({ max: 1000 });
async function petMessages(msg: Message) {
	if (!msg.guild) return;
	const cachedSettings = untrustedGuildSettingsCache.get(msg.guild.id);
	if (!cachedSettings?.petchannel) return;

	const key = `${msg.author.id}.${msg.guild.id}`;
	// If they sent a message in this server in the past 1.5 mins, return.
	const lastMessage = petCache.get(key) ?? 1;
	if (Date.now() - lastMessage < 80_000) return;
	petCache.set(key, Date.now());

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
Type \`/tools user mypets\` to see your pets.`);
		}
	}
}

const mentionText = `<@${CLIENT_ID}>`;

export async function onMessage(msg: Message) {
	rareRoles(msg);
	petMessages(msg);
	if (!msg.content || msg.author.bot || !channelIsSendable(msg.channel)) return;
	const content = msg.content.trim();
	if (!content.includes(mentionText)) return;
	const user = await mUserFetch(msg.author.id);
	const result = await minionStatusCommand(user);
	const { components } = result;

	if (content === `${mentionText} b`) {
		msg.reply({
			files: [
				(
					await makeBankImage({
						bank: user.bankWithGP,
						title: 'Your Bank',
						user,
						flags: {
							page: 1
						}
					})
				).file.attachment
			],
			components
		});
		return;
	}
	if (content.includes(`${mentionText} bs `)) {
		const searchText = content.split(' ')[2];
		msg.reply({
			files: [
				(
					await makeBankImage({
						bank: user.bankWithGP.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase())),
						title: 'Your Bank',
						user
					})
				).file.attachment
			],
			components
		});
		return;
	}
	if (content.includes(`${mentionText} mem`) && OWNER_IDS.includes(msg.author.id)) {
		msg.reply(
			Object.entries(memoryAnalysis())
				.map(ent => `**${ent[0]}:** ${ent[1]}`)
				.join('\n')
		);
		return;
	}

	msg.reply({
		content: result.content,
		components
	});
}
