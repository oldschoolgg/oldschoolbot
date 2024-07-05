import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { miniID } from '@oldschoolgg/toolkit';
import { randFloat } from '../util';

function randomHSLColor(num = randFloat(0, 1)): string {
	const hue = num * 137.508;
	return `hsl(${hue},50%,75%)`;
}

function nextNiceNumber(value: number) {
    const exponent = Math.floor(Math.log10(value));
    const fraction = value / Math.pow(10, exponent);
    let niceFraction = -1;
    
    if (fraction <= 1) {
        niceFraction = 1;
    } else if (fraction <= 2) {
        niceFraction = 2;
    } else if (fraction <= 5) {
        niceFraction = 5;
    } else {
        niceFraction = 10;
    }
    
    return niceFraction * Math.pow(10, exponent);
}

function randomHexColor(): string {
	const hsl = randomHSLColor();
	const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
	const hNorm = h / 360;
	const sNorm = s / 100;
	const lNorm = l / 100;

	const a = sNorm * Math.min(lNorm, 1 - lNorm);
	const f = (n: number, k = (n + hNorm * 12) % 12) => lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

	const rgb = [f(0), f(8), f(4)].map(x =>
		Math.round(x * 255)
			.toString(16)
			.padStart(2, '0')
	);

	return `#${rgb.join('')}`;
}

function createGnuplotScript(
	type: 'pie' | 'line' | 'bar',
	format: ChartType,
	title: string,
	values: [string, number, string?][]
): string {
	let script = `
set terminal png enhanced font 'Arial,10' size 1100,550
set output 'chart.png'
set title "${title}"
    `;

	if (format === 'percent') {
		// Make the values show as percentages
		script += `\nset format y "%.0f%%";`;
		// Set min/max Y to 0-100%
		script += '\nset yrange [0:100]';
	}

	if (type === 'pie') {
		script += `
set style data histograms
set style fill solid 1.00 border -1
set boxwidth 0.5
plot '-' using 2:xtic(1) title columnheader linecolor rgb variable
        `;
	} else if (type === 'line') {
		script += `
set xlabel "Category"
set ylabel "Value"
plot '-' using 1:2 with linespoints title columnheader linecolor rgb variable
        `;
	} else if (type === 'bar') {
		const lowestValue = Math.min(...values.map(v => v[1]));
		const highestValue = Math.max(...values.map(v => v[1]));
const numTics = 9

const roundedMaxY = nextNiceNumber(highestValue);
const steps = Math.ceil(roundedMaxY / numTics);

if (format === 'kmb') {
		script += `# Custom tics for y-axis
set yrange [0:${roundedMaxY}]
unset ytics
do for [i=${steps}:${roundedMaxY}:${steps}] {
    if (i >= 1e9) {
        set ytics add (sprintf("%.1fB", i/1e9) i)
    } else if (i >= 1e6) {
        set ytics add (sprintf("%.1fM", i/1e6) i)
    } else if (i >= 1e3) {
        set ytics add (sprintf("%.1fK", i/1e3) i)
    } else {
        set ytics add (sprintf("%d", i) i)
    }
}`;
	}
		script += `
set style data histograms
set style histogram cluster gap 1
set style fill solid
set boxwidth 0.5
set xlabel "Category"
set ylabel "Value"
set xtics rotate by 30 right font ", 8"

${values.map(([_label, _value, color = randomHexColor()], i) => `set style line ${i + 1} lc rgb "${color}"`).join('\n')}

plot ${values.map(([_label, _value, _color], i) => `'-' using 1:3:xtic(2) with boxes linestyle ${i + 1} title ''`).join(', ')}

${values.map(([label, value], i) => `${i + 1} "${label}" ${value}\ne`).join('\n')}
`;
	}

	return script;
}

async function saveGnuplotChart(script: string): Promise<Buffer> {
	const scriptID = miniID(10);
	const imageID = miniID(10);
	script = script.replace("'chart.png'", `'${path.join(os.tmpdir(), `chart.${imageID}.png`)}'`);
	console.log(script);
	const scriptPath = path.join(os.tmpdir(), `plot_script.${scriptID}.gp`);
	const outputPath = path.join(os.tmpdir(), `chart.${imageID}.png`);

	await fs.writeFile(scriptPath, script);

	return new Promise<Buffer>((resolve, reject) => {
		exec(`gnuplot ${scriptPath}`, async (error, _stdout, stderr) => {
			if (error) {
				throw new Error(error);
			}
			if (stderr) {
				throw new Error(stderr);
			}
			try {
				const buffer = await fs.readFile(outputPath);
				resolve(buffer);
			} catch (readError) {
				reject(readError);
			}
		});
	});
}

const types = [
	{ name: 'percent', format: '%' },
	{ name: 'kmb', format: 'idk' },
	{ name: 'rank', format: 'idk' },
	{ name: 'number', format: 'idk' }
] as const;
type ChartType = (typeof types)[number]['name'];

export async function pieChart(title: string, format: ChartType, values: [string, number, string?][]): Promise<Buffer> {
	const script = createGnuplotScript('pie', format, title, values);
	return await saveGnuplotChart(script);
}

export async function lineChart(
	title: string,
	format: ChartType,
	values: [string, number, string?][]
): Promise<Buffer> {
	const script = createGnuplotScript('line', format, title, values);
	return await saveGnuplotChart(script);
}

export async function barChart(title: string, format: ChartType, values: [string, number, string?][]): Promise<Buffer> {
	const script = createGnuplotScript('bar', format, title, values);
	return await saveGnuplotChart(script);
}
