import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BitField, Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import PatreonTask from '../../tasks/patreon';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			runIn: ['text'],
			usage: '<cmd:str> [user:user]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [cmd, input]: [string, KlasaUser | undefined]) {
		if (msg.guild!.id !== '342983479501389826') return null;
		const isMod = msg.author.settings.get(UserSettings.BitField).includes(BitField.isModerator);
		const isOwner = this.client.owners.has(msg.author);
		if (!isMod && !isOwner) return null;

		// Mod commands
		switch (cmd.toLowerCase()) {
			case 'bypassage': {
				if (!input) return;
				await input.settings.update(UserSettings.BitField, BitField.BypassAgeRestriction);
				return msg.send(
					`${Emoji.RottenPotato} Bypassed age restriction for ${input.username}.`
				);
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
				return msg.channel.sendBankImage({ bank: input.allItemsOwned() });
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
