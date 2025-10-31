import {
	type APIApplicationCommandOptionChoice,
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIRole,
	ApplicationCommandOptionType,
	type Channel,
	type ChatInputCommandInteraction,
	type GuildMember,
	type PermissionFlagsBits,
	type Role,
	type User
} from '@oldschoolgg/discord';
import type { SpecialResponse } from '@oldschoolgg/toolkit';

import type { MMember } from '@/lib/structures/MInteraction.js';

export function convertCommandOptionToAPIOption(option: CommandOption): any {
	switch (option.type) {
		case 'Number':
		case 'Integer':
		case 'String': {
			return {
				...option,
				type: stringyToApiMap[option.type],
				autocomplete: 'autocomplete' in option
			};
		}

		default: {
			return {
				...option,
				type: stringyToApiMap[option.type],
				options:
					'options' in option && option.options ? option.options.map(convertCommandOptionToAPIOption) : []
			};
		}
	}
}

type StringyApplicationCommandOptionType =
	| 'Subcommand'
	| 'SubcommandGroup'
	| 'String'
	| 'Integer'
	| 'Boolean'
	| 'User'
	| 'Channel'
	| 'Role'
	| 'Mentionable'
	| 'Number';

const stringyToApiMap: Record<StringyApplicationCommandOptionType, ApplicationCommandOptionType> = {
	Subcommand: ApplicationCommandOptionType.Subcommand,
	SubcommandGroup: ApplicationCommandOptionType.SubcommandGroup,
	String: ApplicationCommandOptionType.String,
	Integer: ApplicationCommandOptionType.Integer,
	Boolean: ApplicationCommandOptionType.Boolean,
	User: ApplicationCommandOptionType.User,
	Channel: ApplicationCommandOptionType.Channel,
	Role: ApplicationCommandOptionType.Role,
	Mentionable: ApplicationCommandOptionType.Mentionable,
	Number: ApplicationCommandOptionType.Number
};
export function convertAPIOptionsToCommandOptions(
	options: ChatInputCommandInteraction['options']['data'],
	resolvedObjects: ChatInputCommandInteraction['options']['resolved'] | null
): CommandOptions {
	if (!options) return {};

	const parsedOptions: CommandOptions = {};

	for (const opt of options) {
		if (
			opt.type === ApplicationCommandOptionType.SubcommandGroup ||
			opt.type === ApplicationCommandOptionType.Subcommand
		) {
			const opts: CommandOptions = {};
			for (const [key, value] of Object.entries(
				convertAPIOptionsToCommandOptions(opt.options ?? [], resolvedObjects)
			)) {
				opts[key] = value;
			}
			parsedOptions[opt.name] = opts;
		} else if (opt.type === ApplicationCommandOptionType.Channel) {
			if (resolvedObjects?.channels) {
				parsedOptions[opt.name] = resolvedObjects.channels.get(opt.value as string)!;
			}
		} else if (opt.type === ApplicationCommandOptionType.Role) {
			if (resolvedObjects?.roles) {
				parsedOptions[opt.name] = resolvedObjects.roles.get(opt.value as string)!;
			}
		} else if (opt.type === ApplicationCommandOptionType.User) {
			if (resolvedObjects?.users) {
				parsedOptions[opt.name] = {
					user: resolvedObjects.users.get(opt.value as string)!,
					member: resolvedObjects.members?.has(opt.value as string)
						? resolvedObjects.members.get(opt.value as string)!
						: undefined
				};
			}
		} else {
			parsedOptions[opt.name as string] = opt.value as any;
		}
	}

	return parsedOptions;
}

export interface MahojiUserOption {
	user: User;
	member?: GuildMember | APIInteractionDataResolvedGuildMember;
}

export type MahojiCommandOption =
	| number
	| string
	| MahojiUserOption
	| Channel
	| APIInteractionDataResolvedChannel
	| Role
	| APIRole
	| boolean;

export interface CommandOptions {
	[key: string]: MahojiCommandOption | CommandOptions;
}

export type CategoryFlag =
	| 'minion'
	| 'settings'
	| 'patron'
	| 'skilling'
	| 'pvm'
	| 'minigame'
	| 'utility'
	| 'fun'
	| 'simulation';

export interface AbstractCommandAttributes {
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	enabled?: boolean;
	cooldown?: number;
	requiresMinionNotBusy?: boolean;
	requiresMinion?: boolean;
	description: string;
}

export type CommandOption = {
	name: string;
	description: string;
	required?: boolean;
} & (
	| { type: 'Subcommand' | 'SubcommandGroup'; options?: AnyArr<CommandOption> }
	| StringOption
	| NumberOption
	| { type: 'Boolean' | 'User' | 'Channel' | 'Role' | 'Mentionable' }
);
export type CommandResponse = Promise<CommandResponseValue>;
type NumberOption<C extends AnyArr<{ name: string; value: number }> = AnyArr<{ name: string; value: number }>> = {
	type: 'Integer' | 'Number';
	choices?: C;
	autocomplete?: (
		value: number,
		user: MUser,
		member?: GuildMember
	) => Promise<APIApplicationCommandOptionChoice<number>[]>;
	min_value?: number;
	max_value?: number;
};
type StringOption<C extends AnyArr<{ name: string; value: string }> = AnyArr<{ name: string; value: string }>> = {
	type: 'String';
	choices?: C;
	autocomplete?: (
		value: string,
		user: MUser,
		member?: GuildMember
	) => Promise<APIApplicationCommandOptionChoice<string>[]>;
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ChoiceValueUnion<C> = C extends AnyArr<infer E> ? (E extends { value: infer V } ? V : never) : never;

type OptionValue<O> = O extends { type: 'String'; choices?: infer C }
	? ChoiceValueUnion<C> extends never
		? string
		: Extract<ChoiceValueUnion<C>, string>
	: O extends { type: 'Integer' | 'Number'; choices?: infer C2 }
		? ChoiceValueUnion<C2> extends never
			? number
			: Extract<ChoiceValueUnion<C2>, number>
		: O extends { type: 'Boolean' }
			? boolean
			: O extends { type: 'User' }
				? MahojiUserOption
				: O extends { type: 'Channel' | 'Role' | 'Mentionable' }
					? string
					: never;

type ExtractArgs<T extends AnyArr<unknown> | undefined> = T extends AnyArr<unknown>
	? [ParamEntry<Extract<T[number], CommandOption>>] extends [never]
		? {}
		: Simplify<UnionToIntersection<ParamEntry<Extract<T[number], CommandOption>>>>
	: {};

type CommandEntry<C> = C extends { type: 'Subcommand'; name: infer N extends string; options?: infer Sub }
	? { [K in N]?: ExtractArgs<AsOptArr<Sub>> }
	: C extends { type: 'SubcommandGroup'; name: infer G extends string; options?: infer SubG }
		? { [K in G]?: ExtractCommands<AsOptArr<SubG>> }
		: never;

type ExtractCommands<T extends AnyArr<unknown> | undefined> = T extends AnyArr<unknown>
	? Simplify<UnionToIntersection<CommandEntry<Extract<T[number], CommandOption>>>>
	: {};

export type CommandRunOptions<TOpts = {}> = {
	interaction: MInteraction;
	options: TOpts;
	user: MUser;
	member?: MMember;
	channelID: string;
	guildID?: string;
	userID: string;
	rng: RNGProvider;
};

export type OSBMahojiCommand<T extends readonly CommandOption[] = CommandOption[]> = Readonly<{
	name: string;
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
	description: string;
	options: T;
	requiredPermissions?: (keyof typeof PermissionFlagsBits)[];
	guildID?: string;
	run(options: CommandRunOptions<ExtractOptions<T>>): CommandResponse;
}>;
type AnyArr<T> = readonly T[] | T[];
type AsOptArr<T> = T extends AnyArr<infer E> ? readonly (E & CommandOption)[] : readonly [];

type Lit<S> = S extends string ? (string extends S ? never : S) : never;

type ParamEntry<P> = P extends { name: infer N extends string }
	? P extends { type: 'Subcommand' | 'SubcommandGroup' }
		? never
		: P extends { required: true }
			? { [K in Lit<N>]-?: OptionValue<P> }
			: { [K in Lit<N>]?: OptionValue<P> }
	: never;

export const choicesOf = <const A extends readonly (string | number)[]>(arr: A) =>
	arr.map(v => ({ name: String(v), value: v })) as { name: string; value: A[number] }[];
export type AnyCommand = Readonly<{
	name: string;
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
	description: string;
	options: readonly CommandOption[];
	requiredPermissions?: (keyof typeof PermissionFlagsBits)[];
	guildID?: string;
	run(options: CommandRunOptions<any>): CommandResponse;
}>;
export function defineOption<const O extends CommandOption>(o: O): O {
	return o;
}
export function defineCommandSrc<const T extends AnyArr<unknown>>(
	cmd: Readonly<{
		name: string;
		attributes?: Omit<AbstractCommandAttributes, 'description'>;
		description: string;
		options: T;
		requiredPermissions?: (keyof typeof PermissionFlagsBits)[];
		guildID?: string;
		run(options: CommandRunOptions<ExtractOptions<T>>): CommandResponse;
	}> &
		(T[number] extends CommandOption ? unknown : { __error__: 'options must be CommandOption[]' })
): OSBMahojiCommand<AsOptArr<T>> {
	return cmd as unknown as OSBMahojiCommand<AsOptArr<T>>;
}

export type CommandResponseValue = string | CompatibleResponse | SpecialResponse;
declare global {
	var defineCommand: typeof defineCommandSrc;
}

global.defineCommand = defineCommandSrc;

type Opts<C> = C extends { options?: infer O } ? O : never;
type ToObj<T> = [T] extends [never] ? {} : T;
type ArgsFromOptions<T extends AnyArr<unknown>> = [ParamEntry<Extract<T[number], CommandOption>>] extends [never]
	? {}
	: Simplify<UnionToIntersection<ParamEntry<Extract<T[number], CommandOption>>>>;
type SubKeyMapSub<C> = C extends { type: 'Subcommand'; name: infer N extends string }
	? { [K in Lit<N>]?: OptionsToShape<AsOptArr<Extract<Opts<C>, AnyArr<unknown>>>> }
	: never;

type SubKeyMapGroup<C> = C extends { type: 'SubcommandGroup'; name: infer G extends string }
	? { [K in Lit<G>]?: OptionsToShape<AsOptArr<Extract<Opts<C>, AnyArr<unknown>>>> }
	: never;

type OptionsToShape<T extends AnyArr<unknown> | undefined> = [T] extends [never]
	? {}
	: T extends AnyArr<unknown>
		? Simplify<
				ToObj<ArgsFromOptions<T>> &
					ToObj<UnionToIntersection<SubKeyMapSub<Extract<T[number], CommandOption>>>> &
					ToObj<UnionToIntersection<SubKeyMapGroup<Extract<T[number], CommandOption>>>>
			>
		: {};

type LeafEntry<P> = P extends { name: infer N extends string }
	? P extends { type: 'Subcommand' | 'SubcommandGroup' }
		? {}
		: P extends { required: true }
			? { [K in Lit<N>]-?: OptionValue<P> }
			: { [K in Lit<N>]?: OptionValue<P> }
	: {};

type OptionNodeToShape<O> = O extends { type: 'SubcommandGroup'; name: infer G extends string; options?: infer GO }
	? { [K in Lit<G>]?: OptionsArrayToShape<GO> }
	: O extends { type: 'Subcommand'; name: infer N extends string; options?: infer SO }
		? { [K in Lit<N>]?: OptionsArrayToShape<SO> }
		: LeafEntry<O>;

type OptionsArrayToShape<T> = T extends AnyArr<infer O> ? Simplify<UnionToIntersection<OptionNodeToShape<O>>> : {};

type ExtractOptions<T extends AnyArr<unknown>> = OptionsArrayToShape<T>;
