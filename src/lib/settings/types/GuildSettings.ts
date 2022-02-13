/* eslint-disable @typescript-eslint/no-namespace */
export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, TCustom>;
}

export namespace GuildSettings {
	export const StaffOnlyChannels = T<readonly string[]>('staffOnlyChannels');
	export const Prefix = T<string>('prefix');
	export const DisabledCommands = T<readonly string[]>('disabledCommands');
	export const HCIMDeaths = T<string>('hcimdeaths');
	export const JMODComments = T<string>('jmodComments');
	export const PetChannel = T<string>('petchannel');
	export const JModTweets = T<string>('tweetchannel');
}
