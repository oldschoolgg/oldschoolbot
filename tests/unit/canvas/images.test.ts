import { readFile, writeFile } from 'node:fs/promises';
import { isDeepEqual } from 'remeda';
import { describe, test } from 'vitest';

import { type ChartOptions, createApexChartConfig, createChart } from '../../../src/lib/util/chart.js';

describe('Images', async () => {
	test('Charts', async () => {
		const sampleData: Record<'kmb' | 'percent', ChartOptions['values'][]> = {
			percent: [
				[
					['Magna', 55],
					['Cyr', 45]
				]
			],
			kmb: [
				[
					['Twisted bow', 5_000_000_000],
					['Egg', 1_500_000_000],
					['Cat', 500_000_000],
					['Dog', 2500_000_000],
					['Trout', 4500_000_000]
				]
			]
		} as const;

		for (const chartType of ['bar', 'line'] as const) {
			for (const format of ['kmb', 'percent'] as const) {
				const chartOptions: ChartOptions = {
					type: chartType,
					title: `${chartType} ${format} title`,
					values: sampleData[format][0],
					format: format
				};

				const config = createApexChartConfig(chartOptions);
				const configFilePath = `tests/unit/snapshots/chart.${chartType}.${format}.json`;
				const existingConfigRaw = await readFile(configFilePath, 'utf-8').catch(() => null);
				if (existingConfigRaw) {
					const existingConfig = JSON.parse(existingConfigRaw);
					if (isDeepEqual(existingConfig, config)) {
						continue;
					}
				}

				const res = await createChart(chartOptions);
				await writeFile(`tests/unit/snapshots/chart.${chartType}.${format}.png`, res);
				await writeFile(configFilePath, `${JSON.stringify(config, null, 4)}\n`);
			}
		}
	});
});
