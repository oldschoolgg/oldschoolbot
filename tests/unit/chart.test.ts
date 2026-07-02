import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createChart } from '@/lib/util/chart.js';

const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

const chartOptions = {
	title: 'Chart Test',
	type: 'bar' as const,
	format: 'kmb' as const,
	values: [
		['A', 1],
		['B', 2]
	] as [string, number][]
};

const originalNodeEnv = process.env.NODE_ENV;

describe('chart util', () => {
	beforeEach(() => {
		process.env.NODE_ENV = 'development';
	});

	afterEach(() => {
		process.env.NODE_ENV = originalNodeEnv;
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	test('falls back to GET when POST fails and returns PNG', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response('<html>bad post response</html>', {
					status: 400,
					headers: { 'content-type': 'text/html; charset=UTF-8' }
				})
			)
			.mockResolvedValueOnce(
				new Response(pngBytes, {
					status: 200,
					headers: { 'content-type': 'image/png' }
				})
			);
		vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

		const result = await createChart(chartOptions);

		expect(result.equals(pngBytes)).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[0][0]).toBe('https://quickchart.io/apex-charts/render');
		expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' });
		expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'GET' });
		expect(String(fetchMock.mock.calls[1][0])).toContain('/apex-charts/render?config=');
	});

	test('throws when both POST and GET do not return an image', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response('<html>post failed</html>', {
					status: 500,
					headers: { 'content-type': 'text/html' }
				})
			)
			.mockResolvedValueOnce(
				new Response('<html>get failed</html>', {
					status: 200,
					headers: { 'content-type': 'text/html; charset=UTF-8' }
				})
			);
		vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

		await expect(createChart(chartOptions)).rejects.toThrow('Failed to render chart via QuickChart.');
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	test('returns on successful POST without issuing GET', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(
			new Response(pngBytes, {
				status: 200,
				headers: { 'content-type': 'image/png' }
			})
		);
		vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

		const result = await createChart(chartOptions);

		expect(result.equals(pngBytes)).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' });
	});
});
