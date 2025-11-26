import { navigate } from 'wouter/use-browser-location';
import wretch from 'wretch';
import { retry } from 'wretch/middlewares';

import type { IUserUpdate, OverlayConfig, WSOverlayConfigUpdate } from '@worp/worp-schemas';

import { globalState } from '@/lib/state.ts';
import type { UserWithManageables } from '../../../server/src/lib/auth.ts';
import type { AdminIronstreamStatsResponse, AdminMiscResponse, CaddyLog } from '../../../server/src/server/admin.ts';
import type { INewCustomCommand } from '../../../server/src/server/customCommands.ts';
import type { CustomCommand } from '../../../server/src/server/helpers.ts';
import type { INewPollSchema } from '../../../server/src/server/polls.ts';

export interface DiscordUser {
	id: string;
	bot: boolean;
	system: boolean;
	flags: number;
	username: string;
	globalName: string;
	discriminator: string;
	avatar: string;
	banner: string | null;
	accentColor: number;
	avatarDecoration: string | null;
	avatarDecorationData: any | null;
	createdTimestamp: number;
	defaultAvatarURL: string;
	hexAccentColor: string;
	tag: string;
	avatarURL: string;
	displayAvatarURL: string;
	bannerURL: string | null;
}

const rawApiWretch = wretch(__API_URL__)
	.options({ credentials: 'include' })
	.middlewares([
		retry({
			maxAttempts: 10,
			delayTimer: 5000,
			retryOnNetworkError: true,
			delayRamp: (delay, nAttempts) => delay * nAttempts * nAttempts
		})
	]);

async function logOut() {
	await rawApi.user.logOut();
	localStorage.clear();
	globalState.setState({
		user: null
	});
	navigate('/login', { replace: true });
}

async function syncState() {
	const res = await rawApi.user.me();

	if (!('error' in res)) {
		globalState.setState({
			user: res
		});
	} else {
		logOut();
	}
}

type WorpError = {
	error: string;
};
type WorpResponse<T> = T | { error: string };
export type UserUpdatePayload = Partial<Omit<IUserUpdate, 'id'>>;

export const rawApi = {
	syncState,
	user: {
		me: async () => rawApiWretch.url('/users/me').get().json() as Promise<WorpError | UserWithManageables>,
		logOut,
		update: async (userId: string, data: UserUpdatePayload) =>
			rawApiWretch.url(`/users/${userId}`).json(data).patch().json() as Promise<WorpError | UserWithManageables>
	},
	customCommands: {
		upsert: async (input: INewCustomCommand) =>
			rawApiWretch.url('/custom-commands').json(input).post().json() as Promise<WorpResponse<CustomCommand[]>>,
		delete: async (worpId: string, commandName: string) =>
			rawApiWretch.url(`/custom-commands/${worpId}/${commandName}`).delete().json() as Promise<
				WorpResponse<CustomCommand[]>
			>,
		get: async (worpId: string) =>
			rawApiWretch.url(`/custom-commands/${worpId}`).get().json() as Promise<WorpResponse<CustomCommand[]>>
	},
	polls: {
		create: async (input: INewPollSchema) =>
			rawApiWretch.url('/polls').json(input).put().json() as Promise<WorpResponse<OverlayConfig>>,
		delete: async (pollId: string) =>
			rawApiWretch.url(`/polls/${pollId}`).delete().json() as Promise<WorpResponse<OverlayConfig>>
		// get: async (worpId: string) =>
		// 	rawApiWretch.url(`/polls/${worpId}`).get().json() as Promise<WorpResponse<OverlayConfig>>
	},

	discordUser: async (discordUserId: string) =>
		rawApiWretch.url(`/discord/user/${discordUserId}`).get().json() as Promise<{ error: string } | DiscordUser>,
	overlay: (userID: string, token?: string) =>
		rawApiWretch
			.url(`/overlay/${userID}${token ? `?token=${token}` : ''}`)
			.get()
			.json() as Promise<OverlayConfig>,
	leaderboard: (id: string, type: string) =>
		rawApiWretch.url(`/leaderboard/${id}/${type}`).get().json() as Promise<{
			leaderboard: Record<string, number>;
			title: string;
		}>
};

export type {
	UserWithManageables,
	CustomCommand,
	OverlayConfig,
	INewCustomCommand,
	AdminMiscResponse,
	CaddyLog,
	AdminIronstreamStatsResponse,
	INewPollSchema,
	WSOverlayConfigUpdate,
	IUserUpdate
};
