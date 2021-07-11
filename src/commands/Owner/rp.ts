import { MessageAttachment, MessageEmbed } from 'discord.js';
import { notEmpty, uniqueArr } from 'e';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import fetch from 'node-fetch';

import { badges, BitField, BitFieldData, Channel, Emoji } from '../../lib/constants';
import { getSimilarItems } from '../../lib/data/similarItems';
import { cancelTask, minionActivityCache } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTable } from '../../lib/typeorm/ActivityTable.entity';
import { cleanString, formatDuration, getSupportGuild, itemNameFromID } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { sendToChannelID } from '../../lib/util/webhook';
import PatreonTask from '../../tasks/patreon';

export const emoji = (client: KlasaClient) => getSupportGuild(client).emojis.cache.random().toString();

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			runIn: ['text'],
			usage: '<cmd:str> [user:user|str:...str] [str:...str]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [cmd, input, str]: [string, KlasaUser | string | undefined, string | undefined]) {
		if (msg.guild!.id !== '342983479501389826') return null;

		switch (cmd.toLowerCase()) {
			case 'hasequipped': {
				if (typeof input !== 'string') return;
				const item = getOSItem(input);
				const setupsWith = [];
				let res = `Does ${msg.author.username} have a ${item.name} (or similar items: ${getSimilarItems(item.id)
					.map(itemNameFromID)
					.join(', ')}) equipped?`;
				for (const [key, gear] of Object.entries(msg.author.rawGear())) {
					if (gear.hasEquipped([item.id], false, true)) {
						setupsWith.push(key);
						continue;
					}
				}
				return msg.channel.send(`${res}

${
	setupsWith.length === 0
		? "You don't have this item equipped anywhere."
		: `You have ${item.name} equipped in these setups: ${setupsWith.join(', ')}.`
}`);
			}
			case 'issues': {
				if (typeof input !== 'string' || input.length < 3 || input.length > 25) return;
				const query = cleanString(input);

				const searchURL = new URL('https://api.github.com/search/issues');

				searchURL.search = new URLSearchParams([
					['q', ['repo:oldschoolgg/oldschoolbot', 'is:issue', 'is:open', query].join(' ')]
				]).toString();
				const { items } = await fetch(searchURL).then(res => res.json());
				if (items.length === 0) return msg.channel.send('No results found.');
				return msg.channel.send({
					embeds: [
						new MessageEmbed()
							.setTitle(`${items.length} Github issues found from your search`)
							.setDescription(
								items
									.slice(0, 10)
									.map((i: any, index: number) => `${index + 1}. [${i.title}](${i.html_url})`)
									.join('\n')
							)
					]
				});
			}
		}

		const isMod = msg.author.settings.get(UserSettings.BitField).includes(BitField.isModerator);
		const isOwner = this.client.owners.has(msg.author);
		if (!isMod && !isOwner) return null;

		if (input && input instanceof KlasaUser) {
			await input.settings.sync(true);
		}

		// Mod commands
		switch (cmd.toLowerCase()) {
			case 'bypassage': {
				if (!input || !(input instanceof KlasaUser)) return;
				await input.settings.sync(true);
				if (input.settings.get(UserSettings.BitField).includes(BitField.BypassAgeRestriction)) {
					return msg.channel.send('This user is already bypassed.');
				}
				await input.settings.update(UserSettings.BitField, BitField.BypassAgeRestriction, {
					arrayAction: 'add'
				});
				return msg.channel.send(`${Emoji.RottenPotato} Bypassed age restriction for ${input.username}.`);
			}
			case 'gptrack': {
				return msg.channel.send(`
**Sell** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourceSellingItems)}
**PvM/Clues** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourcePVMLoot)}
**Alch** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourceAlching)}
**Pickpocket** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourcePickpocket)}
**Dice** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourceDice)}
**Open** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourceOpen)}
**Daily** ${this.client.settings.get(ClientSettings.EconomyStats.GPSourceDaily)}
`);
			}
			case 'check':
			case 'c': {
				if (!input || !(input instanceof KlasaUser)) return;
				const bitfields = `${input.settings
					.get(UserSettings.BitField)
					.map(i => BitFieldData[i])
					.filter(notEmpty)
					.map(i => i.name)
					.join(', ')}`;

				const task = minionActivityCache.get(input.id);
				const taskText = task
					? `${task.type} - ${formatDuration(task.finishDate - Date.now())} remaining`
					: 'None';

				const lastTasks = await ActivityTable.find({
					where: { userID: msg.author.id },
					take: 10
				});
				const lastTasksStr = lastTasks.map(i => (i.completed ? i.type : `*${i.type}*`)).join(', ');

				const userBadges = input.settings.get(UserSettings.Badges).map(i => badges[i]);
				const isBlacklisted = this.client.settings.get(ClientSettings.UserBlacklist).includes(input.id);
				return msg.channel.send(
					`**${input.username}**
**Bitfields:** ${bitfields}
**Badges:** ${userBadges}
**Current Task:** ${taskText}
**Previous Tasks:** ${lastTasksStr}.
**Blacklisted:** ${isBlacklisted ? 'Yes' : 'No'}
**Patreon/Github:** ${input.settings.get(UserSettings.PatreonID) ?? 'None'}/${
						input.settings.get(UserSettings.GithubID) ?? 'None'
					}
**Ironman:** ${input.isIronman ? 'Yes' : 'No'}
`
				);
			}
			case 'patreon': {
				msg.channel.send('Running patreon task...');
				await this.client.tasks.get('patreon')?.run();
				return msg.channel.send('Finished syncing patrons.');
			}
			case 'roles': {
				msg.channel.send('Running roles task...');
				const result = await this.client.tasks.get('roles')?.run();
				return msg.channel.send(result as string);
			}
			case 'canceltask': {
				if (!input || !(input instanceof KlasaUser)) return;
				await cancelTask(input.id);
				this.client.oneCommandAtATimeCache.delete(input.id);
				this.client.secondaryUserBusyCache.delete(input.id);
				minionActivityCache.delete(input.id);

				return msg.react(Emoji.Tick);
			}
			case 'setgh': {
				if (!input || !(input instanceof KlasaUser)) return;
				if (!str) return;
				const res = await fetch(`https://api.github.com/users/${encodeURIComponent(str)}`)
					.then(res => res.json())
					.catch(() => null);
				if (!res || !res.id) {
					return msg.channel.send('Could not find user in github API. Is the username written properly?');
				}
				const alreadyHasName = await this.client.query<{ github_id: string }[]>(
					`SELECT github_id FROM users WHERE github_id = '${res.id}'`
				);
				if (alreadyHasName.length > 0) {
					return msg.channel.send('Someone already has this Github account connected.');
				}
				await input.settings.update(UserSettings.GithubID, parseInt(res.id));
				if (!msg.flagArgs.nosync) {
					await (this.client.tasks.get('patreon') as PatreonTask).syncGithub();
				}
				return msg.channel.send(`Set ${res.login}[${res.id}] as ${input.username}'s Github account.`);
			}
			case 'giveperm': {
				if (!input || !(input instanceof KlasaUser)) return;
				await input.settings.update(
					UserSettings.BitField,
					[
						...input.settings.get(UserSettings.BitField),
						BitField.HasPermanentTierOne,
						BitField.HasPermanentEventBackgrounds
					],
					{ arrayAction: 'overwrite' }
				);
				sendToChannelID(this.client, Channel.ErrorLogs, {
					content: `${msg.author.username} gave permanent t1/bgs to ${input.username}`
				});
				return msg.channel.send(`Gave permanent perks to ${input.username}.`);
			}

			case 'bf': {
				if (!input || !str || !(input instanceof KlasaUser)) {
					return msg.channel.send(
						Object.entries(BitFieldData)
							.map(entry => `**${entry[0]}:** ${entry[1]?.name}`)
							.join('\n')
					);
				}
				const [action, _bit] = str.split(' ');

				const bit = Number(_bit);
				if (
					!bit ||
					!(BitFieldData as any)[bit] ||
					[7, 8].includes(bit) ||
					(action !== 'add' && action !== 'remove')
				) {
					return msg.channel.send('Invalid bitfield.');
				}

				let newBits = [...input.settings.get(UserSettings.BitField)];

				if (action === 'add') {
					if (newBits.includes(bit)) {
						return msg.channel.send("Already has this bit, so can't add.");
					}
					newBits.push(bit);
				} else {
					if (!newBits.includes(bit)) {
						return msg.channel.send("Doesn't have this bit, so can't remove.");
					}
					newBits = newBits.filter(i => i !== bit);
				}

				await input.settings.update(UserSettings.BitField, uniqueArr(newBits), {
					arrayAction: 'overwrite'
				});

				return msg.channel.send(
					`${action === 'add' ? 'Added' : 'Removed'} '${(BitFieldData as any)[bit].name}' bit to ${
						input.username
					}.`
				);
			}

			case 'badges': {
				if (!input || !str || !(input instanceof KlasaUser)) {
					return msg.channel.send(
						Object.entries(badges)
							.map(entry => `**${entry[1]}:** ${entry[0]}`)
							.join('\n')
					);
				}

				const badgesKeys = Object.keys(badges);

				const [action, _badge] = str.split(' ');
				const badge = Number(_badge);

				if (!badgesKeys.includes(_badge) || (action !== 'add' && action !== 'remove')) {
					return msg.channel.send('Invalid badge.');
				}

				let newBadges = [...input.settings.get(UserSettings.Badges)];

				if (action === 'add') {
					if (newBadges.includes(badge)) {
						return msg.channel.send("Already has this badge, so can't add.");
					}
					newBadges.push(badge);
				} else {
					if (!newBadges.includes(badge)) {
						return msg.channel.send("Doesn't have this badge, so can't remove.");
					}
					newBadges = newBadges.filter(i => i !== badge);
				}

				await input.settings.update(UserSettings.Badges, uniqueArr(newBadges), {
					arrayAction: 'overwrite'
				});

				return msg.channel.send(
					`${action === 'add' ? 'Added' : 'Removed'} ${badges[badge]} badge to ${input.username}.`
				);
			}

			case 'mostactive': {
				const res = await this.client.query<{ num: number; username: string }[]>(`
SELECT sum(duration) as num, "new_user"."username", user_id
FROM activity
INNER JOIN "new_users" "new_user" on "new_user"."id" = "activity"."user_id"
WHERE start_date > now() - interval '2 days'
GROUP BY user_id, "new_user"."username"
ORDER BY num DESC
LIMIT 10;
`);
				return msg.channel.send(
					`Most Active Users in past 48h\n${res
						.map((i, ind) => `${ind + 1} ${i.username}: ${formatDuration(i.num)}`)
						.join('\n')}`
				);
			}
			case 'bank': {
				if (!input || !(input instanceof KlasaUser)) return;
				return msg.channel.sendBankImage({ bank: input.allItemsOwned().bank });
			}
			case 'disable': {
				if (!input || input instanceof KlasaUser) return;
				const command = this.client.commands.find(c => c.name.toLowerCase() === input.toLowerCase());
				if (!command) return msg.channel.send("That's not a valid command.");
				command.disable();
				return msg.channel.send(`${emoji(this.client)} Disabled \`+${command}\`.`);
			}
			case 'enable': {
				if (!input || input instanceof KlasaUser) return;
				const command = this.client.commands.find(c => c.name.toLowerCase() === input.toLowerCase());
				if (!command) return msg.channel.send("That's not a valid command.");
				if (command.enabled) return msg.channel.send('That command is already enabled.');
				command.enable();
				return msg.channel.send(`${emoji(this.client)} Enabled \`+${command}\`.`);
			}
		}

		if (!isOwner) return null;

		// Owner commands
		switch (cmd.toLowerCase()) {
			case 'debugpatreon': {
				const result = await (this.client.tasks.get('patreon') as PatreonTask).fetchPatrons();
				return msg.channel.send({
					files: [new MessageAttachment(Buffer.from(JSON.stringify(result, null, 4)), 'patreon.txt')]
				});
			}
		}
	}
}
