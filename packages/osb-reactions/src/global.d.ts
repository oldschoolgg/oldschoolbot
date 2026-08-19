declare global {
	export type MahojiUserOption = import('./discord/index.js').MahojiUserOption;
	export type AnyCommand = import('./discord/index.js').AnyCommand;
	export type CommandOption = import('./discord/index.js').CommandOption;
	export type CommandResponse = import('./discord/index.js').CommandResponse;
	export type CommandRunOptions = import('./discord/index.js').CommandRunOptions;
	export type CommandOptions = import('./discord/index.js').CommandOptions;
	export type StringAutoComplete = import('./discord/index.js').StringAutoComplete;
	export type NumberAutoComplete = import('./discord/index.js').NumberAutoComplete;

	type RUser = import('@/structures/RUser.js').RUser;
	type OSBReactionsClient = import('@/discord/client.js').OSBReactionsClientClass;
	var globalClient: OSBReactionsClient;

	export type MInteraction = import('@oldschoolgg/discord').MInteraction;
}

export {};
