import { notEmpty } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import fetch from 'node-fetch';

import { BitField, BitFieldData, Channel, Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
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
			case 'check': {
				if (!input) return;
				const bitfields = `${input.settings
					.get(UserSettings.BitField)
					.map(i => BitFieldData[i])
					.filter(notEmpty)
					.map(i => i.name)
					.join(', ')}.`;
				return msg.send(`**${input.username}**\nBitfields: ${bitfields}`);
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
			case 'bank': {
				if (!input) return;
				return msg.channel.sendBankImage({ bank: input.allItemsOwned().bank });
			}
			case 'genmon': {
				const data = killableMonsters.map(i => ({
					id: i.id,
					name: i.name,
					aliases: i.aliases,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					allItems: i.table?.allItems || [],
					itemsRequired: i.itemsRequired,
					qpRequired: i.qpRequired,
					itemInBankBoosts: i.itemInBankBoosts,
					groupKillable: i.groupKillable,
					respawnTime: i.respawnTime,
					levelRequirements: i.levelRequirements,
					healAmountNeeded: i.healAmountNeeded,
					attackStylesUsed: i.attackStylesUsed,
					attackStyleToUse: i.attackStyleToUse,
					minimumGearRequirements: i.minimumGearRequirements,
					pohBoosts: i.pohBoosts,
					timeToFinish: i.timeToFinish
				}));

				return msg.channel.sendFile(
					Buffer.from(JSON.stringify(data, null, 4)),
					`monsters.json`
				);
			}
		}
	}
}
