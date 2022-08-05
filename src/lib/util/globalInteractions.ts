import { MessageButton } from 'discord.js';
import { APIInteraction, APIMessageComponentInteraction, InteractionType } from 'mahoji';

import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { ClueTier } from '../clues/clueTiers';
import { lastTripCache } from '../constants';
import { runCommand } from '../settings/settings';
import { minionIsBusy } from './minionIsBusy';
import { minionName } from './minionUtils';
import { respondToButton } from './respondToButton';

const globalInteractionActions = [
	'DO_BEGINNER_CLUE',
	'DO_EASY_CLUE',
	'DO_MEDIUM_CLUE',
	'DO_HARD_CLUE',
	'DO_ELITE_CLUE',
	'DO_MASTER_CLUE',
	'DO_GRANDMASTER_CLUE',
	'OPEN_BEGINNER_CASKET',
	'OPEN_EASY_CASKET',
	'OPEN_MEDIUM_CASKET',
	'OPEN_HARD_CASKET',
	'OPEN_ELITE_CASKET',
	'OPEN_MASTER_CASKET',
	'OPEN_GRANDMASTER_CASKET',
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

export function makeOpenCasketButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `OPEN_${name}_CASKET`;
	return new MessageButton()
		.setCustomID(id)
		.setLabel(`Open ${tier.name} Casket`)
		.setStyle('SECONDARY')
		.setEmoji('365003978678730772');
}

export function makeRepeatTripButton() {
	return new MessageButton().setCustomID('REPEAT_TRIP').setLabel('Repeat Trip').setStyle('SECONDARY').setEmoji('🔁');
}

export async function interactionHook(data: APIInteraction) {
	if (data.type !== InteractionType.MessageComponent) return;
	const id = data.data.custom_id;
	if (!isValidGlobalInteraction(id)) return;
	const userID = data.member ? data.member.user?.id : data.user?.id;
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
		await respondToButton(data.id, data.token);
		runCommand({
			commandName: 'clue',
			args: { tier },
			bypassInhibitors: true,
			...options
		});
	}

	async function openCasket(tier: ClueTier['name']) {
		await respondToButton(data.id, data.token);
		runCommand({
			commandName: 'open',
			args: {
				name: tier,
				quantity: 1
			},
			...options
		});
	}

	if (minionIsBusy(user.id)) {
		return respondToButton(data.id, data.token, `${minionName(user)} is busy.`);
	}

	switch (id) {
		case 'REPEAT_TRIP': {
			const entry = lastTripCache.get(userID);
			if (entry) {
				await respondToButton(data.id, data.token);
				return entry.continue({
					...options
				});
			}
			return respondToButton(data.id, data.token, "Couldn't find a last trip to repeat.");
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

		case 'OPEN_BEGINNER_CASKET':
			return openCasket('Beginner');
		case 'OPEN_EASY_CASKET':
			return openCasket('Easy');
		case 'OPEN_MEDIUM_CASKET':
			return openCasket('Medium');
		case 'OPEN_HARD_CASKET':
			return openCasket('Hard');
		case 'OPEN_ELITE_CASKET':
			return openCasket('Elite');
		case 'OPEN_MASTER_CASKET':
			return openCasket('Master');
		default: {
		}
	}
}
