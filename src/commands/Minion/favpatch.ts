import { objectValues } from 'e';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { FarmingPatchTypes } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[patches:...string]',
			description: 'Favorites a farming patch.',
			examples: ['+favpatch herb'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage, [patches]: [string | undefined]) {
		const currentFavorites = msg.author.settings.get(UserSettings.FavoritePatches);
		let newFavorites = [...currentFavorites];
		const input = patches?.split(', ').map(x => toTitleCase(x).replace(' ', ''));

		if (!patches || patches.length === 0) {
			if (currentFavorites.length === 0) {
				return msg.channel.send(
					`You have no favorited farming patches. Valid options are: ${objectValues(FarmingPatchTypes)}`
				);
			}
			return msg.channel.send(
				`Your current favorite farming patches are: ${currentFavorites.toString().split(',').join(', ')}.`
			);
		}

		if (input![0] === 'clear') {
			await msg.author.settings.update(UserSettings.FavoritePatches, [], {
				arrayAction: ArrayActions.Overwrite
			});
			return msg.channel.send('Your favorite patches are cleared');
		}

		const patchesProvided: FarmingPatchTypes[] = input
			?.map(patch => FarmingPatchTypes[patch as keyof typeof FarmingPatchTypes])
			.filter(x => x !== undefined) as FarmingPatchTypes[];

		const unrecognized = input?.filter(
			patch => FarmingPatchTypes[patch as keyof typeof FarmingPatchTypes] === undefined
		);

		if (!patchesProvided || patchesProvided.length === 0) {
			return msg.channel.send('No valid patches provided.');
		}

		// Removes all specified patches that already exist
		newFavorites = newFavorites.filter(patch => !patchesProvided.includes(patch));

		// Add all specified patches that weren't already favorites to the new favorites
		newFavorites.push(...patchesProvided.filter(patch => !currentFavorites.includes(patch)));

		if (newFavorites !== currentFavorites) {
			const removed = currentFavorites.filter(x => !newFavorites.includes(x));
			const added = newFavorites.filter(x => !currentFavorites.includes(x));
			let str = 'Favorite patches modified.\n';

			if (added.length !== 0) str += `You added: ${added.toString().split(',').join(', ')}\n`;
			if (removed.length !== 0) str += `You removed: ${removed.toString().split(',').join(', ')}\n`;
			if (unrecognized) str += `Unrecognized patches: ${unrecognized.toString().split(',').join(', ')}\n`;

			await msg.author.settings.update(UserSettings.FavoritePatches, newFavorites, {
				arrayAction: ArrayActions.Overwrite
			});
			return msg.channel.send(str);
		}

		return msg.channel.send('No change in fav patches detected. Please report this.');
	}
}
