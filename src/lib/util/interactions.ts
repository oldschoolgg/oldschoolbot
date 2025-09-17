import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { InteractionID } from '../InteractionID.js';
import type { ClueTier } from '../clues/clueTiers';

export function makeOpenCasketButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `OPEN_${name}_CASKET`;
	return new ButtonBuilder()
		.setCustomId(id)
		.setLabel(`Open ${tier.name} Casket`)
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('365003978678730772');
}

export function makeOpenSeedPackButton() {
	return new ButtonBuilder()
		.setCustomId('OPEN_SEED_PACK')
		.setLabel('Open Seed Pack')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('977410792754413668');
}

export function makeAutoContractButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_FARMING_CONTRACT')
		.setLabel('Auto Farming Contract')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('977410792754413668');
}

export function makeRepeatTripButton() {
	return new ButtonBuilder()
		.setCustomId('REPEAT_TRIP')
		.setLabel('Repeat Trip')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('🔁');
}

export function makeTearsOfGuthixButton() {
	return new ButtonBuilder()
		.setCustomId('START_TOG')
		.setLabel('Start Tears of Guthix')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('🐍');
}

export function makeBirdHouseTripButton() {
	return new ButtonBuilder()
		.setCustomId('DO_BIRDHOUSE_RUN')
		.setLabel('Birdhouse Run')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('692946556399124520');
}

export function makeAutoSlayButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_SLAY')
		.setLabel('Auto Slay')
		.setEmoji('630911040560824330')
		.setStyle(ButtonStyle.Secondary);
}

export function makeClaimDailyButton() {
	return new ButtonBuilder()
		.setCustomId('CLAIM_DAILY')
		.setLabel('Minion Daily')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('493286312854683654');
}

export function makeNewSlayerTaskButton() {
	return new ButtonBuilder()
		.setCustomId('NEW_SLAYER_TASK')
		.setLabel('New Slayer Task')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('630911040560824330');
}

const globalInteractionActions = [
	'DO_BEGINNER_CLUE',
	'DO_EASY_CLUE',
	'DO_MEDIUM_CLUE',
	'DO_HARD_CLUE',
	'DO_ELITE_CLUE',
	'DO_MASTER_CLUE',
	'OPEN_BEGINNER_CASKET',
	'OPEN_EASY_CASKET',
	'OPEN_MEDIUM_CASKET',
	'OPEN_HARD_CASKET',
	'OPEN_ELITE_CASKET',
	'OPEN_MASTER_CASKET',
	'DO_BIRDHOUSE_RUN',
	'CLAIM_DAILY',
	'CHECK_PATCHES',
	'CANCEL_TRIP',
	'AUTO_FARM',
	'AUTO_FARMING_CONTRACT',
	'FARMING_CONTRACT_EASIER',
	'OPEN_SEED_PACK',
	'BUY_MINION',
	'BUY_BINGO_TICKET',
	'NEW_SLAYER_TASK',
	'DO_SHOOTING_STAR',
	'CHECK_TOA',
	'START_TOG',

	// Slayer
	InteractionID.Slayer.AutoSlay,
	InteractionID.Slayer.AutoSlaySaved,
	InteractionID.Slayer.AutoSlayDefault,
	InteractionID.Slayer.AutoSlayEHP,
	InteractionID.Slayer.AutoSlayBoss,
	InteractionID.Slayer.SkipTask,
	InteractionID.Slayer.CancelTask,
	InteractionID.Slayer.BlockTask
] as const;

type GlobalInteractionAction = (typeof globalInteractionActions)[number];

export function isValidGlobalInteraction(str: string): str is GlobalInteractionAction {
	return globalInteractionActions.includes(str as GlobalInteractionAction);
}
