type MUserInstance = MUser;

declare global {
	export type RNGProvider = import('@oldschoolgg/rng').RNGProvider;
	export type MInteraction = import('@oldschoolgg/discord').MInteraction;

	export type MahojiUserOption = import('./discord/index.js').MahojiUserOption;
	export type AnyCommand = import('./discord/index.js').AnyCommand;
	export type CommandOption = import('./discord/index.js').CommandOption;
	export type CommandResponse = import('./discord/index.js').CommandResponse;
	export type CommandRunOptions = import('./discord/index.js').CommandRunOptions;
	export type CommandOptions = import('./discord/index.js').CommandOptions;
	export type StringAutoComplete = import('./discord/index.js').StringAutoComplete;
	export type NumberAutoComplete = import('./discord/index.js').NumberAutoComplete;

	export type SendableMessage = import('@oldschoolgg/discord').SendableMessage;
	export type BaseSendableMessage = import('@oldschoolgg/discord').BaseSendableMessage;
	export type SendableFile = import('@oldschoolgg/discord').SendableFile;
}

export {};
