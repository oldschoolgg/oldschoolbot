import type { APIApplicationCommandOptionChoice } from '@oldschoolgg/discord';
import type { IAutoCompleteInteractionOption, IChannel, IMember, IRole, IUser } from '@oldschoolgg/schemas';

import type { AnyArr, Lit, Simplify, ToObj, UnionToIntersection } from './typeUtils.js';

export interface MahojiUserOption {
	user: IUser;
	member?: IMember;
}

export type MahojiCommandOption = number | string | MahojiUserOption | IChannel | IRole | boolean;

export interface CommandOptions {
	[key: string]: MahojiCommandOption | CommandOptions;
}

export type BaseAutoCompleteOptions = {
	userId: string;
	user: MUser;
	guildId: string | null;
	options?: IAutoCompleteInteractionOption[];
	focused?: IAutoCompleteInteractionOption;
};

export type NumberAutoComplete = BaseAutoCompleteOptions & {
	value: number;
};

export type StringAutoComplete = BaseAutoCompleteOptions & {
	value: string;
};

export type NumberOption<C extends AnyArr<{ name: string; value: number }> = AnyArr<{ name: string; value: number }>> =
	{
		type: 'Integer' | 'Number';
		choices?: C;
		autocomplete?: (options: NumberAutoComplete) => Promise<APIApplicationCommandOptionChoice<number>[]>;
		min_value?: number;
		max_value?: number;
	};

export type StringOption<C extends AnyArr<{ name: string; value: string }> = AnyArr<{ name: string; value: string }>> =
	{
		type: 'String';
		choices?: C;
		autocomplete?: (options: StringAutoComplete) => Promise<APIApplicationCommandOptionChoice<string>[]>;
	};

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

type ExtractArgs<T extends AnyArr<unknown> | undefined> =
	T extends AnyArr<unknown>
		? [ParamEntry<Extract<T[number], CommandOption>>] extends [never]
			? {}
			: Simplify<UnionToIntersection<ParamEntry<Extract<T[number], CommandOption>>>>
		: {};

type CommandEntry<C> = C extends { type: 'Subcommand'; name: infer N extends string; options?: infer Sub }
	? { [K in N]?: ExtractArgs<AsOptArr<Sub>> }
	: C extends { type: 'SubcommandGroup'; name: infer G extends string; options?: infer SubG }
		? { [K in G]?: ExtractCommands<AsOptArr<SubG>> }
		: never;

type ExtractCommands<T extends AnyArr<unknown> | undefined> =
	T extends AnyArr<unknown> ? Simplify<UnionToIntersection<CommandEntry<Extract<T[number], CommandOption>>>> : {};

export type AsOptArr<T> = T extends AnyArr<infer E> ? readonly (E & CommandOption)[] : readonly [];

type ParamEntry<P> = P extends { name: infer N extends string }
	? P extends { type: 'Subcommand' | 'SubcommandGroup' }
		? never
		: P extends { required: true }
			? { [K in Lit<N>]-?: OptionValue<P> }
			: { [K in Lit<N>]?: OptionValue<P> }
	: never;

export const choicesOf = <const A extends readonly (string | number)[]>(arr: A) =>
	arr.map(v => ({ name: String(v), value: v })) as { name: string; value: A[number] }[];

export function defineOption<const O extends CommandOption>(o: O): O {
	return o;
}

type Opts<C> = C extends { options?: infer O } ? O : never;

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

export type ExtractOptions<T extends AnyArr<unknown>> = OptionsArrayToShape<T>;

export type CommandOption = {
	name: string;
	description: string;
	required?: boolean;
} & (
	| { type: 'Subcommand' | 'SubcommandGroup'; options?: AnyArr<CommandOption> }
	| StringOption
	| NumberOption
	| { type: 'Boolean' | 'User' | 'Channel' | 'Role' | 'Mentionable' | 'Attachment' }
);
