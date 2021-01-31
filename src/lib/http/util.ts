import { createHmac } from 'crypto';

export { v4 as uuidv } from 'uuid';

import { clientSecret } from '../../config';

export function rateLimit(max: number, timeWindow: string) {
	return {
		rateLimit: {
			max,
			timeWindow
		}
	};
}

export function verifyGithubSecret(body: string, signature?: string | string[]): boolean {
	if (!signature) {
		return false;
	}
	const hmac = createHmac('sha1', clientSecret);
	hmac.update(body);
	const calculated = `sha1=${hmac.digest('hex')}`;
	return signature === calculated;
}
