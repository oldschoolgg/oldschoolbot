import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

type CacheFetchInit = RequestInit & {
	cacheForSeconds?: number;
};

type CacheEntry = {
	url: string;
	createdAtMs: number;
	expiresAtMs: number;
	status: number;
	statusText?: string;
	headers: Array<[string, string]>;
	bodyBase64: string;
};

const CACHE_DIR = path.join(os.tmpdir(), 'fetch-cache-v1');
const inFlight = new Map<string, Promise<Response>>();

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

const toUrlString = (input: string | URL): string => {
	if (typeof input === 'string') return input;
	return input.toString();
};

const assertGetOnly = (input: string | URL, init?: CacheFetchInit): void => {
	const initMethod = init?.method?.toUpperCase();
	if (initMethod && initMethod !== 'GET') throw new Error('Only GET is supported');
	if (init?.body != null) throw new Error('Only GET is supported');

	if (typeof input !== 'string' && !(input instanceof URL) && init?.method?.toUpperCase() !== 'GET') {
		throw new Error('Only GET is supported');
	}
};

const responseFromEntry = (e: CacheEntry): Response => {
	const body = Buffer.from(e.bodyBase64, 'base64');
	return new Response(body, {
		status: e.status,
		statusText: e.statusText,
		headers: e.headers
	});
};

export async function pfetch(input: string | URL, init?: CacheFetchInit): Promise<Response> {
	assertGetOnly(input, init);

	const cacheForSeconds = init?.cacheForSeconds ?? 0;
	if (cacheForSeconds <= 0) {
		const { cacheForSeconds: _c, ...realInit } = init ?? {};
		return globalThis.fetch(input, realInit);
	}

	const url = toUrlString(input);
	const key = sha256(url);
	const filePath = path.join(CACHE_DIR, `${key}.json`);

	const now = Date.now();

	const existing = inFlight.get(key);
	if (existing) return existing.then(r => r.clone());

	const p = (async (): Promise<Response> => {
		await mkdir(CACHE_DIR, { recursive: true });

		try {
			const raw = await readFile(filePath, 'utf8');
			const entry = JSON.parse(raw) as CacheEntry;
			if (entry.url === url && now < entry.expiresAtMs) {
				console.log(`Cache hit for ${url}`);
				return responseFromEntry(entry);
			}
		} catch {}

		const { cacheForSeconds: _c, ...realInit } = init ?? {};

		console.log(`Cache miss for ${url}`);
		const res = await globalThis.fetch(input, realInit);
		if (!res.ok) return res;

		const ab = await res.arrayBuffer();
		const buf = Buffer.from(ab);

		const entry: CacheEntry = {
			url,
			createdAtMs: now,
			expiresAtMs: now + cacheForSeconds * 1000,
			status: res.status,
			statusText: res.statusText,
			headers: Array.from(res.headers.entries()),
			bodyBase64: buf.toString('base64')
		};

		const tmpPath = `${filePath}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
		await writeFile(tmpPath, JSON.stringify(entry), 'utf8');
		await rename(tmpPath, filePath);

		return new Response(buf, {
			status: entry.status,
			statusText: entry.statusText,
			headers: entry.headers
		});
	})();

	inFlight.set(key, p);

	try {
		const r = await p;
		return r;
	} finally {
		inFlight.delete(key);
	}
}
