import { notEmpty, uniqueArr } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import fetch from 'node-fetch';

import { badges, BitField, BitFieldData, Channel, Emoji } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { OldSchoolBotClient } from '../../lib/structures/OldSchoolBotClient';
import { ActivityTable } from '../../lib/typeorm/ActivityTable.entity';
import { formatDuration } from '../../lib/util';
import { sendToChannelID } from '../../lib/util/webhook';
import PatreonTask from '../../tasks/patreon';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			runIn: ['text'],
			usage: '<cmd:str> [user:user] [str:...str]',
			usageDelim: ' '
		});
	}

	async run(
		msg: KlasaMessage,
		[cmd, input, str]: [string, KlasaUser | undefined, string | undefined]
	) {
		if (msg.guild!.id !== '342983479501389826') return null;

		const isMod = msg.author.settings.get(UserSettings.BitField).includes(BitField.isModerator);
		const isOwner = this.client.owners.has(msg.author);
		if (!isMod && !isOwner) return null;

		if (input) {
			await input.settings.sync(true);
		}

		// Mod commands
		switch (cmd.toLowerCase()) {
			case 'bypassage': {
				if (!input) return;
				await input.settings.sync(true);
				if (
					input.settings
						.get(UserSettings.BitField)
						.includes(BitField.BypassAgeRestriction)
				) {
					return msg.send(`This user is already bypassed.`);
				}
				await input.settings.update(UserSettings.BitField, BitField.BypassAgeRestriction, {
					arrayAction: 'add'
				});
				return msg.send(
					`${Emoji.RottenPotato} Bypassed age restriction for ${input.username}.`
				);
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
				if (!input) return;
				const bitfields = `${input.settings
					.get(UserSettings.BitField)
					.map(i => BitFieldData[i])
					.filter(notEmpty)
					.map(i => i.name)
					.join(', ')}`;

				const task = this.client.minionActivityCache.get(input.id);
				const taskText = task
					? `${task.type} - ${formatDuration(task.finishDate - Date.now())} remaining`
					: 'None';

				const lastTasks = await ActivityTable.find({
					where: { userID: msg.author.id },
					take: 10
				});
				const lastTasksStr = lastTasks
					.map(i => (i.completed ? i.type : `*${i.type}*`))
					.join(', ');

				const userBadges = input.settings.get(UserSettings.Badges).map(i => badges[i]);
				const isBlacklisted = this.client.settings
					.get(ClientSettings.UserBlacklist)
					.includes(input.id);
				return msg.send(
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
				return msg.channel.send(`Finished syncing patrons.`);
			}
			case 'roles': {
				msg.channel.send('Running roles task...');
				const result = await this.client.tasks.get('roles')?.run();
				return msg.send(result);
			}
			case 'canceltask': {
				if (!input) return;
				await (this.client as OldSchoolBotClient).cancelTask(input.id);
				this.client.oneCommandAtATimeCache.delete(input.id);
				this.client.secondaryUserBusyCache.delete(input.id);
				this.client.minionActivityCache.delete(input.id);

				return msg.react(Emoji.Tick);
			}
			case 'setgh': {
				if (!input) return;
				if (!str) return;
				const res = await fetch(`https://api.github.com/users/${encodeURIComponent(str)}`)
					.then(res => res.json())
					.catch(() => null);
				if (!res || !res.id) {
					return msg.send(
						`Could not find user in github API. Is the username written properly?`
					);
				}
				const alreadyHasName = await this.client.query<{ github_id: string }[]>(
					`SELECT github_id FROM users WHERE github_id = '${res.id}'`
				);
				if (alreadyHasName.length > 0) {
					return msg.send(`Someone already has this Github account connected.`);
				}
				await input.settings.update(UserSettings.GithubID, parseInt(res.id));
				if (!msg.flagArgs.nosync) {
					await (this.client.tasks.get('patreon') as PatreonTask).syncGithub();
				}
				return msg.send(
					`Set ${res.login}[${res.id}] as ${input.username}'s Github account.`
				);
			}
			case 'giveperm': {
				if (!input) return;
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
				if (!input || !str) {
					return msg.send(
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
					return msg.send(`Invalid bitfield.`);
				}

				let newBits = [...input.settings.get(UserSettings.BitField)];

				if (action === 'add') {
					if (newBits.includes(bit)) {
						return msg.send(`Already has this bit, so can't add.`);
					}
					newBits.push(bit);
				} else {
					if (!newBits.includes(bit)) {
						return msg.send(`Doesn't have this bit, so can't remove.`);
					}
					newBits = newBits.filter(i => i !== bit);
				}

				await input.settings.update(UserSettings.BitField, uniqueArr(newBits), {
					arrayAction: 'overwrite'
				});

				return msg.channel.send(
					`${action === 'add' ? 'Added' : 'Removed'} '${
						(BitFieldData as any)[bit].name
					}' bit to ${input.username}.`
				);
			}

			case 'badges': {
				if (!input || !str) {
					return msg.send(
						Object.entries(badges)
							.map(entry => `**${entry[1]}:** ${entry[0]}`)
							.join('\n')
					);
				}

				const badgesKeys = Object.keys(badges);

				const [action, _badge] = str.split(' ');
				const badge = Number(_badge);

				if (!badgesKeys.includes(_badge) || (action !== 'add' && action !== 'remove')) {
					return msg.send(`Invalid badge.`);
				}

				let newBadges = [...input.settings.get(UserSettings.Badges)];

				if (action === 'add') {
					if (newBadges.includes(badge)) {
						return msg.send(`Already has this badge, so can't add.`);
					}
					newBadges.push(badge);
				} else {
					if (!newBadges.includes(badge)) {
						return msg.send(`Doesn't have this badge, so can't remove.`);
					}
					newBadges = newBadges.filter(i => i !== badge);
				}

				await input.settings.update(UserSettings.Badges, uniqueArr(newBadges), {
					arrayAction: 'overwrite'
				});

				return msg.channel.send(
					`${action === 'add' ? 'Added' : 'Removed'} ${badges[badge]} badge to ${
						input.username
					}.`
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
				return msg.send(
					`Most Active Users in past 48h\n${res
						.map((i, ind) => `${ind + 1} ${i.username}: ${formatDuration(i.num)}`)
						.join('\n')}`
				);
			}
			case 'bank': {
				if (!input) return;
				return msg.channel.sendBankImage({ bank: input.allItemsOwned().bank });
			}
		}

		if (!isOwner) return null;

		// Owner commands
		switch (cmd.toLowerCase()) {
			case 'debugpatreon': {
				const result = await (this.client.tasks.get(
					'patreon'
				) as PatreonTask).fetchPatrons();
				return msg.sendLarge(JSON.stringify(result, null, 4));
			}
		}
	}
}
