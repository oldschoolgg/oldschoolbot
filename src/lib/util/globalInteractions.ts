import { MessageButton } from 'discord.js';
import {
	APIInteraction,
	APIMessageComponentInteraction,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
	Routes
} from 'mahoji';

import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { lastTripCache } from '../constants';
import { ClueTier } from '../minions/data/clueTiers';
import { runCommand } from '../settings/settings';
import { minionIsBusy } from './minionIsBusy';
import { minionName } from './minionUtils';

const globalInteractionActions = [
	'DO_BEGINNER_CLUE',
	'DO_EASY_CLUE',
	'DO_MEDIUM_CLUE',
	'DO_HARD_CLUE',
	'DO_ELITE_CLUE',
	'DO_MASTER_CLUE',
	'REPEAT_TRIP'
] as const;
type GlobalInteractionAction = typeof globalInteractionActions[number];
function isValidGlobalInteraction(str: string): str is GlobalInteractionAction {
	return globalInteractionActions.includes(str as GlobalInteractionAction);
}

export function makeDoClueButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `DO_${name}_CLUE`;
	return new MessageButton()
		.setCustomID(id)
		.setLabel(`Do ${tier.name} Clue`)
		.setStyle('SECONDARY')
		.setEmoji('365003979840552960');
}

export const repeatTripButton = new MessageButton()
	.setCustomID('REPEAT_TRIP')
	.setLabel('Repeat Trip')
	.setStyle('SECONDARY')
	.setEmoji('🔁');

async function respondButton(id: string, token: string, text: string) {
	const route = Routes.interactionCallback(id, token);
	await globalClient.mahojiClient.restManager.post(route, {
		body: {
			type: InteractionResponseType.DeferredMessageUpdate,
			data: { content: text, flags: MessageFlags.Ephemeral }
		}
	});
}
export async function interactionHook(data: APIInteraction) {
	if (data.type !== InteractionType.MessageComponent) return;
	const id = data.data.custom_id;
	if (!isValidGlobalInteraction(id)) return;
	const userID = data.member?.user?.id;
	if (!userID) return;
	const user = await mahojiUsersSettingsFetch(userID);

	const options = {
		user,
		member: data.member ?? null,
		userID,
		channelID: data.channel_id,
		guildID: data.guild_id
	};

	async function doClue(data: APIMessageComponentInteraction, tier: ClueTier['name']) {
		await respondButton(data.id, data.token, `Doing ${tier} clue...`);
		runCommand({
			commandName: 'clue',
			args: { tier },
			bypassInhibitors: true,
			...options
		});
	}

	if (minionIsBusy(user.id)) {
		return respondButton(data.id, data.token, `${minionName(user)} is busy.`);
	}

	switch (id) {
		case 'REPEAT_TRIP': {
			const entry = lastTripCache.get(userID);
			if (entry) {
				await respondButton(data.id, data.token, 'You repeated your trip.');
				return entry.continue({
					...options
				});
			}
			return respondButton(data.id, data.token, "Couldn't find a last trip to repeat.");
		}
		case 'DO_BEGINNER_CLUE':
			return doClue(data, 'Beginner');
		case 'DO_EASY_CLUE':
			return doClue(data, 'Easy');
		case 'DO_MEDIUM_CLUE':
			return doClue(data, 'Medium');
		case 'DO_HARD_CLUE':
			return doClue(data, 'Hard');
		case 'DO_ELITE_CLUE':
			return doClue(data, 'Elite');
		case 'DO_MASTER_CLUE':
			return doClue(data, 'Master');
		default: {
		}
	}
}
