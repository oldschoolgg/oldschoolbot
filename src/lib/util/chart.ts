import { deepMerge, getWrappedArrayItem } from '@oldschoolgg/toolkit';

const colors = [
	'#fd7f6f',
	'#7eb0d5',
	'#b2e061',
	'#bd7ebe',
	'#ffb55a',
	'#ffee65',
	'#beb9db',
	'#fdcce5',
	'#8bd3c7',
	'#ea5545',
	'#f46a9b',
	'#ef9b20',
	'#edbf33',
	'#ede15b',
	'#bdcf32',
	'#87bc45',
	'#27aeef',
	'#b33dc6',
	'#e60049',
	'#0bb4ff',
	'#50e991',
	'#e6d800',
	'#9b19f5',
	'#ffa300',
	'#dc0ab4',
	'#b3d4ff',
	'#00bfa0'
];

function randomHexColor(value: number): string {
	return getWrappedArrayItem(colors, Math.floor(value));
}

const PNG_FILE_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function isPng(buffer: Buffer) {
	if (buffer.length < PNG_FILE_SIGNATURE.length) return false;
	return buffer.subarray(0, PNG_FILE_SIGNATURE.length).equals(PNG_FILE_SIGNATURE);
}

function isImageResponse(contentType: string | null, buffer: Buffer) {
	if (contentType?.toLowerCase().includes('image/')) return true;
	return isPng(buffer);
}

async function renderChart(url: string, encodedConfig: string) {
	if (process.env.NODE_ENV === 'TEST') {
		return Buffer.from([]);
	}
	const requestAttempts = [
		() =>
			fetch('https://quickchart.io/apex-charts/render', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ config: encodedConfig })
			}),
		() =>
			fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			})
	];
	const errors: string[] = [];

	for (const [index, makeRequest] of requestAttempts.entries()) {
		const method = index === 0 ? 'POST' : 'GET';
		try {
			const response = await makeRequest();
			const contentType = response.headers.get('content-type');
			const buffer = Buffer.from(await response.arrayBuffer());
			if (!response.ok || !isImageResponse(contentType, buffer)) {
				const responseBody = buffer.toString('utf-8', 0, 200).trim().replaceAll(/\s+/g, ' ');
				errors.push(
					`${method} ${response.status} ${response.statusText}${responseBody ? ` - ${responseBody}` : ''}`
				);
				continue;
			}
			return buffer;
		} catch (error) {
			errors.push(`${method} request failed: ${(error as Error).message}`);
		}
	}

	throw new Error(`Failed to render chart via QuickChart. ${errors.join(' | ')}`);
}

export interface ChartOptions {
	type: 'pie' | 'line' | 'bar';
	title: string;
	values: ([string, number] | [string, number, string])[];
	format: ChartNumberFormat;
}

export function createApexChartConfig({ type, title, values, format }: ChartOptions) {
	const categories = values.map(([label]) => label);
	const seriesName = title;

	const formatter = (formatList.find(f => f.name === format) ?? formatList[0]).format;

	let config = {
		chart: { type },
		title: { text: title },
		series: [
			{
				name: seriesName,
				data: values.map(([label, value, color]) => ({
					x: label,
					y: value,
					fillColor: color ?? randomHexColor(value)
				}))
			}
		],
		xaxis: { categories },
		dataLabels: {
			enabled: true,
			style: {
				colors: ['#000']
			},
			formatter: 'FORMATTER'
		},
		yaxis: {
			labels: {
				formatter: 'FORMATTER'
			}
		}
	};

	if (type === 'pie') {
		config = deepMerge(config, {
			plotOptions: {
				pie: {
					dataLabels: {
						offset: 10
					}
				}
			}
		});
	}

	if (type === 'bar') {
		config = deepMerge(config, {
			plotOptions: {
				bar: {
					dataLabels: {
						position: 'top'
					}
				}
			}
		});
	}

	if (format === 'percent') {
		config = deepMerge(config, {
			yaxis: {
				min: 0,
				max: 100
			}
		});
	}

	const encoded = JSON.stringify(config).replaceAll('"FORMATTER"', formatter.toString());

	if (encoded.includes('FORMATTER')) {
		throw new Error('Failed to encode chart config');
	}
	return {
		encoded,
		config,
		url: `https://quickchart.io/apex-charts/render?config=${encodeURIComponent(encoded)}`
	};
}

const formatList = [
	{
		name: 'kmb',
		format: (v: number) => {
			if (v > 999_999_999 || v < -999_999_999) {
				return `${Math.round(v / 1_000_000_000)}b`;
			} else if (v > 999_999 || v < -999_999) {
				return `${Math.round(v / 1_000_000)}m`;
			} else if (v > 999 || v < -999) {
				return `${Math.round(v / 1000)}k`;
			}
			return Math.round(v);
		}
	},
	{ name: 'percent', format: (v: number) => `${v}%` },
	{ name: 'hours', format: (v: number) => `${v}hrs` },
	{ name: 'delta', format: (v: number) => (v === 0 ? '0' : v > 0 ? `+${v}` : `-${v}`) }
] as const;
type ChartNumberFormat = (typeof formatList)[number]['name'];

export async function createChart(options: ChartOptions) {
	const res = createApexChartConfig(options);
	return renderChart(res.url, res.encoded);
}
