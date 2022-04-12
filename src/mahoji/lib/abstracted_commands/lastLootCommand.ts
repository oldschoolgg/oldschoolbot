import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export async function lastLootCommand(interaction: SlashCommandInteraction, user: KlasaUser, format: string) {
	await interaction.deferReply();

	const loot = new Bank(user.settings.get(UserSettings.LastLoot));

	switch (format) {
		case 'image':
			return {
				content: 'Your last received loot was:',
				attachments: [
					(
						await makeBankImage({
							bank: loot,
							user
						})
					).file
				]
			};
		case 'names':
			return {
				content: 'Your last received loot was:',
				attachments: [
					(
						await makeBankImage({
							bank: loot,
							user,
							flags: { names: 1 }
						})
					).file
				]
			};
		default:
			if ( loot.toString().length > 500 ) {
				return {
					content: 'Your last received loot was:',
					attachments:  [{ buffer: Buffer.from(loot.toString()), fileName: 'Loot.txt' }]
				};
			}
			return `Your last received loot was: ${loot}`;
	}
}
