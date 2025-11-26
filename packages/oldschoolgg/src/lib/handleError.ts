export function handleError(e: Error, extra?: Record<string, unknown>) {
	console.error(e, extra);
	if (!__IS_PRODUCTION__) return;
	const params = new URLSearchParams();
	params.append('error', e.message?.slice(0, 100));
	params.append('stack', (e.stack?.toString() ?? '').slice(0, 1000));
	if (extra) {
		for (const [key, value] of Object.entries(extra) as any[]) {
			params.append(key, value.toString());
		}
	}
	params.append('url', window.location.href);
	const url = `${__API_URL__}/error?${params.toString()}`;
	if (__IS_PRODUCTION__) {
		fetch(url);
	}
}
