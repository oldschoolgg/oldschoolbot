export const httpErr = {
	UNAUTHORIZED: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'UNAUTHORIZED', message }, { status: 401 });
	},
	BAD_REQUEST: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'BAD_REQUEST', message }, { status: 400 });
	},
	NOT_FOUND: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'NOT_FOUND', message }, { status: 404 });
	},
	RATELIMITED: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'RATELIMITED', message }, { status: 429 });
	}
};

export const httpRes = {
	JSON: (json: object): Response => {
		return Response.json(json, { status: 200 });
	}
};

type HonoVariables = {
	user: RUser | null;
};

export type HonoServerGeneric = { Bindings: {}; Variables: HonoVariables };
