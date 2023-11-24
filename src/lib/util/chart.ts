import type { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 1000; // px
const height = 500; // px
const backgroundColour = 'white';
const canvasRenderService = new ChartJSNodeCanvas({ width, height, backgroundColour });

export async function generateChart(config: ChartConfiguration) {
	const buffer = await canvasRenderService.renderToBuffer(config);
	return buffer;
}

function randomHexColor(num: number) {
	const hue = num * 137.508; // use golden angle approximation
	return `hsl(${hue},50%,75%)`;
}

export async function pieChart(title: string, format: (value: any) => string, values: [string, number, string?][]) {
	const options: ChartConfiguration = {
		type: 'pie',
		data: {
			labels: values.map(i => i[0]),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map((val, index) => val[2] ?? randomHexColor(index))
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					font: {
						weight: 'bolder'
					},
					formatter(value) {
						return format(value);
					}
				}
			}
		}
	};
	return generateChart(options);
}
export async function lineChart(
	title: string,
	values: [string, number, string?][],
	yFormat: (value: number) => string = (value: number) => value.toString(),
	xFormat: (value: string) => string = (value: string) => value,
	showDataLabels = true
) {
	const options: ChartConfiguration<'line'> = {
		type: 'line',
		data: {
			labels: values.map(i => xFormat(i[0])),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map((_, index) => randomHexColor(index)),
					fill: false,
					pointRadius: 0
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					display: showDataLabels,
					font: {
						weight: 'bolder'
					},
					formatter(value: number) {
						return yFormat(value);
					}
				},
				legend: {
					display: false
				}
			}
		}
	};

	return generateChart(options);
}

export async function barChart(
	title: string,
	format: (value: any) => string,
	values: [string, number, string?][],
	useRelativeColors: boolean = false
) {
	const positiveValues = values.map(i => i[1]).filter(v => v > 0);
	const negativeValues = values.map(i => i[1]).filter(v => v < 0);

	const maxPositiveValue = positiveValues.length > 0 ? Math.max(...positiveValues) : 0;
	const maxNegativeValue = negativeValues.length > 0 ? Math.abs(Math.min(...negativeValues)) : 0;

	const getRelativeSaturation = (value: number) => {
		const saturationRange = 10;
		const minSaturation = 60;
		if (value >= 0 && maxPositiveValue !== 0) {
			return minSaturation + (value / maxPositiveValue) * saturationRange;
		} else if (value < 0 && maxNegativeValue !== 0) {
			return minSaturation + (Math.abs(value) / maxNegativeValue) * saturationRange;
		}
		return minSaturation;
	};

	const getLightness = (value: number) => {
		if (value >= 0) {
			return 30 + (value / maxPositiveValue) * 20;
		}
		return 70 - (Math.abs(value) / maxNegativeValue) * 20;
	};

	const getColorForValue = (value: number) => {
		const hue = value >= 0 ? 120 : 0;
		const saturation = useRelativeColors ? getRelativeSaturation(value) : 100;
		const lightness = useRelativeColors ? getLightness(value) : 50;
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	};

	const options: ChartConfiguration = {
		type: 'bar',
		data: {
			labels: values.map(i => i[0]),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map(val => val[2] ?? getColorForValue(val[1]))
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					font: {
						weight: 'bolder'
					},
					formatter(value) {
						return format(value);
					}
				},
				legend: {
					display: false
				}
			}
		}
	};
	return generateChart(options);
}
