import { readFile, writeFile } from 'node:fs/promises';
import deepEqual from 'fast-deep-equal';
import { describe, test } from 'vitest';

import { type ChartOptions, createApexChartConfig, createChart } from '../../src/lib/util/chart';

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
					if (deepEqual(existingConfig, config)) {
						console.log(`Skipping ${chartType} ${format} chart, no changes.`);
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
