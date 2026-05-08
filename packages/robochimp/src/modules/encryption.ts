import { RUser } from '@/structures/RUser.js';

const IV_LENGTH = 16;
const ALGORITHM = 'AES-GCM';

interface TokenData {
	user_id: string;
	created_at: string;
	expires_at: string;
	nonce: string;
}

function base64ToUint8Array(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export async function encryptToken(data: Pick<TokenData, 'user_id'>): Promise<string> {
	const keyData = base64ToUint8Array(process.env.OAUTH_SECRET!);
	const key = await crypto.subtle.importKey('raw', keyData, ALGORITHM, false, ['encrypt']);

	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

	const tokenData: TokenData = {
		...data,
		created_at: new Date().toISOString(),
		expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
		nonce: Array.from(crypto.getRandomValues(new Uint8Array(8))).join('')
	};

	const encodedData = new TextEncoder().encode(JSON.stringify(tokenData));

	const encryptedData = await crypto.subtle.encrypt(
		{
			name: ALGORITHM,
			iv: iv
		},
		key,
		encodedData
	);

	const encryptedArray = new Uint8Array(encryptedData);
	const combined = new Uint8Array(iv.length + encryptedArray.length);
	combined.set(iv);
	combined.set(encryptedArray, iv.length);

	return btoa(String.fromCharCode(...combined));
}

async function decryptToken(encryptedToken: string, secret: string): Promise<TokenData> {
	try {
		const keyData = base64ToUint8Array(secret);
		const key = await crypto.subtle.importKey('raw', keyData, ALGORITHM, false, ['decrypt']);

		const combined = new Uint8Array(
			atob(encryptedToken)
				.split('')
				.map(c => c.charCodeAt(0))
		);

		const iv = combined.slice(0, IV_LENGTH);
		const data = combined.slice(IV_LENGTH);

		const decrypted = await crypto.subtle.decrypt(
			{
				name: ALGORITHM,
				iv: iv
			},
			key,
			data
		);

		const tokenData: TokenData = JSON.parse(new TextDecoder().decode(decrypted));

		if (new Date(tokenData.expires_at).getTime() < Date.now()) {
			throw new Error('decryptToken: Token expired');
		}

		if (!tokenData.user_id) {
			throw new Error('decryptToken: Invalid token, missing user id');
		}

		return tokenData;
	} catch (_err) {
		throw new Error('decryptToken: Invalid token');
	}
}

export async function handleAuthenticationFromToken(token?: string | null): Promise<RUser | null> {
	if (token && typeof token === 'string') {
		const successfulJWT = await decryptToken(token, process.env.OAUTH_SECRET!);
		if (successfulJWT) {
			const matchingUser = await roboChimpClient.user.findUnique({
				where: { id: BigInt(successfulJWT.user_id) }
			});
			if (!matchingUser) throw new Error('User not found.');
			return new RUser(matchingUser);
		} else {
			throw new Error('handleAuthenticationFromToken: Invalid token.');
		}
	}

	return null;
}
