import { RateLimitManager } from 'klasa';
import { Util } from 'klasa-dashboard-hooks';
import { createFunctionInhibitor } from 'klasa-decorators';

import ApiRequest from './structures/ApiRequest';
import ApiResponse from './structures/ApiResponse';
import { clientSecret } from '../../config';

export const authenticated = createFunctionInhibitor(
	(request: ApiRequest) => {
		if (!request.headers.authorization) return false;
		request.auth = Util.decrypt(request.headers.authorization, clientSecret);
		return !(!request.auth!.user_id || !request.auth!.token);
	},
	(_request: ApiRequest, response: ApiResponse) => {
		response.error(403);
	}
);

export function ratelimit(bucket: number, cooldown: number, auth = false) {
	const manager = new RateLimitManager(bucket, cooldown);
	const xRateLimitLimit = bucket;
	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse) => {
			const id = (auth
				? request.auth!.user_id
				: request.headers['x-forwarded-for'] || request.connection.remoteAddress) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());
			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());
				return false;
			}

			try {
				bucket.drip();
			} catch {}

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.bucket.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_request: ApiRequest, response: ApiResponse) => {
			response.error(429);
		}
	);
}
